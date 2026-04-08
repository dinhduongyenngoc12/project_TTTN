<?php
declare(strict_types=1);

namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * RefreshTokensFixture
 */
class RefreshTokensFixture extends TestFixture
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
                'user_id' => 1,
                'token' => 'Lorem ipsum dolor sit amet',
                'expires_at' => '2026-04-06 10:19:02',
                'is_revoked' => 1,
                'created_at' => '2026-04-06 10:19:02',
                'last_used_at' => '2026-04-06 10:19:02',
            ],
        ];
        parent::init();
    }
}
