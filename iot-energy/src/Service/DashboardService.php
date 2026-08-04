<?php
declare(strict_types=1);

namespace App\Service;

use App\Model\Table\AlertLogsTable;
use App\Model\Table\DevicesTable;
use App\Model\Table\HourSummariesTable;
use App\Model\Table\IotDevicesTable;
use App\Model\Table\UsersTable;
use Cake\I18n\FrozenTime;
use Cake\ORM\TableRegistry;

class DashboardService
{
    protected UsersTable $Users;
    protected DevicesTable $Devices;
    protected AlertLogsTable $AlertLogs;
    protected HourSummariesTable $HourSummaries;
    protected IotDevicesTable $IotDevices;

    public function __construct()
    {
        $locator = TableRegistry::getTableLocator();

        $this->Users = $locator->get('Users');
        $this->Devices = $locator->get('Devices');
        $this->AlertLogs = $locator->get('AlertLogs');
        $this->HourSummaries = $locator->get('HourSummaries');
        $this->IotDevices = $locator->get('IotDevices');
    }

    //Lấy toàn bộ dữ liệu tóm tắt cho trang chủ người dùng
    public function getUserDashboard(int $userId): array
    {
        $currentUser = $this->getCurrentUser($userId);

        if ($currentUser === null) {
            return [
                'success' => false,
                'statusCode' => 404,
                'message' => 'Không tìm thấy người dùng.',
            ];
        }

        return [
            'success' => true,
            'statusCode' => 200,
            'data' => [
                'user' => $currentUser,
                'device_count' => $this->getDeviceCount($userId),
                'energy_trend' => $this->buildEnergyTrend($userId),
                'recent_alerts' => $this->getLatestAlerts($userId),
            ],
        ];
    }

    // Tổng hợp các số liệu ngắn gọn cho trang Tổng quan của Admin.
    public function getSystemDashboard(): array
    {
        return [
            'success' => true,
            'statusCode' => 200,
            'data' => [
                'total_users' => $this->countSystemUsers(),
                'total_devices' => $this->countSystemDevices(),
                'active_iot_devices' => $this->countActiveIotDevices(),
                'today_alerts' => $this->countTodayAlerts(),
            ],
        ];
    }

    // Tài khoản Admin không được tính vào số người dùng của hệ thống.
    private function countSystemUsers(): int
    {
        return $this->Users->find()
            ->where([
                'Users.role !=' => 'admin',
            ])
            ->count();
    }

    // Đếm toàn bộ thiết bị đã khai báo, bao gồm active và inactive.
    private function countSystemDevices(): int
    {
        return $this->Devices->find()->count();
    }

    // Status active nghĩa là bộ đo đang được phép sử dụng, không phải trạng thái online.
    private function countActiveIotDevices(): int
    {
        return $this->IotDevices->find()
            ->where([
                'IotDevices.status' => 'active',
            ])
            ->count();
    }

    // Chỉ đếm cảnh báo được tạo từ đầu ngày đến cuối ngày theo timezone backend.
    private function countTodayAlerts(): int
    {
        $now = FrozenTime::now();

        return $this->AlertLogs->find()
            ->where([
                'AlertLogs.created_at >=' => $now->startOfDay(),
                'AlertLogs.created_at <=' => $now->endOfDay(),
            ])
            ->count();
    }

    //Lấy thông tin cơ bản của người dùng đang đăng nhập
    private function getCurrentUser(int $userId): ?array
    {
        $user = $this->Users->find()
            ->select([
                'id' => 'Users.id',
                'username' => 'Users.username',
                'email' => 'Users.email',
            ])
            ->where([
                'Users.id' => $userId,
            ])
            ->enableHydration(false)
            ->first();

        if (!$user) {
            return null;
        }

        return [
            'id' => (int)$user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
        ];
    }

    //Đếm toàn bộ thiết bị thuộc tài khoản người dùng
    private function getDeviceCount(int $userId): int
    {
        return $this->Devices->find()
            ->where([
                'Devices.user_id' => $userId,
            ])
            ->count();
    }

    //So sánh điện năng hôm nay với cùng khoảng thời gian của hôm qua
    private function buildEnergyTrend(int $userId): array
    {
        $now = FrozenTime::now();
        $currentHour = (int)$now->format('H');

        /*
         * Dữ liệu hôm nay được tính từ đầu ngày đến hết giờ hiện tại.
         * Ví dụ lúc 15:30, khoảng tính là từ 00:00:00 đến 15:59:59.
         */
        $todayFrom = $now->startOfDay();
        $todayTo = $now->setTime(
            $currentHour,
            59,
            59
        );

        /*
         * Dữ liệu hôm qua được tính trong cùng khoảng thời gian
         * để bảo đảm hai giá trị có thể so sánh trực tiếp.
         */
        $yesterday = $now->subDays(1);
        $yesterdayFrom = $yesterday->startOfDay();
        $yesterdayTo = $yesterday->setTime(
            $currentHour,
            59,
            59
        );

        $todayEnergy = $this->calculateEnergyInPeriod(
            $userId,
            $todayFrom,
            $todayTo
        );

        $yesterdayEnergy = $this->calculateEnergyInPeriod(
            $userId,
            $yesterdayFrom,
            $yesterdayTo
        );

        $difference = round(
            $todayEnergy - $yesterdayEnergy,
            3
        );

        /*
         * Không tính phần trăm khi hôm qua không có dữ liệu
         * để tránh phép chia cho 0.
         */
        if ($yesterdayEnergy <= 0) {
            return [
                'today_energy' => $todayEnergy,
                'yesterday_energy' => $yesterdayEnergy,
                'difference' => $difference,          //chệnh lệch
                'percentage' => null,                //%     
                'trend' => 'no_previous_data'       
            ];
        }

        $percentage = round(
            ($difference / $yesterdayEnergy) * 100, 2
        );

        $trend = 'unchanged';

        if ($difference > 0) {
            $trend = 'increase';    //tăng
        } elseif ($difference < 0) {
            $trend = 'decrease';    //giảm
        }

        return [
            'today_energy' => $todayEnergy,
            'yesterday_energy' => $yesterdayEnergy,
            'difference' => $difference,
            'percentage' => $percentage,
            'trend' => $trend
        ];
    }

    //Tính tổng điện năng trong một khoảng thời gian từ dữ liệu tổng hợp theo giờ
    private function calculateEnergyInPeriod(
        int $userId,
        FrozenTime $from,
        FrozenTime $to
    ): float {
        $query = $this->HourSummaries->find()
            ->select([
                'total_energy' => 'HourSummaries.total_energy',
            ])
            ->where([
                'HourSummaries.hour_at >=' => $from,
                'HourSummaries.hour_at <=' => $to,
            ])
            ->innerJoinWith(
                'Devices',
                function ($query) use ($userId) {
                    return $query->where([
                        'Devices.user_id' => $userId,
                    ]);
                }
            )
            ->enableHydration(false);

        $totalEnergy = 0.0;

        foreach ($query->toArray() as $row) {
            $totalEnergy += (float)$row['total_energy'];
        }

        return round($totalEnergy, 3);
    }

    //Lấy ba cảnh báo mới nhất của các thiết bị thuộc người dùng
    private function getLatestAlerts(int $userId): array
    {
        $alerts = $this->AlertLogs->find()
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
            ])
            ->select([
                'id' => 'AlertLogs.id',
                'device_id' => 'devices.id',
                'device_name' => 'devices.name',
                'power_value' => 'AlertLogs.power_value',
                'threshold_value' => 'AlertLogs.threshold_value',
                'created_at' => 'AlertLogs.created_at',
            ])
            ->where([
                'devices.user_id' => $userId,
            ])
            ->orderBy([
                'AlertLogs.created_at' => 'DESC',
                'AlertLogs.id' => 'DESC',
            ])
            ->limit(3)
            ->enableHydration(false)
            ->toArray();

        //Chuẩn hóa kiểu dữ liệu trước khi trả về frontend
        foreach ($alerts as &$alert) {
            $alert['id'] = (int)$alert['id'];
            $alert['device_id'] = (int)$alert['device_id'];
            $alert['power_value'] =
                (float)$alert['power_value'];
            $alert['threshold_value'] =
                (float)$alert['threshold_value'];
        }

        unset($alert);

        return $alerts;
    }
}
