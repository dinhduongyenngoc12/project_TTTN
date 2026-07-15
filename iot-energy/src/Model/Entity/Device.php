<?php
declare(strict_types=1);

namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Device Entity
 *
 * @property int $id
 * @property int|null $user_id
 * @property int|null $iot_device_id
 * @property string|null $name
 * @property string|null $device_type
 * @property float|null $rated_power
 * @property string $status
 * @property \Cake\I18n\DateTime|null $activated_at
 * @property \Cake\I18n\DateTime|null $created_at
 * @property \Cake\I18n\DateTime|null $updated_at
 *
 * @property \App\Model\Entity\User $user
 * @property \App\Model\Entity\IotDevice $iot_device
 * @property \App\Model\Entity\EnergyLog[] $energy_logs
 * @property \App\Model\Entity\AlertConfig $alert_config
 * @property \App\Model\Entity\HourSummary[] $hour_summaries
 * @property \App\Model\Entity\DailySummary[] $daily_summaries
 * @property \App\Model\Entity\MonthSummary[] $month_summaries
 */
class Device extends Entity
{
    protected array $_accessible = [
        'user_id' => true,
        'iot_device_id' => true,
        'name' => true,
        'device_type' => true,
        'rated_power' => true,
        'status' => true,
        'activated_at' => true,
        'created_at' => true,
        'updated_at' => true,

        'user' => true,
        'iot_device' => true,
        'energy_logs' => true,
        'alert_config' => true,
        'hour_summaries' => true,
        'daily_summaries' => true,
        'month_summaries' => true,
    ];
}