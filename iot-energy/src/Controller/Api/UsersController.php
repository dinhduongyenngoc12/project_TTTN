<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;
use App\Provider\AuthSocialProvider;
use App\Service\SocialCallbackService;
use App\Service\TokenService;
use Cake\Event\EventInterface;
use Cake\I18n\FrozenTime;
use Cake\ORM\TableRegistry;

class UsersController extends AppController
{
    public function initialize(): void
    {
        parent::initialize();
        $this->loadComponent('Comon');
    }

    public function beforeFilter(EventInterface $event): void
    {
        parent::beforeFilter($event);

        $this->Authentication->addUnauthenticatedActions([                      //Authentication middleware/component: khong can login van duoc phep goi
            'login',
            'register',
            'checkOTP',
            'socialLogin',
            'socialCallback',
            'resendOTP',
            'refresh',
        ]);
    }

    public function socialLogin(string $provider)
    {
        $providerAction = new AuthSocialProvider();
        $authUrl = $providerAction->execute($provider, $this->request->getSession());

        return $this->redirect($authUrl);
    }

    //SOCIAL_LOGIN            CHƯA DONE
    public function socialCallback(string $provider)
    {
        $code = $this->request->getQuery('code');
        $state = $this->request->getQuery('state');

        if (!$code) {
            $this->Flash->error('Đăng nhập thất bại');

            return $this->redirect(['action' => 'login']);
        }

        try {
            $callbackAction = new SocialCallbackService();
            $userData = $callbackAction->execute($provider, $code, $state, $this->request->getSession());

            $user = $this->fetchTable('Users')->findOrCreateSocialUser($userData);

            $this->request->getSession()->write('Auth.User', $user);
            $this->Flash->success(" {$userData['name']}!");

            return $this->redirect(['controller' => 'Pages', 'action' => 'home']);
        } catch (\Exception $e) {
            $this->Flash->error('ERROR: ' . $e->getMessage());

            return $this->redirect(['action' => 'login']);
        }
    }

    //LOGIN
    public function login(): void
    {
        $otp = $this->Comon->randomOTP();
        $result = $this->Authentication->getResult();

        if ($result?->isValid()) {
            $user = $this->Authentication->getIdentity();

            $this->Comon->sendOTP($otp, $user->email);

            $tableOtp = $this->fetchTable('UserOtps');
            $dataOtp = $tableOtp->newEntity([
                'email' => $user->email,
                'otp' => $otp,
                'created_at' => FrozenTime::now(),
                'expires_at' => FrozenTime::now()->addMinutes(5),      //han otp
            ]);

            $tableOtp->save($dataOtp);

            $this->renderJson([
                'status' => 'success',
                'message' => 'OTP',
                'email' => $user->email,
                'otp' => $otp,
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Email hoặc mật khẩu không hợp lệ !',
        ], 200);
    }

    //CHECK_OTP
    public function checkOTP(): void
    {
        $this->request->allowMethod(['post']);

        $email = $this->request->getData('email');
        $otp = $this->request->getData('otp');

        if (empty($email) || empty($otp)) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Thiếu email hoặc mật khẩu',
            ], 200);

            return;
        }

        $userOtpTable = TableRegistry::getTableLocator()->get('UserOtps');
        $otpRecord = $userOtpTable->find()->where([
            'email' => $email,
            'otp' => $otp,
            'expires_at >' => FrozenTime::now(),
        ])->first();

        if (!$otpRecord) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'OTP không hợp lệ hoặc đã hết hạn',
            ]);

            return;
        }

        $dataUser = $this->fetchTable('Users')->find()->where([
            'email' => $email,
        ])->first();

        if (!$dataUser) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Không tìm thấy User',
            ], 404);

            return;
        }

        $tokenService = new TokenService();
        $token = $tokenService->createToken($dataUser);
        $refresh = $tokenService->createRefreshToken($dataUser);

        $this->renderJson([
            'status' => 'success',
            'message' => 'OTP xác thực thành công',
            'user' => [
                'id' => $dataUser->id,
                'username' => $dataUser->username,
                'email' => $dataUser->email,
                'role' => $dataUser->role,
            ],
            'token' => $token,
            'refresh' => $refresh,
        ]);
    }

    //RESEND_OTP
    public function resendOTP(): void
    {
        $this->request->allowMethod(['post']);

        $email = $this->request->getData('email');

        if (empty($email)) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Thiếu Email',
            ], 400);

            return;
        }

        $user = $this->fetchTable('Users')->find()
            ->where(['email' => $email])
            ->first();

        if (!$user) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Email không tồn tại',
            ], 404);

            return;
        }

        $otp = $this->Comon->randomOTP();
        $this->Comon->sendOTP($otp, $email);

        $tableOtp = $this->fetchTable('UserOtps');
        $dataOtp = $tableOtp->newEntity([
            'email' => $email,
            'otp' => $otp,
            'created_at' => FrozenTime::now(),
            'expires_at' => FrozenTime::now()->addMinutes(5),
        ]);

        $tableOtp->save($dataOtp);

        $this->renderJson([
            'status' => 'success',
            'message' => 'Đã gửi lại mã OTP',
            'email' => $email,
            'otp' => $otp,
        ]);
    }

    //ME
    public function me(): void
    {
        $this->request->allowMethod(['get']);

        $userId = $this->getAuthenticatedUserId();               //user dang trong phien 
        if ($userId === null) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Không xác định được User hiện tại',
            ], 401);

            return;
        }

        $user = $this->fetchTable('Users')->find()
            ->select(['id', 'username', 'email', 'role'])
            ->where(['id' => $userId])
            ->first();

        if (!$user) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Không tìm thấy User',
            ], 404);

            return;
        }

        $this->renderJson([
            'status' => 'success',
            'user' => $user,
        ]);
    }

    //REFRESH
    public function refresh(): void
    {
        $this->request->allowMethod(['post']);

        $refreshToken = (string)$this->request->getData('refresh', '');
        if ($refreshToken === '') {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Thiếu refresh token',
            ], 400);

            return;
        }

        try {
            $tokenService = new TokenService();
            $tokens = $tokenService->refresh($refreshToken);

            $this->renderJson([
                'status' => 'success',
                'token' => $tokens['token'],
                'refresh' => $tokens['refresh'],
            ]);
        } catch (\Throwable $th) {
            $this->renderJson([
                'status' => 'error',
                'message' => $th->getMessage(),
            ], 401);
        }
    }

    //REGISTER
    public function register()
    {
        $this->request->allowMethod(['post']);

        $user = $this->Users->newEmptyEntity();
        $user = $this->Users->patchEntity($user, $this->request->getData());

        if ($user->getErrors()) {
            return $this->error('Validation failed', $user->getErrors(), 422);
        }

        if ($this->Users->find()->where(['username' => $user->username])->first()) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Username đã tồn tại, Vui lòng kiểm tra lại User !',
            ], 409);

            return;
        }

        if ($this->Users->find()->where(['email' => $user->email])->first()) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Email đã tồn tại, Vui lòng kiểm tra lại Email',
            ], 409);

            return;
        }

        if (!$this->Users->save($user)) {
            return $this->error('Không thể tạo User', $user->getErrors(), 422);
        }

        return $this->success([
            'id' => $user->id,
            'email' => $user->email,
        ], 'Đăng ký thành công');
    }

    public function logout(): void
    {
        $this->request->allowMethod(['post']);
        $this->Authentication->logout();

        $this->renderJson([
            'status' => 'success',
            'message' => 'Đăng xuất thành công',
        ]);
    }

    public function delete($id = null): void
    {
        $this->request->allowMethod(['post', 'delete']);

        $user = $this->Users->get($id);
        if ($this->Users->delete($user)) {
            $this->renderJson([
                'status' => 'success',
                'message' => 'Đã xoá User',
            ]);

            return;
        }

        $this->renderJson([
            'status' => 'error',
            'message' => 'Không thể xoá User này !',
        ], 422);
    }
}
