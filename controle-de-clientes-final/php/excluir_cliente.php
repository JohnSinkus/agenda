<?php
require __DIR__.'/conexao.php'; header('Content-Type: application/json; charset=utf-8');$in=json_decode(file_get_contents('php://input'),true) ?: $_POST;$id=trim($in['id']??'');if(!$id){http_response_code(422);echo json_encode(['ok'=>false]);exit;}$s=$pdo->prepare('DELETE FROM clientes WHERE id=?');$s->execute([$id]);echo json_encode(['ok'=>true]);
