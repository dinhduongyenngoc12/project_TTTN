<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class PasswordResetTokensTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('password_reset_tokens');
        $this->setPrimaryKey('id');
        $this->setDisplayField('id');

        $this->belongsTo('Users', [
            'foreignKey' => 'user_id',
            'joinType' => 'INNER',
        ]);
    }

    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->integer('user_id')
            ->requirePresence('user_id', true)
            ->notEmptyString('user_id');

        $validator
            ->scalar('token_hash')
            ->requirePresence('token_hash', true)
            ->notEmptyString('token_hash')
            ->maxLength('token_hash', 64);

        $validator
            ->dateTime('expires_at')
            ->requirePresence('expires_at', true)
            ->notEmptyDateTime('expires_at');

        $validator
            ->dateTime('used_at')
            ->allowEmptyDateTime('used_at');

        $validator
            ->dateTime('created_at')
            ->requirePresence('created_at', true)
            ->notEmptyDateTime('created_at');

        return $validator;
    }

    public function buildRules(RulesChecker $rules): RulesChecker
    {
        $rules->add(
            $rules->existsIn(['user_id'], 'Users'),
            ['errorField' => 'user_id']
        );

        $rules->add(
            $rules->isUnique(['token_hash']),
            ['errorField' => 'token_hash']
        );

        return $rules;
    }
}