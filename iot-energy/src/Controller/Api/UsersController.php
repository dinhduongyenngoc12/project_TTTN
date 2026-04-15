<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;
use App\Model\Table\UserOtpsTable;
use Cake\Event\EventInterface;
use Firebase\JWT\JWT;
use App\Service\TokenService;
use Cake\I18n\FrozenTime;
use Cake\ORM\TableRegistry;

use function Cake\Error\dd;

class UsersController extends AppController
{
    public function initialize(): void
    {
        parent::initialize();   
        $this ->loadComponent("Comon");
    }

    
    /**
     * @param \Cake\Event\EventInterface $event Event instance.
     * @return void
     */
    public function beforeFilter(EventInterface $event): void
    {
        parent::beforeFilter($event);
        $this->Authentication->addUnauthenticatedActions(['login','register','checkOTP']);
        //truy cap ma khong can dang nhap - UnAuthen
    }

public function login(): void
{
    $this->request->allowMethod(['post']);

    $result = $this->Authentication->getResult();

    $otp = $this->Comon->randomOTP();
   
    if ($result?->isValid()) {
        $user = $this->Authentication->getIdentity();
     
        // $tokenService = new TokenService();
        // $token = $tokenService->createToken($user);
        // $refresh = $tokenService->createRefreshToken($user);     =>>Token se duoc tao khi checkOtp true

        $this->Comon->sendOTP($otp, $user->email);
        $tableOtp = $this->fetchTable('UserOtps');
        $dataOtp= $tableOtp->newEntity([
            'email' => $user->email,
            'otp'=> $otp,
            'created_at'=> FrozenTime::now(),
            'expires_at'=> FrozenTime::now()->addDays(3),
        ]);

        $tableOtp->save($dataOtp);

        $this->renderJson([
            // 'status' => 'success',
            // 'message' => 'Login successful.',
            // 'token' => $token,
            // 'refresh'=> $refresh
            
                'status' => 'success',
                'message' => 'OTP created',
                'email' => $user->email,
                'otp' => $otp   //sau nay se khong cho OTP xuat o day
        ]);
        return;
    }

    $this->renderJson([
        'status' => 'error',
        'message' => 'Invalid email or password',
    ], 401);
    }

    public function checkOTP(){
        $this->request->allowMethod(['post']);

        $email = $this->request->getData('email');
        $otp = $this->request->getData('otp');

        if(empty($email) || empty($otp)) {
             return $this->renderJson([
                'status' => 'error',
                'message' => 'Thieu email hoac otp',
        ], 400);
        //tra token 
        }
        $userOtpTable = TableRegistry::getTableLocator()->get('UserOtps');
        $userTable = TableRegistry::getTableLocator()->get('Users');


        $otpRecord = $userOtpTable->find()->where([
            'email' => $email,
            'otp' => $otp,
            'created_at <' => FrozenTime::now()
        ])
        ->first();

        if (empty($otpRecord)) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'OTP khong hop le hoac het han'
            ]);
            return;
        }

        $dataUser = $this->fetchTable('Users')->find()->where([
            'email' => $email
        ])->first();
       

        $tokenService = new TokenService();
        $token = $tokenService->createToken($dataUser);
        $refresh = $tokenService->createRefreshToken($dataUser);

        $this->renderJson([
            'status' => 'success',
            'message' => 'OTP xac thuc thanh cong',
            'token' => $token,
            'refresh' => $refresh
        ]);
        return;

    }
    

    public function register()
    {
        $this->request->allowMethod(['post']);

        $user = $this->Users->newEmptyEntity();
        $user = $this->Users->patchEntity($user, $this->request->getData());    

        if ($user->getErrors()) {
            return $this->error('Validation failed', $user->getErrors(), 422);
        }

        if($this->Users->find()->where(['username'=> $user->username])->first()){
            $this->renderJson([
            'status' => 'error',
            'message' => 'User da ton tai, vui long kiem tra lai User !!!'],409);
            return;
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
            'message' => 'Logout successful',
        ]);
    }

    public function delete($id = null): void
    {
        $this->request->allowMethod(['post', 'delete']);

        $user = $this->Users->get($id);
        if ($this->Users->delete($user)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'The user has been deleted',
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'The user could not be deleted.',
        ], 422);
    }
}
