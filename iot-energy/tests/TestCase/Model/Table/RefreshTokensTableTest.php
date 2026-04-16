<?php
declare(strict_types=1);

namespace App\Test\TestCase\Model\Table;

use App\Model\Table\RefreshTokensTable;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\RefreshTokensTable Test Case
 */
class RefreshTokensTableTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\RefreshTokensTable
     */
    protected $RefreshTokens;

    /**
     * setUp method
     *
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();
        $config = $this->getTableLocator()->exists('RefreshTokens') ? [] : ['className' => RefreshTokensTable::class];
        $this->RefreshTokens = $this->getTableLocator()->get('RefreshTokens', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    protected function tearDown(): void
    {
        unset($this->RefreshTokens);

        parent::tearDown();
    }

    /**
     * Test validationDefault method
     *
     * @return void
     * @link \App\Model\Table\RefreshTokensTable::validationDefault()
     */
    public function testValidationDefault(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }

    /**
     * Test buildRules method
     *
     * @return void
     * @link \App\Model\Table\RefreshTokensTable::buildRules()
     */
    public function testBuildRules(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }
}
