<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;
use Cake\Event\EventInterface;
use Firebase\JWT\JWT;
use App\Service\TokenService;


use function Cake\Error\dd;

class UsersController extends AppController
{
    /**
     * @param \Cake\Event\EventInterface $event Event instance.
     * @return void
     */
    public function beforeFilter(EventInterface $event): void
    {
        parent::beforeFilter($event);
        $this->Authentication->addUnauthenticatedActions(['login','register']);
        //truy cap ma khong can dang nhap - UnAuthen
    }

public function login(): void
{
    $this->request->allowMethod(['post']);

    $result = $this->Authentication->getResult();

    if ($result?->isValid()) {
        $user = $this->Authentication->getIdentity();
    
        $tokenService = new TokenService();

        $token = $tokenService->createToken($user);
        $refresh = $tokenService->createRefreshToken($user);
        
        $this->renderJson([
            'status' => 'success',
            'message' => 'Login successful.',
            'token' => $token,
            'refresh'=> $refresh
        ]);
        return;
    }

    $this->renderJson([
        'status' => 'error',
        'message' => 'Invalid email or password',
    ], 401);
}

    public function register()
    {
        $this->request->allowMethod(['post']);

        $user = $this->Users->newEmptyEntity();
        $user = $this->Users->patchEntity($user, $this->request->getData());    

        if ($user->getErrors()) {
            return $this->error('Validation failed', $user->getErrors(), 422);
        }

        if(!$this->Users->save($user)) {
            return $this->error('Khong the tao User', [], 500);
        }
        return $this->success([
            'id'=>$user->id,
            'email' => $user->email
        ], 'Dang ky thanh cong');
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


}
