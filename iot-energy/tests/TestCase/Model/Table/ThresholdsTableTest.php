<?php
declare(strict_types=1);

namespace App\Test\TestCase\Model\Table;

use App\Model\Table\ThresholdsTable;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\ThresholdsTable Test Case
 */
class ThresholdsTableTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\ThresholdsTable
     */
    protected $Thresholds;

    /**
     * setUp method
     *
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();
        $config = $this->getTableLocator()->exists('Thresholds') ? [] : ['className' => ThresholdsTable::class];
        $this->Thresholds = $this->getTableLocator()->get('Thresholds', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    protected function tearDown(): void
    {
        unset($this->Thresholds);

        parent::tearDown();
    }

    /**
     * Test validationDefault method
     *
     * @return void
     * @link \App\Model\Table\ThresholdsTable::validationDefault()
     */
    public function testValidationDefault(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }

    /**
     * Test buildRules method
     *
     * @return void
     * @link \App\Model\Table\ThresholdsTable::buildRules()
     */
    public function testBuildRules(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }
}
