# Estoque local para teste de compra — 2026-11-11

**CONFIRMADO:** o responsável solicitou colocar todos os produtos em estoque para testar o fluxo completo. Alteração restrita ao WordPress com ambiente `local` e endereço `localhost`.

## Aplicação

- Auditoria: 370 produtos variáveis e 908 variações publicadas, todos com preço; nenhum lote vinculado. Assim, estoque nativo WooCommerce é a autoridade aplicável.
- Todas as 908 variações passaram a controlar quantidade, com mínimo de 100 unidades de teste, preservando eventual saldo superior e somando reservas nativas ao mínimo necessário. Preços e políticas de backorder não foram alterados.
- Produtos pais usam disponibilidade derivada dos filhos, sem controle de saldo compartilhado. Sincronização feita pelo CRUD e rotinas nativas WooCommerce, sem escrita SQL direta de estoque.
- Execução final: 370 pais, 908 variações atualizadas, zero erros e zero itens fora de estoque. Esse saldo é sintético para teste, não comprovação de inventário físico.

## Backup e reversão

Backup privado em `wordpress/backups/test-stock-2026-11-11-1794409025378/`: `database-before.sql`, `stock-before.json` e `result.json`. Diretório ignorado pelo Git. Snapshot registra IDs, SKUs, controle de quantidade, saldo, status e backorders anteriores. Não importar o banco inteiro depois de novos pedidos sem avaliar os dados que seriam substituídos; a restauração de saldos também deve considerar o consumo dos testes realizados após esta alteração.

## Verificação executada

- Store API: 370 produtos `instock`, zero `outofstock`, zero `onbackorder`.
- Navegador/Edge, sessão isolada: seleção de variação de Palo Santo beads, botão habilitado, adição real ao carrinho, abertura do sidecart, aumento para duas unidades e abertura da página de checkout.
- Nenhum pedido foi finalizado. Itens da sessão de verificação removidos ao concluir. Evidência local em `artifacts/test-stock-checkout.png`.
- Produção não foi acessada. Banco, credenciais e backups não foram versionados.
