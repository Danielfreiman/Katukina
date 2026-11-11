# Assets do frontend Katukina

## Especificação vigente — 11/11/2026

**Para os banners em dupla da home, usar [BANNERS.md](BANNERS.md): 2400 × 1800 px, 4:3, WebP/sRGB, em `public/images/home/banners/`.** Três arquivos independentes: `discover-katukina.webp`, `our-story.webp`, `sacred-incense.webp`. Mesma arte no desktop/celular.

A home atual está em `app/page.tsx` + `components/home/reference-widgets.tsx` + `app/reference-home.css`. Categorias da home usam ícones nesta composição; o banner Kuripe & Tepi e o hero de tela inteira abaixo pertencem à versão anterior. Os fundos `collection/` e `journal/` e as pastas `category-band/`/`category-cards/` são preservados, mas não são pontos de entrega da primeira dobra atual. Não produzir novas artes para áreas históricas sem confirmar a seção ativa.

Marca em `public/images/brand/`, imagens editoriais compartilhadas em `public/images/` e fotos de produto no WooCommerce permanecem válidas. O título “Somente brand foi criada nesta etapa” mais abaixo descreve a etapa histórica, não o inventário atual.

[Mapa completo de pastas](../PROJECT_STRUCTURE.md) · [Guia geral](../PROJECT_GUIDE.md).

## Histórico preservado

**Limpeza posterior em 11/11/2026:** `hero-01/`, `hero-02/`, `hero-03/` e `collections-banner/` foram retiradas de `public/images/home/`, com backup externo em `.local-backups/`. Duas fotos ainda usadas por cards passaram para `public/images/editorial/`. Os caminhos antigos nas seções históricas abaixo não existem mais como destinos de entrega.

As seções a seguir registram versões anteriores. Em caso de conflito para os banners atuais, prevalece BANNERS.md. As validações listadas são das respectivas etapas, não foram todas repetidas nesta organização.


## Banner Kuripe & Tepi — 11/11/2026

- Seção da home entre a coleção e o journal, com CTA para `/collections/kuripe-and-tepi`.
- Composição atual conforme referência de Danilo: fotografia à esquerda, painel verde central com título e dois botões brancos, fotografia à direita. No celular, fotos lado a lado acima do painel central.
- Fotos: `public/images/home/collections-banner/left.webp` (Kuripe) e `right.webp` (Tepi). Salvar nesses caminhos e atualizar a página; os arquivos são detectados no servidor.
- Recomendação: WebP sRGB, **900 × 1100 px** por foto, sem textos incorporados. As artes usam recorte `cover` centralizado; preservar os produtos na região central.
- Até a entrega das artes, usa fotos reais do catálogo com `contain`. O caminho anterior `background.webp`, se fornecido, continua sendo fallback para as laterais sem arte própria.
- Botões: coleção Kuripe & Tepi com filtros de busca `?q=kuripe` e `?q=tepi`. Conferir recorte após inserir as fotos definitivas.

## Pastas da home — organização vigente em 10/11/2026

Cada área tem sua pasta em `public/images/home/`. Os arquivos dos heros foram movidos sem alterar seu conteúdo; os caminhos históricos mais abaixo não são os destinos atuais.

Formato confirmado por Danilo: todas as imagens raster entregues para estas áreas usam **WebP**, incluindo fundos transparentes. Logotipos vetoriais existentes permanecem em SVG.

| Pasta | Arquivo | Arte recomendada |
| --- | --- | --- |
| `hero-01/` | `desktop.webp` / `mobile.webp` | 2400 × 1500 / 1200 × 2400 px |
| `hero-02/` | `desktop.webp` / `mobile.webp` | 2400 × 1500 / 1200 × 2400 px |
| `hero-03/` | `desktop.webp` / `mobile.webp` | 2400 × 1500 / 1200 × 2400 px |
| `collection/` | `background.webp` | 1024 × 1024 px, transparente e seamless |
| `journal/` | `background.webp` | 1024 × 1024 px, transparente e seamless |

## Padrões de fundo da home — 10/11/2026

- Produtos/coleção: `public/images/home/collection/background.webp`. Journal: `public/images/home/journal/background.webp`. As duas áreas podem receber artes independentes.
- Arte recomendada: **1024 × 1024 px**, WebP lossless em sRGB, com transparência e encaixe nas quatro bordas (seamless). A transparência da arte determina a intensidade do padrão sobre o fundo branco.
- Repetição nos dois eixos, no tamanho intrínseco do arquivo (`background-size: auto`), no desktop e no mobile. 1024 × 1024 px é apenas uma recomendação de arte. Preservar o WebP exatamente como Danilo salvar: sem reexportação, redimensionamento, filtros ou opacidade adicional. A transparência embutida é composta diretamente sobre o fundo branco.
- Aplicado ao fundo do conteúdo da home: área da coleção/produtos, seus espaços e margens e convite ao journal. Cards e fotografias mantêm seus fundos sólidos. Hero e faixa institucional mantêm suas superfícies próprias; cabeçalho, rodapé e outras rotas não recebem este padrão.
- Os arquivos iniciais são totalmente transparentes, preparados para Danilo substituir pelas artes mantendo nome e caminho. Nenhum desenho provisório foi criado; até a entrega, os fundos continuam brancos.
- Não incorporar textos ou produtos no padrão. Manter contraste suficiente para o conteúdo que fica sobre as áreas transparentes.

## Imagens independentes do hero — 10/11/2026

Por solicitação de Danilo, cada slide agora tem arquivos independentes para desktop e mobile. Esta decisão substitui o uso de uma única imagem por slide descrito no histórico abaixo.

| Slide | Desktop (acima de 600 px) | Mobile (até 600 px) |
| --- | --- | --- |
| Discover Katukina | `hero-01/desktop.webp` | `hero-01/mobile.webp` |
| Explore Rapé | `hero-02/desktop.webp` | `hero-02/mobile.webp` |
| Explore incense | `hero-03/desktop.webp` | `hero-03/mobile.webp` |

- Pasta de todos os arquivos: `public/images/home/`, com uma subpasta por hero.
- Desktop: manter **2400 × 1500 px**.
- Arte mobile recomendada: **1200 × 2400 px** (largura × altura, proporção 1:2), WebP em sRGB, preferencialmente até 500 KB. As artes entregues foram preservadas integralmente durante a reorganização.
- Substituir o arquivo correspondente mantendo nome e extensão. O navegador seleciona a arte pelo `<picture>` em `app/page.tsx`, usando o mesmo limite de 600 px do layout mobile.
- No celular, o hero tem altura mínima de 790 px, podendo crescer com o conteúdo. A imagem cobre a área com recorte conforme a tela; manter elementos importantes afastados das bordas. Concentrar os produtos na metade inferior e reservar a parte superior para o texto HTML e seu overlay escuro. Não incorporar títulos, botões ou ícones na imagem.
- A separação preserva layout, overlays, textos e controles existentes. Conferir o recorte ao substituir cada arte final.

### Tempo de exibição — 10/11/2026

No desktop (acima de 600 px), o slide 01 avança para o 02 após 5 segundos. Os slides 02 e 03 permanecem por 6 segundos; no mobile, todos permanecem por 6 segundos. A transição usa fade de 900 ms, desativado para movimento reduzido. Slides inativos ficam fora da navegação e da árvore de acessibilidade. Pausa, foco, aba oculta e preferência de movimento reduzido continuam respeitados.

### Slide 03: incensos e acessórios — 10/11/2026

- Título: “Sticks, herbs & resins. Create your ritual.” Texto: “Explore incense sticks, herbs and resins, with burners and holders to complete your ritual.”
- Categorias verificadas no banco local: Sacred Incense (14 produtos), Incense Herbs (13), Incense Smudge (20), Incense Sticks (26) e Tools (27). Contagens do snapshot local, sem equivalência com produção.
- CTA principal “Explore incense”: `/collections/sacred-incense`. CTA secundário “Incense accessories”: `/collections/tools?q=incense`, usando o filtro de busca existente dentro de Tools, sem criar categoria comercial.
- Desktop: `hero-03/desktop.webp`, **2400 × 1500 px**. Mobile: `hero-03/mobile.webp`, **1200 × 2400 px**. As fotografias entregues por Danilo estão aplicadas. Substituir mantendo os nomes.
- Overlay marrom `#3b2619`, alinhado aos tons da fotografia entregue por Danilo, com texto claro no desktop e mobile. No desktop, produtos à direita e espaço livre à esquerda. No mobile, reservar o topo para o texto e concentrar produtos na parte inferior. Sem títulos, botões ou ícones incorporados à arte.

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

## Faixa de categorias da home — 10/11/2026

Confirmado por Danilo: uma única faixa compacta com seis cards pequenos lado a lado,
com foto, overlay, título e CTA discreto sem seta. “Explore by category” permanece
à esquerda. Em telas menores, a faixa tem rolagem horizontal, preservando a ordem.

Atualiza??o de Danilo na mesma data: as fotos dos seis cards passam a vir de produtos
da pr?pria categoria no WooCommerce. O servidor sorteia uma imagem por categoria a
cada novo carregamento da home, entre at? 24 produtos com imagem. O sorteio pode
repetir uma foto; n?o h? rota??o enquanto a p?gina est? aberta. Falhas de API ou
categorias sem foto mant?m o link com fallback de imagem indispon?vel.

Os cinco WebP totalmente verdes em `public/images/home/categories/` foram removidos.
`exclusive-sale.webp` foi preservado por j? conter uma imagem inserida por Danilo;
n?o ? mais usado pelos cards. N?o ? necess?rio preparar imagens manuais para a faixa.
Fotos de produtos usam `object-fit: contain` para preservar sua composi??o no quadrado.

## Camada decorativa sobre a faixa verde de categorias - 10/11/2026

Preparada a pedido de Danilo, sem alterar o alinhamento dos cards.

- Arquivo: `public/images/home/category-band/category-band-overlay.webp`.
- Export recomendado: **2400 x 800 px**, WebP com alpha, sRGB, ate 400 KB.
- Placeholder atual: imagem totalmente transparente nessas dimensoes.
- Substituir o arquivo mantendo nome e caminho ativa a arte sem editar codigo.
- Aplicacao: camada decorativa sobre o verde, atras do titulo e dos cards, de ponta a ponta da tela.
- Centralizada, `cover`, sem repeticao, sem filtros e sem opacidade adicional.
- No mobile, utiliza o recorte central do mesmo arquivo. Evitar elementos essenciais nas bordas e textos incorporados.
- O fundo verde permanece visivel nas areas transparentes; fotografias e textos HTML permanecem independentes.

## Cards de categorias com arte manual - atualizacao de 10/11/2026

Danilo pediu cards como a referencia enviada, com foto preenchendo o card e faixa
verde com nome na base, sem arredondamento e sem CTA textual separado.
Esta decisao substitui o sorteio obrigatorio de fotos: cada categoria aceita uma
arte manual em `public/images/home/category-cards/<slug>.webp`; somente arquivos
ausentes continuam usando provisoriamente fotos de produtos do WooCommerce.

- Artes: **960 x 1120 px (6:7)**, WebP, sRGB, preferencialmente ate 200 KB cada.
- Nomes: `exclusive-sale.webp`, `puer-teas.webp`, `giftshop.webp`,
  `incense-smudge.webp`, `shamanic-tools.webp`, `rape.webp`.
- Sem textos na arte; preservar os 20% inferiores para a faixa HTML sobreposta.
- Arte manual usa `cover`, sem padding; fotos provisorias usam `contain`.
- Desktop: seis cards em uma linha. Tablet ate 1100 px: duas linhas de tres.
  Celular ate 600 px: rolagem horizontal com indicacao de gesto.
- Arquivos podem ser entregues individualmente. Todas as seis artes presentes
  dispensam as consultas de fotos de categorias ao WooCommerce nesta faixa.
- Fundo verde com pattern, alinhamento e CTAs dos produtos acima preservados.

### Correcao de enquadramento - 10/11/2026

A pedido de Danilo, a foto passa a ocupar um quadro **quadrado separado acima**
da faixa do nome, sem sobreposicao. Esta decisao substitui a proporcao 6:7 e a
reserva inferior anteriores. Exportar as seis artes em **960 x 960 px (1:1)**,
com os mesmos nomes e caminhos. A faixa verde fica fora da imagem.

### Profundidade dos cards da home - 10/11/2026

Pedido de Danilo via Impeccable/layout: modernizar produtos e categorias com
sombras e volume, preservando a identidade e as quinas retas.

- Sombras suaves com deslocamento em duas camadas; sombra maior no hover/foco.
- Hover de mouse com elevacao de 6 px e perspectiva discreta de 1 grau.
- Pressao de clique reduz a elevacao; CTAs recebem relevo interno discreto.
- Bordas externas substituidas por sombra; separadores internos preservados.
- Foco de teclado preservado e reforcado visualmente.
- Movimento reduzido remove inclinacao, elevacao e transicoes dos cards.
- Mobile mantem sombras estaticas e recebe espaco vertical no trilho para evitar corte.
- Grids, fotos quadradas, arquivos manuais, urucum e pattern a 50% preservados.
- Escopo: CSS da home, sem alteracoes em catalogo/API ou regras comerciais.
