# Revisão dos efeitos dos CTAs — 17/11/2026

**CONFIRMADO por Danilo:** verificar os efeitos dos CTAs após o conflito de hover do banner Giftshop. Escopo: vitrine Next.js local, home e componentes compartilhados. Sem alterações no catálogo, pedidos ou backend.

## Correções

- Os banners clicáveis de incenso e Beauty & Body herdavam o verde de `a:hover` no título, enquanto seus botões internos não reagiam ao hover no restante do banner. Agora preservam o texto e destacam o CTA no hover e no foco por teclado.
- Os CTAs internos das promoções e Giftshop passam a responder também ao foco do link pai. A classe `mh-button` agora declara transição de cor/fundo, inclusive quando aplicada a um `span` dentro de um link.
- Botões primários desabilitados mudavam de fundo e subiam 2 px no hover. Efeitos primários/secundários agora excluem `disabled` e `aria-disabled="true"`; regra específica da sacola também exclui botões desabilitados.
- A elevação de botões primários fica limitada a ponteiros com hover e à preferência sem redução de movimento. Durante a pressão, o botão retorna à posição normal.

## Verificações executadas

- `npm.cmd run typecheck`: aprovado.
- Chromium/Playwright: estados normal, hover, pressionado e foco em 16 amostras representativas da home, loja, produto Urucum Coconut Creme, sacola vazia, conta, newsletter e frete. As famílias cobrem os estilos reutilizados; a home continha 142 ocorrências de links/CTAs no inventário. Não foram testadas individualmente todas as ocorrências repetidas.
- Conferência adicional do botão secundário na busca sem resultados e do CTA na sacola lateral vazia.
- Nos CTAs de fundo sólido amostrados, contraste calculado mínimo de 5,19:1 entre texto/fundo nos estados habilitados. Esse cálculo não certifica todo texto sobre fotografias.
- Produto e newsletter: botões nativamente desabilitados mantiveram fundo e posição no hover e não receberam foco.
- Foco visível confirmado nos controles habilitados. Capturas do banner de incenso em hover e Giftshop com foco revisadas.
- Movimento reduzido emulado: botão primário da busca permaneceu sem transformação.
- Mobile Chromium com viewport 390 px e toque emulado: toque no banner Giftshop abriu `/collections/giftshop`, sem overflow horizontal. Não equivale a teste em dispositivo físico.
- Checkout inspecionado com sacola vazia, sem formulário de finalização disponível. Nenhum login, cadastro, assinatura, pedido ou pagamento foi enviado; fluxos autenticados, carregamento real de pagamentos e checkout preenchido não foram exercitados.

As cores de CTAs já consistentes e os destinos existentes foram preservados. A correção anterior de texto claro no hover da Giftshop permanece vigente.
