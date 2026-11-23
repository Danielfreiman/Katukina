---
name: Katukina
description: Vitrine botânica clara, comercial e acolhedora, com produtos reais em primeiro plano.
colors:
  primary: "#782e26"
  primary-hover: "color-mix(in srgb, #782e26 85%, #292c27)"
  green: "#526b35"
  accent: "#782e26"
  accent-ink: "#f7f7f2"
  white: "#ffffff"
  warm-white: "#f7f7f2"
  soft: "color-mix(in srgb, #d3d4cf 22%, #f7f7f2)"
  support-soft: "color-mix(in srgb, #526b35 10%, #f7f7f2)"
  ink: "#292c27"
  muted: "#595957"
  line: "#d3d4cf"
  control-line: "color-mix(in srgb, #595957 72%, #f7f7f2)"
typography:
  display:
    fontFamily: "Sora, Arial, sans-serif"
    fontSize: "clamp(2.75rem, 4.8vw, 4.75rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Sora, Arial, sans-serif"
    fontSize: "clamp(1.25rem, 1.9vw, 1.625rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Source Sans 3, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "0em"
  body:
    fontFamily: "Source Sans 3, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Source Sans 3, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  field: "8px"
  campaign: "9px"
  card: "10px"
  panel: "12px"
  control: "8px"
  circle: "50%"
spacing:
  compact: "14px"
  small: "16px"
  grid: "22px"
  medium: "24px"
  section: "32px"
  gutter: "clamp(20px, 3.4vw, 56px)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "11px 25px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.white}"
  button-soft:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
  tab:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 18px"
  tab-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
  product-photo:
    backgroundColor: "{colors.soft}"
    rounded: "{rounded.field}"
---

# Design System: Katukina

## Overview

**Hero sem overlay, ajuste posterior em 16/11/2026:** mostrar os fundos originais sem camada clara, mantendo os textos e o CTA. Durante a edição local, arquivos em `public/images/home/hero-slider/` são detectados a cada 2 segundos. Composições devem reservar áreas claras atrás do texto.

**Hero vigente em 16/11/2026:** três fundos full rotativos, mantendo título, descrição e CTA atuais. Fotografia avulsa do incenso retirada. Fontes WebP desktop 2400 × 900 px e celular 1080 × 1350 px, em `public/images/home/hero-slider/`; guia de composição e nomes no `LEIA-ME.md`. Até chegarem as artes, o fundo permanece liso. Esta configuração substitui os registros anteriores de hero com produto isolado.

**Ajuste vigente em 16/11/2026:** fundos lisos, sem pattern, conforme pedido posterior de Danilo. Mantidas a paleta oficial e a composição moderna. As referências à introdução do grafismo registram o histórico anterior e não autorizam reaplicá-lo.

**Creative North Star: “Vitrine botânica contemporânea”** — síntese descritiva da direção implementada, sem criar uma nova decisão de marca.

**Paleta oficial reafirmada por Danilo em 16/11/2026:** aplicar urucum `#782E26`, verde folha `#526B35`, branco quente `#F7F7F2`, cinza claro `#D3D4CF`, cinza médio `#595957` e carvão `#292C27` em toda a vitrine, mantendo a identidade xamânica e a estrutura moderna. Esta instrução substitui as cores esmeralda/amarelo/pastéis do primeiro teste Zilly. Branco quente volta a ser o fundo predominante; branco puro permanece disponível nas fotos e superfícies preexistentes. Urucum identifica ações principais; verde folha sustenta navegação e apoio. Fundos lisos, sem pattern, conforme pedido posterior de Danilo. O visual antigo continua preservado.

Documento extraído de `app/modern-storefront.css`, `app/modern-home.css`, `app/globals.css` e dos componentes compartilhados de header e footer. O frontmatter registra os valores vigentes; o sidecar `.impeccable/design.json` registra estados, movimento e breakpoints. Contexto e autorização: `PRODUCT.md` e `docs/katukina/MODERN-STOREFRONT-2026-11-16.md`.

**Key Characteristics:**

- Produtos reconhecíveis, nomes legíveis e preços visíveis.
- Cards leves, controles arredondados e divisórias discretas.
- Densidade comercial nos trilhos, espaço maior em campanhas e introduções.
- Fotografias existentes do WooCommerce e de `public/images/`, reutilizadas sem geração ou modificação de raster nesta reformulação. Recorte, escala e mistura de cor são tratamentos CSS de apresentação; não alteram os arquivos de origem.

## Colors

A seção Conexão Ancestral na home segue a identidade própria da ONG. O guia registra os cinco valores oficiais, os papéis de cada cor, os estados do botão e a grade de fotografias. [Guia da Conexão Ancestral](docs/katukina/CONEXAO-ANCESTRAL.md)

### Primary

Urucum (`primary`) identifica ações principais, incluindo busca e CTA do hero. `primary-hover` escurece o urucum com carvão. Não usar essa cor para decoração ou informações estáticas.

### Secondary

Verde folha (`green`) identifica navegação, foco, seleção e ações de apoio; também sustenta faixa superior e rodapé. `accent` é um alias de `primary` usado pela busca.

### Tertiary

Campanhas usam neutros e misturas de verde folha com branco quente. Fundos lisos mantidos em todas as superfícies; não reaplicar o pattern.

### Neutral

Branco quente é a base. `soft` e `support-soft` separam fotos e superfícies de apoio. `ink` é o texto principal; `muted`, o texto auxiliar. `line` estrutura divisórias; `control-line`, contornos de campos.

**Regra da verdade visual.** Selos, preços anteriores, disponibilidade e avaliações só aparecem quando sustentados pelos dados recebidos. Cores e componentes não autorizam inventar essas informações.

## Typography

Sora, com Arial e sans-serif como alternativas, dá forma aos títulos. Source Sans 3, com as mesmas alternativas, sustenta leitura, nomes de produtos, preços e campos. Pesos usados: regular, semibold e bold. A navegação compartilhada atual usa Source Sans 3; preservar os estilos observados em cada componente.

O papel `display` é o título do hero; `headline`, os títulos de seção da home; `title`, o nome de produto nos trilhos. Os títulos de páginas internas usam uma escala fluida própria (`clamp(2rem, 3.5vw, 3rem)`). O corpo do hero tem medida de leitura limitada (46ch). Números de preços usam algarismos tabulares.

No celular estreito, o título do hero usa (2.7rem); os títulos de seção reduzem para (1.125rem). Não promover a tipografia pequena de metadados a texto de leitura principal.

## Layout

O conteúdo é centralizado, com largura máxima (1440px) e margens fluidas pelo token `gutter`. A home alterna grades e trilhos horizontais. Os trilhos mostram seis produtos em telas largas, cinco até (1200px), três até (800px) e dois até (540px), mantendo rolagem horizontal. Os intervalos passam de (22px) a (20px) e depois (14px).

Categorias usam oito colunas, quatro até (1200px) e duas até (540px). O jornal passa de quatro para duas colunas até (800px), e uma até (540px). O hero mantém texto e foto lado a lado até o empilhamento em (540px). As campanhas iniciais também empilham nesse ponto. Esses arranjos pertencem à home; páginas de operação preservam sua própria estrutura funcional.

O header prioriza marca, busca, conta e carrinho. Até (1200px), o atalho editorial deixa de ocupar espaço; até (800px), busca e ações se reorganizam. O rodapé parte de três áreas, passa a duas e depois a uma; seus grupos de links permanecem compactos. O ajuste extremo em (360px) reduz a marca e distribui links em duas colunas.

## Elevation & Depth

A profundidade vem sobretudo de superfícies claras e contraste de escala. Cards do catálogo permanecem sem sombra e sem elevação no hover. O header tem uma sombra discreta (`0 5px 22px -17px var(--shadow-soft)`); o produto complementar sobreposto ao hero usa uma sombra localizada (`0 14px 30px -14px var(--shadow-soft)`).

Foco visível usa contorno verde (2px) e afastamento (4px); nas áreas verdes do rodapé e da faixa superior, o contorno é branco quente. O foco interno nos cards também destaca a área do produto.

## Shapes

CTAs e abas são retangulares e usam o raio `control` de 8 px. Campos e fotos dos trilhos usam `field`. Cards compartilhados usam `card`, campanhas usam `campaign` e a galeria e o resumo de compra usam `panel`. As fotografias das categorias ficam dentro de círculos.

## Components

### Buttons

CTAs preenchidos usam borda invisível. Os de campanha usam branco quente com texto carvão e passam a carvão com texto branco quente ao interagir. Os principais usam urucum e `primary-hover`. Os de produto da home, da loja e das coleções usam fundo `soft` e texto verde. Os de inscrição usam branco quente e texto verde. Produto e inscrição passam a fundo verde com texto branco quente no hover e no foco por teclado. Links auxiliares de seção usam contorno cinza e botões secundários de formulário usam contorno verde. Todos usam cantos de 8 px.

### Cards / Containers

Os três cards abaixo do hero são categorias, nesta ordem: Rapé, Kuripe & Tepi e Herbal Teas. Recebem fundos WebP 1600 × 900 px em `public/images/home/promotion-cards/`, conforme o `LEIA-ME.md` da pasta. Título e botão são HTML; não inserir texto na arte. Sem arquivo, o fundo fica liso; com arquivo, a foto ocupa o card e recebe escurecimento à esquerda para leitura. Não mostrar preços ou fotos avulsas de produtos nesses três cards.

A foto é separada dos dados por superfície tonal, sem moldura pesada. Produtos usam `object-fit: contain`; imagens editoriais podem usar `cover`. Nome, apresentação quando disponível, preço e ação têm posições consistentes. O zoom de imagem dos trilhos é pequeno (1.045), restrito a ponteiro preciso com hover e desativado com movimento reduzido.

### Inputs / Fields

Campos preservam fonte de leitura, contornos legíveis e foco visível. A barra de busca do cabeçalho tem fundo claro e botão urucum. Ambos são retangulares e usam o raio `field` de 8 px. Mensagens e disponibilidade devem continuar legíveis nos estados reais de erro, vazio ou indisponibilidade.

### Navigation

Header claro e faixa de destino verde folha, sem pattern. A categoria ativa ganha texto verde e sublinhado; o seletor de categorias tem borda fina e formato arredondado. Os painéis preservam fechamento por Escape e retorno do foco ao acionador. Abas de coleções usam seleção verde com texto branco; trilhos mantêm rolagem e controles de navegação.

### Section headings

Títulos das vitrines são acompanhados de uma linha horizontal fina com pequeno segmento verde no início. O link auxiliar fica na extremidade, sem competir com o título. Em telas estreitas, a linha se comprime e o título pode ocupar mais espaço.

## Do's and Don'ts

### Do:

- **Do** usar os tokens vigentes e as famílias tipográficas existentes.
- **Do** preservar identidade, apresentação e proporção reconhecível das fotografias reais.
- **Do** conferir foco, seleção, texto longo e rolagem em telas estreitas.
- **Do** respeitar movimento reduzido e distinguir controles de navegação de CTAs.

### Don't:

- **Don't** reintroduzir esmeralda, amarelo ou campanhas pastel do primeiro teste Zilly; a paleta oficial foi reafirmada.
- **Don't** inventar fotografia de produto, avaliação, desconto ou selo comercial para preencher um card.
- **Don't** transformar todos os cards em superfícies elevadas; o catálogo atual é plano.
- **Don't** tratar a composição específica da home como obrigação para conta, carrinho ou checkout.
