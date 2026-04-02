<?php
declare(strict_types=1);

namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * ThresholdsFixture
 */
class ThresholdsFixture extends TestFixture
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
                'max_power' => 1,
            ],
        ];
        parent::init();
    }
}
