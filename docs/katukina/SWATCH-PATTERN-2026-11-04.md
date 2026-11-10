# Pattern nos swatches — 2026-11-04

**CONFIRMADO — REQ-UX-SWATCH-01:** pedido do responsável nesta conversa para aplicar o pattern de forma sutil aos swatches de apresentação, conforme exemplo de Palo Santo beads.

Implementação local em `app/catalog.css`: a superfície `.swatch-content` reutiliza `/images/original-background.jpg` intacto, com escala de 380 px e opacidade de 6,5%. A camada decorativa fica atrás do texto e não captura cliques. Aplica-se também às opções de tipo, peso e volume que reutilizam o mesmo componente visual. Os estados selecionado, indisponível e foco mantêm as bordas, fundos e indicação textual existentes.

Validações executadas: `npm.cmd run typecheck` passou. Playwright com Edge em `/products/palo-santo-beads` verificou os três swatches, seleção de 100 beads por clique, navegação por seta para 50 beads e foco visível de 3 px. Revisão visual em desktop de 1440 px e mobile de 390 px; sem overflow horizontal. Evidências locais em `artifacts/swatch-pattern-desktop.png` e `artifacts/swatch-pattern-mobile.png`.

Escopo restrito à apresentação visual; nenhum dado de catálogo ou estoque foi alterado. Build não executado nesta tarefa.
