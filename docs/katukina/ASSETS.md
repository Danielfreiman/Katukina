# Assets do frontend Katukina

## Imagens independentes do hero — 10/11/2026

Por solicitação de Danilo, cada slide agora tem arquivos independentes para desktop e mobile. Esta decisão substitui o uso de uma única imagem por slide descrito no histórico abaixo.

| Slide | Desktop (acima de 600 px) | Mobile (até 600 px) |
| --- | --- | --- |
| Discover Katukina | `katukina-hero.webp` | `katukina-hero-mobile.webp` |
| Explore Rapé | `katukina-hero-rape.webp` | `katukina-hero-rape-mobile.webp` |
| Explore incense | `katukina-hero-incense.webp` | `katukina-hero-incense-mobile.webp` |

- Pasta de todos os arquivos: `public/images/campaigns/home/`.
- Desktop: manter **2400 × 1500 px**.
- Arte mobile recomendada: **1200 × 2400 px** (largura × altura, proporção 1:2), WebP em sRGB, preferencialmente até 500 KB. Os arquivos mobile iniciais são cópias independentes dos originais de 2400 × 1500 px para preservar a aparência até Danilo entregar as artes verticais.
- Substituir o arquivo correspondente mantendo nome e extensão. O navegador seleciona a arte pelo `<picture>` em `app/page.tsx`, usando o mesmo limite de 600 px do layout mobile.
- No celular, o hero tem altura mínima de 790 px, podendo crescer com o conteúdo. A imagem cobre a área com recorte conforme a tela; manter elementos importantes afastados das bordas. Concentrar os produtos na metade inferior e reservar a parte superior para o texto HTML e seu overlay escuro. Não incorporar títulos, botões ou ícones na imagem.
- A separação preserva layout, overlays, textos e controles existentes. Conferir o recorte ao substituir cada arte final.

### Tempo de exibição — 10/11/2026

No desktop (acima de 600 px), o slide 01 avança para o 02 após 5 segundos. Os slides 02 e 03 permanecem por 6 segundos; no mobile, todos permanecem por 6 segundos. A transição usa fade de 900 ms, desativado para movimento reduzido. Slides inativos ficam fora da navegação e da árvore de acessibilidade. Pausa, foco, aba oculta e preferência de movimento reduzido continuam respeitados.

### Slide 03: incensos e acessórios — 10/11/2026

- Título: “Discover incense. Complete the ritual.” Texto: “Explore incense resins and blends, then find burners and holders to complete your setup.”
- Categorias verificadas no banco local: Sacred Incense (14 produtos), Incense Herbs (13), Incense Smudge (20), Incense Sticks (26) e Tools (27). Contagens do snapshot local, sem equivalência com produção.
- CTA principal “Explore incense”: `/collections/sacred-incense`. CTA secundário “Incense accessories”: `/collections/tools?q=incense`, usando o filtro de busca existente dentro de Tools, sem criar categoria comercial.
- Desktop: `katukina-hero-incense.webp`, **2400 × 1500 px**. Mobile: `katukina-hero-incense-mobile.webp`, **1200 × 2400 px**. Os dois começam como fundos neutros provisórios, sem fotografia; Danilo fará as imagens. Substituir mantendo os nomes.
- Mesmo layout claro do slide 01 no desktop, com produtos à direita e espaço livre à esquerda. No mobile, reservar o topo para o texto e concentrar produtos na parte inferior; o overlay escuro existente continua aplicado. Sem títulos, botões ou ícones incorporados à arte.

## Carrossel da Home — histórico de 09/11/2026

- Slide 01: `public/images/campaigns/home/katukina-hero.webp`, imagem atual fornecida por Danilo.
- Slide 02 (coleção Rapé): `public/images/campaigns/home/katukina-hero-rape.webp`. Cópia provisória da imagem atual; Danilo produzirá a composição definitiva. Nenhuma instrução de placeholder foi incorporada à imagem.
- Para a nova arte: **2400 × 1500 px**, WebP, sRGB, preferencialmente até 500 KB. Substituir apenas o arquivo do slide 02, mantendo nome e caminho.
- Cada slide usa a mesma imagem no desktop e no mobile, conforme a decisão mais recente de Danilo. Nenhuma imagem exclusiva mobile foi criada. Desktop: produtos à direita e espaço claro à esquerda. Mobile: prever recorte vertical; texto sobre overlay escuro no topo e produtos na parte inferior. Não incorporar títulos, botões ou ícones na arte.
- Altura desktop: 825 px; imagem com `object-fit: cover`. Recorte e legibilidade da nova arte precisam de conferência após a entrega.
- Navegação por indicadores discretos, clique e teclado (setas, Home/End). Troca automática a cada 6 segundos, com controle de pausa/play. Pausa temporária com mouse sobre o hero e ao ocultar a aba; o foco por teclado interrompe a troca até o usuário retomar. Movimento reduzido inicia com reprodução pausada. O conteúdo de Rapé descreve a coleção, sem alegações de saúde ou ofertas inventadas. CTA principal: `/collections/rape`.

Esta atualização substitui as indicações antigas de placeholder neutro e overlay claro no mobile descritas mais abaixo.

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


## Hero panor?mico da Home ? 09/11/2026

Dire??o fornecida por Danilo: imagem ocupando todo o hero, composi??o de produtos feita por ele; texto e ?cones em HTML sobre a imagem, preservando a altura desktop existente (825 px na largura de 1440 px). Refer?ncia de hierarquia: t?tulo compacto em duas linhas, destaque verde, CTA urucum e a??o secund?ria; ?cones de bot?nicos, incensos e objetos sem condi??es comerciais inventadas.

- Pasta: `public/images/campaigns/home/`.
- Arquivo para substituir: `katukina-hero.webp`.
- Dimens?es recomendadas: **2400 ? 1500 px**, WebP, sRGB. Meta de peso: at? 500 KB.
- O arquivo atual ? um placeholder neutro, identificado dentro da pr?pria imagem. Substitu?-lo mantendo nome, formato e caminho atualiza o hero sem altera??o de c?digo.
- Criar somente a composi??o fotogr?fica, sem t?tulos, bot?es, selos ou ?cones incorporados. Produtos concentrados ? direita (aproximadamente os 45% direitos), deixando a metade esquerda clara e livre para os elementos HTML.
- A arte cobre toda a se??o com `object-fit: cover`; manter itens importantes afastados das bordas e prever recorte. No mobile, a composi??o usa o lado direito da arte; o texto permanece no topo com prote??o clara gradual. Conferir esse recorte ao entregar a imagem final.
- Alt vazio: fotografia de ambienta??o decorativa, sem link ou oferta associada. Rever se a imagem final trouxer informa??o exclusiva relevante.

Pr?via local: `http://localhost:3001/`. A arte definitiva e sua aprova??o visual permanecem com Danilo.
