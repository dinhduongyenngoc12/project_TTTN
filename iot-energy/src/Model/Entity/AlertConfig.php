<?php
declare(strict_types=1);

namespace App\Model\Entity;

use Cake\ORM\Entity;

class AlertConfig extends Entity
{
    protected array $_virtual = [
        'max_power',
    ];

    protected array $_accessible = [
        'device_id' => true,
        'default_threshold' => true,
        'power_threshold' => true,
        'mode' => true,
        'learning_status' => true,
        'learned_at' => true,
        'last_learned_date' => true,	
        'created_at' => true,
        'last_email_sent_at' => true,
        'device' => true,
        'alert_logs' => true,
    ];

    protected function _getMaxPower(): ?float
    {
        $value = $this->power_threshold ?? $this->default_threshold;

        return $value === null ? null : (float)$value;
    }
}
