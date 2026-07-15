<?php
declare(strict_types=1);

namespace App\Service;

use App\Model\Entity\AlertConfig;
use App\Model\Entity\Device;
use App\Model\Table\AlertConfigsTable;
use App\Model\Table\EnergyLogsTable;
use Cake\I18n\FrozenTime;
use Cake\ORM\TableRegistry;

class ThresholdLearningService
{
    private const STAGE_3_DAYS = 3;
    private const STAGE_7_DAYS = 7;
    private const MIN_MAX_POWER = 10;
    private const SAFETY_FACTOR = 1.2;

    protected EnergyLogsTable $EnergyLogs;
    protected AlertConfigsTable $AlertConfigs;

    public function __construct()
    {
        $locator = TableRegistry::getTableLocator();

        $this->EnergyLogs = $locator->get('EnergyLogs');
        $this->AlertConfigs = $locator->get('AlertConfigs');
    }

    //xử lý ngưỡng khi nhận hệ thống nhận được dl mới - điều phối: Device -> findAlertConfig() -> getDailyMaxPowers() -> processLearning()    
    public function process(Device $device): array
    {
        $alertConfig = $this->findAlertConfig($device);     //tất cả Entity của AlertConfigs của thiết bị

        if (!$alertConfig) {
            return $this->success('Thiết bị chưa có cấu hình cảnh báo', [
                'threshold_updated' => false,
            ]);
        }

        $dailyMaxPowers = $this->getDailyMaxPowers((int)$device->id);       

        return $this->processLearning($alertConfig, $dailyMaxPowers);        //tách xử lý các giai đoạn học ngưỡng xuống hàm bên dưới, process chỉ điều phối
    }

    //tìm cấu hình cảnh báo của thiết bị
    private function findAlertConfig(Device $device): ?AlertConfig
    {
        return $this->AlertConfigs->find()
            ->where([
                'device_id' => $device->id,
            ])
            ->first();
    }

    //xử lý các giai đoạn học ngưỡng: learning, learned_3d, learned_7d, adaptive
    private function processLearning(AlertConfig $alertConfig, array $dailyMaxPowers): array 
    {
        $validDays = count($dailyMaxPowers);       //$dailyMaxPowers - mảng công suất lớn nhất của từng ngày hợp lệ

        if ($this->shouldLearn3Days($alertConfig, $validDays)) {
            return $this->updateThreshold(
                $alertConfig,
                $dailyMaxPowers,
                self::STAGE_3_DAYS,          //self:: truy cập hằng số của class hiện tại = ThresholdLearningService::STAGE_3_DAYS
                'learned_3d'
            );
        }

        if ($this->shouldLearn7Days($alertConfig, $validDays)) {
            return $this->updateThreshold(
                $alertConfig,
                $dailyMaxPowers,
                self::STAGE_7_DAYS,
                'learned_7d'
            );
        }

        if ($this->shouldAdaptiveLearning($alertConfig, $validDays)) {
            return $this->updateAdaptiveThreshold(
                $alertConfig,
                $dailyMaxPowers
            );
        }

        return $this->success('Chưa cần cập nhật ngưỡng', [
            'threshold_updated' => false,
            'valid_days' => $validDays,
            'learning_status' => $alertConfig->learning_status,
        ]);
    }

    /**
     * Lấy công suất lớn nhất của từng ngày hợp lệ
     * Ngày hợp lệ là ngày có dữ liệu is_valid = 1
     * và công suất lớn nhất trong ngày >= 10W
     */

    //ds max power từng ngày hợp lệ
    private function getDailyMaxPowers(int $deviceId): array
    {
        $query = $this->EnergyLogs->find();

        $rows = $query
            ->select([
                'log_date' => $query->func()->date([                // = DATE(created_at), lấy ngày
                    'EnergyLogs.created_at' => 'identifier'        // identifier - tên cột db
                ]),
                'max_power' => $query->func()->max('EnergyLogs.power')    // = MAX(power)
            ])
            ->where([
                'EnergyLogs.device_id' => $deviceId,          //dl phải thuộc về thiết bị
                'EnergyLogs.is_valid' => 1,                   //dl phải hợp lệ
                'EnergyLogs.power IS NOT' => null             //phải có công suất
            ])
            ->groupBy([
                $query->func()->date([
                    'EnergyLogs.created_at' => 'identifier'
                ]),
            ])
            ->having([
                'max_power >=' => self::MIN_MAX_POWER   //dùng having thay vì where vì MAX(power) là kết qủa sau group by
            ])
            ->orderByAsc('log_date')   //tang dan
            ->enableHydration(false)
            ->toArray();

        return array_map(
            static fn (array $row): float => (float)$row['max_power'],
            $rows
        );
    }


    private function shouldLearn3Days(AlertConfig $alertConfig, int $validDays): bool
    {
        return $validDays >= self::STAGE_3_DAYS
            && in_array($alertConfig->learning_status, [null, '', 'learning'], true);
    }

    private function shouldLearn7Days(AlertConfig $alertConfig, int $validDays): bool
    {
        return $validDays >= self::STAGE_7_DAYS
            && $alertConfig->learning_status === 'learned_3d';
    }

    private function shouldAdaptiveLearning(AlertConfig $alertConfig, int $validDays): bool
    {
        return $validDays >= self::STAGE_7_DAYS
            && in_array($alertConfig->learning_status,['learned_7d', 'adaptive'], true);
    }

    private function shouldUpdateToday(AlertConfig $alertConfig): bool
    {
        if ($alertConfig->last_learned_date === null) {
            return true;
        }

        $lastLearnedDate = $alertConfig->last_learned_date instanceof FrozenTime
            ? $alertConfig->last_learned_date : new FrozenTime($alertConfig->last_learned_date);

        return $lastLearnedDate->format('Y-m-d') !== FrozenTime::today()->format('Y-m-d');
    }


    private function updateThreshold(AlertConfig $alertConfig, array $dailyMaxPowers, int $daysToUse, string $learningStatus): array 
    {
        $selectedPowers = array_slice($dailyMaxPowers, - $daysToUse);          //Lấy đúng số ngày hợp lệ GẦN NHẤT
                        //array_slice(array $array, int $offset, ?int $length = null): 
                        //Lấy ra 1 phần của mảng nhưng không làm thay đổi mảng gốc: $offset - vị trí bắt đầu (-$offset: đếm từ cuối mảng), $length: số phần tử muốn lấy

        $threshold = $this->calculateThreshold($selectedPowers);

        if ($threshold === null) {
            return $this->error('Không đủ dữ liệu để tính ngưỡng cảnh báo', 422);
        }

        $data = $this->buildThresholdData(
            $alertConfig,
            $threshold,
            $learningStatus
        );

        $alertConfig = $this->AlertConfigs->patchEntity($alertConfig, $data);

        if (!$this->AlertConfigs->save($alertConfig)) {
            return $this->error(
                'Không thể cập nhật ngưỡng cảnh báo',
                500,
                $alertConfig->getErrors()
            );
        }

        return $this->success('Cập nhật ngưỡng cảnh báo thành công', [
            'threshold_updated' => true,
            'learning_status' => $learningStatus,
            'valid_days_used' => $daysToUse,
            'default_threshold' => $threshold,
            'power_threshold_updated' => $this->shouldUpdatePowerThreshold($alertConfig),
        ]);
    }

    private function updateAdaptiveThreshold(AlertConfig $alertConfig, array $dailyMaxPowers): array 
    {
        if (!$this->shouldUpdateToday($alertConfig)) {
            return $this->success('Hôm nay đã cập nhật ngưỡng, bỏ qua adaptive learning', [
                'threshold_updated' => false,
                'valid_days' => count($dailyMaxPowers),
                'learning_status' => $alertConfig->learning_status,
            ]);
        }

        return $this->updateThreshold(
            $alertConfig,
            $dailyMaxPowers,
            self::STAGE_7_DAYS,
            'adaptive'
        );
    }

    /**
     * mode = auto, hệ thống cập nhật cả power_threshold
     * mode = manual, hệ thống chỉ cập nhật default_threshold
     */
    private function buildThresholdData(AlertConfig $alertConfig, float $threshold, string $learningStatus): array 
    {
        $data = [
            'default_threshold' => $threshold,
            'learning_status' => $learningStatus,
            'learned_at' => FrozenTime::now(),
            'last_learned_date' => FrozenTime::today(),
        ];

        if ($this->shouldUpdatePowerThreshold($alertConfig)) {
            $data['power_threshold'] = $threshold;
        }

        return $data;
    }

    
    //Chỉ cho phép hệ thống ghi đè power_threshold khi đang ở chế độ auto
    private function shouldUpdatePowerThreshold(AlertConfig $alertConfig): bool
    {
        return $alertConfig->mode === 'auto';
    }

    /**
     * Ngưỡng cảnh báo:
     * trung bình công suất cực đại các ngày hợp lệ × hệ số an toàn.
     */
    private function calculateThreshold(array $dailyMaxPowers): ?float
    {
        if (empty($dailyMaxPowers)) {
            return null;
        }

        $average = array_sum($dailyMaxPowers) / count($dailyMaxPowers);

        return round($average * self::SAFETY_FACTOR, 2);
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