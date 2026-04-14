<?php
namespace App\Model\Table;
use Cake\ORM\Table;

class UserOtpsTable extends Table{
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('user_otps');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->hasMany('OTP', [
            'email' => 'email',
            'otp'=> 'otp',
        ]);
    }
}