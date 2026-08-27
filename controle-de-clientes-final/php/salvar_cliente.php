<?php
require __DIR__.'/conexao.php'; header('Content-Type: application/json; charset=utf-8');
$in=json_decode(file_get_contents('php://input'),true) ?: $_POST;$id=trim($in['id']??'');$nome=trim($in['nome_cliente']??'');
if($nome===''){http_response_code(422);echo json_encode(['ok'=>false,'erro'=>'Nome é obrigatório']);exit;}
$data=($in['data_prevista']??'')?:null;$os=trim($in['os']??'')?:null;$obs=trim($in['observacao']??'')?:null;$done=!empty($in['concluido'])?1:0;
if($id){$s=$pdo->prepare('UPDATE clientes SET nome_cliente=?,data_prevista=?,os=?,concluido=?,observacao=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=?');$s->execute([$nome,$data,$os,$done,$obs,$id]);}
else{$id=bin2hex(random_bytes(12));$s=$pdo->prepare('INSERT INTO clientes(id,nome_cliente,data_prevista,os,concluido,observacao) VALUES(?,?,?,?,?,?)');$s->execute([$id,$nome,$data,$os,$done,$obs]);}
echo json_encode(['ok'=>true,'id'=>$id]);
