<?php
declare(strict_types=1);

namespace App\Test\TestCase\Service;

use App\Model\Entity\AlertConfig;
use App\Service\AlertService;
use Cake\TestSuite\TestCase;
use ReflectionMethod;

class AlertServiceTest extends TestCase
{
    /**
     * Ngưỡng hiện tại hợp lệ phải được ưu tiên.
     */
    public function testUsesPositivePowerThreshold(): void
    {
        $config = new AlertConfig([
            'power_threshold' => 838.8,
            'default_threshold' => 700,
        ]);

        $this->assertSame(838.8, $this->getAppliedThreshold($config));
    }

    /**
     * Ngưỡng hiện tại bằng 0 phải bị bỏ qua và dùng ngưỡng mặc định hợp lệ.
     */
    public function testFallsBackWhenPowerThresholdIsZero(): void
    {
        $config = new AlertConfig([
            'power_threshold' => 0,
            'default_threshold' => 838.8,
        ]);

        $this->assertSame(838.8, $this->getAppliedThreshold($config));
    }

    /**
     * Không có ngưỡng dương thì không được phép tạo cảnh báo.
     */
    public function testReturnsNullWhenAllThresholdsAreInvalid(): void
    {
        $config = new AlertConfig([
            'power_threshold' => 0,
            'default_threshold' => -1,
        ]);

        $this->assertNull($this->getAppliedThreshold($config));
    }

    /**
     * Gọi hàm private để kiểm thử riêng quy tắc chọn ngưỡng.
     */
    private function getAppliedThreshold(AlertConfig $config): ?float
    {
        $service = new AlertService();
        $method = new ReflectionMethod($service, 'getAppliedThreshold');
        $method->setAccessible(true);

        return $method->invoke($service, $config);
    }
}
