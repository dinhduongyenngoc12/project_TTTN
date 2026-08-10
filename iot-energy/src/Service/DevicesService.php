<?php
declare(strict_types=1);

namespace App\Service;

use App\Model\Table\DevicesTable;
use Cake\I18n\FrozenTime;
use Cake\ORM\Query\SelectQuery;
use Cake\ORM\TableRegistry;

use App\Service\AlertConfigsService;

class DevicesService
{
    protected DevicesTable $Devices;
    protected AlertConfigsService $alertConfigsService;

    public function __construct()
    {
        $devicesTable = TableRegistry::getTableLocator()->get('Devices');
        $this->Devices = $devicesTable;

        $this->alertConfigsService = new AlertConfigsService();
    }

    public function getList(?string $keyword = null, ?int $userId = null): SelectQuery
    {
        $query = $this->Devices->find()
            ->join([
                'u' => [
                    'table' => 'users',
                    'type' => 'LEFT',
                    'conditions' => 'u.id = Devices.user_id',
                ],
                'iot' => [
                    'table' => 'iot_devices',
                    'type' => 'LEFT',
                    // Thiết bị đã inactive chỉ là lịch sử và không còn được
                    // nhận trạng thái kết nối hiện tại của bộ đo.
                    'conditions' => [
                        'iot.id = Devices.iot_device_id',
                        'Devices.status' => 'active',
                    ],
                ],
            ])
            ->select([
                'id' => 'Devices.id',
                'name' => 'Devices.name',
                'device_type' => 'Devices.device_type',
                'rated_power' => 'Devices.rated_power',
                'user_id' => 'Devices.user_id',
                'iot_device_id' => 'Devices.iot_device_id',
                'status' => 'Devices.status',
                'activated_at' => 'Devices.activated_at',
                'created_at' => 'Devices.created_at',
                'updated_at' => 'Devices.updated_at',

                'username' => 'u.username',

                'iot_iot_key' => 'iot.iot_key',      //alias: iot.iot_key AS iot_iot_key
                'iot_status' => 'iot.status',
                'iot_last_seen_at' => 'iot.last_seen_at',
            ]);

        if ($userId !== null) {
            $query->where(['Devices.user_id' => $userId]);
        }

        if ($keyword !== null && $keyword !== '') {
            $query->where([
                'Devices.name LIKE' => '%' . trim($keyword) . '%',
            ]);
        }

        return $query;
    }

    public function getById($id = null)
    {
        return $this->Devices->get($id, contain: [
            'Users',
            'EnergyLogs',
            'AlertConfigs',
        ]);
    }

    public function create(array $data): array
    {
        $iotDevicesTable = TableRegistry::getTableLocator()->get('IotDevices');
        $alertConfigsTable = TableRegistry::getTableLocator()->get('AlertConfigs');

        $device = $this->Devices->newEmptyEntity();

        $apiKey = trim((string)($data['iot_key'] ?? ''));

        if ($apiKey === '') {
            $device->setError('iot_key', [
                'required' => 'Vui lòng nhập tên định danh IOT Key của bộ đo IoT',
            ]);

            return [
                'device' => $device,
                'saved' => false,
                'message' => 'Vui lòng nhập tên định danh IOT Key của bộ đo IoT',
            ];
        }

        $iotDevice = $iotDevicesTable->find()
            ->where([
                'IotDevices.iot_key' => $apiKey,
            ])
            ->first();

        if (!$iotDevice) {
            $device->setError('iot_key', [
                'notFound' => 'API Key không tồn tại trong hệ thống',
            ]);

            return [
                'device' => $device,
                'saved' => false,
                'message' => 'API Key không tồn tại trong hệ thống',
            ];
        }

        if ($iotDevice->status !== 'active') {
            $device->setError('iot_key', [
                'disabled' => 'Bộ đo IoT đã bị vô hiệu hóa',
            ]);

            return [
                'device' => $device,
                'saved' => false,
                'message' => 'Bộ đo IoT đã bị vô hiệu hóa',
            ];
        }

        $failureMessage = 'Không thể tạo thiết bị';

        try {
            return $this->Devices->getConnection()->transactional(
                function () use (
                    &$device,
                    &$failureMessage,
                    $data,
                    $apiKey,
                    $iotDevice,
                    $iotDevicesTable,
                    $alertConfigsTable
                ): array {
                    /*
                    * Khóa bản ghi bộ đo trong transaction.
                    * Mọi request cùng sử dụng một API Key phải chờ nhau,
                    * tránh tạo đồng thời nhiều Device active cho cùng bộ đo.
                    */
                    $lockedIotDevice = $iotDevicesTable->find()
                        ->where([
                            'IotDevices.id' => $iotDevice->id,
                            'IotDevices.iot_key' => $apiKey,
                        ])
                        ->epilog('FOR UPDATE')
                        ->first();

                    if (!$lockedIotDevice) {
                        $device->setError('iot_key', [
                            'notFound' => 'API Key không còn tồn tại trong hệ thống',
                        ]);

                        $failureMessage = 'API Key không còn tồn tại trong hệ thống';

                        throw new \RuntimeException('IOT_DEVICE_NOT_FOUND');
                    }

                    /*
                    * Kiểm tra lại trạng thái sau khi đã lấy lock,
                    * vì trạng thái có thể đã thay đổi sau lần kiểm tra đầu tiên.
                    */
                    if ($lockedIotDevice->status !== 'active') {
                        $device->setError('iot_key', [
                            'disabled' => 'Bộ đo IoT đã bị vô hiệu hóa',
                        ]);

                        $failureMessage = 'Bộ đo IoT đã bị vô hiệu hóa';

                        throw new \RuntimeException('IOT_DEVICE_DISABLED');
                    }

                    /*
                    * Device cũ của cùng bộ đo được giữ lại làm lịch sử,
                    * nhưng không còn nhận dữ liệu mới.
                    */
                    $this->Devices->updateAll(
                        [
                            'status' => 'inactive',
                            // Ngắt liên kết hiện tại. Lịch sử số đo vẫn thuộc
                            // device cũ thông qua energy_logs.device_id.
                            'iot_device_id' => null,
                        ],
                        [
                            'iot_device_id' => $lockedIotDevice->id,
                            'status' => 'active',
                        ]
                    );

                    $deviceData = $data;

                    unset(
                        $deviceData['iot_key'],
                        $deviceData['id'],
                        $deviceData['status'],
                        $deviceData['iot_device_id'],
                        $deviceData['activated_at'],
                        $deviceData['created_at'],
                        $deviceData['updated_at']
                    );

                    //Dùng cùng một thời điểm cho lúc tạo và lúc bắt đầu theo dõi thiết bị
                    $now = FrozenTime::now();

                    $deviceData['iot_device_id'] = $lockedIotDevice->id;
                    $deviceData['status'] = 'active';

                    //Thời điểm thiết bị bắt đầu được theo dõi
                    $deviceData['activated_at'] = $now;

                    //Thời điểm bản ghi thiết bị được tạo
                    $deviceData['created_at'] = $now;

                    //Thiết bị chưa được chỉnh sửa nên chưa có thời điểm cập nhật
                    $deviceData['updated_at'] = null;

                    $device = $this->Devices->patchEntity(
                        $device,
                        $deviceData
                    );

                    if (!$this->Devices->save($device)) {
                        $failureMessage = 'Không thể tạo thiết bị';

                        throw new \RuntimeException('DEVICE_SAVE_FAILED');
                    }

                    $temporaryThreshold = null;

                    if (
                        $device->rated_power !== null
                        && (float)$device->rated_power > 0
                    ) {
                        $temporaryThreshold = round(
                            (float)$device->rated_power * 1.2,
                            2
                        );
                    }

                    $alertConfig = $alertConfigsTable->newEntity([
                        'device_id' => $device->id,
                        'power_threshold' => $temporaryThreshold,
                        'default_threshold' => null,
                        'mode' => 'auto',
                        'learning_status' => 'learning',
                        'learned_at' => null,
                        'last_learned_date' => null,
                        'last_email_sent_at' => null,
                    ]);

                    if (!$alertConfigsTable->save($alertConfig)) {
                        $device->setError('alert_config', [
                            'saveFailed' => 'Không thể tạo cấu hình cảnh báo mặc định',
                        ]);

                        $failureMessage = 'Không thể tạo cấu hình cảnh báo mặc định';

                        throw new \RuntimeException('ALERT_CONFIG_SAVE_FAILED');
                    }

                    return [
                        'device' => $device,
                        'saved' => true,
                        'message' => 'Tạo thiết bị thành công',
                    ];
                }
            );
        } catch (\Throwable) {
            return [
                'device' => $device,
                'saved' => false,
                'message' => $failureMessage,
            ];
        }
    }

    public function update(int $id, int $userId, array $data = []): array
    {
        $device = $this->Devices->find()
            ->where([
                'Devices.id' => $id,
                'Devices.user_id' => $userId,
            ])
            ->first();

        if (!$device) {
            $device = $this->Devices->newEmptyEntity();
            $device->setError('id', [
                'notFound' => 'Không tìm thấy thiết bị hoặc bạn không có quyền cập nhật',
            ]);

            return [
                'device' => $device,
                'saved' => false,
                'message' => 'Không tìm thấy thiết bị hoặc bạn không có quyền cập nhật',
            ];
        }

        unset(
            $data['iot_key'],
            $data['iot_device_id'],
            $data['status'],
            $data['activated_at'],
            $data['created_at']
        );

        //Lưu thời điểm cập nhật thông tin thiết bị
        $data['updated_at'] = FrozenTime::now();

        $device = $this->Devices->patchEntity($device, $data);
        $saved = (bool)$this->Devices->save($device);

        if ($saved) {
            /*
            * Khi rated_power thay đổi trong giai đoạn learning,
            * ngưỡng tạm cần được tính lại để đúng với thông tin thiết bị mới nhất.
            */
            $this->alertConfigsService->refreshTemporaryThreshold($device);
        }

        return [
            'device' => $device,
            'saved' => $saved,
            'message' => $saved
                ? 'Cập nhật thiết bị thành công'
                : 'Không thể cập nhật thiết bị',
        ];
    }

    public function remove($id = null): bool
    {
        $device = $this->Devices->get($id);

        return (bool)$this->Devices->delete($device);
    }


    public function getDetail(int $deviceId, int $userId): ?array
    {
        $energyLogsTable = TableRegistry::getTableLocator()->get('EnergyLogs');
        $alertConfigsTable = TableRegistry::getTableLocator()->get('AlertConfigs');
        $alertLogsTable = TableRegistry::getTableLocator()->get('AlertLogs');

        $device = $this->Devices->find()
            ->contain([
                'IotDevices'                
            ])
            ->where([
                'Devices.id' => $deviceId,
                'Devices.user_id' => $userId
            ])
            ->first();

            if (!$device) {
                return null;
            }

        // Chỉ device active mới được kế thừa trạng thái kết nối của bộ đo.
        // Device inactive phải luôn offline và không có "lần gửi cuối" mới.
        $lastSeenAt = $device->status === 'active'
            ? $device->iot_device?->last_seen_at
            : null;

        $latestLog = $energyLogsTable->find()     //lấy dl mới nhất
            ->where([
                'EnergyLogs.device_id' => $deviceId
            ])
            ->orderBy([
                'EnergyLogs.created_at' => 'DESC' //giam dan
            ])
            ->first();

        $alertConfig = $alertConfigsTable->find()
            ->where([
                'AlertConfigs.device_id' => $deviceId
            ])
            ->first();

        $latestAlert = $alertLogsTable->find()
            ->join([
                'table' => 'energy_logs',
                'alias' => 'el',
                'type' => 'INNER',
                'conditions' => 'el.id = AlertLogs.energy_log_id'
            ])
            ->where([
                'el.device_id' => $deviceId
            ])
            ->select([
                'id' => 'AlertLogs.id',
                'power_value' => 'AlertLogs.power_value',
                'email_sent' => 'AlertLogs.email_sent',
                'created_at' => 'AlertLogs.created_at'
            ])
            ->orderBy([
                'AlertLogs.created_at' => 'DESC'
            ])
            ->first();

        return [
            'device' => [
                'id' => $device->id,
                'name' => $device->name,
                'device_type' => $device->device_type,
                'rated_power' => $device->rated_power,
                'status' => $device->status,
                'last_seen_at' => $lastSeenAt,
                'connection_status' => $this->getConnectionStatus($lastSeenAt)        //tính trạng thái onl/off
            ],
            'latest_log' => $latestLog ? [
                'voltage' => $latestLog->voltage,
                'current' => $latestLog->current,
                'power' => $latestLog->power,
                'energy' => $latestLog->energy,
                'created_at' => $latestLog->created_at
            ] : null,
            'alert_config' => $alertConfig ? [
                'power_threshold' => $alertConfig->power_threshold,
                'default_threshold' => $alertConfig->default_threshold,
                'mode' => $alertConfig->mode,
                'learning_status' => $alertConfig->learning_status
            ] : null,
            'latest_alert' => $latestAlert ? [
                'id' => $latestAlert->id,
                'power_value' => $latestAlert->power_value,
                'email_sent' => $latestAlert->email_sent,
                'created_at' => $latestAlert->created_at
            ] : null,
        ];
    }

    //tính trạng thái onl/off từ 
    private function getConnectionStatus(mixed $lastSeenAt): string
    {
        if ($lastSeenAt === null || $lastSeenAt === '') {
            return 'offline';
        }

        try {
            if ($lastSeenAt instanceof \DateTimeInterface) {
                $lastSeenTimestamp = $lastSeenAt->getTimestamp();
            } else {
                $lastSeenTimestamp = (new FrozenTime(
                    (string)$lastSeenAt
                ))->getTimestamp();
            }
        } catch (\Throwable) {
            return 'offline';
        }

        $differenceInSeconds =
            FrozenTime::now()->getTimestamp() - $lastSeenTimestamp;

        return $differenceInSeconds >= 0
            && $differenceInSeconds <= 30
                ? 'online'
                : 'offline';
    }
}
