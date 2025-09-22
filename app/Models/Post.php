<?php

namespace App\Models;

use App\Core\Database;

class Post
{
    protected $db;

    public function __construct()
    {
        $config = require __DIR__ . '/../../config/config.php';
        $this->db = new Database($config['db']);
    }

    public function all()
    {
        return $this->db->query("SELECT * FROM posts")->fetchAll();
    }

    public function find($id)
    {
        return $this->db->query("SELECT * FROM posts WHERE id = :id", ['id' => $id])->fetch();
    }

    public function create($data)
    {
        $sql = "INSERT INTO posts (title, content, category_id, image) VALUES (:title, :content, :category_id, :image)";
        $this->db->query($sql, [
            'title' => $data['title'],
            'content' => $data['content'],
            'category_id' => $data['category_id'],
            'image' => $data['image']
        ]);
    }


    public function update($id, $data)
    {
        $sql = "UPDATE posts SET title = :title, content = :content, category_id = :category_id";

        if (!empty($data['image'])) {
            $sql .= ", image = :image";
        }

        $sql .= " WHERE id = :id";

        $params = [
            'title' => $data['title'],
            'content' => $data['content'],
            'category_id' => $data['category_id'],
            'id' => $id,
        ];

        if (!empty($data['image'])) {
            $params['image'] = $data['image'];
        }

        $this->db->query($sql, $params);
    }

    public function delete($id)
    {
        $this->db->query("DELETE FROM posts WHERE id = :id", ['id' => $id]);
    }

    public function deleteImg($id)
    {
        $this->db->query("UPDATE posts SET image = '' WHERE id = :id", ['id' => $id]);
    }
}
