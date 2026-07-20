<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;
use App\Service\UtilitiesService;

class UtilitiesController extends AppController
{
    protected UtilitiesService $utilitiesService;

    public function initialize(): void
    {
        parent::initialize();

        $this->utilitiesService = new UtilitiesService();
    }

    //Ước tính tiền điện theo tháng của người dùng đang đăng nhập
    public function electricityCost(): void
    {
        $this->request->allowMethod(['get']);

        $userId = $this->getAuthenticatedUserId();

        if ($userId === null) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Người dùng chưa đăng nhập.',
            ], 401);

            return;
        }

        $month = trim(
            (string)$this->request->getQuery('month', '')
        );

        $vatRate = (int)$this->request->getQuery('vat', 0);

        $result = $this->utilitiesService
            ->estimateElectricityCost(
                $userId,
                $month,
                $vatRate
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
            'message' => $result['message'],
            'data' => $result['data'],
        ], $result['statusCode']);
    }
}