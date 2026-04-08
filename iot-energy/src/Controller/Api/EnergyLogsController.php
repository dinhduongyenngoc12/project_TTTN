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
        $energyLogs = $this->paginate(
            $this->EnergyLogs->find()->contain(['Devices']),
        );

        $this->renderJson([
            'status' => 'success',
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
                'message' => 'Energy log created successfully.',
                'energyLog' => $energyLog,
            ], 201);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Unable to create energy log.',
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
                'message' => 'Energy log updated successfully.',
                'energyLog' => $energyLog,
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Unable to update energy log.',
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
                'message' => 'The energy log has been deleted.',
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'The energy log could not be deleted.',
        ], 422);
    }
}
