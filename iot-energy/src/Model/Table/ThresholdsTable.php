<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\Query\SelectQuery;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Thresholds Model
 *
 * @property \App\Model\Table\DevicesTable&\Cake\ORM\Association\BelongsTo $Devices
 *
 * @method \App\Model\Entity\Threshold newEmptyEntity()
 * @method \App\Model\Entity\Threshold newEntity(array $data, array $options = [])
 * @method array<\App\Model\Entity\Threshold> newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Threshold get(mixed $primaryKey, array|string $finder = 'all', \Psr\SimpleCache\CacheInterface|string|null $cache = null, \Closure|string|null $cacheKey = null, mixed ...$args)
 * @method \App\Model\Entity\Threshold findOrCreate($search, ?callable $callback = null, array $options = [])
 * @method \App\Model\Entity\Threshold patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method array<\App\Model\Entity\Threshold> patchEntities(iterable $entities, array $data, array $options = [])
 * @method \App\Model\Entity\Threshold|false save(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method \App\Model\Entity\Threshold saveOrFail(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method iterable<\App\Model\Entity\Threshold>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Threshold>|false saveMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Threshold>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Threshold> saveManyOrFail(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Threshold>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Threshold>|false deleteMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Threshold>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Threshold> deleteManyOrFail(iterable $entities, array $options = [])
 */
class ThresholdsTable extends Table
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

        $this->setTable('thresholds');
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
            ->numeric('max_power')
            ->allowEmptyString('max_power');

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
