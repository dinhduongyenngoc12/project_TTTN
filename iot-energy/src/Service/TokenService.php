<?php
declare(strict_types=1);

namespace App\Service;

use App\Model\Entity\User;
use Cake\I18n\FrozenTime;
use Cake\ORM\TableRegistry;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use RuntimeException;
use stdClass;

class TokenService
{
    protected string $secretKey;
    protected string $algorithm = 'HS256';

     //Access token: token gọi API hàng ngày


    protected int $expiresIn = 10800;

    //Refresh token: chỉ dùng để xin access token mới khi access token cũ hết hạn 

    protected int $refreshTokenExpiresIn = 259200;      //s - khong can login lai trong 3 ngay 

    public function __construct()
    {
        $this->secretKey = (string)env('JWT_SECRET');

        if ($this->secretKey === '') {
            throw new RuntimeException('JWT_SECRET is not configured.');
        }
    }

    public function createToken(User $user): string
    {
        if ($user->id === null) {
            throw new RuntimeException('Khong tim thay user id de tao access token');
        }

        $payload = [
            'sub' => $user->id,                   //claim chuan JWT 
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
            'iat' => time(),
            'exp' => time() + $this->expiresIn 
        ];

        return JWT::encode($payload, $this->secretKey, $this->algorithm);
    }

    public function decodeToken(string $jwt): stdClass
    {
        return JWT::decode($jwt, new Key($this->secretKey, $this->algorithm));
    }

    public function createRefreshToken(User $user): string
    {
        if ($user->id === null) {
            throw new RuntimeException('Khong tim thay user id de tao refresh token');
        }

        $refreshToken = bin2hex(random_bytes(64));
        $refreshTokenTable = TableRegistry::getTableLocator()->get('RefreshTokens');

        $entity = $refreshTokenTable->newEntity([
            'user_id' => $user->id,
            'token' => $refreshToken,
            'expires_at' => FrozenTime::now()->addSeconds($this->refreshTokenExpiresIn),
            'is_revoked' => false,
        ]);

        if (!$refreshTokenTable->save($entity)) {
            throw new RuntimeException(
                'Khong the tao refresh token: ' . json_encode($entity->getErrors(), JSON_UNESCAPED_UNICODE)
            );
        }

        return $refreshToken;
    }

    public function refresh(string $oldRefresh): array
    {
        $refreshTokenTable = TableRegistry::getTableLocator()->get('RefreshTokens');
        $userTable = TableRegistry::getTableLocator()->get('Users');

        $storeToken = $refreshTokenTable->find()
            ->where([
                'token' => $oldRefresh,
                'is_revoked' => false,
                'expires_at >' => FrozenTime::now(),
            ])
            ->first();

        if (!$storeToken) {
            throw new RuntimeException('Refresh token khong hop le');
        }

        
        $user = $userTable->find()
            ->where(['id' => $storeToken->user_id])
            ->first();

        if (!$user) {
            throw new RuntimeException('Khong tim thay user');
        }

        $storeToken->is_revoked = true;
        $storeToken->last_used_at = FrozenTime::now();

        if (!$refreshTokenTable->save($storeToken)) {
            throw new RuntimeException('Khong the thu hoi refresh token cu');
        }

        return [
            'token' => $this->createToken($user),
            'refresh' => $this->createRefreshToken($user),
        ];
    }
}