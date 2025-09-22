<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

use App\Core\Router;

require __DIR__ . '/../vendor/autoload.php'; // Változtatás itt
$config = require __DIR__ . '/../config/config.php'; // Változtatás itt
$router = new Router();
require __DIR__ . '/../routes/web.php'; // Változtatás itt

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$router->direct($uri, $method);