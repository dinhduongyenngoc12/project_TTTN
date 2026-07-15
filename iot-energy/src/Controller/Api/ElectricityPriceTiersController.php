<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;
use Cake\Http\Exception\NotFoundException;

class ElectricityPriceTiersController extends AppController
{
    public function index(): void
    {
        $this->request->allowMethod(['get']);

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

        $tier = $this->fetchTable('ElectricityPriceTiers')->get($id);

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
        } catch (NotFoundException) {
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

        $tier = $table->patchEntity($tier, $this->request->getData());

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
        } catch (NotFoundException) {
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
}