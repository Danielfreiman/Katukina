# Tipografia Katukina

Sistema vigente em 11/11/2026, revisado pelo comando `impeccable typeset` a pedido de Danilo. A aprovação das famílias em 06/11/2026 permanece: **Sora principal e Source Sans 3 de apoio**. O escopo é todo o frontend público Next.js. O tema administrativo WordPress não faz parte desta mudança.

## Famílias e pesos

| Família | Token | Aplicações | Pesos usados |
| --- | --- | --- | --- |
| Sora variável | `--font-display` / `--font-sora` | H1–H6, títulos de seção e campanha, títulos de produtos, navegação principal, `.button`, `.text-link`, assinatura textual histórica | 600 semibold; 700 bold para campanha e ênfase |
| Source Sans 3 variável | `--font-body` / `--font-source-sans` | Corpo, descrições, preços, metadados, formulários e controles de apoio | 400 regular; 600 semibold para controles/valores; 700 bold para ênfase |
| Compatibilidade | `--font` | Alias de `--font-body` usado por componentes existentes | Herdado |

Pesos centralizados: `--weight-regular: 400`, `--weight-semibold: 600`, `--weight-bold: 700`. As declarações de peso 500/550/650/750 foram substituídas pelo papel correspondente. São eixos de fontes variáveis; não há um arquivo separado para cada peso.

Source Sans 3 carrega normal e itálico real para a prosa. Sora carrega normal; `em` dentro de títulos recebe ênfase em bold normal, evitando itálico simulado. Os logotipos SVG e as imagens fornecidas permanecem ativos gráficos próprios.

Removidos do `package.json` e lockfile: Manrope, Inter e Cormorant Garamond. Removida a referência Georgia do CSS histórico. Arial/sans-serif permanece apenas como fallback técnico do sistema, nunca como uma terceira família de marca.

## Escala centralizada

Valores em rem respeitam o tamanho de texto escolhido pelo visitante. Equivalências abaixo consideram a raiz padrão de 16 px.

| Token | rem | px | Papel |
| --- | --- | --- | --- |
| `--text-meta` | .75 | 12 | Estoque, SKU, opções, breadcrumbs, informação auxiliar |
| `--text-ui` | .875 | 14 | Links, filtros, botões, navegação e rótulos compactos |
| `--text-body` | 1 | 16 | Corpo, descrições, campos e nomes de produtos em contexto amplo |
| `--text-lead` | 1.125 | 18 | Introduções e títulos compactos |
| `--text-price` | 1.25 | 20 | Preços de cards e destaques de apoio |
| `--text-card-title` | 1.5 | 24 | Seções compactas e títulos de cards editoriais |
| `--text-subheading` | 1.75 | 28 | Subtítulos e valor principal da compra |
| `--text-heading` | 2 | 32 | Títulos de seção |
| `--text-page-small` | 2.25 | 36 | Títulos intermediários |
| `--text-page` | 2.5 | 40 | Campanhas e páginas |
| `--text-page-large` | 3 | 48 | H1 de páginas amplas |
| `--text-display-small` | 3.5 | 56 | Display histórico |
| `--text-display` | 4 | 64 | Display histórico |
| `--text-display-large` | 5 | 80 | Display histórico |
| `--text-display-max` | 6 | 96 | Limite de display |

A escala não obriga todo H2 a ter a mesma dimensão: seção comercial, chamada de newsletter e card editorial são papéis diferentes. Os mesmos papéis repetidos usam os mesmos tokens. `clamp()` é reservado aos títulos/campanhas e usa limites em rem; detalhes de cada breakpoint ficam no inventário. O texto decorativo histórico em `cqw` e `font-size: 0` do contêiner de logotipo não são conteúdo de leitura.

## Hierarquia por superfície

| Lugar | Família / peso | Escala e comportamento |
| --- | --- | --- |
| Barra superior | Source Sans 3 / 400 | 12 px; aviso breve e seletor de destino |
| Navegação principal | Sora / 600 | 14 px; navegação móvel preserva a adaptação existente |
| Busca e formulários comerciais | Source Sans 3 / 400 | 16 px em campos; rótulos auxiliares em 14 px |
| CTAs `.button` e `.text-link` | Sora / 600 | 14 px, entrelinha 1,45; demais controles herdam Source Sans 3 |
| Campanhas da home | Sora / 700 | 24–40 px conforme largura; cópia de apoio em Source Sans 3 |
| Seções da home | Sora / 600 | Base fluida 24–32 px; chamadas compactas têm token próprio |
| H1 de categorias | Sora / 600 | Fluido 32–48 px; tracking −.025 em |
| Nomes nos cards | Sora / 600 | 16 px no desktop e 14 px nos cards compactos mobile; entrelinha 1,45–1,5; sem truncamento de nomes na home |
| Preços de cards | Source Sans 3 / 600 | 20 px desktop, 18 px no contexto compacto; algarismos tabulares |
| Estoque, opções e SKU | Source Sans 3 / 400 ou 600 conforme papel | Piso de 12 px; contraste preservado |
| Filtros, ordenação e CTA de produto | Source Sans 3 ou Sora conforme classe / 600 | 14 px; controles comerciais de entrada mantêm 16 px |
| Página de produto | Sora / 600 no H1 | Até 48 px desktop; 28–36 px mobile; palavras extensas podem quebrar |
| Descrição de produto | Source Sans 3 / 400 | 16 px, entrelinha 1,75, até 68ch |
| Preço principal de produto | Source Sans 3 / 600 | 28 px; numeração tabular |
| Institucional, jornal e políticas | Sora / 600 nos títulos; Source Sans 3 / 400 na prosa | Prosa 16 px, entrelinha 1,7–1,8, medida 68–70ch |
| Carrinho, conta, entrega, assinatura e checkout | Sora nos títulos; Source Sans 3 em dados/campos | H2 de grupos 24 px; campos 16 px; avisos e rótulos compactos 14 px |
| Cookies e preferências | Sora / 600 nos títulos; Source Sans 3 no texto | Títulos 20/24 px; leitura compacta 14/16 px; ações 14 px |
| Rodapé | Sora / 600 nos títulos; Source Sans 3 em links e leitura | Títulos de grupo 12 px; links 14 px; descrição 16 px; logotipo SVG preservado |
| Erro, vazio e 404 | Sora no título; Source Sans 3 no texto | Herdam os mesmos papéis das páginas normais |

Os tamanhos são papéis contextuais. A lista completa de seletores, regras locais e media queries está em [TYPOGRAPHY-INVENTORY.md](TYPOGRAPHY-INVENTORY.md), gerada diretamente das oito folhas de estilo. O inventário registra declarações; o resultado final depende da cascata e está comprovado pelas amostras computadas no navegador.

## Leitura, quebra e acessibilidade

- Corpo global 16 px / 1,65; prosa de produto/editorial/políticas com medida de 68–70ch. Descrições introdutórias não encolhem no mobile.
- Títulos com entrelinha base 1,2 e tracking −.025 em. Regras contextuais podem variar; nenhuma comprime além de −.04 em.
- Nomes de produtos na home e cards de descoberta não usam mais `line-clamp`; mantêm o nome completo e a quebra natural.
- Nenhum tamanho de texto informativo é inferior a 12 px. Textos utilitários não assumem o tamanho do corpo por serem papéis compactos.
- Preços e totais usam `font-variant-numeric: tabular-nums` para alinhamento de valores.
- Não fixar o tamanho da raiz em px, desabilitar zoom ou usar altura fixa que corte texto. A navegação, o foco e os estados existentes são preservados.

## Carregamento

`app/layout.tsx` usa `next/font/google`, subconjuntos `latin` e `latin-ext` e `display: swap`. O build obtém os arquivos das duas famílias e o frontend os serve em `/_next/static/media/`, com fallback ajustado pelo Next.js. O visitante recebe as fontes pela mesma origem do site. A compilação pode precisar de rede; não há importação de outras famílias no frontend.

## Manutenção e automação

1. Escolher família e papel pela tabela acima.
2. Reutilizar os tokens de `app/globals.css`; não criar tamanhos em px nem fontes isoladas no componente.
3. Conferir regras específicas de `catalog.css`, `reference-home.css`, `category-reference.css`, `privacy.css`, `storefront.css` e `layout-refinement.css` antes de adicionar uma sobrescrita.
4. Executar `node scripts/audit-typography.mjs --write` para atualizar o inventário e conferir famílias, dependências, tamanhos em px e tracking. `node scripts/audit-typography.mjs` somente verifica.
5. Executar `npm.cmd run typecheck` e validar as superfícies afetadas em desktop e mobile, incluindo nomes extensos, controles e ampliação.

`home.css` e regras antigas em `globals.css` estão inventariadas para não reintroduzir estilos divergentes, mas não determinam a home atual, que usa `reference-home.css`. O refinamento opcional de layout permanece habilitado como já estava; os tokens de tipografia independem desse toggle.

## Evidências da revisão

As verificações executadas e suas limitações estão em [TYPESET-2026-11-11.md](TYPESET-2026-11-11.md). Capturas e estilos computados ficam em `output/playwright/typeset-*` e `output/typography-*`. Mudança local, sem publicação em produção.
