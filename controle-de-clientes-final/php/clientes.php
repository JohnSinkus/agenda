<?php
require __DIR__.'/conexao.php'; header('Content-Type: application/json; charset=utf-8');
$stmt=$pdo->query('SELECT id,nome_cliente,data_prevista,os,concluido,observacao,criado_em,atualizado_em FROM clientes ORDER BY concluido ASC, data_prevista IS NULL, data_prevista ASC, nome_cliente ASC');
echo json_encode(['ok'=>true,'clientes'=>$stmt->fetchAll()],JSON_UNESCAPED_UNICODE);
