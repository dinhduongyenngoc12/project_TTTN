<?php
use Cake\Routing\Route\DashedRoute;
use Cake\Routing\RouteBuilder;

return function (RouteBuilder $routes): void {
    // Thiết lập class mặc định cho route
    $routes->setRouteClass(DashedRoute::class);

    $routes->scope('/', function (RouteBuilder $builder): void {
        // 1. Bật phần mở rộng .json cho toàn bộ scope này
        $builder->setExtensions(['json']);

        // 2. Các route mặc định của Pages
        $builder->connect('/', ['controller' => 'Pages', 'action' => 'display', 'home']);
        $builder->connect('/pages/*', 'Pages::display');

        // 3. Các API Custom mà bạn đã tạo
        $builder->connect('/get-energy', ['controller' => 'EnergyLogs', 'action' => 'index']);
        $builder->connect('/list-devices', ['controller' => 'Devices', 'action' => 'index']);
        $builder->connect('/get-user/{id}', ['controller' => 'Users', 'action' => 'view'], ['pass' => ['id']]);
        
        // 4. Route cho Login (Quan trọng)
        $builder->connect('/login', ['controller' => 'Users', 'action' => 'login']);
        $builder->connect('/logout', ['controller' => 'Users', 'action' => 'logout']);

        // 5. Tự động kết nối các controller còn lại (CRUD mặc định)
        $builder->fallbacks();
    });
};
