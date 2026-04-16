<?php
declare(strict_types=1);

namespace App\Test\TestCase\Model\Table;

use App\Model\Table\EnergyLogsTable;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\EnergyLogsTable Test Case
 */
class EnergyLogsTableTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\EnergyLogsTable
     */
    protected $EnergyLogs;

    /**
     * setUp method
     *
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();
        $config = $this->getTableLocator()->exists('EnergyLogs') ? [] : ['className' => EnergyLogsTable::class];
        $this->EnergyLogs = $this->getTableLocator()->get('EnergyLogs', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    protected function tearDown(): void
    {
        unset($this->EnergyLogs);

        parent::tearDown();
    }

    /**
     * Test validationDefault method
     *
     * @return void
     * @link \App\Model\Table\EnergyLogsTable::validationDefault()
     */
    public function testValidationDefault(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }

    /**
     * Test buildRules method
     *
     * @return void
     * @link \App\Model\Table\EnergyLogsTable::buildRules()
     */
    public function testBuildRules(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }
}
