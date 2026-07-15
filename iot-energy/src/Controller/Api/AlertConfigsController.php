<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;
use App\Service\AlertConfigsService;

class AlertConfigsController extends AppController
{
    protected AlertConfigsService $alertConfigsService;

    public function initialize(): void
    {
        parent::initialize();

        $this->alertConfigsService = new AlertConfigsService();
    }

    public function index(): void
    {
        $this->request->allowMethod(['get']);

        $alertConfigs = $this->alertConfigsService->getList(
            $this->getAuthenticatedUserId()
        );

        $this->renderJson([
            'status' => 'success',
            'alertConfigs' => $alertConfigs,
            'thresholds' => $alertConfigs,
        ]);
    }

    public function view($id = null): void
    {
        $this->request->allowMethod(['get']);

        $alertConfig = $this->alertConfigsService->getDetail(
            (int)$id,
            $this->getAuthenticatedUserId()
        );

        if (!$alertConfig) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Không tìm thấy cấu hình cảnh báo.',
            ], 404);

            return;
        }

        $this->renderJson([
            'status' => 'success',
            'alertConfig' => $alertConfig,
            'threshold' => $alertConfig,
        ]);
    }

    public function edit($id = null): void
    {
        $this->request->allowMethod(['patch', 'put']);

        $result = $this->alertConfigsService->update(
            (int)$id,
            $this->getAuthenticatedUserId(),
            $this->request->getData()
        );

        if (!$result['saved']) {
            $this->renderJson([
                'status' => 'error',
                'message' => $result['message'],
                'errors' => $result['errors'],
            ], $result['statusCode']);

            return;
        }

        $this->renderJson([
            'status' => 'success',
            'message' => $result['message'],
            'alertConfig' => $result['alertConfig'],
            'threshold' => $result['alertConfig'],
        ]);
    }
}