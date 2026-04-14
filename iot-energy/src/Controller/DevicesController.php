<?php
declare(strict_types=1);

namespace App\Controller;

use App\Service\DevicesService;

use function Cake\Error\dd;

/**
 * Devices Controller
 *
 * @property \App\Model\Table\DevicesTable $Devices
 */
class DevicesController extends AppController
{
    protected DevicesService $devicesService;

    public function initialize(): void
    {
        parent::initialize();
        $this->devicesService = new DevicesService();
    }

    /**
     * @return void
     */
    public function index(): void
    {
        try {
            $query = $this->devicesService->getList()->orderBy(['Devices.id' => 'DESC']);
            $devices = $this->paginate($query, [
            'limit' => 10,
            'sortableFields' => ['id', 'name', 'user_id', 'photo_path'], ]);

            $pagingData = $devices->pagingParams();
            $this->renderJson([
            'status' => 'success',
            'message' => 'Lay danh sach thiet bi thanh cong',
            'devices' => $devices,
            'pagingData' => $pagingData,]);

        } catch (\Throwable $th) {
            $this->renderJson([
            'status' => 'error',
            'message' => 'Trang ban yeu cau khong co du lieu hoac vuot qua so trang hien co',
            'devices' => [],
            'pagingData' => []
        ], 404);
        }
    }

    public function view($id = null): void
    {
        $device = $this->devicesService->getById($id);

        $this->renderJson([
            'status' => 'success',
            'message' => 'Lay chi tiet thiet bi thanh cong',
            'device' => $device,
        ]);
    }

    public function add(): void
    {
        $this->request->allowMethod(['post']);
        $result = $this->devicesService->create($this->request->getData());
        $device = $result['device'];

        if ($result['saved']) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Tao thiet bi thanh cong',
                'device' => $device,
            ], 201);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Khong the tao thiet bi',
            'errors' => $device->getErrors(),
        ], 422);
    }

    public function edit($id = null): void
    {
        $this->request->allowMethod(['patch', 'post', 'put']);
        $result = $this->devicesService->update($id, $this->request->getData());
        $device = $result['device'];

        if ($result['saved']) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Cap nhat thiet bi thanh cong',
                'device' => $device,
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Khong the cap nhat thiet bi',
            'errors' => $device->getErrors(),
        ], 422);
    }

    public function delete($id = null): void
    {
        $this->request->allowMethod(['post', 'delete']);

        if ($this->devicesService->remove($id)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Xoa thiet bi thanh cong',
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Khong the xoa thiet bi',
        ], 422);
    }
}
