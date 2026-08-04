<?php
declare(strict_types=1);

namespace App\Service;

use App\Model\Entity\AlertConfig;
use App\Model\Entity\Device;
use App\Model\Entity\EnergyLog;
use App\Model\Table\AlertConfigsTable;
use App\Model\Table\AlertLogsTable;
use App\Model\Table\UsersTable;
use Cake\I18n\FrozenTime;
use Cake\ORM\TableRegistry;

class AlertService
{
    private const DEFAULT_HISTORY_LIMIT = 10;
    private const MAX_HISTORY_LIMIT = 50;
    private const SYSTEM_MONITORING_LIMIT = 20;

    protected AlertConfigsTable $AlertConfigs;
    protected AlertLogsTable $AlertLogs;
    protected UsersTable $Users;
    protected MailService $mailService;

    public function __construct()
    {
        $locator = TableRegistry::getTableLocator();

        $this->AlertConfigs = $locator->get('AlertConfigs');
        $this->AlertLogs = $locator->get('AlertLogs');
        $this->Users = $locator->get('Users');

        $this->mailService = new MailService();
    }

    /**
     * Mỗi thiết bị chỉ được gửi email cảnh báo tối đa 1 lần trong 30 phút
     * Các lần vượt ngưỡng còn lại vẫn được ghi vào alert_logs để hiển thị trên hệ thống
     */
    private function canSendEmail(AlertConfig $alertConfig): bool
    {
        if ($alertConfig->last_email_sent_at === null) {
            return true;
        }

        $lastSend = $alertConfig->last_email_sent_at instanceof FrozenTime
            ? $alertConfig->last_email_sent_at
            : new FrozenTime($alertConfig->last_email_sent_at);

        $diffSeconds = FrozenTime::now()->getTimestamp()
            - $lastSend->getTimestamp();

        return $diffSeconds >= 1800;
    }

    private function sendAlertEmail(Device $device, float $powerValue, float $threshold): array 
    {
        $user = $this->Users->find()
            ->where([
                'Users.id' => $device->user_id   //tìm user nhận cảnh báo
            ])
            ->first();

        if (!$user || empty($user->email)) {
            return [
                'success' => false,
                'message' => 'Không tìm thấy email người dùng để gửi cảnh báo'
            ];
        }

        return $this->mailService->sendPowerAlertEmail(
            $user,
            $device,
            $powerValue,
            $threshold
        );
    }

    /**
     * Alert phải chạy sau Threshold Learning.
     * Nếu bản ghi mới làm thay đổi ngưỡng học được,
     * cảnh báo cần sử dụng ngưỡng mới nhất để so sánh.
     */
    public function checkPowerThreshold(EnergyLog $energyLog, Device $device): array
    {
        if ((int)$energyLog->is_valid !== 1) {
            return $this->success('Dữ liệu đo không hợp lệ, bỏ qua kiểm tra cảnh báo', [
                'alert_created' => false,
            ]);
        }

        if ($energyLog->power === null) {
            return $this->success('Không có dữ liệu công suất, bỏ qua kiểm tra cảnh báo', [
                'alert_created' => false,
            ]);
        }

        $alertConfig = $this->AlertConfigs->find()
            ->where([
                'device_id' => $device->id,
            ])
            ->first();

        if (!$alertConfig) {
            return $this->success('Thiết bị chưa có cấu hình cảnh báo', [
                'alert_created' => false,
            ]);
        }

        $threshold = $this->getAppliedThreshold($alertConfig);      //lấy ngưỡng đang áp dụng

        if ($threshold === null) {
            return $this->success('Thiết bị chưa có ngưỡng cảnh báo', [
                'alert_created' => false,
            ]);
        }

        if ((float)$energyLog->power <= $threshold) {
            return $this->success('Công suất chưa vượt ngưỡng', [
                'alert_created' => false,
            ]);
        }

        $alertLog = $this->AlertLogs->newEntity([
            'alert_config_id' => $alertConfig->id,
            'energy_log_id' => $energyLog->id,
            'power_value' => $energyLog->power,
            'threshold_value' => $threshold,           //lưu lại để sau này ngưỡng adaptive thay đổi vẫn biết cảnh báo cũ vượt ngưỡng nào
            'email_sent' => 0,      //vì alert_log được tạo trước
            'created_at' => FrozenTime::now()
        ]);

        if (!$this->AlertLogs->save($alertLog)) {
            return $this->error(
                'Không thể tạo cảnh báo vượt ngưỡng',
                500,
                $alertLog->getErrors()
            );
        }

        $emailSent = false;
        $emailError = null;

        if ($this->canSendEmail($alertConfig)) {
            $sendResult = $this->sendAlertEmail(
                $device,
                (float)$energyLog->power,
                $threshold
            );

            if ($sendResult['success']) {
                $emailSent = true;

                $alertLog = $this->AlertLogs->patchEntity($alertLog, [
                    'email_sent' => 1,
                ]);
                $this->AlertLogs->save($alertLog);

                $alertConfig = $this->AlertConfigs->patchEntity($alertConfig, [
                    'last_email_sent_at' => FrozenTime::now(),
                ]);
                $this->AlertConfigs->save($alertConfig);
            } else {
                $emailError = $sendResult['message'];
            }
        }

        return $this->success('Đã tạo cảnh báo vượt ngưỡng', [
            'alert_created' => true,
            'alert_log_id' => $alertLog->id,
            'power_value' => (float)$energyLog->power,
            'threshold' => $threshold,
            'email_sent' => $emailSent,
            'email_error' => $emailError,
        ]);
    }

    /**
     * power_threshold là ngưỡng thực tế đang được dùng để cảnh báo
     * default_threshold chỉ được dùng thay thế khi power_threshold chưa có giá trị
     */
    private function getAppliedThreshold(AlertConfig $alertConfig): ?float
    {
        if (
            $alertConfig->power_threshold !== null
            && (float)$alertConfig->power_threshold > 0
        ) {
            return (float)$alertConfig->power_threshold;
        }

        if (
            $alertConfig->default_threshold !== null
            && (float)$alertConfig->default_threshold > 0
        ) {
            return (float)$alertConfig->default_threshold;
        }

        //Null, 0 và số âm đều không phải ngưỡng 
        return null;    //khi chưa tìm thấy ngưỡng hợp lệ
    }

    //Lấy lịch sử cảnh báo thuộc các thiết bị của user đang đăng nhập
    public function getUserAlertHistory(int $userId, array $filters): array
    {
        $validationResult = $this->validateHistoryFilters($filters);

        if (!$validationResult['success']) {
            return $validationResult;
        }

        $deviceId = $validationResult['filters']['device_id'];
        $from = $validationResult['filters']['from'];
        $to = $validationResult['filters']['to'];
        $page = $validationResult['filters']['page'];
        $limit = $validationResult['filters']['limit'];

        $query = $this->AlertLogs->find()
            ->select([
                'id' => 'AlertLogs.id',
                'alert_config_id' => 'AlertLogs.alert_config_id',
                'energy_log_id' => 'AlertLogs.energy_log_id',
                'power_value' => 'AlertLogs.power_value',
                'threshold_value' => 'AlertLogs.threshold_value',
                'email_sent' => 'AlertLogs.email_sent',
                'created_at' => 'AlertLogs.created_at',
                'device_id' => 'Devices.id',
                'device_name' => 'Devices.name',
                'device_type' => 'Devices.device_type',
            ])
            /*
             * Không nhận user_id từ frontend
             * User được lấy từ JWT và chỉ xem cảnh báo của thiết bị mình sở hữu
             */
            ->innerJoinWith('AlertConfigs.Devices', function ($query) use ($userId) {
                return $query->where([
                    'Devices.user_id' => $userId,
                ]);
            })
            ->orderBy([
                'AlertLogs.created_at' => 'DESC',
                'AlertLogs.id' => 'DESC',
            ])
            ->enableHydration(false);

        if ($deviceId !== null) {
            $query->where([
                'Devices.id' => $deviceId,
            ]);
        }

        if ($from !== null) {
            $query->where([
                'AlertLogs.created_at >=' => $from . ' 00:00:00',
            ]);
        }

        if ($to !== null) {
            $query->where([
                'AlertLogs.created_at <=' => $to . ' 23:59:59',
            ]);
        }

        //Đếm tổng trước khi limit để thông tin phân trang luôn chính xác
        $totalItems = (clone $query)->count();
        $totalPages = $totalItems === 0
            ? 0
            : (int)ceil($totalItems / $limit);

        $alerts = $query
            ->limit($limit)
            ->offset(($page - 1) * $limit)
            ->toArray();

        return [
            'success' => true,
            'statusCode' => 200,
            'data' => $alerts,
            'filters' => [
                'device_id' => $deviceId,
                'from' => $from,
                'to' => $to,
            ],
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total_items' => $totalItems,
                'total_pages' => $totalPages,
            ],
        ];
    }

    //Lấy các cảnh báo mới nhất trên toàn hệ thống để Admin theo dõi
    public function getSystemAlertHistory(): array
    {
        $alerts = $this->AlertLogs->find()
            //Liên kết từ cảnh báo đến đúng thiết bị và chủ sở hữu thiết bị
            ->join([
                'alert_configs' => [
                    'table' => 'alert_configs',
                    'type' => 'INNER',
                    'conditions' =>
                        'alert_configs.id = AlertLogs.alert_config_id',
                ],
                'devices' => [
                    'table' => 'devices',
                    'type' => 'INNER',
                    'conditions' =>
                        'devices.id = alert_configs.device_id',
                ],
                'users' => [
                    'table' => 'users',
                    'type' => 'INNER',
                    'conditions' => 'users.id = devices.user_id',
                ],
            ])
            
            ->select([
                'id' => 'AlertLogs.id',
                'username' => 'users.username',
                'device_name' => 'devices.name',
                'power_value' => 'AlertLogs.power_value',
                'threshold_value' => 'AlertLogs.threshold_value',
                'email_sent' => 'AlertLogs.email_sent',
                'created_at' => 'AlertLogs.created_at',
            ])
            ->orderBy([
                'AlertLogs.created_at' => 'DESC',
                'AlertLogs.id' => 'DESC',
            ])
            ->limit(self::SYSTEM_MONITORING_LIMIT)
            ->enableHydration(false)
            ->toArray();

        // Chuẩn hóa kiểu dữ liệu để frontend không phải tự đoán kiểu từ MySQL Decimal.
        foreach ($alerts as &$alert) {
            $alert['id'] = (int)$alert['id'];
            $alert['power_value'] = (float)$alert['power_value'];
            $alert['threshold_value'] = (float)$alert['threshold_value'];
            $alert['email_sent'] = (bool)$alert['email_sent'];
        }

        unset($alert);

        return [
            'success' => true,
            'statusCode' => 200,
            'data' => $alerts,
        ];
    }

    //Chuẩn hóa bộ lọc lịch sử trước khi tạo truy vấn db
    private function validateHistoryFilters(array $filters): array
    {
        $errors = [];
        $deviceId = null;
        $deviceIdInput = trim((string)($filters['device_id'] ?? ''));
        $from = trim((string)($filters['from'] ?? ''));
        $to = trim((string)($filters['to'] ?? ''));
        $pageInput = $filters['page'] ?? 1;
        $limitInput = $filters['limit'] ?? self::DEFAULT_HISTORY_LIMIT;

        if ($deviceIdInput !== '') {
            if (
                filter_var($deviceIdInput, FILTER_VALIDATE_INT) === false
                || (int)$deviceIdInput < 1
            ) {
                $errors['device_id'] = 'Thiết bị không hợp lệ.';
            } else {
                $deviceId = (int)$deviceIdInput;
            }
        }

        if ($from !== '' && !$this->isValidHistoryDate($from)) {
            $errors['from'] =
                'Ngày bắt đầu phải đúng định dạng YYYY-MM-DD.';
        }

        if ($to !== '' && !$this->isValidHistoryDate($to)) {
            $errors['to'] =
                'Ngày kết thúc phải đúng định dạng YYYY-MM-DD.';
        }

        if (
            $from !== ''
            && $to !== ''
            && $this->isValidHistoryDate($from)
            && $this->isValidHistoryDate($to)
            && $from > $to
        ) {
            $errors['date_range'] =
                'Ngày bắt đầu không được sau ngày kết thúc.';
        }

        if (
            filter_var($pageInput, FILTER_VALIDATE_INT) === false
            || (int)$pageInput < 1
        ) {
            $errors['page'] =
                'Trang phải là số nguyên lớn hơn hoặc bằng 1.';
        }

        if (
            filter_var($limitInput, FILTER_VALIDATE_INT) === false
            || (int)$limitInput < 1
            || (int)$limitInput > self::MAX_HISTORY_LIMIT
        ) {
            $errors['limit'] =
                'Số bản ghi mỗi trang phải từ 1 đến 50.';
        }

        if ($errors !== []) {
            return [
                'success' => false,
                'statusCode' => 422,
                'message' => 'Bộ lọc cảnh báo không hợp lệ.',
                'errors' => $errors,
            ];
        }

        return [
            'success' => true,
            'filters' => [
                'device_id' => $deviceId,
                'from' => $from !== '' ? $from : null,
                'to' => $to !== '' ? $to : null,
                'page' => (int)$pageInput,
                'limit' => (int)$limitInput,
            ],
        ];
    }

    //Kiểm tra cả định dạng YYYY-MM-DD và giá trị ngày thực tế
    private function isValidHistoryDate(string $value): bool
    {
        $date = FrozenTime::createFromFormat('Y-m-d', $value);

        return $date !== false
            && $date->format('Y-m-d') === $value;
    }

    private function success(string $message, mixed $data = null): array
    {
        return [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];
    }

    private function error(
        string $message,
        int $statusCode = 400,
        mixed $errors = []
    ): array {
        return [
            'success' => false,
            'statusCode' => $statusCode,
            'message' => $message,
            'errors' => $errors,
        ];
    }
}
