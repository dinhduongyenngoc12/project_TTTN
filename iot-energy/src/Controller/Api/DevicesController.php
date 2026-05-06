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
            'pagingData' => [],
        ]);
    }
}
