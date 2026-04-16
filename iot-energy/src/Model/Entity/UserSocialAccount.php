<?php

declare(strict_types=1);

namespace App\Model\Entity;

use Cake\ORM\Entity;

class UserSocialAccount extends Entity
{
    protected array $_accessible = [
        'user_id' => true,
        'provider' => true,
        'provider_user_id' => true,
        'provider_email' => true,
        'avatar_url' => true,
        'created_at' => true,
        'updated_at' => true,

        // association
        'user' => true,
    ];
}