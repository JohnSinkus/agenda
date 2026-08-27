# Controle de Clientes — Agenda

Aplicação feita somente com HTML, CSS, JavaScript puro, PHP e SQL.

## Testar no Windows agora
1. Extraia a pasta.
2. Abra `index.html` no Chrome.
3. A agenda já inicia com a carga dos registros transcritos da imagem enviada.
4. Use **Backup** para gerar um JSON antes de qualquer alteração importante.

> Não abra `index.php` com duplo clique. PHP precisa de um servidor. No GitHub Pages, use `index.html`.

## GitHub
Envie a pasta inteira `controle-de-clientes` para o repositório. Se usar GitHub Pages, a entrada é `index.html`.

## PHP/MySQL
Os endpoints PHP estão em `php/` e o esquema em `sql/banco.sql`. Eles são para hospedagem com PHP + MySQL/MariaDB. O arquivo `php/conexao.php` usa variáveis de ambiente para não expor senha no GitHub.

## Campos
Nome é obrigatório. Data prevista, OS, observação e Done são opcionais.

## Dados da imagem
A carga inicial reproduz os registros legíveis da imagem fornecida. Alguns nomes estavam parcialmente cortados/ilegíveis; por isso alguns foram mantidos como leitura aproximada. Revise-os contra a planilha original antes de usar como cadastro oficial.
