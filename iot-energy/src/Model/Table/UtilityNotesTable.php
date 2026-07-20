<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class UtilityNotesTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('utility_notes');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('Users', [
            'foreignKey' => 'user_id',
            'joinType' => 'INNER',
        ]);
    }

    public function validationDefault(
        Validator $validator
    ): Validator {

        $validator
            ->integer('user_id')
            ->requirePresence('user_id', 'create')
            ->notEmptyString('user_id');

        $validator
            ->scalar('note')
            ->requirePresence('note', 'create')
            ->notEmptyString('note')
            ->maxLength('note', 2000);

        return $validator;
    }

    public function buildRules(
        RulesChecker $rules
    ): RulesChecker {

        //Người dùng phải tồn tại
        $rules->add(
            $rules->existsIn(['user_id'], 'Users'),
            ['errorField' => 'user_id']
        );

        return $rules;
    }
}