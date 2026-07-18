<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;
use App\Service\IotDevicesService;

class IotDevicesController extends AppController
{
    protected IotDevicesService $iotDevicesService;

    public function initialize(): void
    {
        parent::initialize();

        $this->iotDevicesService = new IotDevicesService();
    }

    //Lấy danh sách bộ đo IoT
    public function index(): void
    {
        $this->request->allowMethod(['get']);

        if (!$this->requireAdmin()) {
            return;
        }

        $result = $this->iotDevicesService->getList(
            trim((string)$this->request->getQuery('keyword', '')),
            trim((string)$this->request->getQuery('status', ''))
        );

        $this->renderJson([
            'status' => 'success',
            'filters' => $result['filters'],
            'iotDevices' => $result['data'],
        ], $result['statusCode']);
    }

    //Thêm bộ đo IoT
    public function add(): void
    {
        $this->request->allowMethod(['post']);

        if (!$this->requireAdmin()) {
            return;
        }

        $result = $this->iotDevicesService->create(
            $this->request->getData()
        );

        if (!$result['success']) {
            $this->renderJson([
                'status' => 'error',
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], $result['statusCode']);

            return;
        }

        $this->renderJson([
            'status' => 'success',
            'message' => $result['message'],
            'iotDevice' => $result['data'],
        ], $result['statusCode']);
    }

    //Vô hiệu hóa bộ đo IoT
    public function disable(int $id): void
    {
        $this->request->allowMethod(['patch']);

        if (!$this->requireAdmin()) {
            return;
        }

        $result = $this->iotDevicesService->disable($id);

        if (!$result['success']) {
            $this->renderJson([
                'status' => 'error',
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], $result['statusCode']);

            return;
        }

        $this->renderJson([
            'status' => 'success',
            'message' => $result['message'],
            'data' => $result['data'],
        ]);
    }

    //Kích hoạt lại bộ đo IoT
    public function enable(int $id): void
    {
        $this->request->allowMethod(['patch']);

        if (!$this->requireAdmin()) {
            return;
        }

        $result = $this->iotDevicesService->enable($id);

        if (!$result['success']) {
            $this->renderJson([
                'status' => 'error',
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], $result['statusCode']);

            return;
        }

        $this->renderJson([
            'status' => 'success',
            'message' => $result['message'],
            'iotDevice' => $result['data'],
        ]);
    }
}