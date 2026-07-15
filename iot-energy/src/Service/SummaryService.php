<?php
declare(strict_types=1);

namespace App\Service;
use App\Model\Entity\EnergyLog;
use App\Model\Table\DailySummariesTable;
use App\Model\Table\EnergyLogsTable;
use App\Model\Table\HourSummariesTable;
use App\Model\Table\MonthSummariesTable;
use Cake\I18n\FrozenTime;
use Cake\ORM\TableRegistry;


class SummaryService
{
    protected HourSummariesTable $HourSummaries;
    protected DailySummariesTable $DailySummaries;
    protected MonthSummariesTable $MonthSummaries;
    protected EnergyLogsTable $EnergyLogs;

    public function __construct()
    {
        $locator = TableRegistry::getTableLocator();

        $this->HourSummaries = $locator->get('HourSummaries');
        $this->DailySummaries = $locator->get('DailySummaries');
        $this->MonthSummaries = $locator->get('MonthSummaries');
        $this->EnergyLogs = $locator->get('EnergyLogs');
    }

    //Cập nhật toàn bộ dữ liệu tổng hợp sau khi lưu log mới
    public function updateSummaries(EnergyLog $log): void
    {
        //chỉ tổng hợp dữ liệu hợp lệ và có energy
        if ((int)$log->is_valid !== 1 || $log->energy === null) {
            return;
        }

        $this->updateHourSummary($log);
        $this->updateDailySummary($log);
        $this->updateMonthSummary($log);
    }

    //Cập nhật thống kê theo giờ
    private function updateHourSummary(EnergyLog $log): void
    {
        $hourAt = $this->getHourStart($log->created_at);

        $logs = $this->getLogsInRange(
            (int)$log->device_id,
            $hourAt,
            $hourAt->modify('+1 hour')
        );

        $summaryData = $this->calculateSummaryData($logs);

        $summary = $this->HourSummaries->find()
            ->where([
                'device_id' => $log->device_id,
                'hour_at' => $hourAt
            ])
            ->first();

        if (!$summary) {
            $summary = $this->HourSummaries->newEmptyEntity();
        }

        $summary = $this->HourSummaries->patchEntity($summary, [
            'device_id' => $log->device_id,
            'hour_at' => $hourAt,
            'total_energy' => $summaryData['total_energy'],
            'avg_power' => $summaryData['avg_power'],
            'max_power' => $summaryData['max_power']
        ]);

        $this->HourSummaries->save($summary);
    }

    //Cập nhật thống kê theo ngày
    private function updateDailySummary(EnergyLog $log): void
    {
        $dateAt = $this->getDateOnly($log->created_at);

        $from = new FrozenTime($dateAt . ' 00:00:00');
        $to = new FrozenTime($dateAt . ' 23:59:59');

        $logs = $this->getLogsInRange((int)$log->device_id, $from, $to);

        $summaryData = $this->calculateSummaryData($logs);

        $summary = $this->DailySummaries->find()
            ->where([
                'device_id' => $log->device_id,
                'date_at' => $dateAt,
            ])
            ->first();

        if (!$summary) {
            $summary = $this->DailySummaries->newEmptyEntity();
        }

        $summary = $this->DailySummaries->patchEntity($summary, [
            'device_id' => $log->device_id,
            'date_at' => $dateAt,
            'total_energy' => $summaryData['total_energy'],
            'avg_power' => $summaryData['avg_power'],
            'max_power' => $summaryData['max_power'],
            //alert_count sẽ xử lý sau khi gắn với AlertService
            'alert_count' => $summary->alert_count ?? 0,
        ]);

        $this->DailySummaries->save($summary);
    }

    //Cập nhật thống kê theo tháng
    private function updateMonthSummary(EnergyLog $log): void
    {
        $date = $this->toFrozenTime($log->created_at);
        $year = (int)$date->format('Y');
        $month = (int)$date->format('m');

        $from = $date->startOfMonth();
        $to = $date->endOfMonth();

        $logs = $this->getLogsInRange((int)$log->device_id, $from, $to);

        $summaryData = $this->calculateSummaryData($logs);

        $summary = $this->MonthSummaries->find()
            ->where([
                'device_id' => $log->device_id,
                'year' => $year,
                'month' => $month,
            ])
            ->first();

        if (!$summary) {
            $summary = $this->MonthSummaries->newEmptyEntity();
        }

        $summary = $this->MonthSummaries->patchEntity($summary, [
            'device_id' => $log->device_id,
            'year' => $year,
            'month' => $month,
            'total_energy' => $summaryData['total_energy'],
            'user_note' => $summary->user_note ?? null,
        ]);

        $this->MonthSummaries->save($summary);
    }

    //Lấy log hợp lệ của 1 thiết bị trong khoảng thời gian
    private function getLogsInRange(int $deviceId, FrozenTime $from, FrozenTime $to): array
    {
        return $this->EnergyLogs->find()
            ->select([
                'energy' => 'EnergyLogs.energy',
                'power' => 'EnergyLogs.power',
            ])
            ->where([
                'EnergyLogs.device_id' => $deviceId,
                'EnergyLogs.is_valid' => 1,
                'EnergyLogs.energy IS NOT' => null,
                'EnergyLogs.power IS NOT' => null,
                'EnergyLogs.created_at >=' => $from,
                'EnergyLogs.created_at <=' => $to,
            ])
            ->enableHydration(false)
            ->toArray();
    }

    //Tính total_energy, avg_power, max_power từ danh sách log
    private function calculateSummaryData(array $logs): array
    {
        if (count($logs) === 0) {
            return [
                'total_energy' => 0,
                'avg_power' => 0,
                'max_power' => 0,
            ];
        }

        $energyValues = [];
        $powerValues = [];

        foreach ($logs as $log) {
            $energyValues[] = (float)$log['energy'];
            $powerValues[] = (float)$log['power'];
        }

        return [
            //energy là chỉ số tích lũy nên điện tiêu thụ = max - min
            'total_energy' => round(max(0, max($energyValues) - min($energyValues)), 3),
            'avg_power' => round(array_sum($powerValues) / count($powerValues), 2),
            'max_power' => round(max($powerValues), 2),
        ];
    }

    //Lấy thời điểm đầu giờ, ví dụ 10:35:12 -> 10:00:00
    private function getHourStart(mixed $createdAt): FrozenTime
    {
        $date = $this->toFrozenTime($createdAt);

        return new FrozenTime($date->format('Y-m-d H:00:00'));
    }

    //Lấy ngày dạng Y-m-d để lưu vào date_at
    private function getDateOnly(mixed $createdAt): string
    {
        return $this->toFrozenTime($createdAt)->format('Y-m-d');
    }

    //Chuẩn hóa created_at về FrozenTime
    private function toFrozenTime(mixed $createdAt): FrozenTime
    {
        if ($createdAt instanceof FrozenTime) {
            return $createdAt;
        }

        return new FrozenTime($createdAt);
    }
}