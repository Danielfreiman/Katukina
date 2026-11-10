# Estoque integrado e busca no painel — 2026-11-04

## Requisitos e diagnóstico

**CONFIRMADO pelo responsável:** corrigir o recebimento que não gravou para Wooden Egg Shaker, revisar entrada/controle de estoque, permitir busca por digitação e integrar alterações nos dois sentidos entre lotes e WooCommerce. Esse pedido substitui a separação anterior que exigia desativar o estoque nativo antes de receber um lote.

**OBSERVADO LOCALMENTE:** produto pai 1829 com controle nativo ativado e uma variação 1829-3944. Não havia lote nem movimento gravado para esse produto. O bloqueio estava em `Inventory::create_lot`, que rejeitava produtos com `managing_stock()`. O formulário retornava sem preservar os campos. A quantidade e o código da tentativa original não foram fornecidos; nenhum recebimento real foi reconstituído ou inventado.

## ADR-011 — Dois caminhos de edição, um saldo físico

**Status:** requisito confirmado; solução implementada e testada localmente.

- WooCommerce continua sendo a autoridade do catálogo. Antes do primeiro lote, seu estoque nativo funciona normalmente. Depois, o ledger de lotes é a autoridade física e a quantidade nativa é uma projeção reconciliada.
- Recebimento, ajuste, produção, reserva/liberação e baixa passam pelo mutex e pela transação de `Database::command`. A gravação da quantidade nativa e lookup WooCommerce participa da mesma transação; caches dos produtos afetados são invalidados após rollback.
- Edições nativas de quantidade e `wc_update_product_stock` passam pelos data stores CPT estendidos. A diferença é um movimento de ajuste, não uma segunda cópia editável de saldo. Com um lote, o destino é inequívoco; com vários, o editor nativo exige **Stock adjustment lot** em **Origin and packaging**, ou a tela **Adjust stock**. Não se distribui uma diferença arbitrariamente entre lotes.
- A tela nativa leva o saldo-base para detectar edição desatualizada. Comandos de recebimento preservam chave/fingerprint idempotentes; repetir um total nativo já aplicado não cria diferença física. Reservas e limites impedem ajuste abaixo do saldo reservado.
- Saldo nativo anterior não é descartado. Se positivo, o primeiro recebimento exige marcar a transferência para um lote de abertura no depósito selecionado. O usuário informa apenas a **nova entrega** em Quantity received. Lote de abertura e entrega são separados; ambos são revertidos se a operação falhar.
- Estoque herdado de um pai com uma única variação pode ser transferido para essa variação. Pai com várias variações exige distribuir antes o saldo nativo entre apresentações; reservas nativas pendentes também impedem a transferência inicial. Não se deduz a distribuição de estoque compartilhado.
- Unidades embaladas permanecem inteiras. Granel em g/ml suporta três casas decimais, inclusive na projeção WooCommerce. O filtro nativo de quantidade aceita decimais e a validação do produto continua impedindo frações de `unit`.
- Estoque físico não equivale ao disponível: reservas e validade continuam separados. A Store API mantém o recorte por canal/depósito e a disponibilidade de produtos variáveis acompanha seus filhos. O pagamento nativo não dá uma segunda baixa nos itens acompanhados pelo ledger; a baixa operacional em PACKED AND PENDING permanece.
- Reconciliation compara movimentos/reservas e também a projeção nativa com o agregado dos lotes. Escritas SQL externas que ignorem o CRUD não são um caminho suportado de edição; divergências ficam detectáveis.

**Alternativas rejeitadas:** exigir dois cadastros de saldo independentes; sobrescrever saldo nativo no primeiro recebimento; distribuir reduções automaticamente entre lotes sem identificação. **Reversibilidade:** código anterior pode ser restaurado apenas com tratamento explícito dos novos movimentos e projeções; não retornar ao modelo antigo apagando histórico. Os originais de discovery permanecem preservados.

## Telas e contrato

- Receive lot, Repack, Expected receipts e Production: seletores com digitação de nome/SKU, usando SelectWoo do WooCommerce. Campos de lote em ajustes, reservas e amostras pesquisam produto, SKU e código do lote.
- Receive lot consulta o saldo ao selecionar um SKU e explica a transferência inicial quando necessária. Erro mostra **Not saved**, preserva dados e chave para correção; sucesso retorna à listagem com referência.
- Lots, Inventory, Movements e Reservations têm filtro pesquisável por produto. O filtro ocorre antes da paginação. Quantidades na interface usam a unidade comercial, não o inteiro interno multiplicado por 1.000.
- Inventory inclui saldos nativos ainda sem lotes, identificados como WooCommerce, e saldos por lotes, sem duplicá-los. Estoque nativo sem alocação não recebe empresa/depósito fictícios.
- `GET /wp-json/katukina/v1/inventory/product/{form_id}`: sessão REST WordPress, nonce e capacidade `katukina_inventory`; retorna SKU, saldo físico, unidade, quantidade de lotes, controle nativo e indicador de pai compartilhado. Não grava dados.
- Não há tela paralela de catálogo. Os controles continuam nas extensões nativas existentes.

## Evidência executada

- `npm.cmd run wp:test`: 37 verificações operacionais, 54 de expansão nativa, 9 de comunicação e 25 da nova integração de estoque, todas aprovadas. Comunicação usou provedor falso em memória.
- Nova suíte cobre ida/volta, API nativa de estoque, lookup, idempotência, rollback conjunto, editor desatualizado, proteção de reservas, múltiplos lotes com escolha explícita, abertura com saldo anterior, variação herdando pai, granel fracionário e detecção/reparo de divergência.
- `tests/stock-bridge.spec.ts` com Playwright/Edge: aprovado. Busca pelo SKU real sem alterá-lo; produto sintético recebido pelo formulário; erro preserva campos; edição no editor nativo atualiza o lote; ajuste pelo painel atualiza WooCommerce; filtro Inventory mostra o saldo correto.
- Typecheck, sintaxe JavaScript e `git diff --check`: aprovados. Sintaxe PHP validada nos utilitários principais e carregamento coberto pela suíte.
- Lotes sintéticos de navegador foram zerados e seus produtos removidos. Os dois lotes fechados desta execução foram removidos por rotina CLI local restrita ao prefixo exato dos testes, sem tocar o produto do usuário.

**Limites:** validado no WordPress/WooCommerce local com data stores CPT padrão. Outros plugins que substituam esses data stores precisam de revisão de compatibilidade. Não houve alteração de produção nem recriação da tentativa original sem quantidade/código.

Conferência final somente de leitura: Receive lot, Inventory, Adjust stock, Production e Expected receipts responderam HTTP 200, com seletores pesquisáveis e sem erros JavaScript. Wooden Egg Shaker foi selecionado por `1829-3944` para conferir o aviso de saldo, sem salvar entrada. Captura: `artifacts/stock-wooden-ready.png`.
