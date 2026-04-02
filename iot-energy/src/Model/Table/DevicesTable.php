<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\Query\SelectQuery;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Devices Model
 *
 * @property \App\Model\Table\UsersTable&\Cake\ORM\Association\BelongsTo $Users
 * @property \App\Model\Table\EnergyLogsTable&\Cake\ORM\Association\HasMany $EnergyLogs
 * @property \App\Model\Table\ThresholdsTable&\Cake\ORM\Association\HasMany $Thresholds
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
            'foreignKey' => 'user_id',
        ]);
        $this->hasMany('EnergyLogs', [
            'foreignKey' => 'device_id',
        ]);
        $this->hasMany('Thresholds', [
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
            ->scalar('name')
            ->maxLength('name', 100)
            ->allowEmptyString('name');

        $validator
            ->integer('user_id')
            ->allowEmptyString('user_id');

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
        $rules->add($rules->existsIn(['user_id'], 'Users'), ['errorField' => 'user_id']);

        return $rules;
    }
}
