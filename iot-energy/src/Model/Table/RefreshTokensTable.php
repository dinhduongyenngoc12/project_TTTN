<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\Query\SelectQuery;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * RefreshTokens Model
 *
 * @property \App\Model\Table\UsersTable&\Cake\ORM\Association\BelongsTo $Users
 *
 * @method \App\Model\Entity\RefreshToken newEmptyEntity()
 * @method \App\Model\Entity\RefreshToken newEntity(array $data, array $options = [])
 * @method array<\App\Model\Entity\RefreshToken> newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\RefreshToken get(mixed $primaryKey, array|string $finder = 'all', \Psr\SimpleCache\CacheInterface|string|null $cache = null, \Closure|string|null $cacheKey = null, mixed ...$args)
 * @method \App\Model\Entity\RefreshToken findOrCreate($search, ?callable $callback = null, array $options = [])
 * @method \App\Model\Entity\RefreshToken patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method array<\App\Model\Entity\RefreshToken> patchEntities(iterable $entities, array $data, array $options = [])
 * @method \App\Model\Entity\RefreshToken|false save(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method \App\Model\Entity\RefreshToken saveOrFail(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method iterable<\App\Model\Entity\RefreshToken>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\RefreshToken>|false saveMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\RefreshToken>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\RefreshToken> saveManyOrFail(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\RefreshToken>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\RefreshToken>|false deleteMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\RefreshToken>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\RefreshToken> deleteManyOrFail(iterable $entities, array $options = [])
 */
class RefreshTokensTable extends Table
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

        $this->setTable('refresh_tokens');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('Users', [
            'foreignKey' => 'user_id',
            'joinType' => 'INNER',
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
            ->integer('user_id')
            ->notEmptyString('user_id');

        $validator
            ->scalar('token')
            ->maxLength('token', 512)
            ->requirePresence('token', 'create')
            ->notEmptyString('token')
            ->add('token', 'unique', ['rule' => 'validateUnique', 'provider' => 'table']);

        $validator
            ->dateTime('expires_at')
            ->requirePresence('expires_at', 'create')
            ->notEmptyDateTime('expires_at');

        $validator
            ->boolean('is_revoked')
            ->notEmptyString('is_revoked');

        $validator
            ->dateTime('created_at')
            ->allowEmptyDateTime('created_at');

        $validator
            ->dateTime('last_used_at')
            ->allowEmptyDateTime('last_used_at');

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
        $rules->add($rules->isUnique(['token']), ['errorField' => 'token']);
        $rules->add($rules->existsIn(['user_id'], 'Users'), ['errorField' => 'user_id']);

        return $rules;
    }
}
