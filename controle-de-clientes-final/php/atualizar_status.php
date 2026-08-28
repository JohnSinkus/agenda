<?php
declare(strict_types=1);
require __DIR__ . '/conexao.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'erro' => 'Método não permitido'], JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) $input = $_POST;
$id = trim((string)($input['id'] ?? ''));
$done = !empty($input['concluido']) ? 1 : 0;

if ($id === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'erro' => 'ID obrigatório.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare('UPDATE clientes SET concluido=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?');
    $stmt->execute([$done, $id]);
    if ($stmt->rowCount() === 0) {
        $check = $pdo->prepare('SELECT id FROM clientes WHERE id=?');
        $check->execute([$id]);
        if (!$check->fetch()) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'erro' => 'Cliente não encontrado.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'erro' => 'Não foi possível atualizar o status.'], JSON_UNESCAPED_UNICODE);
}
