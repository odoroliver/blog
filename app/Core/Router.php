<?php

namespace App\Core;

class Router
{
    protected $routes = [];

    public function get($uri, $controller)
    {
        $this->routes['GET'][$uri] = $controller;
    }

    public function post($uri, $controller)
    {
        $this->routes['POST'][$uri] = $controller;
    }

    public function put($uri, $controller)
    {
        $this->routes['PUT'][$uri] = $controller;
    }

    public function delete($uri, $controller)
    {
        $this->routes['DELETE'][$uri] = $controller;
    }

    public function direct($uri, $method)
    {
        if (isset($this->routes[$method][$uri])) {
            [$class, $method] = explode('@', $this->routes[$method][$uri]);
            $class = "App\\Controllers\\$class";
            return (new $class)->$method();
        }
        
       // Ha API útvonal → 404 JSON
        if (strpos($uri, '/api') === 0) {
            http_response_code(404);
            echo json_encode(["error" => "API endpoint not found"]);
            return;
        }

        // SPA fallback → index.html
        http_response_code(200);
        readfile(__DIR__ . '/../../public_html/index.html');
    }
}
