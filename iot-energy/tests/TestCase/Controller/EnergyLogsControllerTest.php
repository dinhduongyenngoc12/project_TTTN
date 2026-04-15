<?php
declare(strict_types=1);

namespace App\Test\TestCase\Controller;

use App\Controller\EnergyLogsController;
use Cake\TestSuite\IntegrationTestTrait;
use Cake\TestSuite\TestCase;

/**
 * App\Controller\EnergyLogsController Test Case
 *
 * @link \App\Controller\EnergyLogsController
 */
class EnergyLogsControllerTest extends TestCase
{
    use IntegrationTestTrait;

    /**
     * Fixtures
     *
     * @var array<string>
     */
    protected array $fixtures = [
        'app.EnergyLogs',
        'app.Devices',
    ];

    /**
     * Test index method
     *
     * @return void
     * @link \App\Controller\EnergyLogsController::index()
     */
    public function testIndex(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }

    /**
     * Test view method
     *
     * @return void
     * @link \App\Controller\EnergyLogsController::view()
     */
    public function testView(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }

    /**
     * Test add method
     *
     * @return void
     * @link \App\Controller\EnergyLogsController::add()
     */
    public function testAdd(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }

    /**
     * Test edit method
     *
     * @return void
     * @link \App\Controller\EnergyLogsController::edit()
     */
    public function testEdit(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }

    /**
     * Test delete method
     *
     * @return void
     * @link \App\Controller\EnergyLogsController::delete()
     */
    public function testDelete(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }
}
