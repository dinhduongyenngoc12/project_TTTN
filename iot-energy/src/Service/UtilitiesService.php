<?php
declare(strict_types=1);

namespace App\Service;

use App\Model\Table\ElectricityPriceTiersTable;
use App\Model\Table\MonthSummariesTable;
use Cake\I18n\FrozenTime;
use Cake\ORM\TableRegistry;

class UtilitiesService
{
    protected MonthSummariesTable $MonthSummaries;
    protected ElectricityPriceTiersTable $ElectricityPriceTiers;

    public function __construct()
    {
        $locator = TableRegistry::getTableLocator();

        $this->MonthSummaries = $locator->get('MonthSummaries');
        $this->ElectricityPriceTiers = $locator->get(
            'ElectricityPriceTiers'
        );
    }

    /**
     * Ước tính tiền điện của người dùng trong một tháng
     *
     * @param int $userId ID người dùng đang đăng nhập
     * @param string $month Tháng cần tính theo định dạng YYYY-MM
     * @param int $vatRate Thuế VAT: 0, 8 hoặc 10
     */
    public function estimateElectricityCost(
        int $userId,
        string $month,
        int $vatRate = 0
    ): array {
        $month = trim($month);

        //Kiểm tra tháng có đúng định dạng YYYY-MM hay không
        if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
            return [
                'success' => false,
                'statusCode' => 422,
                'message' => 'Tháng cần tính không đúng định dạng YYYY-MM.',
            ];
        }

        [$year, $monthNumber] = array_map(
            'intval',
            explode('-', $month)
        );

        //Kiểm tra tháng có tồn tại trong lịch hay không
        if (!checkdate($monthNumber, 1, $year)) {
            return [
                'success' => false,
                'statusCode' => 422,
                'message' => 'Tháng cần tính không hợp lệ.',
            ];
        }

        //Chỉ chấp nhận các mức VAT đã thống nhất trên giao diện
        if (!in_array($vatRate, [0, 8, 10], true)) {
            return [
                'success' => false,
                'statusCode' => 422,
                'message' => 'Mức VAT không hợp lệ.',
            ];
        }

        $monthEnergy = $this->getMonthEnergy(
            $userId,
            $year,
            $monthNumber
        );

        if (!$monthEnergy['found']) {
            return [
                'success' => false,
                'statusCode' => 404,
                'message' => 'Không có dữ liệu điện năng trong tháng đã chọn.',
            ];
        }

        
        //Biểu giá được xác định theo ngày cuối tháng.
        //Hệ thống chọn ngày áp dụng gần nhất nhưng không vượt quá thời điểm này

        $monthEnd = (new FrozenTime(
            sprintf('%04d-%02d-01 00:00:00', $year, $monthNumber)
        ))->endOfMonth();

        $priceData = $this->getApplicablePriceTiers($monthEnd);

        if (!$priceData['found']) {
            return [
                'success' => false,
                'statusCode' => 404,
                'message' => 'Không tìm thấy biểu giá điện phù hợp.',
            ];
        }

        $costData = $this->calculateElectricityCost(
            $monthEnergy['total_energy'],
            $priceData['tiers']
        );

        $vatData = $this->calculateVat(
            $costData['subtotal'],
            $vatRate
        );

        return [
            'success' => true,
            'statusCode' => 200,
            'message' => 'Ước tính tiền điện thành công.',
            'data' => $this->buildEstimateResult(
                $year,
                $monthNumber,
                $monthEnergy['total_energy'],
                $priceData['effective_from'],
                $costData,
                $vatData
            ),
        ];
    }

    //Lấy tổng điện năng của tất cả thiết bị thuộc người dùng trong tháng
    private function getMonthEnergy(
        int $userId,
        int $year,
        int $month
    ): array {
        $query = $this->MonthSummaries->find()
            ->select([
                'total_energy' => 'MonthSummaries.total_energy',
            ])
            ->where([
                'MonthSummaries.year' => $year,
                'MonthSummaries.month' => $month,
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

        $rows = $query->toArray();

        if (empty($rows)) {
            return [
                'found' => false,
                'total_energy' => 0.0,
            ];
        }

        $totalEnergy = 0.0;

        foreach ($rows as $row) {
            $totalEnergy += (float)$row['total_energy'];
        }

        return [
            'found' => true,
            'total_energy' => round($totalEnergy, 3),
        ];
    }

    //Lấy bộ biểu giá đang có hiệu lực tại thời điểm tính toán
    private function getApplicablePriceTiers(
        FrozenTime $calculationDate
    ): array {
        
        //Tìm ngày áp dụng gần nhất nhưng không vượt quá ngày cuối tháng cần tính
        $latestTier = $this->ElectricityPriceTiers->find()
            ->select([
                'effective_from',
            ])
            ->where([
                'ElectricityPriceTiers.effective_from <=' =>
                    $calculationDate->format('Y-m-d'),
            ])
            ->orderByDesc('ElectricityPriceTiers.effective_from')
            ->first();

        if (!$latestTier) {
            return [
                'found' => false,
                'effective_from' => null,
                'tiers' => [],
            ];
        }

        $effectiveFrom = $latestTier->effective_from;

        //Lấy toàn bộ bậc giá thuộc cùng một ngày áp dụng
        $tiers = $this->ElectricityPriceTiers->find()
            ->where([
                'ElectricityPriceTiers.effective_from' => $effectiveFrom,
            ])
            ->orderByAsc('ElectricityPriceTiers.tier_order')
            ->enableHydration(false)
            ->toArray();

        $effectiveFromText = is_object($effectiveFrom)
            && method_exists($effectiveFrom, 'format')
                ? $effectiveFrom->format('Y-m-d')
                : (string)$effectiveFrom;

        return [
            'found' => !empty($tiers),
            'effective_from' => $effectiveFromText,
            'tiers' => $tiers,
        ];
    }

    //Tính tiền điện lần lượt theo từng bậc giá
    private function calculateElectricityCost(
        float $totalEnergy,
        array $priceTiers
    ): array {
        $remainingEnergy = $totalEnergy;
        $previousUpperLimit = 0.0;
        $subtotal = 0.0;
        $tierDetails = [];

        foreach ($priceTiers as $tier) {
            if ($remainingEnergy <= 0) {
                break;
            }

            $toKwh = $tier['to_kwh'] !== null
                ? (float)$tier['to_kwh']
                : null;

            /*
             * Sức chứa của bậc được xác định theo mức kết thúc của bậc hiện tại và bậc trước
             *
             * Bậc 1 kết thúc tại 50 kWh  -> sức chứa 50 kWh
             * Bậc 2 kết thúc tại 100 kWh -> sức chứa 50 kWh
             * Bậc cuối có to_kwh = null -> dùng toàn bộ phần còn lại
             */
            $tierCapacity = $toKwh === null
                ? $remainingEnergy
                : max(0, $toKwh - $previousUpperLimit);

            $usedKwh = min($remainingEnergy, $tierCapacity);
            $priceKwh = (float)$tier['price_kwh'];

            //Thành tiền từng bậc được làm tròn đến đơn vị đồng
            $amount = round($usedKwh * $priceKwh);

            $tierDetails[] = [
                'tier_order' => (int)$tier['tier_order'],
                'from_kwh' => (float)$tier['from_kwh'],
                'to_kwh' => $toKwh,
                'used_kwh' => round($usedKwh, 3),
                'price_kwh' => round($priceKwh, 2),
                'amount' => $amount,
            ];

            $subtotal += $amount;
            $remainingEnergy -= $usedKwh;

            if ($toKwh !== null) {
                $previousUpperLimit = $toKwh;
            }
        }

        return [
            'subtotal' => round($subtotal),
            'tier_details' => $tierDetails,
        ];
    }

    
    //Tính tiền VAT và tổng số tiền sau VAT
    private function calculateVat(
        float $subtotal,
        int $vatRate
    ): array {
        $vatAmount = round($subtotal * $vatRate / 100);
        $totalAmount = round($subtotal + $vatAmount);

        return [
            'vat_rate' => $vatRate,
            'vat_amount' => $vatAmount,
            'total_amount' => $totalAmount,
        ];
    }

    //Chuẩn hóa dữ liệu trả về fe
    private function buildEstimateResult(
        int $year,
        int $month,
        float $totalEnergy,
        string $effectiveFrom,
        array $costData,
        array $vatData
    ): array {
        return [
            'year' => $year,
            'month' => $month,
            'month_label' => sprintf(
                'Tháng %02d/%04d',
                $month,
                $year
            ),
            'total_energy' => round($totalEnergy, 3),
            'effective_from' => $effectiveFrom,
            'subtotal' => $costData['subtotal'],
            'vat_rate' => $vatData['vat_rate'],
            'vat_amount' => $vatData['vat_amount'],
            'total_amount' => $vatData['total_amount'],
            'tier_details' => $costData['tier_details'],
        ];
    }
}