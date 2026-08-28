# Controle de Clientes — Agenda

Agenda operacional feita somente com **HTML, CSS, JavaScript puro, PHP e SQL**.

## Como usar agora

Abra `index.html` no navegador. O modo local funciona sem servidor e mantém os dados no `localStorage` do navegador.

No GitHub Pages, a entrada é `index.html`. GitHub Pages é hospedagem estática, portanto o PHP não é executado ali.

## Estrutura

- `index.html` — interface principal
- `index.php` — entrada para servidor PHP
- `style.css` — interface responsiva
- `app.js` — lógica da agenda
- `dados-iniciais.js` — carga inicial baseada na referência fornecida
- `php/` — API opcional para MySQL/MariaDB
- `sql/banco.sql` — banco e índices
- `sql/dados_exemplo.sql` — carga inicial SQL

## Campos

Nome é obrigatório. Data prevista, OS, observação e Done são opcionais.

## Recursos

- Total, Pendentes, Hoje, Atrasados e Concluídos;
- filtros combináveis;
- busca por cliente, OS e observação;
- ordenação por pendência e prazo;
- destaque de hoje e atrasados;
- marcar concluído direto na tabela;
- edição e exclusão;
- atalhos `N`, `/` e `Ctrl+K`;
- backup JSON;
- restauração JSON;
- exportação CSV;
- fallback automático para modo local;
- integração opcional com PHP + MySQL/MariaDB.

## PHP + MySQL/MariaDB

Configure `DB_HOST`, `DB_NAME`, `DB_USER` e `DB_PASS` no servidor. O frontend tenta usar `php/clientes.php`; se o backend não estiver disponível, continua em modo local.

Os endpoints PHP usam validação de entrada e prepared statements. Não publique credenciais no GitHub.

## Dados iniciais

A carga inicial segue a imagem fornecida. Informações ambíguas foram preservadas em observações para revisão:

- `SQUADRA CA`: a imagem indica `14/09 ou 15/09`;
- `FRIGORIFICO`: a imagem aparenta mostrar `17/01/9000`; por segurança, ficou sem data e com observação para revisão.
