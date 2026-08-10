<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class IotDevicesTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('iot_devices');
        $this->setDisplayField('iot_key');
        $this->setPrimaryKey('id');

        $this->hasMany('Devices', [
            'foreignKey' => 'iot_device_id'
        ]);
    }

    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->scalar('iot_key')
            ->maxLength('iot_key', 100)
            ->requirePresence('iot_key', 'create')
            ->notEmptyString(
                'iot_key',
                'Vui lòng nhập tên định danh IOT Key của bộ đo IoT'
            );

        $validator
            ->scalar('status')
            ->requirePresence('status', 'create')
            ->notEmptyString('status')
            ->inList(
                'status',
                ['active', 'disabled'],
                'Trạng thái bộ đo IoT không hợp lệ'
            );

        return $validator;
    }

    public function buildRules(RulesChecker $rules): RulesChecker
    {
        //Mỗi bộ đo phải có một API Key duy nhất
        $rules->add(
            $rules->isUnique(
                ['iot_key'],
                'API Key đã tồn tại trong hệ thống'
            ),
            ['errorField' => 'iot_key']
        );

        return $rules;
    }
}