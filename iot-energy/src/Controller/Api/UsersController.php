<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Controller\AppController;
use App\Provider\AuthSocialProvider;
use App\Service\SocialCallbackService;
use App\Service\TokenService;
use App\Service\MailService;

use Cake\Event\EventInterface;
use Cake\I18n\FrozenTime;
use Cake\ORM\TableRegistry;

/**
 * @property \App\Model\Table\UsersTable $Users        //docblock giup tu hieu $this->Users la UsersTable
 */

class UsersController extends AppController
{
    protected MailService $mailService;

    public function initialize(): void
    {
        parent::initialize();
        $this->mailService = new MailService();
    }

    public function beforeFilter(EventInterface $event): void
    {
        parent::beforeFilter($event);

        $this->Authentication->addUnauthenticatedActions([         //Authentication middleware/component: khong can login van duoc phep goi
            'login',
            'register',
            'checkOTP',
            'socialLogin',
            'socialCallback',
            'resendOTP',
            'refresh',
            'forgotPassword',
            'resetPassword'
        ]);
    }

    public function index(): void
    {
        $this->request->allowMethod(['get']);

        if (!$this->requireAdmin()) {
            return;
        }

        $totalUsers = $this->Users->find()
            ->where(['Users.role !=' => 'admin'])
            ->count();

        $this->renderJson([
            'status' => 'success',
            'totalUsers' => $totalUsers,
        ]);
    }

    //SOCIAL_LOGIN 
    public function socialLogin(string $provider)
    {
        $providerAction = new AuthSocialProvider();
        $authUrl = $providerAction->execute($provider, $this->request->getSession());

        return $this->redirect($authUrl);
    }

    //SOCIAL_LOGIN            
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

            //social acccount
            $user = $this->fetchTable('Users')->findOrCreateSocialUser($userData);

            $this->request->getSession()->write('Auth.User', $user);
            $this->Flash->success(" {$userData['name']}!");
            return $this->redirect(['controller' => 'Pages', 'action' => 'home']);

            
        } catch (\Exception $e) {
            $this->Flash->error('ERROR: ' . $e->getMessage());

            return $this->redirect(['action' => 'login']);
        }

        //Exception: Tìm trong namespace hiện tại 
        // \ExceptionTìm ở global namespace (root)
        //use Exception + ExceptionImport vào namespace hiện tại rồi dùng
    }

    //LOGIN
    public function login(): void
    {
        $otp = $this->generateOtp();

        $result = $this->Authentication->getResult();

        if ($result?->isValid()) {
            $user = $this->Authentication->getIdentity();

            $mailSent = $this->mailService->sendOtp($otp, $user->email);

            if (!$mailSent) {
                $this->renderJson([
                    'status' => 'error',
                    'message' => 'Không thể gửi OTP qua email, vui lòng thử lại sau',
                ], 500);
                return;
            }


            $tableOtp = $this->fetchTable('UserOtps');

            $tableOtp->deleteAll([                 //DELETE OTP CŨ TRƯỚC KHI SAVE
                'email' => $user->email,
            ]);

            $dataOtp = $tableOtp->newEntity([
                'email' => $user->email,
                'otp' => $otp,
                'created_at' => FrozenTime::now(),
                'expires_at' => FrozenTime::now()->addMinutes(5),
            ]);

            //save
            if (!$tableOtp->save($dataOtp)) {
                $this->renderJson([
                    'status' => 'error',
                    'message' => 'Không thể lưu mã OTP',
                    'errors' => $dataOtp->getErrors(),
                ], 500);

                return;
            }


            $this->renderJson([
                'status' => 'success',
                'message' => 'Đã gửi mã OTP về email',
                'email' => $user->email,
                // 'otp' => $otp,
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

        $userOtpTable->delete($otpRecord);      //delete otp vua dung truoc khi tao token

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

        $otp = $this->generateOtp();
        $mailSent = $this->mailService->sendOtp($otp, $email);

        if (!$mailSent) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Không thể gửi lại OTP qua email',
            ], 500);

            return;
        }

        $tableOtp = $this->fetchTable('UserOtps');

        $tableOtp->deleteAll([               //delete otp cu truoc khi tao otp moI
            'email' => $email,
        ]);

        $dataOtp = $tableOtp->newEntity([
            'email' => $email,
            'otp' => $otp,
            'created_at' => FrozenTime::now(),
            'expires_at' => FrozenTime::now()->addMinutes(5),
        ]);

        //save
        if (!$tableOtp->save($dataOtp)) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Không thể lưu mã OTP',
                'errors' => $dataOtp->getErrors(),
            ], 500);

            return;
        }

        $this->renderJson([
            'status' => 'success',
            'message' => 'Đã gửi lại mã OTP',
            'email' => $email,
        ]);
    }

    //ME
    public function me(): void
    {
        $this->request->allowMethod(['get']);

        $userId = $this->getAuthenticatedUserId();               //user đang trong phiên
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

        //Kiem tra trung da co trong buildRules() UserTable
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

    //LOGOUT
    public function logout(): void
    {
        $this->request->allowMethod(['post']);
        $this->Authentication->logout();

        $this->renderJson([
            'status' => 'success',
            'message' => 'Đăng xuất thành công',
        ]);
    }

    //FORGOT_PASS 
    public function forgotPassword(): void
    {
        $this->request->allowMethod(['post']);

        $email = trim((string)$this->request->getData('email'));

        if ($email === '') {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Vui lòng nhập email',
            ], 400);
            return;
        }

        $user = $this->Users->find()
            ->where(['email' => $email])
            ->first();

        if (!$user) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Email không tồn tại',
            ], 404);
            return;
        }

        $plainToken = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $plainToken);

        $passwordResetTokensTable = $this->fetchTable('PasswordResetTokens');

        $passwordResetTokensTable->deleteAll([
            'user_id' => $user->id,
            'used_at IS' => null,
        ]);

        $entity = $passwordResetTokensTable->newEntity([
            'user_id' => $user->id,
            'token_hash' => $tokenHash,
            'expires_at' => FrozenTime::now()->addMinutes(5),
            'used_at' => null,
            'created_at' => FrozenTime::now(),
        ]);

        if (!$passwordResetTokensTable->save($entity)) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Không thể tạo liên kết đặt lại mật khẩu',
            ], 500);
            return;
        }

        $frontendUrl = 'http://localhost:5173/reset-password';
        $resetLink = $frontendUrl . '?token=' . urlencode($plainToken);

        $mailSent = $this->mailService->sendResetPasswordLink($resetLink, $email);

        if (!$mailSent) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Không thể gửi email đặt lại mật khẩu',
            ], 500);
            return;
        }

        $this->renderJson([
            'status' => 'success',
            'message' => 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn',
        ]);
    }

    //RESET_PASS 
    public function resetPassword(): void
    {
        $this->request->allowMethod(['post']);

        $token = trim((string)$this->request->getData('token'));
        $password = trim((string)$this->request->getData('password'));

        if ($token === '' || $password === '') {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Thiếu token hoặc mật khẩu mới',
            ], 400);
            return;
        }

        if (!preg_match('/^[0-9]{8}$/', $password)) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Mật khẩu phải gồm đúng 8 chữ số',
            ], 422);
            return;
        }

        $weakPasswords = ['00000000', '11111111', '12345678', '87654321', '88888888'];

        if (in_array($password, $weakPasswords, true) || preg_match('/^(\d)\1+$/', $password)) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Mật khẩu quá đơn giản, vui lòng chọn mật khẩu khác',
            ], 422);
            return;
        }

        $tokenHash = hash('sha256', $token);

        $passwordResetTokensTable = $this->fetchTable('PasswordResetTokens');

        $resetRecord = $passwordResetTokensTable->find()
            ->where([
                'token_hash' => $tokenHash,
                'used_at IS' => null,
                'expires_at >' => FrozenTime::now(),
            ])
            ->first();

        if (!$resetRecord) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
            ], 400);
            return;
        }

        // $user = $this->Users->get($resetRecord->user_id);
        // if (!$user) {
        //     $this->renderJson([
        //         'status' => 'error',
        //         'message' => 'Không tìm thấy user',
        //     ], 404);
        //     return;
        // }

        $user = $this->Users->find()
            ->where(['id' => $resetRecord->user_id])
            ->first();
            //get() nếu không tìm thấy record thì ném exception, không trả về null hoặc false

        $user->password = $password;        //trong User.php da co setter tu Hash Pass

        if (!$this->Users->save($user)) {
            $this->renderJson([
                'status' => 'error',
                'message' => 'Không thể cập nhật mật khẩu',
            ], 422);
            return;
        }

        $resetRecord->used_at = FrozenTime::now();
        $passwordResetTokensTable->save($resetRecord);

        $this->renderJson([
            'status' => 'success',
            'message' => 'Đặt lại mật khẩu thành công',
        ]);
    }

    //Tạo OTP
    private function generateOtp(int $length = 6): string
    {
        return str_pad(
            (string)random_int(0, (10 ** $length) - 1),
            $length,
            '0',
            STR_PAD_LEFT
        );
    }
}
