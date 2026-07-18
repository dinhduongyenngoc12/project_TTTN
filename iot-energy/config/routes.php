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
            $builder->connect('/social/google',
                ['controller' => 'Users', 'action' => 'socialLogin', 'provider' => 'google'],
                ['pass' => ['provider'], '_method' => 'GET']           
            );

            $builder->connect('/social/google/callback',
                ['controller' => 'Users', 'action' => 'socialCallback'],
                ['pass' => ['provider'], '_method' => 'GET']
            );

            $builder->connect('/forgot-password', ['controller' => 'Users', 'action' => 'forgotPassword'], ['_method' => 'POST']);

            $builder->connect('/reset-password', ['controller' => 'Users', 'action' => 'resetPassword'], ['_method' => 'POST']);
        });

        $builder->scope('/users', ['prefix' => 'Api'], function (RouteBuilder $builder): void {
            $builder->connect('', ['controller' => 'Users', 'action' => 'index'], ['_method' => 'GET']);
        });

        $builder->scope('/devices', ['prefix' => 'Api'], function (RouteBuilder $builder): void {
            $builder->get('', ['controller' => 'Devices', 'action' => 'index']);
            $builder->post('', ['controller' => 'Devices', 'action' => 'add']);
            $builder->get('/{id}', ['controller' => 'Devices', 'action' => 'view'])->setPass(['id']);
            $builder->put('/{id}', ['controller' => 'Devices', 'action' => 'edit'])->setPass(['id']);
            $builder->patch('/{id}', ['controller' => 'Devices', 'action' => 'edit'])->setPass(['id']);

            // $builder->post('/{id}/activate', ['controller' => 'Devices', 'action' => 'activate'])->setPass(['id']);
            // $builder->post('/{id}/disable', ['controller' => 'Devices', 'action' => 'disable'])->setPass(['id']);
        });

        $builder->scope('/energy-logs', ['prefix' => 'Api'], function (RouteBuilder $builder): void {
            $builder->get('', ['controller' => 'EnergyLogs', 'action' => 'index']);
            $builder->post('', ['controller' => 'EnergyLogs', 'action' => 'add']);
            $builder->get('/{id}', ['controller' => 'EnergyLogs', 'action' => 'view'])->setPass(['id']);

        });

         $builder->scope('/alert-configs', ['prefix' => 'Api'], function (RouteBuilder $builder): void {
            $builder->get('', ['controller' => 'AlertConfigs', 'action' => 'index']);
            $builder->patch('/{id}', ['controller' => 'AlertConfigs', 'action' => 'edit'])->setPass(['id']);
            $builder->put('/{id}', ['controller' => 'AlertConfigs', 'action' => 'edit'])->setPass(['id']);
            $builder->get('/{id}', ['controller' => 'AlertConfigs', 'action' => 'view'])->setPass(['id']);
        });

        $builder->scope('/price-tiers', ['prefix' => 'Api'], function (RouteBuilder $builder): void {
            $builder->get('', ['controller' => 'ElectricityPriceTiers', 'action' => 'index']);
            $builder->post('', ['controller' => 'ElectricityPriceTiers', 'action' => 'add']);
            $builder->patch('/{id}', ['controller' => 'ElectricityPriceTiers', 'action' => 'edit'])->setPass(['id']);
            $builder->delete('/{id}', ['controller' => 'ElectricityPriceTiers', 'action' => 'delete'])->setPass(['id']);
            $builder->get('/{id}', ['controller' => 'ElectricityPriceTiers', 'action' => 'view'])->setPass(['id']);
        });

        $builder->scope('/statistics', ['prefix' => 'Api'], function (RouteBuilder $builder): void {
            $builder->get('/hour-power', ['controller' => 'Statistics', 'action' => 'hourPower']);
            $builder->get('/day-energy', ['controller' => 'Statistics', 'action' => 'dayEnergy']);
            $builder->get('/month-energy', ['controller' => 'Statistics', 'action' => 'monthEnergy']);
            $builder->get('/available-years', ['controller' => 'Statistics', 'action' => 'availableYears']);
        });

        $builder->scope('/iot-devices', ['prefix' => 'Api'], function (RouteBuilder $builder): void {
            $builder->get('', ['controller' => 'IotDevices', 'action' => 'index']);
            $builder->post('', ['controller' => 'IotDevices', 'action' => 'add']);
            $builder->patch('/{id}/disable', ['controller' => 'IotDevices', 'action' => 'disable'])->setPass(['id']);
            $builder->patch('/{id}/enable', ['controller' => 'IotDevices', 'action' => 'enable'])->setPass(['id']);
        });

        $builder->fallbacks();
    });
};
