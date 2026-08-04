<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;
use Cake\Datasource\EntityInterface;
use Cake\Datasource\Exception\RecordNotFoundException;
use Cake\I18n\FrozenDate;
use Cake\ORM\Table;

class ElectricityPriceTiersController extends AppController
{
    public function index(): void
    {
        $this->request->allowMethod(['get']);

        if (!$this->requireAdmin()) {
            return;
        }

        $tiers = $this->fetchTable('ElectricityPriceTiers')
            ->find()
            ->orderBy([
                'effective_from' => 'DESC',
                'tier_order' => 'ASC',
            ])
            ->all();

        $this->set([
            'status' => 'success',
            'electricityPriceTiers' => $tiers,
        ]);

        $this->viewBuilder()->setOption('serialize', [
            'status',
            'electricityPriceTiers',
        ]);
    }

    public function view(int $id): void
    {
        $this->request->allowMethod(['get']);

        if (!$this->requireAdmin()) {
            return;
        }

        try {
            $tier = $this->fetchTable('ElectricityPriceTiers')->get($id);
        } catch (RecordNotFoundException) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Không tìm thấy bậc giá điện',
            ], 404);

            return;
        }

        $this->set([
            'status' => 'success',
            'electricityPriceTier' => $tier,
        ]);

        $this->viewBuilder()->setOption('serialize', [
            'status',
            'electricityPriceTier',
        ]);
    }

    public function add(): void
    {
        $this->request->allowMethod(['post']);

        if (!$this->requireAdmin()) {       //.Appcontroller (chỉ có role Admin mới được thao tác các tiến trình bên dưới, không thì return)
            return;
        }

        $table = $this->fetchTable('ElectricityPriceTiers');

        $tier = $table->newEmptyEntity();
        $tier = $table->patchEntity($tier, $this->request->getData());

        if ($tier->getErrors()) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Dữ liệu bậc giá điện không hợp lệ',
                'errors' => $tier->getErrors(),
            ], 422);

            return;
        }

        if ($this->isEffectiveDateLocked($tier->get('effective_from'))) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Ngày áp dụng phải sau ngày hiện tại',
            ], 422);

            return;
        }

        if ($this->hasOverlappingTier($table,$tier->get('effective_from'),(float)$tier->get('from_kwh'),
            $tier->get('to_kwh') !== null ? (float)$tier->get('to_kwh') : null)) 
        {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Khoảng tiêu thụ bị chồng lấn với bậc giá khác',
            ], 422);

            return;
        }

        if ($this->hasInvalidTierSequence($table, $tier)) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Thứ tự hoặc khoảng tiêu thụ của các bậc không liên tục',
            ], 422);

            return;
        }

        if ($table->save($tier)) {
            $this->set([
                'status' => 'success',
                'message' => 'Thêm bậc giá điện thành công',
                'electricityPriceTier' => $tier,
            ]);

            $this->viewBuilder()->setOption('serialize', [
                'status',
                'message',
                'electricityPriceTier',
            ]);

            return;
        }

        $this->response = $this->response->withStatus(422);

        $this->set([
            'status' => 'error',
            'message' => 'Không thể thêm bậc giá điện',
            'errors' => $tier->getErrors(),
        ]);

        $this->viewBuilder()->setOption('serialize', [
            'status',
            'message',
            'errors',
        ]);
    }

    public function edit(int $id): void
    {
        $this->request->allowMethod(['patch', 'put']);

        if (!$this->requireAdmin()) {
            return;
        }

        $table = $this->fetchTable('ElectricityPriceTiers');

        try {
            $tier = $table->get($id);
        } catch (RecordNotFoundException) {
            $this->response = $this->response->withStatus(404);

            $this->set([
                'status' => 'error',
                'message' => 'Không tìm thấy bậc giá điện',
            ]);

            $this->viewBuilder()->setOption('serialize', [
                'status',
                'message',
            ]);

            return;
        }

        // Không cho thay đổi dữ liệu đã được dùng để tính tiền điện lịch sử
        if ($this->isEffectiveDateLocked($tier->get('effective_from'))) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Bậc giá đã có hiệu lực nên không thể chỉnh sửa',
            ], 422);

            return;
        }

        $tier = $table->patchEntity($tier, $this->request->getData());

        if ($tier->getErrors()) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Dữ liệu bậc giá điện không hợp lệ',
                'errors' => $tier->getErrors(),
            ], 422);

            return;
        }

        if ($this->isEffectiveDateLocked($tier->get('effective_from'))) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Ngày áp dụng phải sau ngày hiện tại',
            ], 422);

            return;
        }

        if ($this->hasOverlappingTier(
            $table,
            $tier->get('effective_from'),
            (float)$tier->get('from_kwh'),
            $tier->get('to_kwh') !== null ? (float)$tier->get('to_kwh') : null,
            (int)$tier->get('id')
        )) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Khoảng tiêu thụ bị chồng lấn với bậc giá khác',
            ], 422);

            return;
        }

        if ($this->hasInvalidTierSequence($table, $tier, (int)$tier->get('id'))) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Thứ tự hoặc khoảng tiêu thụ của các bậc không liên tục',
            ], 422);

            return;
        }

        if ($table->save($tier)) {
            $this->set([
                'status' => 'success',
                'message' => 'Cập nhật bậc giá điện thành công',
                'electricityPriceTier' => $tier,
            ]);

            $this->viewBuilder()->setOption('serialize', [
                'status',
                'message',
                'electricityPriceTier',
            ]);

            return;
        }

        $this->response = $this->response->withStatus(422);

        $this->set([
            'status' => 'error',
            'message' => 'Không thể cập nhật bậc giá điện',
            'errors' => $tier->getErrors(),
        ]);

        $this->viewBuilder()->setOption('serialize', [
            'status',
            'message',
            'errors',
        ]);
    }

    public function delete(int $id): void
    {
        $this->request->allowMethod(['delete']);

        if (!$this->requireAdmin()) {
            return;
        }

        $table = $this->fetchTable('ElectricityPriceTiers');

        try {
            $tier = $table->get($id);
        } catch (RecordNotFoundException) {
            $this->response = $this->response->withStatus(404);

            $this->set([
                'status' => 'error',
                'message' => 'Không tìm thấy bậc giá điện',
            ]);

            $this->viewBuilder()->setOption('serialize', [
                'status',
                'message',
            ]);

            return;
        }

        //Bảng giá đã áp dụng phải được giữ lại để không làm sai tháng cũ
        if ($this->isEffectiveDateLocked($tier->get('effective_from'))) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Bậc giá đã có hiệu lực nên không thể xóa',
            ], 422);

            return;
        }

        if ($this->hasHigherTier($table, $tier)) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Chỉ được xóa bậc giá cao nhất của cùng ngày áp dụng',
            ], 422);

            return;
        }

        if ($table->delete($tier)) {
            $this->set([
                'status' => 'success',
                'message' => 'Xóa bậc giá điện thành công',
            ]);

            $this->viewBuilder()->setOption('serialize', [
                'status',
                'message',
            ]);

            return;
        }

        $this->response = $this->response->withStatus(422);

        $this->set([
            'status' => 'error',
            'message' => 'Không thể xóa bậc giá điện',
        ]);

        $this->viewBuilder()->setOption('serialize', [
            'status',
            'message',
        ]);
    }

    //Ngày hiện tại và ngày quá khứ đã tham gia tính tiền nên phải khóa
    private function isEffectiveDateLocked(mixed $effectiveFrom): bool
    {
        $effectiveDate = is_object($effectiveFrom)
            && method_exists($effectiveFrom, 'format')
                ? $effectiveFrom->format('Y-m-d')
                : (string)$effectiveFrom;

        return $effectiveDate <= FrozenDate::today()->format('Y-m-d');
    }

    //Kiểm tra hai khoảng [from, to) có giao nhau trong cùng ngày áp dụng
    private function hasOverlappingTier(
        Table $table,
        mixed $effectiveFrom,
        float $fromKwh,
        ?float $toKwh,
        ?int $ignoredTierId = null
    ): bool {
        $effectiveDate = is_object($effectiveFrom)
            && method_exists($effectiveFrom, 'format')
                ? $effectiveFrom->format('Y-m-d')
                : (string)$effectiveFrom;

        $query = $table->find()
            ->where([
                'ElectricityPriceTiers.effective_from' => $effectiveDate,
            ]);

        if ($ignoredTierId !== null) {
            //Khi sửa, bỏ qua chính bản ghi đang được kiểm tra
            $query->where([
                'ElectricityPriceTiers.id !=' => $ignoredTierId,
            ]);
        }

        if ($toKwh !== null) {
            $query->where([
                'ElectricityPriceTiers.from_kwh <' => $toKwh,
            ]);
        }

        $query->where([
            'OR' => [
                'ElectricityPriceTiers.to_kwh IS' => null,
                'ElectricityPriceTiers.to_kwh >' => $fromKwh,
            ],
        ]);

        return $query->count() > 0;
    }

    //Kiểm tra bậc bắt đầu từ 1 và khoảng sau nối tiếp khoảng trước
    private function hasInvalidTierSequence(
        Table $table,
        EntityInterface $candidateTier,
        ?int $ignoredTierId = null
    ): bool {
        // Dùng get() để CakePHP đọc field rõ ràng, tránh coi entity là object tổng quát
        $effectiveDate = $candidateTier->get('effective_from')->format('Y-m-d');

        $query = $table->find()
            ->where([
                'ElectricityPriceTiers.effective_from' => $effectiveDate,
            ]);

        if ($ignoredTierId !== null) {
            $query->where([
                'ElectricityPriceTiers.id !=' => $ignoredTierId,
            ]);
        }

        $tiers = $query->all()->toList();
        $tiers[] = $candidateTier;

        usort($tiers, function ($firstTier, $secondTier): int {
            return (int)$firstTier->get('tier_order') <=> (int)$secondTier->get('tier_order');
        });

        foreach ($tiers as $index => $tier) {
            $expectedOrder = $index + 1;

            if ((int)$tier->get('tier_order') !== $expectedOrder) {
                return true;
            }

            if ($index === 0) {
                if ((float)$tier->get('from_kwh') !== 0.0) {
                    return true;
                }

                continue;
            }

            $previousTier = $tiers[$index - 1];

            if ($previousTier->get('to_kwh') === null) {
                return true;
            }

            if ((float)$tier->get('from_kwh') !== (float)$previousTier->get('to_kwh')) {
                return true;
            }
        }

        return false;
    }

    //Xóa từ bậc cao nhất xuống để không làm đứt thứ tự của bộ giá
    private function hasHigherTier(Table $table, EntityInterface $tier): bool
    {
        return $table->find()
            ->where([
                'ElectricityPriceTiers.effective_from' =>
                    $tier->get('effective_from')->format('Y-m-d'),
                'ElectricityPriceTiers.tier_order >' =>
                    (int)$tier->get('tier_order'),
            ])
            ->count() > 0;
    }
}
