<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;
use App\Service\AlertService;

class AlertsController extends AppController
{
    protected AlertService $alertService;

    //Khởi tạo service xử lý lịch sử cảnh báo.
    public function initialize(): void
    {
        parent::initialize();

        //Dùng chung service đã kiểm tra ngưỡng và tạo cảnh báo.
        $this->alertService = new AlertService();
    }

    //Trả lịch sử cảnh báo của user được xác định từ JWT.
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

        // if ($this->getAuthenticatedUserRole() !== 'user') {
        //     $this->renderJson([
        //         'status' => 'error',
        //         'message' => 'Chức năng này chỉ dành cho người dùng.',
        //     ], 403);

        //     return;
        // }

        //chỉ đọc các alert_logs đã được tạo trước đó.
        $result = $this->alertService->getUserAlertHistory($userId, [
            'device_id' => $this->request->getQuery('device_id'),
            'from' => $this->request->getQuery('from'),
            'to' => $this->request->getQuery('to'),
            'page' => $this->request->getQuery('page', 1),
            'limit' => $this->request->getQuery('limit', 10),
        ]);

        if (!$result['success']) {
            $this->renderJson([
                'status' => 'error',
                'message' => $result['message'],
                'errors' => $result['errors'],
            ], $result['statusCode']);

            return;
        }

        $this->renderJson([
            'status' => 'success',
            'filters' => $result['filters'],
            'pagination' => $result['pagination'],
            'alerts' => $result['data'],
        ], $result['statusCode']);
    }

    //Trả tối đa 20 cảnh báo mới nhất để Admin giám sát toàn hệ thống
    public function systemMonitoring(): void
    {
        $this->request->allowMethod(['get']);

        if (!$this->requireAdmin()) {
            return;
        }

        //Service chỉ đọc các cảnh báo đã có, không tạo hoặc gửi lại email
        $result = $this->alertService->getSystemAlertHistory();

        $this->renderJson([
            'status' => 'success',
            'alerts' => $result['data'],
        ], $result['statusCode']);
    }
}
