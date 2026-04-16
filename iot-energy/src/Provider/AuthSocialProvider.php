<?php
declare(strict_types=1);

namespace App\Provider;
use Cake\Core\Configure;
use League\OAuth2\Client\Provider\Google;
use League\OAuth2\Client\Provider\Facebook;

use function Cake\Error\dd;

class AuthSocialProvider {


    public function execute(string $provider, $session): string
    {
        $oauthProvider = $this->getProvider($provider);

        $authUrl = $oauthProvider->getAuthorizationUrl([
            'scope' => match ($provider) {
                'google'   => ['openid', 'email', 'profile'],
                'facebook' => ['email', 'public_profile'],
                default    => throw new \InvalidArgumentException("Provider không hợp lệ: {$provider}"),
            },
        ]);

        // Lưu state chống CSRF
        $session->write('oauth2state', $oauthProvider->getState());

        return $authUrl;
        dd($authUrl);
    }

        private function getProvider(string $provider)
    {
        $config = Configure::read("OAuth.{$provider}");

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
            default => throw new \InvalidArgumentException("Provider khong hop le: {$provider}"),
        };
    }
}
