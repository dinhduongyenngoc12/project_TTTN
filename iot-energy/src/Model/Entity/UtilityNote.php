<?php
declare(strict_types=1);

namespace App\Model\Entity;

use Cake\ORM\Entity;

class UtilityNote extends Entity
{
    protected array $_accessible = [
        'user_id' => true,
        'note' => true,
        'created_at' => true,
        'updated_at' => true,
    ];
}