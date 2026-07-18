<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Devices Model
 *
 * @property \App\Model\Table\UsersTable&\Cake\ORM\Association\BelongsTo $Users
 * @property \App\Model\Table\EnergyLogsTable&\Cake\ORM\Association\HasMany $EnergyLogs
 * @property \App\Model\Table\AlertConfigsTable&\Cake\ORM\Association\HasOne $AlertConfigs
 * @property \App\Model\Table\HourSummariesTable&\Cake\ORM\Association\HasMany $HourSummaries
 * @property \App\Model\Table\DailySummariesTable&\Cake\ORM\Association\HasMany $DailySummaries
 * @property \App\Model\Table\MonthSummariesTable&\Cake\ORM\Association\HasMany $MonthSummaries
 *
 * @method \App\Model\Entity\Device newEmptyEntity()
 * @method \App\Model\Entity\Device newEntity(array $data, array $options = [])
 * @method array<\App\Model\Entity\Device> newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Device get(mixed $primaryKey, array|string $finder = 'all', \Psr\SimpleCache\CacheInterface|string|null $cache = null, \Closure|string|null $cacheKey = null, mixed ...$args)
 * @method \App\Model\Entity\Device findOrCreate($search, ?callable $callback = null, array $options = [])
 * @method \App\Model\Entity\Device patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method array<\App\Model\Entity\Device> patchEntities(iterable $entities, array $data, array $options = [])
 * @method \App\Model\Entity\Device|false save(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method \App\Model\Entity\Device saveOrFail(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method iterable<\App\Model\Entity\Device>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Device>|false saveMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Device>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Device> saveManyOrFail(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Device>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Device>|false deleteMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Device>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Device> deleteManyOrFail(iterable $entities, array $options = [])
 */
class DevicesTable extends Table
{
    /**
     * Initialize method
     *
     * @param array<string, mixed> $config The configuration for the Table.
     * @return void
     */
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('devices');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');

        $this->belongsTo('Users', [
            'foreignKey' => 'user_id'
        ]);
        $this->belongsTo('IotDevices', [
            'foreignKey' => 'iot_device_id',
            'joinType' => 'LEFT'
        ]);
        $this->hasMany('EnergyLogs', [
            'foreignKey' => 'device_id'
        ]);
        $this->hasOne('AlertConfigs', [
            'foreignKey' => 'device_id'
        ]);
        $this->hasMany('HourSummaries', [
            'foreignKey' => 'device_id'
        ]);
        $this->hasMany('DailySummaries', [
            'foreignKey' => 'device_id'
        ]);
        $this->hasMany('MonthSummaries', [
            'foreignKey' => 'device_id'
        ]);
    }

    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->integer('user_id')
            ->notEmptyString('user_id');

        $validator
            ->integer('iot_device_id')
            ->allowEmptyString('iot_device_id');

        $validator
            ->scalar('name')
            ->maxLength('name', 100)
            ->requirePresence('name', 'create')
            ->notEmptyString('name');

        $validator
            ->scalar('device_type')
            ->maxLength('device_type', 50)
            ->requirePresence('device_type', 'create')
            ->notEmptyString('device_type');

        $validator
            ->numeric('rated_power')
            ->greaterThanOrEqual('rated_power', 0)
            ->allowEmptyString('rated_power');

        $validator
            ->scalar('status')
            ->inList('status', ['active', 'inactive'])
            ->allowEmptyString('status');

        $validator
            ->dateTime('activated_at')
            ->allowEmptyDateTime('activated_at');

        $validator
            ->dateTime('created_at')
            ->allowEmptyDateTime('created_at');

        $validator
            ->dateTime('updated_at')
            ->allowEmptyDateTime('updated_at');
        return $validator;
    }

    public function buildRules(RulesChecker $rules): RulesChecker
    {
        $rules->add(
            $rules->existsIn(['user_id'], 'Users'),
            ['errorField' => 'user_id']
        );

        $rules->add(
            $rules->existsIn(['iot_device_id'], 'IotDevices'),
            ['errorField' => 'iot_device_id']
        );

        return $rules;
    }
}
