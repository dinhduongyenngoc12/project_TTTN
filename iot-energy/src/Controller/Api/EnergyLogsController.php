<?php
declare(strict_types=1);

namespace App\Controller\Api;
//nhan request, goi Service, tra JSON

use App\Controller\AppController;
use App\Service\EnergyLogsService;
use Cake\Event\EventInterface;

class EnergyLogsController extends AppController
{
    protected EnergyLogsService $energyLogsService;

    public function initialize(): void
    {
        parent::initialize();

        $this->Authentication->addUnauthenticatedActions(['add']);
        $this->energyLogsService = new EnergyLogsService();
    }

    public function beforeFilter(EventInterface $event): void
    {
        parent::beforeFilter($event);

        $this->Authentication->addUnauthenticatedActions(['add']);
    }

    public function index(): void
    {
        $this->request->allowMethod(['get']);

        $result = $this->energyLogsService->getList(
            $this->getAuthenticatedUserId(),
            $this->request->getQuery('device_id'),
            trim((string)$this->request->getQuery('from', '')),
            trim((string)$this->request->getQuery('to', ''))
        );

        $this->renderJson([
            'status' => 'success',
            'filters' => $result['filters'],
            'energyLogs' => $result['data'],
        ]);
    }

    public function view($id = null): void
    {
        $this->request->allowMethod(['get']);

        $result = $this->energyLogsService->getDetail(
            (int)$id,
            $this->getAuthenticatedUserId()
        );

        if (!$result['success']) {
            $this->renderJson([
                'status' => 'error',
                'message' => $result['message'],
            ], $result['statusCode']);

            return;
        }

        $this->renderJson([
            'status' => 'success',
            'energyLog' => $result['data'],
        ]);
    }

    public function add(): void
    {
        $this->request->allowMethod(['post']);

        $apiKey = trim($this->request->getHeaderLine('API-KEY'));                //xác thực bằng header

        $result = $this->energyLogsService->createFromIot(
            $apiKey,
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
            'data' => $result['data'],
        ], $result['statusCode']);
    }
    
}