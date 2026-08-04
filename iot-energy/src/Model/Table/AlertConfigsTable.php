<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class AlertConfigsTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('alert_configs');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('Devices', [
            'foreignKey' => 'device_id',
            'joinType' => 'INNER',
        ]);

        $this->hasMany('AlertLogs', [
            'foreignKey' => 'alert_config_id',
        ]);
    }

    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->integer('device_id')
            ->requirePresence('device_id', 'create')
            ->notEmptyString('device_id');

        $validator
            ->numeric('default_threshold')
            ->greaterThan(
                'default_threshold',
                0,
                'Ngưỡng mặc định phải lớn hơn 0 W'
            )
            ->allowEmptyString('default_threshold');

        $validator
            ->numeric('power_threshold')
            ->greaterThan(
                'power_threshold',
                0,
                'Ngưỡng cảnh báo phải lớn hơn 0 W'
            )
            ->allowEmptyString('power_threshold');

        $validator
            ->scalar('mode')
            ->inList('mode', ['auto', 'manual'])
            ->notEmptyString('mode');

        $validator
            ->scalar('learning_status')
            ->inList('learning_status', ['learning', 'learned_3d', 'learned_7d','adaptive'])
            ->notEmptyString('learning_status');

        $validator
            ->dateTime('learned_at')
            ->allowEmptyDateTime('learned_at');

        $validator
            ->dateTime('created_at')
            ->allowEmptyDateTime('created_at');

        $validator
            ->dateTime('last_email_sent_at')
            ->allowEmptyDateTime('last_email_sent_at');

        return $validator;
    }

    public function buildRules(RulesChecker $rules): RulesChecker
    {
        $rules->add($rules->existsIn(['device_id'], 'Devices'), ['errorField' => 'device_id']);
        $rules->add($rules->isUnique(['device_id']), ['errorField' => 'device_id']);

        return $rules;
    }
}
