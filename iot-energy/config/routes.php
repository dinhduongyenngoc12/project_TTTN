<?php

use Cake\Routing\Route\DashedRoute;
use Cake\Routing\RouteBuilder;

return function (RouteBuilder $routes): void {
    $routes->setRouteClass(DashedRoute::class);

    $routes->scope('/api', function (RouteBuilder $builder): void {
        $builder->setExtensions(['json']);

        $builder->scope('/auth', ['prefix' => 'Api'], function (RouteBuilder $builder): void {
            $builder->connect('/register', ['controller' => 'Users', 'action' => 'register']);
            $builder->connect('/checkOTP', ['controller' => 'Users', 'action' => 'checkOTP']);
            $builder->connect('/login', ['controller' => 'Users', 'action' => 'login']);
            $builder->connect('/logout', ['controller' => 'Users', 'action' => 'logout']);
        });

        $builder->scope('/devices', ['prefix' => 'Api'], function (RouteBuilder $builder): void {
            $builder->connect('', ['controller' => 'Devices', 'action' => 'index']);
        });

        $builder->scope('/energy-logs', ['prefix' => 'Api'], function (RouteBuilder $builder): void {
            $builder->connect('', ['controller' => 'EnergyLogs', 'action' => 'index']);
            $builder->connect('/{id}', ['controller' => 'EnergyLogs', 'action' => 'view'], ['pass' => ['id']]);
        });

        $builder->fallbacks();
    });
};
