<?php
declare(strict_types=1);

namespace App\Service;

use App\Model\Entity\UtilityNote;
use App\Model\Table\UtilityNotesTable;
use Cake\ORM\TableRegistry;

class UtilityNotesService
{
    protected UtilityNotesTable $UtilityNotes;

    public function __construct()
    {
        $this->UtilityNotes = TableRegistry::getTableLocator()
            ->get('UtilityNotes');
    }

    //Lấy danh sách ghi chú của người dùng
    public function getList(int $userId): array
    {
        $notes = $this->UtilityNotes->find()
            ->where([
                'UtilityNotes.user_id' => $userId,
            ])
            ->orderBy([
                'UtilityNotes.created_at' => 'DESC',
                'UtilityNotes.id' => 'DESC',
            ])
            ->all()
            ->toList();

        return [
            'success' => true,
            'statusCode' => 200,
            'data' => $notes,
        ];
    }

    //Tạo ghi chú mới cho người dùng
    public function create(int $userId, array $data): array
    {
        $noteContent = trim((string)($data['note'] ?? ''));

        if ($noteContent === '') {
            return [
                'success' => false,
                'statusCode' => 422,
                'message' => 'Vui lòng nhập nội dung ghi chú.',
                'errors' => [
                    'note' => [
                        'required' => 'Vui lòng nhập nội dung ghi chú.',
                    ],
                ],
            ];
        }

        $note = $this->UtilityNotes->newEmptyEntity();

        $note = $this->UtilityNotes->patchEntity($note, [
            'user_id' => $userId,
            'note' => $noteContent,
        ]);

        if (!$this->UtilityNotes->save($note)) {
            return [
                'success' => false,
                'statusCode' => 422,
                'message' => 'Không thể tạo ghi chú.',
                'errors' => $note->getErrors(),
            ];
        }

        return [
            'success' => true,
            'statusCode' => 201,
            'message' => 'Tạo ghi chú thành công.',
            'data' => $note,
        ];
    }

    //Cập nhật ghi chú của chính người dùng
    public function update(
        int $id,
        int $userId,
        array $data
    ): array {
        $note = $this->findUserNote($id, $userId);

        if ($note === null) {
            return [
                'success' => false,
                'statusCode' => 404,
                'message' => 'Không tìm thấy ghi chú hoặc bạn không có quyền cập nhật.',
            ];
        }

        $noteContent = trim((string)($data['note'] ?? ''));

        if ($noteContent === '') {
            return [
                'success' => false,
                'statusCode' => 422,
                'message' => 'Vui lòng nhập nội dung ghi chú.',
                'errors' => [
                    'note' => [
                        'required' => 'Vui lòng nhập nội dung ghi chú.',
                    ],
                ],
            ];
        }

        /*
         * Chỉ cho phép cập nhật nội dung ghi chú.
         * Không nhận user_id từ request để tránh thay đổi chủ sở hữu.
         */
        $note = $this->UtilityNotes->patchEntity($note, [
            'note' => $noteContent,
        ]);

        if (!$this->UtilityNotes->save($note)) {
            return [
                'success' => false,
                'statusCode' => 422,
                'message' => 'Không thể cập nhật ghi chú.',
                'errors' => $note->getErrors(),
            ];
        }

        return [
            'success' => true,
            'statusCode' => 200,
            'message' => 'Cập nhật ghi chú thành công.',
            'data' => $note,
        ];
    }

    //Xóa ghi chú của chính người dùng
    public function remove(int $id, int $userId): array
    {
        $note = $this->findUserNote($id, $userId);

        if ($note === null) {
            return [
                'success' => false,
                'statusCode' => 404,
                'message' => 'Không tìm thấy ghi chú hoặc bạn không có quyền xóa.',
            ];
        }

        if (!$this->UtilityNotes->delete($note)) {
            return [
                'success' => false,
                'statusCode' => 422,
                'message' => 'Không thể xóa ghi chú.',
            ];
        }

        return [
            'success' => true,
            'statusCode' => 200,
            'message' => 'Xóa ghi chú thành công.',
        ];
    }

    //Tìm ghi chú theo ID và chủ sở hữu
    private function findUserNote(
        int $id,
        int $userId
    ): ?UtilityNote {
        return $this->UtilityNotes->find()
            ->where([
                'UtilityNotes.id' => $id,
                'UtilityNotes.user_id' => $userId,
            ])
            ->first();
    }
}