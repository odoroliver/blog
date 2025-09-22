<?php

namespace App\Models;

use App\Core\Database;

class User
{
    protected $db;

    public function __construct()
    {
        $config = require __DIR__ . '/../../config/config.php';
        $this->db = new Database($config['db']);
    }

    public function findByUsername($username)
    {
        $stmt = $this->db->query("SELECT * FROM users WHERE username = ?", [$username]);
        return $stmt->fetch();
    }
}
