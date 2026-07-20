<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class MonthSummariesTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('month_summaries');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('Devices', [
            'foreignKey' => 'device_id',
            'joinType' => 'INNER',
        ]);
    }

    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->integer('device_id')
            ->requirePresence('device_id', 'create')
            ->notEmptyString('device_id');

        $validator
            ->integer('year')
            ->requirePresence('year', 'create')
            ->notEmptyString('year');

        $validator
            ->integer('month')
            ->requirePresence('month', 'create')
            ->notEmptyString('month');

        $validator
            ->decimal('total_energy')
            ->requirePresence('total_energy', 'create')
            ->notEmptyString('total_energy')
            ->greaterThanOrEqual('total_energy', 0);

        return $validator;
    }

    public function buildRules(RulesChecker $rules): RulesChecker
    {
        //Thiết bị phải tồn tại trước khi tạo dữ liệu tổng hợp tháng
        $rules->add(
            $rules->existsIn(['device_id'], 'Devices'),
            ['errorField' => 'device_id']
        );

        //Mỗi thiết bị chỉ có một bản tổng hợp trong cùng năm và tháng
        $rules->add(
            $rules->isUnique(['device_id', 'year', 'month']),
            ['errorField' => 'month']
        );

        return $rules;
    }
}