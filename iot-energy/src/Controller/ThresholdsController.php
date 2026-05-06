<?php
declare(strict_types=1);

namespace App\Controller;

/**
 * Thresholds Controller
 *
 * @property \App\Model\Table\ThresholdsTable $Thresholds
 */
class ThresholdsController extends AppController
{
    /**
     * @return void
     */
    public function index(): void
    {
        $thresholds = $this->paginate(
            $this->Thresholds->find()->contain(['Devices']),
        );

        $this->renderJson([
            'status' => 'success',
            'thresholds' => $thresholds,
        ]);
    }

    /**
     * @param string|null $id Threshold id.
     * @return void
     */
    public function view($id = null): void
    {
        $threshold = $this->Thresholds->get($id, contain: ['Devices']);

        $this->renderJson([
            'status' => 'success',
            'threshold' => $threshold,
        ]);
    }

    /**
     * @return void
     */
    public function add(): void
    {
        $this->request->allowMethod(['post']);

        $threshold = $this->Thresholds->newEmptyEntity();
        $threshold = $this->Thresholds->patchEntity($threshold, $this->request->getData());

        if ($this->Thresholds->save($threshold)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Tạo ngưỡng tiêu thụ thành công',
                'threshold' => $threshold,
            ], 201);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Không thể tạo ngưỡng tiêu thụ',
            'errors' => $threshold->getErrors(),
        ], 422);
    }

    /**
     * @param string|null $id Threshold id.
     * @return void
     */
    public function edit($id = null): void
    {
        $this->request->allowMethod(['patch', 'post', 'put']);

        $threshold = $this->Thresholds->get($id);
        $threshold = $this->Thresholds->patchEntity($threshold, $this->request->getData());

        if ($this->Thresholds->save($threshold)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Ngưỡng tiêu thụ đã được cập nhật thành công',
                'threshold' => $threshold,
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Không thể cập nhật ngưỡng tiêu thụ',
            'errors' => $threshold->getErrors(),
        ], 422);
    }

    /**
     * @param string|null $id Threshold id.
     * @return void
     */
    public function delete($id = null): void
    {
        $this->request->allowMethod(['post', 'delete']);

        $threshold = $this->Thresholds->get($id);
        if ($this->Thresholds->delete($threshold)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Đã xoá ngưỡng tiêu thụ',
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Không thể xoá ngưỡng tiêu thụ này',
        ], 422);
    }
}
