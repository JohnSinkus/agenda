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
$name = trim((string)($input['nome_cliente'] ?? ''));
$date = trim((string)($input['data_prevista'] ?? ''));
$os = trim((string)($input['os'] ?? ''));
$notes = trim((string)($input['observacao'] ?? ''));
$done = !empty($input['concluido']) ? 1 : 0;

if ($name === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'erro' => 'Nome é obrigatório.'], JSON_UNESCAPED_UNICODE);
    exit;
}
if (mb_strlen($name) > 160 || mb_strlen($os) > 80 || mb_strlen($notes) > 500) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'erro' => 'Um dos campos ultrapassa o tamanho permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}
if ($date !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'erro' => 'Data prevista inválida.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$date = $date !== '' ? $date : null;
$os = $os !== '' ? $os : null;
$notes = $notes !== '' ? $notes : null;

try {
    if ($id !== '') {
        $stmt = $pdo->prepare(
            'UPDATE clientes SET nome_cliente=?, data_prevista=?, os=?, concluido=?, observacao=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?'
        );
        $stmt->execute([$name, $date, $os, $done, $notes, $id]);
        if ($stmt->rowCount() === 0) {
            $check = $pdo->prepare('SELECT id FROM clientes WHERE id=?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                http_response_code(404);
                echo json_encode(['ok' => false, 'erro' => 'Cliente não encontrado.'], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }
    } else {
        $id = bin2hex(random_bytes(12));
        $stmt = $pdo->prepare(
            'INSERT INTO clientes (id, nome_cliente, data_prevista, os, concluido, observacao) VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$id, $name, $date, $os, $done, $notes]);
    }

    echo json_encode(['ok' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'erro' => 'Não foi possível salvar o cliente.'], JSON_UNESCAPED_UNICODE);
}
