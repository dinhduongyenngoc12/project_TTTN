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
     * power_threshold là ngưỡng thực tế đang được dùng để cảnh báo.
     * default_threshold chỉ được dùng thay thế khi power_threshold chưa có giá trị.
     */
    private function getAppliedThreshold(AlertConfig $alertConfig): ?float
    {
        if ($alertConfig->power_threshold !== null) {
            return (float)$alertConfig->power_threshold;
        }

        if ($alertConfig->default_threshold !== null) {
            return (float)$alertConfig->default_threshold;
        }

        return null;
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