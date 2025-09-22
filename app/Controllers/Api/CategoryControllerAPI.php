<?php

namespace App\Controllers\API;

use App\Models\Category;

class CategoryControllerAPI
{
    protected $categoryModel;

    public function __construct()
    {
        $this->categoryModel = new Category();
    }

    public function index()
    {
        header('Content-Type: application/json');
        echo json_encode($this->categoryModel->all());
    }

    public function show()
    {
        header('Content-Type: application/json');

        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Hiányzik az ID'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            return;
        }

        $category = $this->categoryModel->find($id);

        if ($category) {
            echo json_encode($category);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Kategória nem található']);
        }
    }

    public function store()
    {
        header('Content-Type: application/json');
        $name = trim($_POST['name'] ?? '');

        if ($name === '') {
            http_response_code(400);
            echo json_encode(['error' => 'A kategória név megadása kötelező']);
            return;
        }

        $this->categoryModel->create(['name' => $name]);
        http_response_code(201);
        echo json_encode(['message' => 'Kategória létrehozva']);
    }

    public function update()
    {
        header('Content-Type: application/json');

        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Hiányzik az ID'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            return;
        }

        $category = $this->categoryModel->find($id);
        if (!$category) {
            http_response_code(404);
            echo json_encode(['error' => 'Kategória nem található']);
            return;
        }

        $name = trim($_POST['name'] ?? '');

        if ($name === '') {
            http_response_code(400);
            echo json_encode(['error' => 'A kategória név megadása kötelező']);
            return;
        }

        $this->categoryModel->update($id, ['name' => $name]);
        echo json_encode(['message' => 'Kategória frissítve']);
    }

    public function delete()
    {
        header('Content-Type: application/json');

        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Hiányzik az ID'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            return;
        }

        $category = $this->categoryModel->find($id);
        if (!$category) {
            http_response_code(404);
            echo json_encode(['error' => 'Kategória nem található']);
            return;
        }

        $this->categoryModel->delete($id);
        echo json_encode(['message' => 'Kategória törölve']);
    }
}
