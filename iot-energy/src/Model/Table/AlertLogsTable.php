<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class AlertLogsTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('alert_logs');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('AlertConfigs', [
            'foreignKey' => 'alert_config_id',
            'joinType' => 'INNER',
        ]);

        $this->belongsTo('EnergyLogs', [
            'foreignKey' => 'energy_log_id',
        ]);
    }

    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->integer('alert_config_id')
            ->requirePresence('alert_config_id', 'create')
            ->notEmptyString('alert_config_id');

        $validator
            ->integer('energy_log_id')
            ->notEmptyString('energy_log_id');

        $validator
            ->numeric('power_value')
            ->requirePresence('power_value', 'create')
            ->notEmptyString('power_value');

        $validator
            ->numeric('threshold_value')
            ->requirePresence('threshold_value', 'create')     //co gui field threshold_value len khong {}
                                                                //create - chi bat buoc khi newEntity()
            ->notEmptyString('threshold_value');

        $validator
            ->boolean('email_sent')
            ->notEmptyString('email_sent');

        $validator
            ->dateTime('created_at')
            ->notEmptyDateTime('created_at');

        return $validator;
    }

    public function buildRules(RulesChecker $rules): RulesChecker
    {
        $rules->add($rules->existsIn(['alert_config_id'], 'AlertConfigs'), ['errorField' => 'alert_config_id']);
        $rules->add($rules->existsIn(['energy_log_id'], 'EnergyLogs'), ['errorField' => 'energy_log_id']);
        $rules->add($rules->isUnique(['energy_log_id'], ['allowMultipleNulls' => true]), ['errorField' => 'energy_log_id']);

        return $rules;
    }
}
