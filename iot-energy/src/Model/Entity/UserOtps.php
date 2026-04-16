<?php
namespace App\Model\Entity;
use Cake\ORM\Entity;

class UserOtps extends Entity {
    protected array $_accessible = [
        "id"=> true,
        'email' => true,
        'otp' => true,
        'created_at' => true,
        'expires_at' => true,
    ];
}
