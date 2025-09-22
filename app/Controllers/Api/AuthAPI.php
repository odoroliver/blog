<?php

namespace App\Controllers\Api;

use App\Models\User;

class AuthAPI
{
    public function login()
    {
        header('Content-Type: application/json');
        session_start();

        $json = file_get_contents("php://input");
        $data = json_decode($json, true);

        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        $userModel = new User();
        $user = $userModel->findByUsername($username);

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user'] = $user['username'];
            echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Hibás felhasználónév vagy jelszó'
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        }
    }

    public function logout()
    {
        header('Content-Type: application/json');
        session_start();
        session_destroy();
        echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

    public function user()
    {
        header('Content-Type: application/json');
        session_start();

        if (isset($_SESSION['user'])) {
            echo json_encode([
                'logged_in' => true,
                'user' => $_SESSION['user']
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        } else {
            echo json_encode(['logged_in' => false], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        }
    }
}
