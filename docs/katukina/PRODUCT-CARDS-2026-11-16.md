# Cards de produtos da home — 16/11/2026

**CONFIRMADO:** Danilo pediu cards mais modernos, com mais informações e CTA, usando a imagem enviada como referência. Escopo aplicado aos produtos da home, sem alterar banners, categorias ou composição geral.

**Implementação visual:** foto quadrada maior e painel de informações com leve sobreposição sobre sua borda inferior; nome completo, categoria, SKU e quantidade de opções, quando fornecidos pelo WooCommerce. Descrição curta limitada visualmente a duas linhas, avaliações somente quando existentes, preço e disponibilidade preservados. Selo Sale somente quando `on_sale` for verdadeiro. Estado de backorder diferenciado quando informado pela API.

CTA verde sempre visível, com alvo mínimo de 44 px: “Choose options” para produto variável em estoque, “View product” nos demais casos. Ambos levam à página real do produto. A mudança não adiciona itens ao carrinho nem altera disponibilidade ou regras comerciais. Sora/Source Sans 3, tokens da paleta, raio de 8 px e efeitos de hover/foco existentes foram mantidos.

As seções de produtos Exclusive Sale, Shop by collection, New in the catalogue e From the collection compartilham `HomeCard`. O catálogo nas páginas internas mantém seu componente vigente. A ausência de descrição ou avaliação no backend não é preenchida com conteúdo inventado.

## Verificações executadas

- `npm.cmd run typecheck`: aprovado.
- `npx.cmd playwright test tests/reference-home.spec.ts tests/storefront-navigation.spec.ts`: dois testes aprovados, cobrindo campanhas, abas por teclado, carrosséis, imagens, navegação e ausência de overflow em cinco larguras.
- Capturas da seção Exclusive Sale em 1440/390/320 px; desktop e celular inspecionados. A verificação adicional encontrou 127 cards e 127 CTAs na home, sem overflow horizontal nas três larguras.
- Detector Impeccable de layout sem achados determinísticos; `git diff --check` aprovado.

**A VALIDAR:** avaliação visual de Danilo sobre o resultado. As alterações locais anteriores dos círculos claros e de sua documentação foram preservadas.
