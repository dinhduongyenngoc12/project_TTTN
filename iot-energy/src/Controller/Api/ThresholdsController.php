<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;

class ThresholdsController extends AppController
{
    public function index(): void
    {
        $this->request->allowMethod(['get']);

        $userId = $this->getAuthenticatedUserId();

        $query = $this->Thresholds->find()
            ->contain(['Devices'])
            ->orderBy(['Thresholds.id' => 'DESC']);

        if ($userId !== null) {
            $query->innerJoinWith('Devices', function ($q) use ($userId) {
                return $q->where(['Devices.user_id' => $userId]);
            });
        }

        $thresholds = $query->all()->toList();

        $this->renderJson([
            'status' => 'success',
            'thresholds' => $thresholds,
        ]);
    }

    public function view($id = null): void
    {
        $this->request->allowMethod(['get']);

        $userId = $this->getAuthenticatedUserId();
        $query = $this->Thresholds->find()
            ->contain(['Devices'])
            ->where(['Thresholds.id' => $id]);

        if ($userId !== null) {
            $query->innerJoinWith('Devices', function ($q) use ($userId) {
                return $q->where(['Devices.user_id' => $userId]);
            });
        }

        $threshold = $query->first();
        if (!$threshold) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Không tìm thấy ngưỡng cảnh báo !',
            ], 404);

            return;
        }

        $this->renderJson([
            'status' => 'success',
            'threshold' => $threshold,
        ]);
    }

    public function edit($id = null): void
    {
        $this->request->allowMethod(['patch', 'put']);

        $userId = $this->getAuthenticatedUserId();
        $query = $this->Thresholds->find()
            ->contain(['Devices'])
            ->where(['Thresholds.id' => $id]);

        if ($userId !== null) {
            $query->innerJoinWith('Devices', function ($q) use ($userId) {
                return $q->where(['Devices.user_id' => $userId]);
            });
        }

        $threshold = $query->first();
        if (!$threshold) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Không tìm thấy ngưỡng cảnh báo !',
            ], 404);

            return;
        }

        $threshold = $this->Thresholds->patchEntity($threshold, $this->request->getData());
        if ($this->Thresholds->save($threshold)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Cập nhật ngưỡng thành công ',
                'threshold' => $threshold,
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Không thể cập nhật ngưỡng.',
            'errors' => $threshold->getErrors(),
        ], 422);
    }
}
