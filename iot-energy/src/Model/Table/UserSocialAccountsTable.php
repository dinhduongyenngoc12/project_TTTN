<?php

declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;
use Cake\ORM\RulesChecker;

class UserSocialAccountsTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('user_social_accounts');
        $this->setPrimaryKey('id');
        $this->setDisplayField('provider_user_id');

        $this->addBehavior('Timestamp', [
            'events' => [
                'Model.beforeSave' => [
                    'created_at' => 'new',
                    'updated_at' => 'always',
                ],
            ],
        ]);

        $this->belongsTo('Users', [
            'foreignKey' => 'user_id',
            'joinType' => 'INNER',
        ]);
    }

    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->integer('id')
            ->allowEmptyString('id', null, 'create');

        $validator
            ->integer('user_id')
            ->requirePresence('user_id', 'create')
            ->notEmptyString('user_id', 'user_id không được để trống');

        $validator
            ->scalar('provider')
            ->maxLength('provider', 50)
            ->requirePresence('provider', 'create')
            ->notEmptyString('provider', 'provider không được để trống');

        $validator
            ->scalar('provider_user_id')
            ->maxLength('provider_user_id', 191)
            ->requirePresence('provider_user_id', 'create')
            ->notEmptyString('provider_user_id', 'provider_user_id không được để trống');

        $validator
            ->scalar('provider_email')
            ->maxLength('provider_email', 255)
            ->allowEmptyString('provider_email');

        $validator
            ->scalar('avatar_url')
            ->allowEmptyString('avatar_url');

        return $validator;
    }

    public function buildRules(RulesChecker $rules): RulesChecker
    {
        $rules->add($rules->existsIn(['user_id'], 'Users'), [
            'errorField' => 'user_id',
            'message' => 'user_id không tồn tại trong bảng users',
        ]);

        $rules->add($rules->isUnique(
            ['provider', 'provider_user_id']
        ), [
            'errorField' => 'provider_user_id',
            'message' => 'Tài khoản social này đã được liên kết',
        ]);

        $rules->add($rules->isUnique(
            ['user_id', 'provider']
        ), [
            'errorField' => 'provider',
            'message' => 'User này đã liên kết provider này rồi',
        ]);

        return $rules;
    }
}