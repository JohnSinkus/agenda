<?php
declare(strict_types=1);
require __DIR__ . '/conexao.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'erro' => 'Método não permitido'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->query(
        'SELECT id, nome_cliente, data_prevista, os, concluido, observacao, criado_em, atualizado_em
         FROM clientes
         ORDER BY concluido ASC, data_prevista IS NULL, data_prevista ASC, nome_cliente ASC'
    );
    echo json_encode(['ok' => true, 'clientes' => $stmt->fetchAll()], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'erro' => 'Não foi possível carregar os clientes.'], JSON_UNESCAPED_UNICODE);
}
