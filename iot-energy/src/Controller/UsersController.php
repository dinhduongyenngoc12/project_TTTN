<?php
declare(strict_types=1);

namespace App\Controller;

use Cake\Event\EventInterface;

/**
 * Users Controller
 *
 * @property \App\Model\Table\UsersTable $Users
 */
class UsersController extends AppController
{
    /**
     * @param \Cake\Event\EventInterface $event Event instance.
     * @return void
     */
    public function beforeFilter(EventInterface $event): void
    {
        parent::beforeFilter($event);
        $this->Authentication->addUnauthenticatedActions(['login']);
    }

    /**
     * @return void
     */
    public function index(): void
    {
        $users = $this->paginate($this->Users->find());
        $this->renderJson([
            'status' => 'success',
            'users' => $users,
        ]);
    }

    /**
     * @param string|null $id User id.
     * @return void
     */
    public function view($id = null): void
    {
        $user = $this->Users->get($id, contain: ['Devices']);
        $this->renderJson([
            'status' => 'success',
            'user' => $user,
        ]);
    }

    /**
     * @return void
     */
    public function add(): void
    {
        $this->request->allowMethod(['post']);

        $user = $this->Users->newEmptyEntity();
        $user = $this->Users->patchEntity($user, $this->request->getData());

        if ($this->Users->save($user)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'User created successfully.',
                'user' => $user,
            ], 201);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Unable to create user.',
            'errors' => $user->getErrors(),
        ], 422);
    }

    /**
     * @param string|null $id User id.
     * @return void
     */
    public function edit($id = null): void
    {
        $this->request->allowMethod(['patch', 'post', 'put']);

        $user = $this->Users->get($id);
        $user = $this->Users->patchEntity($user, $this->request->getData());

        if ($this->Users->save($user)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'User updated successfully.',
                'user' => $user,
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Unable to update user.',
            'errors' => $user->getErrors(),
        ], 422);
    }

    /**
     * @param string|null $id User id.
     * @return void
     */
    public function delete($id = null): void
    {
        $this->request->allowMethod(['post', 'delete']);

        $user = $this->Users->get($id);
        if ($this->Users->delete($user)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'The user has been deleted.',
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'The user could not be deleted.',
        ], 422);
    }

    /**
     * Session-based login endpoint.
     *
     * @return void
     */
    public function login(): void
    {
        $this->request->allowMethod(['get', 'post']);

        if ($this->request->is('get')) {
            $identity = $this->request->getAttribute('identity');
            $this->renderJson([
                'status' => 'success',
                'authenticated' => $identity !== null,
                'user' => $identity,
            ]);

            return;
        }

        $result = $this->Authentication->getResult();
        if ($result?->isValid()) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Login successful.',
                'user' => $this->Authentication->getIdentity(),
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Invalid username or password.',
            'errors' => $result?->getErrors() ?? [],
        ], 401);
    }

    /**
     * Clear the current authenticated session.
     *
     * @return void
     */
    public function logout(): void
    {
        $this->request->allowMethod(['post']);
        $this->Authentication->logout();

        $this->renderJson([
            'status' => 'success',
            'message' => 'Logout successful.',
        ]);
    }
}
