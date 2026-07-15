<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;
use App\Service\DevicesService;

class DevicesController extends AppController
{
    protected DevicesService $devicesService;

    public function initialize(): void
    {
        parent::initialize();
        $this->devicesService = new DevicesService();
    }

    public function index(): void
    {
        $this->request->allowMethod(['get']);

        $keyword = trim((string)$this->request->getQuery('keyword', ''));
        $userId = $this->getAuthenticatedUserId();

        $devices = $this->devicesService
            ->getList($keyword, $userId)
            ->orderBy(['Devices.id' => 'DESC'])
            ->all()
            ->toList();

        $this->renderJson([
            'status' => 'success',
            'message' => 'Lấy danh sách thiết bị thành công',
            'keyword' => $keyword,
            'devices' => $devices,
            'pagingData' => []
        ]);
    }

    public function view(int $id): void
    {
        $this->request->allowMethod(['get']);

        $userId = $this->getAuthenticatedUserId();

        if ($userId === null) {
            $this->renderJson([
                'success' => false,
                'message' => 'Người dùng chưa đăng nhập.',
            ], 401);

            return;
        }

        $data = $this->devicesService->getDetail($id, $userId);

        if ($data === null) {
            $this->renderJson([
                'success' => false,
                'message' => 'Không tìm thấy thiết bị hoặc bạn không có quyền truy cập.',
            ], 404);

            return;
        }

        $this->renderJson([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function add(): void
    {
        $this->request->allowMethod(['post']);

        $userId = $this->getAuthenticatedUserId();

        if ($userId === null) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Người dùng chưa đăng nhập',
            ], 401);

            return;
        }

        $requestData = $this->request->getData();

        $data = [
            'user_id' => $userId,
            'name' => trim((string)($requestData['name'] ?? '')),
            'device_type' => trim((string)($requestData['device_type'] ?? '')),
            'rated_power' => $requestData['rated_power'] ?? null,
            'api_key' => trim((string)($requestData['api_key'] ?? '')),
        ];

        $result = $this->devicesService->create($data);

        if (!$result['saved']) {
            $this->renderJson([
                'status' => 'error',
                'message' => $result['message'] ?? 'Không thể tạo thiết bị',
                'errors' => $result['device']->getErrors(),
            ], 422);

            return;
        }

        $this->renderJson([
            'status' => 'success',
            'message' => 'Tạo thiết bị thành công',
            'device' => $result['device'],
        ], 201);
    }

    public function edit($id = null): void
    {
        $this->request->allowMethod(['patch', 'post', 'put']);

        $userId = $this->getAuthenticatedUserId();

        if ($userId === null) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Người dùng chưa đăng nhập',
            ], 401);

            return;
        }

        $requestData = $this->request->getData();

        $data = [
            'name' => trim((string)($requestData['name'] ?? '')),
            'device_type' => trim((string)($requestData['device_type'] ?? '')),
            'rated_power' => $requestData['rated_power'] ?? null,
        ];

        $result = $this->devicesService->update((int)$id, $userId, $data);

        if (!$result['saved']) {
            $this->renderJson([
                'status' => 'error',
                'message' => $result['message'] ?? 'Không thể cập nhật thiết bị',
                'errors' => $result['device']->getErrors(),
            ], 422);

            return;
        }

        $this->renderJson([
            'status' => 'success',
            'message' => 'Cập nhật thiết bị thành công',
            'device' => $result['device'],
        ]);
    }
}