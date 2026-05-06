<?php

use Cake\Routing\Route\DashedRoute;
use Cake\Routing\RouteBuilder;

return function (RouteBuilder $routes): void {
    $routes->setRouteClass(DashedRoute::class);

    $routes->scope('/api', function (RouteBuilder $builder): void {
        $builder->setExtensions(['json']);

        $builder->scope('/auth', ['prefix' => 'Api'], function (RouteBuilder $builder): void {
            $builder->connect('/register', ['controller' => 'Users', 'action' => 'register'], ['_method' => 'POST']);
            $builder->connect('/checkOTP', ['controller' => 'Users', 'action' => 'checkOTP'], ['_method' => 'POST']);
            $builder->connect('/resend-otp', ['controller' => 'Users', 'action' => 'resendOTP'], ['_method' => 'POST']);
            $builder->connect('/login', ['controller' => 'Users', 'action' => 'login'], ['_method' => 'POST']);
            $builder->connect('/logout', ['controller' => 'Users', 'action' => 'logout'], ['_method' => 'POST']);
            $builder->connect('/me', ['controller' => 'Users', 'action' => 'me'], ['_method' => 'GET']);
            $builder->connect('/refresh', ['controller' => 'Users', 'action' => 'refresh'], ['_method' => 'POST']);
            $builder->connect(
                '/social/google',
                ['controller' => 'Users', 'action' => 'socialLogin', 'provider' => 'google'],
                ['pass' => ['provider']]           //
            );
        });

        $builder->scope('/devices', ['prefix' => 'Api'], function (RouteBuilder $builder): void {
            $builder->connect('', ['controller' => 'Devices', 'action' => 'index'], ['_method' => 'GET']);
        });

        $builder->scope('/energy-logs', ['prefix' => 'Api'], function (RouteBuilder $builder): void {
            $builder->connect('', ['controller' => 'EnergyLogs', 'action' => 'index'], ['_method' => 'GET']);
            $builder->connect('/{id}', ['controller' => 'EnergyLogs', 'action' => 'view'], ['pass' => ['id'], '_method' => 'GET']);
        });

        $builder->scope('/thresholds', ['prefix' => 'Api'], function (RouteBuilder $builder): void {
            $builder->connect('', ['controller' => 'Thresholds', 'action' => 'index'], ['_method' => 'GET']);
            $builder->connect('/{id}', ['controller' => 'Thresholds', 'action' => 'view'], ['pass' => ['id'], '_method' => 'GET']);
            $builder->connect('/{id}', ['controller' => 'Thresholds', 'action' => 'edit'], ['pass' => ['id'], '_method' => ['PUT', 'PATCH']]);
        });

        $builder->fallbacks();
    });
};
