<?php
// Hospedagem PHP: a interface principal continua sendo o index.html.
// Se o servidor estiver configurado para PHP, este arquivo redireciona para a versão estática.
header('Location: index.html');
exit;
?>
