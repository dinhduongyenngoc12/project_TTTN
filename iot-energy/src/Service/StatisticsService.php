<?php
declare(strict_types=1);

namespace App\Service;

use App\Model\Table\DailySummariesTable;
use App\Model\Table\HourSummariesTable;
use App\Model\Table\MonthSummariesTable;
use Cake\I18n\FrozenTime;
use Cake\ORM\TableRegistry;

class StatisticsService
{
    protected HourSummariesTable $HourSummaries;
    protected DailySummariesTable $DailySummaries;
    protected MonthSummariesTable $MonthSummaries;

    public function __construct()
    {
        $locator = TableRegistry::getTableLocator();

        $this->HourSummaries = $locator->get('HourSummaries');
        $this->DailySummaries = $locator->get('DailySummaries');
        $this->MonthSummaries = $locator->get('MonthSummaries');
    }

    //Lấy công suất trung bình theo từng giờ trong ngày
    public function getHourPower(?int $userId, ?string $date = null): array
    {
        $date = $date ?: FrozenTime::now()->format('Y-m-d');

        $from = new FrozenTime($date . ' 00:00:00');
        $to = new FrozenTime($date . ' 23:59:59');

        $query = $this->HourSummaries->find()
            ->select([
                'hour_at' => 'HourSummaries.hour_at',
                'avg_power' => 'HourSummaries.avg_power',
            ])
            ->where([
                'HourSummaries.hour_at >=' => $from,
                'HourSummaries.hour_at <=' => $to,
            ])
            ->enableHydration(false);

        if ($userId !== null) {
            $query->innerJoinWith('Devices', function ($q) use ($userId) {
                return $q->where([
                    'Devices.user_id' => $userId,
                ]);
            });
        }

        $rows = $query->toArray();

        return [
            'success' => true,
            'data' => $this->fillHours($rows)       
        ];
    }

    //Lấy điện năng tiêu thụ theo từng ngày trong tháng
    public function getDayEnergy(?int $userId, ?string $month = null): array
    {
        $month = $month ?: FrozenTime::now()->format('Y-m');          // $month ?: đã có gtri thì giữ nguyên, null thì gán tháng hiện tại

        //tách năm - tháng bằng explode cắt chuỗi tại '-'
        [$year, $monthNumber] = explode('-', $month);

        $from = new FrozenTime($month . '-01 00:00:00');
        $daysInMonth = (int)$from->format('t');       //php hiểu 't' là Total days in month

        $query = $this->DailySummaries->find()
            ->select([
                'date_at' => 'DailySummaries.date_at',
                'total_energy' => 'DailySummaries.total_energy',
            ])
            ->where([
                'DailySummaries.date_at >=' => $from->format('Y-m-01'),
                'DailySummaries.date_at <=' => $from->format('Y-m-' . $daysInMonth),
            ])
            ->enableHydration(false);

        if ($userId !== null) {
            $query->innerJoinWith('Devices', function ($q) use ($userId) {
                return $q->where([
                    'Devices.user_id' => $userId,
                ]);
            });
        }

        $rows = $query->toArray();
        $data = $this->fillDays((int)$year, (int)$monthNumber, $daysInMonth, $rows);

        return [
            'success' => true,
            'summary' => [
                'year' => (int)$year,
                'month' => (int)$monthNumber,
                'total_energy' => round(array_sum(array_column($data, 'energy')), 3),
                'highest_day' => $this->findHighestDay($data),
            ],
            'data' => $data,
        ];
    }

    //Lấy điện năng tiêu thụ theo 12 tháng trong năm
    public function getMonthEnergy(?int $userId, ?int $year = null): array
    {
        $year = $year ?: (int)FrozenTime::now()->format('Y');

        $query = $this->MonthSummaries->find()
            ->select([
                'year' => 'MonthSummaries.year',
                'month' => 'MonthSummaries.month',
                'total_energy' => 'MonthSummaries.total_energy',
            ])
            ->where([
                'MonthSummaries.year' => $year,
            ])
            ->enableHydration(false);

        if ($userId !== null) {
            $query->innerJoinWith('Devices', function ($q) use ($userId) {
                return $q->where([
                    'Devices.user_id' => $userId,
                ]);
            });
        }

        $rows = $query->toArray();
        $data = $this->fillMonths($year, $rows);

        return [
            'success' => true,
            'summary' => [
                'year' => $year,
                'total_energy' => round(array_sum(array_column($data, 'energy')), 3),
                'highest_month' => $this->findHighestMonth($data),
            ],
            'data' => $data,
        ];
    }

    //Lấy danh sách năm có dữ liệu thống kê
    public function getAvailableYear(?int $userId): array
    {
        $query = $this->MonthSummaries->find()
            ->select([
                'year' => 'MonthSummaries.year',
            ])
            ->distinct(['MonthSummaries.year'])
            ->orderByDesc('MonthSummaries.year')
            ->enableHydration(false);

        if ($userId !== null) {
            $query->innerJoinWith('Devices', function ($q) use ($userId) {
                return $q->where([
                    'Devices.user_id' => $userId,
                ]);
            });
        }

        $years = array_map(
            fn ($row) => (int)$row['year'],   //Arrow Function: duyệt qua từng row lấy gtri year ép int
            $query->toArray()
        );

        if (empty($years)) {
            $years[] = (int)FrozenTime::now()->format('Y');
        }

        return [
            'success' => true,
            'data' => $years,
        ];
    }

    //Fill đủ 24 giờ, giờ nào chưa có dữ liệu thì power = 0
    private function fillHours(array $rows): array
    {
        $powerByHour = [];

        foreach ($rows as $row) {
            $hour = (new FrozenTime($row['hour_at']))->format('H');
        
            if (!isset($powerByHour[$hour])) {
                $powerByHour[$hour] = 0;
            }

            //tổng công suất trung bình của tất cả thiết bị trong từng giờ
            $powerByHour[$hour] += (float)$row['avg_power'];
        }

        $data = [];

        for ($hour = 0; $hour < 24; $hour++) {
            $hourKey = str_pad((string)$hour, 2, '0', STR_PAD_LEFT);       //số giờ dạng 2 chữ số

            $data[] = [
                'hour' => $hourKey . ':00',
                'power' => round($powerByHour[$hourKey] ?? 0, 2),
            ];
        }

        return $data;
    }

    //Fill đủ số ngày trong tháng, ngày nào chưa có dữ liệu thì energy = 0
    private function fillDays(int $year, int $month, int $daysInMonth, array $rows): array
    {
        $energyByDate = [];

        foreach ($rows as $row) {
            $date = (new FrozenTime($row['date_at']))->format('Y-m-d');

            if (!isset($energyByDate[$date])) {
                $energyByDate[$date] = 0;
            }

            //cộng điện năng của nhiều thiết bị trong cùng một ngày
            $energyByDate[$date] += (float)$row['total_energy'];
        }

        $data = [];

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = sprintf('%04d-%02d-%02d', $year, $month, $day);    //định dạng (d số nguyên)

            $data[] = [
                'date' => $date,
                'day' => $day,
                'label' => sprintf('%02d/%02d', $day, $month),
                //'label' => str_pad((string)$day, 2, '0', STR_PAD_LEFT),
                'energy' => round($energyByDate[$date] ?? 0, 3)
            ];
        }

        return $data;
    }

    //Fill đủ 12 tháng, tháng nào chưa có dữ liệu thì energy = 0
    private function fillMonths(int $year, array $rows): array
    {
        $energyByMonth = [];

        foreach ($rows as $row) {
            $month = (int)$row['month'];

            if (!isset($energyByMonth[$month])) {
                $energyByMonth[$month] = 0;
            }

            //cộng điện năng của nhiều thiết bị trong cùng một tháng
            $energyByMonth[$month] += (float)$row['total_energy'];
        }

        $data = [];

        for ($month = 1; $month <= 12; $month++) {
            $data[] = [
                'year' => $year,
                'month' => $month,
                'label' => sprintf('T%02d', $month),
                'energy' => round($energyByMonth[$month] ?? 0, 3),
            ];
        }

        return $data;
    }

    //Tìm ngày có điện năng tiêu thụ cao nhất
    private function findHighestDay(array $data): ?array
    {
        if (empty($data)) {
            return null;
        }

        $highest = $data[0];

        foreach ($data as $item) {
            if ($item['energy'] > $highest['energy']) {
                $highest = $item;
            }
        }

        return $highest;
    }

    //Tìm tháng có điện năng tiêu thụ cao nhất
    private function findHighestMonth(array $data): ?array
    {
        if (empty($data)) {
            return null;
        }

        $highest = $data[0];

        foreach ($data as $item) {
            if ($item['energy'] > $highest['energy']) {
                $highest = $item;
            }
        }

        return $highest;
    }
}