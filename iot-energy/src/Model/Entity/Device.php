<?php
declare(strict_types=1);

namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Device Entity
 *
 * @property int $id
 * @property string|null $name
 * @property int|null $user_id
 *
 * @property \App\Model\Entity\User $user
 * @property \App\Model\Entity\EnergyLog[] $energy_logs
 * @property \App\Model\Entity\Threshold[] $thresholds
 */
class Device extends Entity
{
    /**
     * Fields that can be mass assigned using newEntity() or patchEntity().
     *
     * Note that when '*' is set to true, this allows all unspecified fields to
     * be mass assigned. For security purposes, it is advised to set '*' to false
     * (or remove it), and explicitly make individual fields accessible as needed.
     *
     * @var array<string, bool>
     */
    protected array $_accessible = [
        'name' => true,
        'user_id' => true,
        'user' => true,
        'energy_logs' => true,
        'thresholds' => true,
    ];
}
