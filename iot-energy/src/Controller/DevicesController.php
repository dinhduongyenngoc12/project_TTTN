<?php
declare(strict_types=1);

namespace App\Controller;

use App\Service\DevicesService;

use function Cake\Error\dd;

/**
 * Devices Controller
 *
 * @property \App\Model\Table\DevicesTable $Devices
 */
class DevicesController extends AppController
{
    protected DevicesService $devicesService;

    public function initialize(): void
    {
        parent::initialize();
        $this->devicesService = new DevicesService();
    }

    /**
     * @return void
     */
    public function index(): void
    {

        $this->request->allowMethod(['get', 'post']);

        try {
            $keyword = trim((string)($this->request->getData('keyword') ?? $this->request->getQuery('keyword', '')));
           
            $query = $this->devicesService->getList($keyword)->orderBy(['Devices.id' => 'DESC']);
            
            $devices = $this->paginate($query, [
            'limit' => 10,
            'sortableFields' => ['id', 'name', 'user_id', 'photo_path'], ]);


            // $devicesList = [];
            // foreach ($devices as $de) {
            // $devicesList[] = [
            //     'id'=>$de->id,
            //     'name'=>$de->name,
            //     'user_id'=>$de->user_id,
            //     'photo_path'=>$de->photo_path,
            //     'username'=>$de->user->username ?? null,
            //     ];
            // } 
            $pagingData = $devices->pagingParams();
            $this->renderJson([
                'status'=>'success',
                'message'=>'Lấy danh sách thiết bị thành công',
                'keyword'=>$keyword,
                'devices'=>$devices,
                // 'devices'=>$devicesList,
                'pagingData'=>$pagingData,]);


        } catch (\Throwable $th) {
            $this->renderJson([
            'status' => 'error',
            'message' => 'Trang bạn yêu cầu không có dữ liệu hoặc vượt quá số trang hiện có',
            'devices' => [],

            'pagingData' => []], 404);

        }
    }

    public function view($id = null): void
    {
        $device = $this->devicesService->getById($id);

        $this->renderJson([
            'status' => 'success',
            'message' => 'Lấy chi tiết thiết bị thành công',
            'device' => $device,
        ]);
    }

    public function add(): void
    {
        $this->request->allowMethod(['post']);
        $result = $this->devicesService->create($this->request->getData());
        $device = $result['device'];

        if ($result['saved']) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Tạo mới thiết bị thành công',
                'device' => $device,
            ], 201);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Không thể tạo thiết bị',
            'errors' => $device->getErrors(),
        ], 422);
    }

    public function edit($id = null): void
    {
        $this->request->allowMethod(['patch', 'post', 'put']);
        $result = $this->devicesService->update($id, $this->request->getData());
        $device = $result['device'];

        if ($result['saved']) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Cập nhật thiết bị thành công',
                'device' => $device,
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Không thể cập nhật thiết bị',
            'errors' => $device->getErrors(),
        ], 422);
    }

    public function delete($id = null): void
    {
        $this->request->allowMethod(['post', 'delete']);

        if ($this->devicesService->remove($id)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Xoá thiết bị thành công',
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Không thể xoá thiết bị',
        ], 422);
    }
}
