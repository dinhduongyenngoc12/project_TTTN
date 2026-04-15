<?php
declare(strict_types=1);

namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Threshold Entity
 *
 * @property int $id
 * @property int|null $device_id
 * @property float|null $max_power
 *
 * @property \App\Model\Entity\Device $device
 */
class Threshold extends Entity
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
        'max_power' => true,
        'device' => true,
    ];
}
