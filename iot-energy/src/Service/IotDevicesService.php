<?php
declare(strict_types=1);

namespace App\Service;

use App\Model\Table\DevicesTable;
use App\Model\Table\IotDevicesTable;
use Cake\I18n\FrozenTime;
use Cake\ORM\TableRegistry;

class IotDevicesService
{
    protected IotDevicesTable $IotDevices;
    protected DevicesTable $Devices;

    public function __construct()
    {
        $locator = TableRegistry::getTableLocator();

        $this->IotDevices = $locator->get('IotDevices');
        $this->Devices = $locator->get('Devices');
    }

    //Lấy danh sách bộ đo IoT
    public function getList(
        ?string $keyword = null,
        ?string $status = null
    ): array {
        $keyword = trim((string)$keyword);
        $status = trim((string)$status);

        $query = $this->IotDevices->find()
            ->contain([
                'Devices' => function ($query) {
                    return $query
                        ->select([
                            'Devices.id',
                            'Devices.iot_device_id',
                            'Devices.user_id',
                            'Devices.name',
                            'Devices.device_type',
                            'Devices.status',
                        ])
                        ->where([
                            'Devices.status' => 'active',
                        ])
                        ->orderByDesc('Devices.id');
                },
            ])
            ->orderByAsc('IotDevices.id');         //TĂNG DẦN - IOT_0001, IOT_0002

        if ($keyword !== '') {
            $query->where([
                'IotDevices.iot_key LIKE' => '%' . $keyword . '%',
            ]);
        }

        if (in_array($status, ['active', 'disabled'], true)) {
            $query->where([
                'IotDevices.status' => $status,
            ]);
        }

        $iotDevices = [];

        foreach ($query->all() as $iotDevice) {
            //Theo nghiệp vụ chỉ có tối đa một thiết bị active
            $linkedDevice = $iotDevice->devices[0] ?? null;

            $iotDevices[] = [
                'id' => (int)$iotDevice->id,
                'iot_key' => $iotDevice->iot_key,
                'status' => $iotDevice->status,
                'last_seen_at' => $iotDevice->last_seen_at,
                'created_at' => $iotDevice->created_at,
                'updated_at' => $iotDevice->updated_at,
                'connection_status' => $this->getConnectionStatus(
                    $iotDevice->last_seen_at
                ),
                'linked_device' => $linkedDevice === null
                    ? null
                    : [
                        'id' => (int)$linkedDevice->id,
                        'user_id' => (int)$linkedDevice->user_id,
                        'name' => $linkedDevice->name,
                        'device_type' => $linkedDevice->device_type,
                        'status' => $linkedDevice->status
                    ],
            ];
        }

        return [
            'success' => true,
            'statusCode' => 200,
            'filters' => [
                'keyword' => $keyword,
                'status' => $status,
            ],
            'data' => $iotDevices
        ];
    }

    //Thêm bộ đo IoT mới
    public function create(array $data): array
    {
        $apiKey = trim((string)($data['iot_key'] ?? ''));

        if ($apiKey === '') {
            return [
                'success' => false,
                'statusCode' => 422,
                'message' => 'Vui lòng nhập tên định danh IOT Key của bộ đo IoT.',
                'errors' => [
                    'iot_key' => [
                        'required' => 'Vui lòng nhập tên định danh IOT Key của bộ đo IoT.'
                    ],
                ],
            ];
        }

        //Kiểm tra trước để trả thông báo rõ ràng
        $existingIotDevice = $this->IotDevices->find()
            ->where([
                'IotDevices.iot_key' => $apiKey
            ])
            ->first();

        if ($existingIotDevice) {
            return [
                'success' => false,
                'statusCode' => 422,
                'message' => 'API Key đã tồn tại trong hệ thống.',
                'errors' => [
                    'iot_key' => [
                        'unique' => 'API Key đã tồn tại trong hệ thống.'
                    ],
                ],
            ];
        }

        $now = FrozenTime::now();

        $iotDevice = $this->IotDevices->newEmptyEntity();

        $iotDevice = $this->IotDevices->patchEntity($iotDevice, [
            'iot_key' => $apiKey,

            //Bộ đo được cấp phép ngay khi admin khai báo
            'status' => 'active',

            //Bộ đo chưa từng gửi dữ liệu
            'last_seen_at' => null,

            //Quy ước timestamp A
            'created_at' => $now,
            'updated_at' => null
        ]);

        if (!$this->IotDevices->save($iotDevice)) {
            return [
                'success' => false,
                'statusCode' => 422,
                'message' => 'Không thể thêm bộ đo IoT.',
                'errors' => $iotDevice->getErrors()
            ];
        }

        return [
            'success' => true,
            'statusCode' => 201,
            'message' => 'Thêm bộ đo IoT thành công.',
            'data' => $iotDevice
        ];
    }

    //Vô hiệu hóa bộ đo IoT
    public function disable(int $id): array
    {
        $iotDevice = $this->IotDevices->find()
            ->where([
                'IotDevices.id' => $id
            ])
            ->first();

        if (!$iotDevice) {
            return [
                'success' => false,
                'statusCode' => 404,
                'message' => 'Không tìm thấy bộ đo IoT.'
            ];
        }

        $connection = $this->IotDevices
            ->getConnection();

        try {
            return $connection->transactional(
                function () use ($iotDevice): array {
                    //Lấy các thiết bị active trước khi chuyển trạng thái
                    $activeDevices = $this->Devices->find()
                        ->select([
                            'Devices.id',
                            'Devices.name'
                        ])
                        ->where([
                            'Devices.iot_device_id' => $iotDevice->id,
                            'Devices.status' => 'active'
                        ])
                        ->enableHydration(false)
                        ->toArray();

                    $iotDevice = $this->IotDevices->patchEntity(
                        $iotDevice,
                        [
                            'status' => 'disabled',
                            'updated_at' => FrozenTime::now()
                        ]
                    );

                    if (!$this->IotDevices->save($iotDevice)) {
                        throw new \RuntimeException(
                            'IOT_DEVICE_DISABLE_FAILED'
                        );
                    }

                    //Đưa tất cả thiết bị active về trạng thái an toàn
                    $this->Devices->updateAll(
                        [
                            'status' => 'inactive',
                            'updated_at' => FrozenTime::now()
                        ],
                        [
                            'iot_device_id' => $iotDevice->id,
                            'status' => 'active'
                        ]
                    );

                    return [
                        'success' => true,
                        'statusCode' => 200,
                        'message' => 'Vô hiệu hóa bộ đo IoT thành công.',
                        'data' => [
                            'iot_device' => [
                                'id' => (int)$iotDevice->id,
                                'iot_key' => $iotDevice->iot_key,
                                'status' => $iotDevice->status,
                                'updated_at' => $iotDevice->updated_at
                            ],
                            'affected_devices' => $activeDevices
                        ],
                    ];
                }
            );
        } catch (\Throwable) {
            return [
                'success' => false,
                'statusCode' => 500,
                'message' => 'Không thể vô hiệu hóa bộ đo IoT.'
            ];
        }
    }

    //Kích hoạt lại bộ đo IoT
    public function enable(int $id): array
    {
        $iotDevice = $this->IotDevices->find()
            ->where([
                'IotDevices.id' => $id
            ])
            ->first();

        if (!$iotDevice) {
            return [
                'success' => false,
                'statusCode' => 404,
                'message' => 'Không tìm thấy bộ đo IoT.'
            ];
        }

        $iotDevice = $this->IotDevices->patchEntity(
            $iotDevice,
            [
                'status' => 'active',
                'updated_at' => FrozenTime::now()
            ]
        );

        if (!$this->IotDevices->save($iotDevice)) {
            return [
                'success' => false,
                'statusCode' => 422,
                'message' => 'Không thể kích hoạt bộ đo IoT.',
                'errors' => $iotDevice->getErrors()
            ];
        }

        return [
            'success' => true,
            'statusCode' => 200,
            'message' => 'Kích hoạt lại bộ đo IoT thành công.',
            'data' => [
                'id' => (int)$iotDevice->id,
                'iot_key' => $iotDevice->iot_key,
                'status' => $iotDevice->status,
                'updated_at' => $iotDevice->updated_at
            ],
        ];
    }

    //Xác định trạng thái kết nối từ lần gửi dữ liệu gần nhất
    private function getConnectionStatus(
        FrozenTime|string|null $lastSeenAt
    ): string {
        if ($lastSeenAt === null || $lastSeenAt === '') {
            return 'offline';
        }

        $lastSeen = $lastSeenAt instanceof FrozenTime
            ? $lastSeenAt
            : new FrozenTime($lastSeenAt);

        $diffSeconds =
            FrozenTime::now()->getTimestamp()
            - $lastSeen->getTimestamp();

        return $diffSeconds <= 30
            ? 'online'
            : 'offline';
    }
}