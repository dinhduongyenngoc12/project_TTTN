<?php
declare(strict_types=1);

namespace App\Model\Entity;

use Cake\ORM\Entity;

class IotDevice extends Entity
{
    protected array $_accessible = [
        'iot_key' => true,
        'status' => true,
        'last_seen_at' => true,
        'created_at' => true,
        'updated_at' => true,
        'devices' => true,
    ];
}