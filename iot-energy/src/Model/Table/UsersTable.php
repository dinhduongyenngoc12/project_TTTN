<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\Query\SelectQuery;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Users Model
 *
 * @property \App\Model\Table\DevicesTable&\Cake\ORM\Association\HasMany $Devices
 * @property \App\Model\Table\RefreshTokensTable&\Cake\ORM\Association\HasMany $RefreshTokens
 *
 * @method \App\Model\Entity\User newEmptyEntity()
 * @method \App\Model\Entity\User newEntity(array $data, array $options = [])
 * @method array<\App\Model\Entity\User> newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\User get(mixed $primaryKey, array|string $finder = 'all', \Psr\SimpleCache\CacheInterface|string|null $cache = null, \Closure|string|null $cacheKey = null, mixed ...$args)
 * @method \App\Model\Entity\User findOrCreate($search, ?callable $callback = null, array $options = [])
 * @method \App\Model\Entity\User patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method array<\App\Model\Entity\User> patchEntities(iterable $entities, array $data, array $options = [])
 * @method \App\Model\Entity\User|false save(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method \App\Model\Entity\User saveOrFail(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method iterable<\App\Model\Entity\User>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\User>|false saveMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\User>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\User> saveManyOrFail(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\User>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\User>|false deleteMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\User>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\User> deleteManyOrFail(iterable $entities, array $options = [])
 */
class UsersTable extends Table
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

        $this->setTable('users');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->hasMany('Devices', [
            'foreignKey' => 'user_id',
        ]);

        $this->hasMany('RefreshTokens', [
            'foreignKey' => 'user_id',
        ]);
    }

    //Rang buoc du lieu dau vao
    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->scalar('username')
            ->requirePresence('username', true, 'Vui lòng nhập username')    //kiem tra field co duoc gui len khong, true -> bat buoc field phai co moi luc
            ->notEmptyString('username', 'Username không được để trống')     //kiem tra field co rong hay khong
            ->minLength('username', 2, 'Username phải có ít nhất 2 ký tự')
            ->maxLength('username', 50, 'Username không được vượt quá 50 ký tự')
            ->add('username', 'validFormat', [
                'rule' => ['custom', '/^[a-zA-Z0-9_]+$/'],
                'message' => 'Username chỉ được chứa chữ, số và dấu gạch dưới',
            ]);

        $validator
            ->scalar('email')
            ->requirePresence('email',true, 'Vui lòng nhập email')
            ->notEmptyString('email', 'Email không được để trống')
            ->email('email', false, 'Email không đúng định dạng')
            ->maxLength('email', 255, 'Email không được vượt quá 255 ký tự');

        $validator
            ->scalar('password')
            ->requirePresence('password', true, 'Vui lòng nhập mật khẩu')
            ->notEmptyString('password', 'Mật khẩu không được để trống')
            ->minLength('password', 8, 'Mật khẩu phải có đúng 8 ký tự')
            ->maxLength('password', 8, 'Mật khẩu phải có đúng 8 ký tự')
            ->add('password', 'numericOnly', [
                'rule' => ['custom', '/^[0-9]+$/'],
                'message' => 'Mật khẩu chỉ được chứa số',
            ])
            ->add('password', 'notWeakPassword', [
                'rule' => function ($value, $context) {
                    $weakPasswords = ['00000000', '11111111', '12345678', '87654321'];

                    if (in_array($value, $weakPasswords, true)) {
                        return false;
                    }

                    if (preg_match('/^(\d)\1+$/', $value)) {
                        return false;
                    }

                    return true;
                },
                'message' => 'Mật khẩu quá đơn giản, vui lòng chọn mật khẩu khác',
            ]);

        $validator
            ->scalar('role')
            ->maxLength('role', 10)
            ->allowEmptyString('role');

        return $validator;
    }

    public function buildRules(RulesChecker $rules): RulesChecker
    {
        $rules->add($rules->isUnique(['username'], 'Username đã tồn tại'), ['errorField' => 'username']);

        $rules->add($rules->isUnique(['email'], 'Email đã tồn tại'), ['errorField' => 'email']);

        return $rules;
    }
}
