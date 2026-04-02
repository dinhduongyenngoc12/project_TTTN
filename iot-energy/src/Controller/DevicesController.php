<?php
declare(strict_types=1);

namespace App\Controller;

/**
 * Devices Controller
 *
 * @property \App\Model\Table\DevicesTable $Devices
 */
class DevicesController extends AppController
{
    /**
     * @return void
     */
    public function index(): void
    {
        $devices = $this->paginate(
            $this->Devices->find()->contain(['Users']),
        );

        $this->renderJson([
            'status' => 'success',
            'devices' => $devices,
        ]);
    }

    /**
     * @param string|null $id Device id.
     * @return void
     */
    public function view($id = null): void
    {
        $device = $this->Devices->get($id, contain: ['Users', 'EnergyLogs', 'Thresholds']);

        $this->renderJson([
            'status' => 'success',
            'device' => $device,
        ]);
    }

    /**
     * @return void
     */
    public function add(): void
    {
        $this->request->allowMethod(['post']);

        $device = $this->Devices->newEmptyEntity();
        $device = $this->Devices->patchEntity($device, $this->request->getData());

        if ($this->Devices->save($device)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Device created successfully.',
                'device' => $device,
            ], 201);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Unable to create device.',
            'errors' => $device->getErrors(),
        ], 422);
    }

    /**
     * @param string|null $id Device id.
     * @return void
     */
    public function edit($id = null): void
    {
        $this->request->allowMethod(['patch', 'post', 'put']);

        $device = $this->Devices->get($id);
        $device = $this->Devices->patchEntity($device, $this->request->getData());

        if ($this->Devices->save($device)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Device updated successfully.',
                'device' => $device,
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Unable to update device.',
            'errors' => $device->getErrors(),
        ], 422);
    }

    /**
     * @param string|null $id Device id.
     * @return void
     */
    public function delete($id = null): void
    {
        $this->request->allowMethod(['post', 'delete']);

        $device = $this->Devices->get($id);
        if ($this->Devices->delete($device)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'The device has been deleted.',
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'The device could not be deleted.',
        ], 422);
    }
}
