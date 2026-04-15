<?php
declare(strict_types=1);

namespace App\Test\TestCase\Controller;

use App\Controller\ThresholdsController;
use Cake\TestSuite\IntegrationTestTrait;
use Cake\TestSuite\TestCase;

/**
 * App\Controller\ThresholdsController Test Case
 *
 * @link \App\Controller\ThresholdsController
 */
class ThresholdsControllerTest extends TestCase
{
    use IntegrationTestTrait;

    /**
     * Fixtures
     *
     * @var array<string>
     */
    protected array $fixtures = [
        'app.Thresholds',
        'app.Devices',
    ];

    /**
     * Test index method
     *
     * @return void
     * @link \App\Controller\ThresholdsController::index()
     */
    public function testIndex(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }

    /**
     * Test view method
     *
     * @return void
     * @link \App\Controller\ThresholdsController::view()
     */
    public function testView(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }

    /**
     * Test add method
     *
     * @return void
     * @link \App\Controller\ThresholdsController::add()
     */
    public function testAdd(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }

    /**
     * Test edit method
     *
     * @return void
     * @link \App\Controller\ThresholdsController::edit()
     */
    public function testEdit(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }

    /**
     * Test delete method
     *
     * @return void
     * @link \App\Controller\ThresholdsController::delete()
     */
    public function testDelete(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }
}
