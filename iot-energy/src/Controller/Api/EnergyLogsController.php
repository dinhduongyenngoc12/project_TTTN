<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;

/**
 * Energy Logs API Controller
 *
 * @property \App\Model\Table\EnergyLogsTable $EnergyLogs
 */
class EnergyLogsController extends AppController
{
    /**
     * @return void
     */
    public function index(): void
    {
        $this->request->allowMethod(['get']);

        $userId = $this->getAuthenticatedUserId();
        $deviceId = $this->request->getQuery('device_id');
        $from = trim((string)$this->request->getQuery('from', ''));
        $to = trim((string)$this->request->getQuery('to', ''));

        $query = $this->EnergyLogs->find()
            ->contain(['Devices'])             //load
            ->orderBy([
                'EnergyLogs.created_at' => 'DESC',
                'EnergyLogs.id' => 'DESC',
            ]);

        if ($userId !== null) {
            $query->innerJoinWith('Devices', function ($q) use ($userId) {
                return $q->where(['Devices.user_id' => $userId]);
            });
        }

        if (is_numeric($deviceId)) {
            $query->where(['EnergyLogs.device_id' => (int)$deviceId]);
        }

        if ($from !== '') {
            $query->where([
                'EnergyLogs.created_at >=' => $this->normalizeDateBoundary($from, false),         //chuan hoa ngay bat dau 00:00:00
            ]);
        }

        if ($to !== '') {
            $query->where([
                'EnergyLogs.created_at <=' => $this->normalizeDateBoundary($to, true)             //chuan hoa ngay bat dau 23:59:59
            ]);
        }

        $energyLogs = $query->all()->toList();

        $this->renderJson([
            'status' => 'success',
            'filters' => [
                'device_id' => is_numeric($deviceId) ? (int)$deviceId : null,
                'from' => $from !== '' ? $from : null,
                'to' => $to !== '' ? $to : null,
            ],
            'energyLogs' => $energyLogs,
        ]);
    }

    /**
     * @param string|null $id Energy log id.
     * @return void
     */
    public function view($id = null): void
    {
        $energyLog = $this->EnergyLogs->get($id, contain: ['Devices']);

        $this->renderJson([
            'status' => 'success',
            'energyLog' => $energyLog,
        ]);
    }

    /**
     * @return void
     */
    public function add(): void
    {
        $this->request->allowMethod(['post']);

        $energyLog = $this->EnergyLogs->newEmptyEntity();
        $energyLog = $this->EnergyLogs->patchEntity($energyLog, $this->request->getData());

        if ($this->EnergyLogs->save($energyLog)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Nhật ký năng lượng đã được tạo thành công.',
                'energyLog' => $energyLog,
            ], 201);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Không thể tạo nhật ký năng lượng',
            'errors' => $energyLog->getErrors(),
        ], 422);
    }

    /**
     * @param string|null $id Energy log id.
     * @return void
     */
    public function edit($id = null): void
    {
        $this->request->allowMethod(['patch', 'post', 'put']);

        $energyLog = $this->EnergyLogs->get($id);
        $energyLog = $this->EnergyLogs->patchEntity($energyLog, $this->request->getData());

        if ($this->EnergyLogs->save($energyLog)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Nhật ký năng lượng đã được cập nhật thành công.',
                'energyLog' => $energyLog,
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Không thể cập nhật nhật ký năng lượng',
            'errors' => $energyLog->getErrors(),
        ], 422);
    }

    /**
     * @param string|null $id Energy log id.
     * @return void
     */
    public function delete($id = null): void
    {
        $this->request->allowMethod(['post', 'delete']);

        $energyLog = $this->EnergyLogs->get($id);
        if ($this->EnergyLogs->delete($energyLog)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Nhật ký năng lượng đã được xoá thành công.',
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Không thể xoá nhật ký năng lượng.',
        ], 422);
    }

    private function normalizeDateBoundary(string $value, bool $isEndOfDay): string
    {
        if (strlen($value) === 10) {
            return $value . ($isEndOfDay ? ' 23:59:59' : ' 00:00:00');
        }

        return $value;
    }
}
