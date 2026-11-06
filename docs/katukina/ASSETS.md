# Assets do frontend Katukina

## Logotipo horizontal

Entregue por Danilo em 06/11/2026 como `katukina-logo-horizontal-01.svg`, renomeado para o nome definitivo abaixo sem alterar o conteúdo vetorial. Integrado ao cabeçalho público; o símbolo e a assinatura do rodapé permanecem independentes.

| Especificação | Entrega |
| --- | --- |
| Pasta | `public/images/brand/` |
| Nome | `katukina-logo-horizontal.svg` |
| URL pública | `/images/brand/katukina-logo-horizontal.svg` |
| Prancheta de referência | 600 × 120 px, proporção 5:1 |
| Formato | SVG vetorial transparente, com `viewBox` |

Entregar a assinatura horizontal completa, com símbolo se fizer parte da marca. A prancheta é uma referência: preservar a proporção original, sem deformar a marca. Ajustar os limites ao desenho, sem margens vazias excessivas. A área de proteção será aplicada por CSS.

Converter letras em contornos. Guardar o mestre editável fora de `public/`. Evitar raster embutido, links externos e scripts; remover metadados desnecessários, preservando as curvas. Usar a versão aprovada para fundo branco quente, conforme [PALETTE.md](PALETTE.md), sem incorporar um fundo ao SVG.

Aplicação implementada: largura de 300 px no desktop, 200 px em mobile e 168 px em telas de 320–360 px, com altura automática. Na proporção 5:1, as alturas são 60/40/33,6 px. SVG não exige DPI, exportação 2x/3x ou conversão para WebP.

A marca atual combina texto e `components/site/brand-mark.tsx`. O símbolo também aparece no rodapé. O cabeçalho usa `next/image`, dimensões intrínsecas 600 × 120, altura automática e carregamento imediato. O link mantém o nome acessível e o destino para a Home. Não há substituição dos símbolos restantes ou do favicon.

## Organização dos próximos assets

| Local | Uso |
| --- | --- |
| `public/images/brand/` | Logotipos e símbolos oficiais; variantes futuras com função clara, como `katukina-logo-horizontal-reversed.svg` |
| `public/images/editorial/` | Futuras imagens institucionais/editoriais, com nomes por assunto, como `forest-canopy.webp` |
| `public/images/campaigns/<campaign-slug>/` | Futuras imagens próprias de cada campanha |
| Biblioteca WordPress/WooCommerce | Fotos de produtos e variações, preservando os vínculos; não duplicar no frontend |
| `docs/katukina/design/` | Referências visuais aprovadas; não confundir com assets servidos ao visitante |

Somente `brand/` foi criada nesta etapa. As demais pastas são convenções para quando houver arquivos reais. Usar nomes em inglês, minúsculos, com hífens, sem espaços/acentos ou sufixos como `final-final-2`.

Mestres AI/PSD, versões de trabalho e exportações descartadas ficam na organização de design do cliente, fora da pasta pública e do Git do site. Os assets existentes permanecem em seus caminhos para preservar URLs. Reorganizar esses arquivos exige inventário das referências e validação própria.

Validação local: logotipo carregado e sem transbordamento nas larguras 1756, 1440, 1100, 900, 801, 800, 390, 375 e 320 px; link para Home, foco visível por teclado e menu mobile conferidos. Evidências em `artifacts/logo-update/` (fora do Git).
