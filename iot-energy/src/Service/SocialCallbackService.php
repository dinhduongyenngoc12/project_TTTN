<?php

declare(strict_types=1);

namespace App\Service;

use Cake\Core\Configure;
use League\OAuth2\Client\Provider\Google;
use League\OAuth2\Client\Provider\Facebook;
use League\OAuth2\Client\Provider\GoogleUser;

use function Cake\Error\dd;

class SocialCallbackService
{
    public function execute(string $provider, string $code, string $state, $session): array
    {
        $savedState = $session->read('oauth2state');
        $session->delete('oauth2state');

        if (!$state || !$savedState || $state !== $savedState) {
            throw new \RuntimeException('Xác thực thất bại, vui lòng thử lại.');
        }

        $oauthProvider = $this->getProvider($provider);

        $token = $oauthProvider->getAccessToken('authorization_code', [
            'code' => $code,
        ]);

        /** @var GoogleUser $socialUser */
        $socialUser = $oauthProvider->getResourceOwner($token);

        return match ($provider) {
           'google' => [
                'provider'    => 'google',
                'provider_id' => $socialUser->getId(),
                'email'       => $socialUser->getEmail(),
                'name'        => $socialUser->getName(),
                'avatar'      => $socialUser->getAvatar(),
            ],
            // 'facebook' => [
            //     'provider'    => 'facebook',
            //     'provider_id' => $socialUser->getId(),
            //     'email'       => $socialUser->getEmail(),
            //     'name'        => $socialUser->getName(),
            //     'avatar'      => $socialUser->getPictureUrl(),
            // ],
            default => throw new \InvalidArgumentException("Provider không hợp lệ: {$provider}"),
        };
    }

    private function getProvider(string $provider)
    {
        $config = Configure::read("OAuth.{$provider}");

        if (!$config) {
            throw new \RuntimeException("Thiếu config OAuth cho provider: {$provider}");
        }

        return match ($provider) {
            'google' => new Google([
               'clientId'     => env('GOOGLE_CLIENT_ID'),
                'clientSecret' => env('GOOGLE_CLIENT_SECRET'),
                'redirectUri'  => env('GOOGLE_REDIRECT_URI'),
            ]),

            // 'facebook' => new Facebook([
            //     'clientId'        => $config['client_id'],
            //     'clientSecret'    => $config['client_secret'],
            //     'redirectUri'     => $config['redirect_uri'],
            //     'graphApiVersion' => 'v19.0',
            // ]),
            default => throw new \InvalidArgumentException("Provider không hợp lệ: {$provider}"),

        };
       
       
    }
}
