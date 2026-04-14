<?php
declare(strict_types=1);

namespace App\Service;

use Cake\ORM\TableRegistry;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use RuntimeException;
use stdClass;
use Cake\I18n\FrozenTime;

use function Cake\Error\dd;

class TokenService
{
    protected string $secretKey;
    protected string $algorithm = 'HS256';
    protected int $expiresIn = 86400;
    protected int $refreshTokenExpiresIn = 86400; //s

    public function __construct()
    {
        $this->secretKey = (string)env('JWT_SECRET');
    
        // if ($this->secretKey === '') {
        //     throw new RuntimeException('JWT_SECRET is not configured.');
        // }
    }

    public function createToken($user): string
    {
        $userId = $user->id ?? $user['id'] ?? null;

        $payload = [
            'sub' => $userId,    //claim chuan JWT
            'id' => $userId,
            'username' => $user['username'] ?? null,
            'email' => $user['email'] ?? null,
            'role' => $user['role'] ?? null,
            'iat' => time(),
            'exp' => time() + $this->expiresIn,
        ];

        return JWT::encode($payload, $this->secretKey, $this->algorithm);
    }

    public function decodeToken(string $jwt): stdClass
    {
        return JWT::decode($jwt, new Key($this->secretKey, $this->algorithm));
    }

    public function createRefreshToken( $user): string
    {
        $refreshToken = bin2hex(random_bytes(64));
        $userId = $user->id ?? $user['id'] ?? null;   //privateKey user = id

        if ($userId === null) {
            throw new RuntimeException('Khong tim thay user id de tao refresh token');
        }

        $refreshTokenTable = TableRegistry::getTableLocator()->get('RefreshTokens');

        $entity = $refreshTokenTable->newEntity([
            'user_id' => $userId,
            'token' => $refreshToken,
            'expires_at' => FrozenTime::now()->addSeconds(30),
            'is_revoked' => false,
        ]);
        
        if (!$refreshTokenTable->save($entity)) {
            throw new RuntimeException(
                'Khong the tao refresh token: ' . json_encode($entity->getErrors(), JSON_UNESCAPED_UNICODE)
            );
        }

        return $refreshToken;
    }

    public function refresh(string $oldRefresh): array{
        $refreshTokenTable = TableRegistry::getTableLocator()->get('RefreshTokens');
        $userTable = TableRegistry::getTableLocator()->get('Users');
        $storeToken = $refreshTokenTable->find()->where([
            'token' => $oldRefresh,
            'is_revoked' => false,
            'expires_at >' => FrozenTime::now()
        ])
        ->first();

        if(!$storeToken) {
            throw new RuntimeException('Fresh token Khong hop le');
        }

        $user = $userTable->get($storeToken->user_id);
        $storeToken->is_revoked = true;
        $storeToken->last_used_at = FrozenTime::now();

        if (!$refreshTokenTable->save($storeToken)) {
            throw new RuntimeException('Khong the thu hoi fresh token cu');
        }

        return [
            'token' => $this->createToken($user),
            'refresh' => $this->createRefreshToken($user),
        ];
    }


} 
