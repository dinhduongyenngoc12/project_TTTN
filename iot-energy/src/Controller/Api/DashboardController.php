<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;
use App\Service\DashboardService;

class DashboardController extends AppController
{
    protected DashboardService $dashboardService;

    public function initialize(): void
    {
        parent::initialize();

        $this->dashboardService = new DashboardService();
    }

    //Lấy dữ liệu tóm tắt cho trang chủ người dùng
    public function index(): void
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

        $result = $this->dashboardService->getUserDashboard($userId);

        if (!$result['success']) {
            $this->renderJson([
                'status' => 'error',
                'message' => $result['message'],
            ], $result['statusCode']);

            return;
        }

        $this->renderJson([
            'status' => 'success',
            'data' => $result['data'],
        ], $result['statusCode']);
    }

    // Trả các số liệu tổng quan ngắn gọn dành riêng cho Admin.
    public function systemOverview(): void
    {
        $this->request->allowMethod(['get']);

        // Không cho tài khoản người dùng xem số liệu toàn hệ thống.
        if (!$this->requireAdmin()) {
            return;
        }

        $result = $this->dashboardService->getSystemDashboard();

        $this->renderJson([
            'status' => 'success',
            'data' => $result['data'],
        ], $result['statusCode']);
    }
}
