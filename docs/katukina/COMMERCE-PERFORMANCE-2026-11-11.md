# Desempenho do fluxo de compra — 2026-11-11

## Confirmado no ambiente local

O usuário relatou demora em “Updating your bag” e “Preparing checkout”. Perfil temporário do PHP mostrou configuração demorando 0,98–5,83 s; o callback da configuração consumiu aproximadamente 2–5 ms. O maior custo ocorreu no bootstrap do WordPress/WooCommerce, incluindo registro de blocos (0,64–1,52 s nas amostras instrumentadas). O OPcache estava ativo, sem saturação ou reinícios por falta de memória. A instrumentação foi removida após a medição.

## Correções

- A extensão `katukina` do carrinho Store API inclui `checkout_config`, calculada pelo mesmo `public_config()` já utilizado no endpoint público. Carrinho e checkout recebem configuração e totais na mesma requisição, no contexto corrente de canal, moeda e destino.
- Frontend mantém fallback para o endpoint anterior quando essa extensão não existe.
- Leituras simultâneas compartilham somente a promessa em andamento, evitando duplicação pelo Strict Mode. Não há cache persistente de carrinhos, informações pessoais ou configurações. Mutações invalidam as leituras compartilhadas; operações de escrita não são repetidas automaticamente.
- O sidecart aberto após inclusão usa a resposta confirmada do WooCommerce, em vez de fazer outro GET. A abertura manual continua consultando o estado atual. Falhas de atualização continuam exigindo reconciliação por leitura.
- Revisão de endereço, totais, disponibilidade, pagamento e idempotência do pedido permanecem autoritativas no backend.

## Validação executada

- Typecheck e build de produção passaram.
- Quatro testes Playwright passaram: checkout combinado, fallback, navegação/acessibilidade do sidecart e atualização/reconciliação após resposta perdida.
- Fluxo real em sessão isolada: produto com variação disponível, inclusão, quantidade 2 e formulário de checkout. Nenhum pedido enviado; carrinho de teste limpo ao final.
- Nessa execução, inclusão até sidecart visível: 1,98 s; navegação até formulário de checkout: 3,09 s. A inicialização do checkout fez **um GET cart e nenhum GET config**, contra leituras repetidas de ambos observadas anteriormente em desenvolvimento. A inclusão não fez GET adicional do carrinho.

As medidas são amostras locais, não um benchmark controlado nem garantia de latência. A variabilidade do bootstrap PHP permanece; a correção elimina trabalho redundante, sem desativar blocos WooCommerce ou validações comerciais.
