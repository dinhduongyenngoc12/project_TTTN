<?php
declare(strict_types=1);

namespace App\Service;

use App\Model\Entity\AlertConfig;
use App\Model\Entity\Device;
use App\Model\Table\AlertConfigsTable;
use Cake\ORM\TableRegistry;

class AlertConfigsService
{
    protected AlertConfigsTable $AlertConfigs;
    private const SAFETY_FACTOR = 1.2;

    public function __construct()
    {
        $this->AlertConfigs = TableRegistry::getTableLocator()->get('AlertConfigs');
    }

    public function getList(?int $userId): array
    {
        $query = $this->AlertConfigs->find()
            ->contain(['Devices'])
            ->orderBy(['AlertConfigs.id' => 'DESC']);

        if ($userId !== null) {
            $query->innerJoinWith('Devices', function ($q) use ($userId) {
                return $q->where([
                    'Devices.user_id' => $userId,
                ]);
            });
        }

        return $query->all()->toList();
    }

    //check cấu hình có tồn tại & thuộc về user đang đắng nhập 
    public function getDetail(int $id, ?int $userId): ?AlertConfig
    {
        $query = $this->AlertConfigs->find()
            ->contain(['Devices'])
            ->where([
                'AlertConfigs.id' => $id,
            ]);

        if ($userId !== null) {
            $query->innerJoinWith('Devices', function ($q) use ($userId) {
                return $q->where([
                    'Devices.user_id' => $userId,
                ]);
            });
        }

        return $query->first();
    }

    public function update(int $id, ?int $userId, array $requestData): array
    {
        $alertConfig = $this->getDetail($id, $userId);

        if (!$alertConfig) {
            return $this->error(
                'Không tìm thấy cấu hình cảnh báo.',
                404
            );
        }

        $validationResult = $this->validateUpdateRequest(
            $alertConfig,
            $requestData
        );

        if (!$validationResult['valid']) {
            return $this->error(
                'Dữ liệu cấu hình ngưỡng không hợp lệ.',
                422,
                $validationResult['errors'],
                $alertConfig
            );
        }

        // Chỉ đưa dữ liệu đã chuẩn hóa vào entity.
        $requestData = $validationResult['data'];
        $data = $this->buildUpdateData($alertConfig, $requestData);

        $alertConfig = $this->AlertConfigs->patchEntity($alertConfig, $data);

        if (!$this->AlertConfigs->save($alertConfig)) {
            return $this->error(
                'Không thể cập nhật cấu hình cảnh báo.',
                422,
                $alertConfig->getErrors(),
                $alertConfig
            );
        }

        return $this->success(
            'Cập nhật cấu hình cảnh báo thành công.',
            $alertConfig
        );
    }

    //che do nguong
    private function buildUpdateData(AlertConfig $alertConfig, array $requestData): array
    {
        $mode = $requestData['mode'] ?? $alertConfig->mode;

        if ($mode === 'manual') {
            return $this->buildManualModeData($requestData);
        }

        return $this->buildAutoModeData($alertConfig);
    }

    //chỉ cập nhật mode = manual (power_threshold = user nhap)
    //không cập nhật default_threshold
    private function buildManualModeData(array $requestData): array
    {
        /*
         * Manual cho phép người dùng tự quyết định ngưỡng cảnh báo thực tế.
         * default_threshold vẫn do hệ thống học và không bị thay đổi tại đây.
         */
        return [
            'mode' => 'manual',
            'power_threshold' => $requestData['power_threshold'] ?? null,
        ];
    }

    //cập nhật mode = auto, nếu đã có default_threshold -> power_threshold = default_threshold
    //nếu chưa thì giữ nguyên power_threshold tạm thời
    private function buildAutoModeData(AlertConfig $alertConfig): array
    {
        $data = [
            'mode' => 'auto',
        ];

        /*
         * Khi quay lại auto, power_threshold phải bám theo default_threshold.
         * Nếu hệ thống chưa học được ngưỡng mặc định thì giữ nguyên ngưỡng tạm hiện có.
         */
        if (
            $alertConfig->default_threshold !== null
            && (float)$alertConfig->default_threshold > 0
        ) {
            $data['power_threshold'] = $alertConfig->default_threshold;
        } elseif (
            $alertConfig->power_threshold !== null
            && (float)$alertConfig->power_threshold <= 0
        ) {
            // Dọn giá trị 0 hoặc âm cũ về null, chờ hệ thống học ngưỡng mới.
            $data['power_threshold'] = null;
        }

        return $data;
    }

    // Kiểm tra request trước khi patch để trả lỗi nghiệp vụ dễ hiểu.
    private function validateUpdateRequest(
        AlertConfig $alertConfig,
        array $requestData
    ): array {
        $errors = [];
        $mode = strtolower(trim((string)(
            $requestData['mode'] ?? $alertConfig->mode
        )));

        if (!in_array($mode, ['auto', 'manual'], true)) {
            $errors['mode'] = 'Chế độ ngưỡng chỉ nhận auto hoặc manual.';
        }

        $normalizedData = [
            'mode' => $mode,
        ];

        if ($mode === 'manual') {
            $threshold = $requestData['power_threshold'] ?? null;

            if (!is_numeric($threshold) || (float)$threshold <= 0) {
                $errors['power_threshold'] =
                    'Ngưỡng cảnh báo thủ công phải lớn hơn 0 W.';
            } else {
                $normalizedData['power_threshold'] = (float)$threshold;
            }
        }

        return [
            'valid' => $errors === [],
            'errors' => $errors,
            'data' => $normalizedData,
        ];
    }

    
    public function refreshTemporaryThreshold(Device $device): void
    {
        $alertConfig = $this->AlertConfigs->find()
            ->where([
                'device_id' => $device->id,
            ])
            ->first();

        if (!$alertConfig) {
            return;
        }

        if (!$this->canRefreshTemporaryThreshold($alertConfig)) {
            return;
        }

        $powerThreshold = $this->calculateTemporaryThreshold($device);

        $alertConfig = $this->AlertConfigs->patchEntity($alertConfig, [
            'power_threshold' => $powerThreshold,
        ]);

        $this->AlertConfigs->save($alertConfig);
    }

    private function canRefreshTemporaryThreshold(AlertConfig $alertConfig): bool
    {
        /*
        * Ngưỡng tạm từ rated_power chỉ được dùng trong giai đoạn chưa học xong
        * Nếu đã có default_threshold hoặc người dùng chọn manual, hệ thống không được ghi đè ngưỡng đang dùng
        */
        return $alertConfig->mode === 'auto'
            && $alertConfig->learning_status === 'learning'
            && $alertConfig->default_threshold === null;
    }

    //tính ngưỡng tạm thời nếu có rated_power người dùng khai báo
    private function calculateTemporaryThreshold(Device $device): ?float
    {
        if (
            $device->rated_power === null
            || (float)$device->rated_power <= 0
        ) {
            return null;
        }

        return round((float)$device->rated_power * self::SAFETY_FACTOR, 2);
    }

    private function success(string $message, AlertConfig $alertConfig): array
    {
        return [
            'saved' => true,
            'statusCode' => 200,
            'message' => $message,
            'alertConfig' => $alertConfig,
            'errors' => [],
        ];
    }

    private function error(
        string $message,
        int $statusCode = 400,
        mixed $errors = [],
        ?AlertConfig $alertConfig = null
    ): array {
        return [
            'saved' => false,
            'statusCode' => $statusCode,
            'message' => $message,
            'alertConfig' => $alertConfig,
            'errors' => $errors,
        ];
    }
}
