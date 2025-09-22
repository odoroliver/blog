<?php
/* auth */
$router->get('/api/user', 'Api\AuthAPI@user');
$router->get('/api/logout', 'Api\AuthAPI@logout');
$router->post('/api/login', 'Api\AuthAPI@login');

/* --- posts --- */
$router->get('/api/posts', 'Api\PostControllerAPI@index');
$router->get('/api/posts/show', 'Api\PostControllerAPI@show');
$router->post('/api/posts', 'Api\PostControllerAPI@storeOrUpdate');
$router->put('/api/posts', 'Api\PostControllerAPI@updateImg');
$router->delete('/api/posts', 'Api\PostControllerAPI@delete');

/* categories */
$router->get('/api/categories', 'Api\CategoryControllerAPI@index');
$router->post('/api/categories', 'Api\CategoryControllerAPI@store');
$router->get('/api/categories/show', 'Api\CategoryControllerAPI@show');
$router->post('/api/categories/update', 'Api\CategoryControllerAPI@update');
$router->delete('/api/categories/delete', 'Api\CategoryControllerAPI@delete');

/* --- SPA fallback route --- */
$router->get('{any}', function () {
    readfile(__DIR__ . '/../../public_html/index.html');
});




