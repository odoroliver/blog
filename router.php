<?php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . '/public_html' . $uri;

if ($uri !== '/' && file_exists($file)) {
    return false;
}

if (str_starts_with($uri, '/api')) {
    require __DIR__ . '/public_html/index.php';
    exit;
}

require __DIR__ . '/public_html/index.html';
