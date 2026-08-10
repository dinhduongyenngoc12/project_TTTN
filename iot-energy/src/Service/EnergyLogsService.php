<?php
declare(strict_types=1);

namespace App\Service;

use Cake\I18n\FrozenTime;
use Cake\ORM\TableRegistry;

use App\Model\Table\EnergyLogsTable;
use App\Model\Table\DevicesTable;
use App\Model\Table\IotDevicesTable;
use App\Service\AlertService;
use App\Service\ThresholdLearningService;
use App\Service\SummaryService;

use App\Model\Entity\Device;
use App\Model\Entity\EnergyLog;

class EnergyLogsService
{
    protected EnergyLogsTable $EnergyLogs;
    protected DevicesTable $Devices;
    protected IotDevicesTable $IotDevices;
    protected AlertService $AlertService;
    protected ThresholdLearningService $ThresholdLearningService;
    protected SummaryService $SummaryService;
    public function __construct()
    {
        $locator = TableRegistry::getTableLocator();

        $this->EnergyLogs = $locator->get('EnergyLogs');
        $this->Devices = $locator->get('Devices');
        $this->IotDevices = $locator->get('IotDevices');

        $this->AlertService = new AlertService();

        $this->ThresholdLearningService = new ThresholdLearningService();

        $this->SummaryService = new SummaryService();
    }

    //xử lý học ngưỡng
    private function processThresholdLearning(Device $device): array
    {
        return $this->ThresholdLearningService->process($device);
    }


    //xử lý cảnh báo 
    private function processAlert(EnergyLog $log, Device $device): array
    {
        return $this->AlertService->checkPowerThreshold($log, $device);
    }

    //xử lý dl ESP32
    public function createFromIot(string $apiKey, array $data): array
    {
        $apiKey = trim($apiKey);

        if ($apiKey === '') {
            return [
                'success' => false,
                'statusCode' => 401,
                'message' => 'Thiếu API Key',
            ];
        }

        $iotDevice = $this->IotDevices->find()
            ->where([
                'iot_key' => $apiKey,
            ])
            ->first();

        if (!$iotDevice) {
            return [
                'success' => false,
                'statusCode' => 401,
                'message' => 'API Key không hợp lệ',
            ];
        }

        if ($iotDevice->status !== 'active') {
            return [
                'success' => false,
                'statusCode' => 403,
                'message' => 'Bộ đo IoT đã bị vô hiệu hóa',
            ];
        }

        $device = $this->Devices->find()
            ->where([
                'iot_device_id' => $iotDevice->id,
                'status' => 'active',
            ])
            ->first();

        if (!$device) {
            return [
                'success' => false,
                'statusCode' => 404,
                'message' => 'Bộ đo chưa được liên kết với thiết bị nào',
            ];
        }

        // Chuyển dữ liệu ESP32 gửi lên thành kiểu float.
        // Giá trị không tồn tại hoặc không phải số sẽ trở thành null.
        $voltage = $this->toNullableFloat($data['voltage'] ?? null);
        $current = $this->toNullableFloat($data['current'] ?? null);
        $power = $this->toNullableFloat($data['power'] ?? null);
        $energy = $this->toNullableFloat($data['energy'] ?? null);

        $now = FrozenTime::now();

        $isValid = $voltage !== null
            && $voltage > 80
            && $voltage <= 300
            && $current !== null
            && $current >= 0
            && $power !== null
            && $power >= 0
            && $energy !== null
            && $energy >= 0;

        // Luôn lưu bản đo để phục vụ truy vết
        // Bản đo không hợp lệ sẽ được đánh dấu is_valid = 0
        $log = $this->EnergyLogs->newEntity([
            'device_id' => $device->id,
            'voltage' => $voltage,
            'current' => $current,
            'power' => $power,
            'energy' => $energy,
            'is_valid' => $isValid ? 1 : 0,
            'created_at' => $now
        ]);

        if (!$this->EnergyLogs->save($log)) {
            return [
                'success' => false,
                'statusCode' => 500,
                'message' => 'Không lưu được dữ liệu',
                'errors' => $log->getErrors()
            ];
        }

        // Bộ đo vẫn được xem là đang kết nối dù dữ liệu đo không hợp lệ, vì hệ thống vẫn nhận được HTTP request từ ESP32
        $iotDevice = $this->IotDevices->patchEntity($iotDevice, [
            'last_seen_at' => $now
        ]);

        if (!$this->IotDevices->save($iotDevice)) {
            return [
                'success' => false,
                'statusCode' => 500,
                'message' => 'Không thể cập nhật trạng thái kết nối bộ đo IoT'
            ];
        }

        $learningResult = null;
        $alertResult = null;

        // Chỉ sử dụng dữ liệu hợp lệ cho các nghiệp vụ phân tích.
        if ($isValid) {
            // Cập nhật dữ liệu tổng hợp theo giờ, ngày và tháng.
            $this->SummaryService->updateSummaries($log);

            // Dữ liệu không hợp lệ không được dùng để học ngưỡng.
            $learningResult = $this->processThresholdLearning($device);

            // Dữ liệu không hợp lệ không được dùng để tạo cảnh báo.
            $alertResult = $this->processAlert($log, $device);
        }

        return [
            'success' => true,
            'statusCode' => 201,
            'message' => 'Ghi nhận dữ liệu điện năng thành công',
            'data' => [
                'energy_log_id' => $log->id,
                'device_id' => $device->id,
                'iot_device_id' => $iotDevice->id,
                'is_valid' => $isValid,
                'learning' => $learningResult['data'] ?? null,
                'alert' => $alertResult['data'] ?? null
            ],
        ];
    }

    private function toNullableFloat(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? (float)$value : null;
    }

    public function getList(?int $userId, mixed $deviceId = null, string $from = '', string $to = ''): array
    {
        $query = $this->EnergyLogs->find()
            ->contain(['Devices'])
            ->orderBy([
                'EnergyLogs.created_at' => 'DESC',
                'EnergyLogs.id' => 'DESC'
            ]);

        if ($userId !== null) {
            $query->innerJoinWith('Devices', function ($q) use ($userId) {
                return $q->where(['Devices.user_id' => $userId]);
            });
        }

        if (is_numeric($deviceId)) {
            $query->where(['EnergyLogs.device_id' => (int)$deviceId]);
        }

        if ($from !== '') {
            $query->where([
                'EnergyLogs.created_at >=' => $this->normalizeDateBoundary($from, false),
            ]);
        }

        if ($to !== '') {
            $query->where([
                'EnergyLogs.created_at <=' => $this->normalizeDateBoundary($to, true),
            ]);
        }

        return [
            'success' => true,
            'data' => $query->all()->toList(),
            'filters' => [
                'device_id' => is_numeric($deviceId) ? (int)$deviceId : null,
                'from' => $from !== '' ? $from : null,
                'to' => $to !== '' ? $to : null,
            ],
        ];
    }

    //ranh giới ngày
    private function normalizeDateBoundary(string $value, bool $isEndOfDay): string
    {
        if (strlen($value) === 10) {
            return $value . ($isEndOfDay ? ' 23:59:59' : ' 00:00:00');
        }

        return $value;
    }

    public function getDetail(int $id, ?int $userId = null): array
    {
        $query = $this->EnergyLogs->find()
            ->contain(['Devices'])
            ->where(['EnergyLogs.id' => $id]);

        if ($userId !== null) {
            $query->innerJoinWith('Devices', function ($q) use ($userId) {
                return $q->where(['Devices.user_id' => $userId]);
            });
        }

        $energyLog = $query->first();

        if (!$energyLog) {
            return [
                'success' => false,
                'statusCode' => 404,
                'message' => 'Không tìm thấy dữ liệu đo',
            ];
        }

        return [
            'success' => true,
            'statusCode' => 200,
            'data' => $energyLog,
        ];
    }

    //HOUR
    public function getHourPower(?int $userId): array
    {
        $today = FrozenTime::now()->format('Y-m-d');

        $query = $this->EnergyLogs->find();

        $query
            ->select([
                'hour' => $query->func()->hour([
                    'EnergyLogs.created_at' => 'identifier',
                ]),
                'power' => $query->func()->round([
                    $query->func()->avg('EnergyLogs.power'),
                    2,
                ]),
            ])
            ->where([
                'DATE(EnergyLogs.created_at)' => $today,
                'EnergyLogs.is_valid' => 1,
            ])
            ->groupBy([
                $query->func()->hour([
                    'EnergyLogs.created_at' => 'identifier'
                ]),
            ])
            ->orderByAsc('hour')
            ->enableHydration(false);

        if ($userId !== null) {
            $query->innerJoinWith('Devices', function ($q) use ($userId) {
                return $q->where(['Devices.user_id' => $userId]);
            });
        }

        $data = $query->toArray();

        foreach ($data as &$item) {
            $item['hour'] = str_pad((string)$item['hour'], 2, '0', STR_PAD_LEFT) . ':00';
            $item['power'] = (float)$item['power'];
        }

        return [
            'success' => true,
            'data' => $data,
        ];
    }

    //DAY
    public function getDayEnergy(?int $userId): array
    {
        $logs = $this->getValidEnergyLogs(
            $userId,
            FrozenTime::now()->startOfMonth(),
            FrozenTime::now()->endOfMonth()
        );

        $groupLogs = $this->groupByDateAndDevice($logs);

        return [
            'success' => true,
            'data' => $this->calculateDayEnergyData($groupLogs),
        ];
    }

    //MONTH
    public function getMonthEnergy(?int $userId): array
    {
        $logs = $this->getValidEnergyLogs(
            $userId,
            FrozenTime::now()->startOfYear(),
            FrozenTime::now()->endOfYear()
        );

        $groupLogs = $this->groupByMonthAndDevice($logs);

        return [
            'success' => true,
            'data' => $this->calculateMonthEnergyData($groupLogs),
        ];
    }

    //Lấy dữ liệu đo hợp lệ trong khoảng thời gian
    private function getValidEnergyLogs(
        ?int $userId,
        FrozenTime $from,
        FrozenTime $to
    ): array {
        $query = $this->EnergyLogs->find()
            ->select([
                'device_id' => 'EnergyLogs.device_id',
                'energy' => 'EnergyLogs.energy',
                'created_at' => 'EnergyLogs.created_at',
            ])
            ->where([
                'EnergyLogs.is_valid' => 1,           //chỉ lấy dữ liệu hợp lệ
                'EnergyLogs.energy IS NOT' => null,   //không lấy bản ghi không có energy
                'EnergyLogs.created_at >=' => $from,
                'EnergyLogs.created_at <=' => $to,
            ])
            ->orderByAsc('EnergyLogs.created_at')
            ->enableHydration(false);      //cakePHP trả về mảng thường

        if ($userId !== null) {
            $query->innerJoinWith('Devices', function ($q) use ($userId) {    //chỉ xem thiết bị của chính mình
                return $q->where([
                    'Devices.user_id' => $userId,
                ]);
            });
        }

        return $query->toArray();
    }

    //Gom dữ liệu theo ngày và thiết bị
    private function groupByDateAndDevice(array $logs): array
    {
        $group = [];

        foreach ($logs as $log) {
            $date = $this->formatDay($log['created_at']);
            $deviceId = (int)$log['device_id'];

            //mỗi ngày có nhiều thiết bị, mỗi thiết bị có nhiều giá trị energy
            $group[$date][$deviceId][] = (float)$log['energy'];
        }

        return $group;
    }

    //Gom dữ liệu theo tháng và thiết bị
    private function groupByMonthAndDevice(array $logs): array
    {
        $group = [];

        foreach ($logs as $log) {
            $monthKey = $this->formatMonth($log['created_at']);
            $deviceId = (int)$log['device_id'];

            //mỗi tháng có nhiều thiết bị, mỗi thiết bị có nhiều giá trị energy
            $group[$monthKey][$deviceId][] = (float)$log['energy'];
        }

        return $group;
    }

    //Định dạng ngày để gom dữ liệu theo ngày
    private function formatDay(mixed $createdAt): string
    {
        $date = $createdAt instanceof FrozenTime
            ? $createdAt
            : new FrozenTime($createdAt);

        return $date->format('Y-m-d');
    }

    //Định dạng khóa tháng để gom dữ liệu theo tháng
    private function formatMonth(mixed $createdAt): string
    {
        $date = $createdAt instanceof FrozenTime
            ? $createdAt
            : new FrozenTime($createdAt);

        return $date->format('Y-m');
    }

    //Tính dữ liệu điện năng tiêu thụ theo ngày
    private function calculateDayEnergyData(array $groupLogs): array
    {
        $data = [];

        foreach ($groupLogs as $date => $devices) {
            $totalEnergy = 0;

            foreach ($devices as $energyValues) {
                //tính điện năng từng thiết bị rồi cộng vào tổng theo ngày
                $totalEnergy += $this->calculateEnergy($energyValues);
            }

            $data[] = [
                'date' => $date,
                'energy' => round($totalEnergy, 3),
            ];
        }

        return $data;
    }

    //Tính dữ liệu điện năng tiêu thụ theo tháng
    private function calculateMonthEnergyData(array $groupLogs): array
    {
        $data = [];

        foreach ($groupLogs as $monthKey => $devices) {
            $totalEnergy = 0;

            foreach ($devices as $energyValues) {
                //tính điện năng từng thiết bị rồi cộng vào tổng theo tháng
                $totalEnergy += $this->calculateEnergy($energyValues);
            }

            [$year, $month] = explode('-', $monthKey);

            $data[] = [
                'year' => (int)$year,
                'month' => (int)$month,
                'label' => 'Tháng ' . $month,
                'energy' => round($totalEnergy, 3),
            ];
        }

        return $data;
    }

    //tính lượng điện năng tiêu thụ
    private function calculateEnergy(array $energyValues): float
    {
        if (count($energyValues) < 2) {        //phải có từ 2 log mới tính được lượng tiêu thụ
            return 0;
        }

        //energy của PZEM là chỉ số tích lũy nên điện năng tiêu thụ = max - min
        $totalEnergy = max($energyValues) - min($energyValues);

        //tránh trường hợp dữ liệu bất thường làm kết quả bị âm
        return max(0, $totalEnergy);
    }

}