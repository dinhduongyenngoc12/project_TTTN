<?php
declare(strict_types=1);

namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * EnergyLogsFixture
 */
class EnergyLogsFixture extends TestFixture
{
    /**
     * Init method
     *
     * @return void
     */
    public function init(): void
    {
        $this->records = [
            [
                'id' => 1,
                'device_id' => 1,
                'power' => 1,
                'created_at' => '2026-04-01 08:46:18',
            ],
        ];
        parent::init();
    }
}
