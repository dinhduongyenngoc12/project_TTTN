<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;
use App\Service\UtilityNotesService;

class UtilityNotesController extends AppController
{
    protected UtilityNotesService $utilityNotesService;

    public function initialize(): void
    {
        parent::initialize();

        $this->utilityNotesService = new UtilityNotesService();
    }

    //Lấy danh sách ghi chú của người dùng đang đăng nhập
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

        $result = $this->utilityNotesService->getList($userId);

        $this->renderJson([
            'status' => 'success',
            'utilityNotes' => $result['data'],
        ], $result['statusCode']);
    }

    //Tạo ghi chú mới
    public function add(): void
    {
        $this->request->allowMethod(['post']);

        $userId = $this->getAuthenticatedUserId();

        if ($userId === null) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Người dùng chưa đăng nhập.',
            ], 401);

            return;
        }

        $result = $this->utilityNotesService->create(
            $userId,
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
            'utilityNote' => $result['data'],
        ], $result['statusCode']);
    }

    //Cập nhật nội dung ghi chú
    public function edit(int $id): void
    {
        $this->request->allowMethod(['patch', 'put']);

        $userId = $this->getAuthenticatedUserId();

        if ($userId === null) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Người dùng chưa đăng nhập.',
            ], 401);

            return;
        }

        $result = $this->utilityNotesService->update(
            $id,
            $userId,
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
            'utilityNote' => $result['data'],
        ], $result['statusCode']);
    }

    //Xóa ghi chú
    public function delete(int $id): void
    {
        $this->request->allowMethod(['delete']);

        $userId = $this->getAuthenticatedUserId();

        if ($userId === null) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Người dùng chưa đăng nhập.',
            ], 401);

            return;
        }

        $result = $this->utilityNotesService->remove(
            $id,
            $userId
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
        ], $result['statusCode']);
    }
}