<?php

namespace App\Controllers\Api;

use App\Models\Post;

class PostControllerAPI
{
    public function uploadError()
    {
        if (($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_OK && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
            $errorMessages = [
                UPLOAD_ERR_INI_SIZE => 'A fájl mérete nagyobb, mint amit a szerver engedélyez.',
                UPLOAD_ERR_FORM_SIZE => 'A fájl túl nagy az űrlapban megadott korláthoz képest.',
                UPLOAD_ERR_PARTIAL => 'A fájl csak részben töltődött fel.',
                UPLOAD_ERR_NO_TMP_DIR => 'Hiányzik az ideiglenes könyvtár a szerveren.',
                UPLOAD_ERR_CANT_WRITE => 'Nem sikerült a fájlt lemezre menteni.',
                UPLOAD_ERR_EXTENSION => 'Egy PHP kiterjesztés megszakította a feltöltést.',
            ];

            $code = $_FILES['image']['error'];
            $errorMessage = $errorMessages[$code] ?? 'Ismeretlen hiba a fájlfeltöltés során.';

            http_response_code(400);
            echo json_encode(['error' => $errorMessage], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            exit;
        }
    }

    public function storeOrUpdate()
    {
        if (isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
            $this->update();
        } else {
            $this->store();
        }
    }

    public function index()
    {
        header('Content-type: application/json');
        $posts = (new Post)->all();
        echo json_encode($posts, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

    public function show()
    {
        header('Content-type: application/json');
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Hiányzik az ID'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            return;
        }

        $post = (new Post)->find($id);
        if (!$post) {
            http_response_code(404);
            echo json_encode(['error' => 'A bejegyzés nem található'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            return;
        }

        echo json_encode($post, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

    public function store()
    {
        header('Content-type: application/json');

        $this->uploadError();

        if (!isset($_POST['title'], $_POST['content'], $_POST['category_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Hiányzó mezők'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            return;
        }

        $data = [
            'title' => $_POST['title'],
            'content' => $_POST['content'],
            'category_id' => $_POST['category_id'],
            'image' => null
        ];

        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../../../public/uploads/';
            $filename = uniqid() . '-' . basename($_FILES['image']['name']);
            $targetPath = $uploadDir . $filename;

            if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                http_response_code(500);
                echo json_encode(['error' => 'Nem sikerült feltölteni a képet'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                return;
            }

            $data['image'] = '/uploads/' . $filename;
        }

        $post = new Post();
        $post->create($data);

        http_response_code(201);
        echo json_encode(['message' => 'Sikeres mentés']);
    }

    public function update()
    {
        header('Content-type: application/json');

        $this->uploadError();

        $id = $_POST['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Hiányzik az ID'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            return;
        }

        if (!isset($_POST['title'], $_POST['content'], $_POST['category_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Hiányzó mezők'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            return;
        }

        $data = [
            'title' => $_POST['title'],
            'content' => $_POST['content'],
            'category_id' => $_POST['category_id'],
            'image' => null
        ];

        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../../../public/uploads/';
            $filename = uniqid() . '-' . basename($_FILES['image']['name']);
            $targetPath = $uploadDir . $filename;

            if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                http_response_code(500);
                echo json_encode(['error' => 'Nem sikerült feltölteni a képet'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                return;
            }

            $data['image'] = '/uploads/' . $filename;
        }

        $post = new Post();
        $existingPost = $post->find($id);

        if (!$existingPost) {
            http_response_code(404);
            echo json_encode(['error' => 'A bejegyzés nem található'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            return;
        }

        $post->update($id, $data);

        echo json_encode(['message' => 'Sikeres frissítés'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

    public function updateImg()
    {
        header('Content-type: application/json');

        $id = $_GET['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Hiányzik az ID'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            return;
        }

        $post = new Post();
        $existingPost = $post->find($id);

        if (!$existingPost) {
            http_response_code(404);
            echo json_encode(['error' => 'A bejegyzés nem található'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            return;
        }

        if (!empty($existingPost['image'])) {
            $imagePath = __DIR__ . '/../../../public/' . $existingPost['image'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }

        $post->deleteImg($id);

        echo json_encode(['message' => 'Kép sikeresen törölve.'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

    public function delete()
    {
        header('Content-type: application/json');
        $id = $_GET['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Hiányzó ID'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            return;
        }

        $post = new Post();
        $existingPost = $post->find($id);

        if (!$existingPost) {
            http_response_code(404);
            echo json_encode(['error' => 'A bejegyzés nem található'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            return;
        }

        if (!empty($existingPost['image'])) {
            $imagePath = __DIR__ . '/../../../public/' . $existingPost['image'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }

        $post->delete($id);

        echo json_encode(['message' => 'Sikeres törlés'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
}
