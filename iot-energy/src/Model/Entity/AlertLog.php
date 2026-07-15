<?php
declare(strict_types=1);

namespace App\Model\Entity;

use Cake\ORM\Entity;

class AlertLog extends Entity
{
    protected array $_accessible = [
        'alert_config_id' => true,
        'energy_log_id' => true,
        'power_value' => true,
        'email_sent' => true,
        'created_at' => true,
        'alert_config' => true,
        'energy_log' => true,
        'threshold_value' => true
    ];
}
