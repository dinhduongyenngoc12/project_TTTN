<?php
declare(strict_types=1);

/**
 * CakePHP(tm) : Rapid Development Framework (https://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 * @link      https://cakephp.org CakePHP(tm) Project
 * @since     0.2.9
 * @license   https://opensource.org/licenses/mit-license.php MIT License
 */
namespace App\Controller;

use Cake\Controller\Controller;
use Cake\Http\Response;

/**
 * Application Controller
 *
 * Add your application-wide methods in the class below, your controllers
 * will inherit them.
 *
 * @link https://book.cakephp.org/5/en/controllers.html#the-app-controller
 */
class AppController extends Controller
{
    /**
     * Initialization hook method.
     *
     * Use this method to add common initialization code like loading components.
     *
     * e.g. `$this->loadComponent('FormProtection');`
     *
     * @return void
     */
    public function initialize(): void
    {
        parent::initialize();

        //$this->loadComponent('RequestHandler');
        $this->loadComponent('Authentication.Authentication');
        $this->viewBuilder()->setClassName('Json');

        /*
         * Enable the following component for recommended CakePHP form protection settings.
         * see https://book.cakephp.org/5/en/controllers/components/form-protection.html
         */
        //$this->loadComponent('FormProtection');
    }

    /**
     * Return a JSON response payload.
     *
     * @param array<string, mixed> $data Response data.
     * @param int $status HTTP status code.
     * @return \Cake\Http\Response
     */
    protected function renderJson(array $data, int $status = 200): Response
    {
        $this->set($data);
        $this->viewBuilder()->setOption('serialize', array_keys($data));

        return $this->response = $this->response
            ->withType('application/json')
            ->withStatus($status);
    }

    protected function success(array $data = [], string $message = 'Success', int $status = 200)
{
    return $this->renderJson([
        'status' => 'success',
        'message' => $message,
        'data' => $data
    ], $status);
}

protected function error(string $message = 'Error', array $errors = [], int $status = 400)
{
    return $this->renderJson([
        'status' => 'error',
        'message' => $message,
        'errors' => $errors
    ], $status);
}
}
