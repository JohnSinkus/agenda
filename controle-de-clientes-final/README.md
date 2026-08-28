# Controle de Clientes — Agenda

Agenda operacional feita somente com **HTML, CSS, JavaScript puro, PHP e SQL**.

## Estrutura

- `index.html` — entrada para GitHub Pages e uso local
- `index.php` — entrada para servidores com PHP
- `style.css` — interface responsiva
- `app.js` — agenda, filtros, cadastro, edição, exclusão, status, backup e exportação
- `dados-iniciais.js` — carga inicial baseada na planilha/imagem fornecida
- `php/` — endpoints para MySQL/MariaDB
- `sql/banco.sql` — estrutura do banco
- `sql/dados_exemplo.sql` — carga inicial SQL

## Uso local

Abra `index.html` no navegador.

O modo local usa `localStorage`, portanto funciona sem servidor e sem instalação adicional.

## GitHub Pages

Publique a pasta e use `index.html` como entrada. GitHub Pages é hospedagem estática; os endpoints PHP não são executados nele. Nesse cenário o sistema funciona em modo local no navegador.

## PHP + MySQL/MariaDB

Em uma hospedagem com PHP, o frontend detecta automaticamente se `php/clientes.php` está disponível. Quando o banco responder corretamente, o indicador superior muda de `LOCAL` para `BANCO` e os cadastros passam a ser lidos/salvos no banco.

Configure as variáveis de ambiente:

- `DB_HOST`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`

Nunca publique credenciais reais no repositório.

## Campos

| Campo | Obrigatório |
|---|---|
| Nome do cliente | Sim |
| Data prevista | Não |
| OS | Não |
| Concluído | Não |
| Observação | Não |

Data e OS podem ficar vazios no cadastro.

## Recursos

- indicadores clicáveis de Total, Pendentes, Hoje, Atrasados e Concluídos;
- busca instantânea;
- filtros combináveis;
- ordenação operacional;
- destaque de Hoje e Atrasados;
- edição e exclusão;
- checkbox Done direto na tabela;
- atalhos `N`, `/` e `Ctrl+K`;
- backup JSON;
- restauração JSON;
- exportação CSV;
- fallback automático para modo local se o backend estiver indisponível.

## Dados iniciais

A carga inicial reproduz os registros legíveis da referência enviada. Dois pontos ambíguos foram preservados em observações para conferência manual:

- `SQUADRA CA`: a imagem indica `14/09 ou 15/09`;
- `FRIGORIFICO`: a imagem mostra uma data aparente de `17/01/9000`, tratada como data pendente para evitar gravar um prazo provavelmente inválido.
