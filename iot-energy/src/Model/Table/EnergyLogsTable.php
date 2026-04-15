<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\Query\SelectQuery;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * EnergyLogs Model
 *
 * @property \App\Model\Table\DevicesTable&\Cake\ORM\Association\BelongsTo $Devices
 *
 * @method \App\Model\Entity\EnergyLog newEmptyEntity()
 * @method \App\Model\Entity\EnergyLog newEntity(array $data, array $options = [])
 * @method array<\App\Model\Entity\EnergyLog> newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\EnergyLog get(mixed $primaryKey, array|string $finder = 'all', \Psr\SimpleCache\CacheInterface|string|null $cache = null, \Closure|string|null $cacheKey = null, mixed ...$args)
 * @method \App\Model\Entity\EnergyLog findOrCreate($search, ?callable $callback = null, array $options = [])
 * @method \App\Model\Entity\EnergyLog patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method array<\App\Model\Entity\EnergyLog> patchEntities(iterable $entities, array $data, array $options = [])
 * @method \App\Model\Entity\EnergyLog|false save(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method \App\Model\Entity\EnergyLog saveOrFail(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method iterable<\App\Model\Entity\EnergyLog>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\EnergyLog>|false saveMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\EnergyLog>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\EnergyLog> saveManyOrFail(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\EnergyLog>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\EnergyLog>|false deleteMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\EnergyLog>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\EnergyLog> deleteManyOrFail(iterable $entities, array $options = [])
 */
class EnergyLogsTable extends Table
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

        $this->setTable('energy_logs');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('Devices', [
            'foreignKey' => 'device_id',
        ]);
    }

    /**
     * Default validation rules.
     *
     * @param \Cake\Validation\Validator $validator Validator instance.
     * @return \Cake\Validation\Validator
     */
    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->integer('device_id')
            ->allowEmptyString('device_id');

        $validator
            ->numeric('power')
            ->allowEmptyString('power');

        $validator
            ->dateTime('created_at')
            ->allowEmptyDateTime('created_at');

        return $validator;
    }

    /**
     * Returns a rules checker object that will be used for validating
     * application integrity.
     *
     * @param \Cake\ORM\RulesChecker $rules The rules object to be modified.
     * @return \Cake\ORM\RulesChecker
     */
    public function buildRules(RulesChecker $rules): RulesChecker
    {
        $rules->add($rules->existsIn(['device_id'], 'Devices'), ['errorField' => 'device_id']);

        return $rules;
    }
}
