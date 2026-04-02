<?php
declare(strict_types=1);

namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * EnergyLog Entity
 *
 * @property int $id
 * @property int|null $device_id
 * @property float|null $power
 * @property \Cake\I18n\DateTime|null $created_at
 *
 * @property \App\Model\Entity\Device $device
 */
class EnergyLog extends Entity
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
        'device_id' => true,
        'power' => true,
        'created_at' => true,
        'device' => true,
    ];
}
