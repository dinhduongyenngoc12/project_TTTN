<?php
declare(strict_types=1);

namespace App\Service;

use App\Model\Table\DevicesTable;
use Cake\ORM\TableRegistry;

class DevicesService
{
    protected DevicesTable $Devices;

    public function __construct()
    {
        $devicesTable = TableRegistry::getTableLocator()->get('Devices');
        $this->Devices = $devicesTable;
    }

    public function getList()
    {
        return $this->Devices->find()->contain(['Users']);
    }

    public function getById($id = null)
    {
        return $this->Devices->get($id, contain: ['Users', 'EnergyLogs', 'Thresholds']);
    }

    public function uploadPhoto($file): ?string
    {
        if (empty($file) || $file->getError() === UPLOAD_ERR_NO_FILE) {
            return null;
        }

        $folder = WWW_ROOT .'uploads/devices/';

        if (!is_dir($folder)) {            //is_dir: check ton tai ?
            mkdir($folder);
        }

        $fileName = time() . '_' . $file->getClientFilename();
        $file->moveTo($folder . $fileName);

        return 'uploads/devices/' . $fileName;
    }


    public function create(array $data): array
    {
        $file = $data['photo'] ?? null;
        unset($data['photo']);

        $path = $this->uploadPhoto($file);
        if ($path !== null) {
            $data['photo_path'] = $path;
        }

        $device = $this->Devices->newEmptyEntity();
        $device = $this->Devices->patchEntity($device, $data);
        $saved = (bool)$this->Devices->save($device);

        return compact('device', 'saved');
    }

    public function update($id = null, array $data = []): array
    {
        $device = $this->Devices->get($id);
        $file = $data['photo'] ?? null;
        unset($data['photo']);

        $path = $this->uploadPhoto($file);
        if ($path !== null) {
            $data['photo_path'] = $path;
        }

        $device = $this->Devices->patchEntity($device, $data);
        $saved = (bool)$this->Devices->save($device);

        return compact('device', 'saved');
    }

    public function remove($id = null): bool
    {
        $device = $this->Devices->get($id);
        return (bool)$this->Devices->delete($device);
    }
}
