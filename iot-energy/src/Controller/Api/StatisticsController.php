<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;
use App\Service\StatisticsService;

class StatisticsController extends AppController
{
    protected StatisticsService $statisticsService;

    public function initialize(): void
    {
        parent::initialize();

        $this->statisticsService = new StatisticsService();
    }

    //Công suất trung bình theo giờ
    public function hourPower(): void
    {
        $this->request->allowMethod(['get']);

        $result = $this->statisticsService->getHourPower(
            $this->getAuthenticatedUserId(),
            trim((string)$this->request->getQuery('date', ''))
        );

        $this->renderJson($result);
    }

    //Điện năng tiêu thụ theo ngày
    public function dayEnergy(): void
    {
        $this->request->allowMethod(['get']);

        $result = $this->statisticsService->getDayEnergy(
            $this->getAuthenticatedUserId(),
            trim((string)$this->request->getQuery('month', ''))
        );

        $this->renderJson($result);
    }

    //Điện năng tiêu thụ theo tháng
    public function monthEnergy(): void
    {
        $this->request->allowMethod(['get']);

        $year = $this->request->getQuery('year');

        $result = $this->statisticsService->getMonthEnergy(
            $this->getAuthenticatedUserId(),
            is_numeric($year) ? (int)$year : null
        );

        $this->renderJson($result);
    }

    //Danh sách năm có dữ liệu
    public function availableYear(): void
    {
        $this->request->allowMethod(['get']);

        $result = $this->statisticsService->getAvailableYear(
            $this->getAuthenticatedUserId()
        );

        $this->renderJson($result);
    }
}