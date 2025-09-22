<?php

namespace App\Models;

use App\Core\Database;

class Category
{
    protected $db;

    public function __construct()
    {
        $config = require __DIR__ . '/../../config/config.php';
        $this->db = new Database($config['db']);
    }

    public function all()
    {
        return $this->db->query("SELECT * FROM categories")->fetchAll();
    }

    public function find($id)
    {
        return $this->db->query("SELECT * FROM categories WHERE id = :id", ['id' => $id])->fetch();
    }

    public function create($data)
    {
        $sql = "INSERT INTO categories (name) VALUES (:name)";
        $this->db->query($sql, ['name' => $data['name']]);
    }

    public function update($id, $data)
    {
        $sql = "UPDATE categories SET name = :name WHERE id = :id";
        $this->db->query($sql, [
            'name' => $data['name'],
            'id' => $id
        ]);
    }

    public function delete($id)
    {
        $this->db->query("DELETE FROM categories WHERE id = :id", ['id' => $id]);
    }
}
