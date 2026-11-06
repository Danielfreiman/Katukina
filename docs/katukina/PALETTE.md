# Paleta Katukina — urucum, verde folha e neutros

**CONFIRMADO por Danilo em 06/11/2026:** aplicar ao site as cores do arquivo aberto no VS Code, `Katukina_Paleta_e_Aplicacoes.svg`, incluindo suas sugestões de função na interface. Essa orientação substitui a combinação anterior de grafite esverdeado, verde escuro e verde-lima.

Fonte preservada, sem alterações: [SVG de referência](design/Katukina_Paleta_e_Aplicacoes.svg). Formato SVG vetorial, prancheta de 1600 × 1450, 8.460 bytes; SHA-256 `f5fbd7c08c6368c7261f637fa7b3ee22d8acfef0ff89cc0a88f764afcbd3ec7a`. O original veio de `GPT Connnnta Sacred/2026-11-06/pr/outputs/` e permanece intacto.

## Cores aprovadas

| Cor | HEX | RGB | Token primitivo | Aplicação |
| --- | --- | --- | --- | --- |
| Urucum | `#782E26` | 120 / 46 / 38 | `--urucum` | Assinatura, destaque do título da Home, ações principais e promoções |
| Verde folha | `#526B35` | 82 / 107 / 53 | `--leaf` | Navegação ativa, links de apoio, ícones, ações secundárias, seleção e foco |
| Branco quente | `#F7F7F2` | 247 / 247 / 242 | `--warm-white` | Fundo predominante e texto sobre urucum/verde |
| Cinza claro | `#D3D4CF` | 211 / 212 / 207 | `--light-gray` | Divisórias, bordas estruturais e assinatura decorativa do rodapé |
| Cinza médio | `#595957` | 89 / 89 / 87 | `--medium-gray` | Descrições, legendas, placeholders e informações secundárias |
| Carvão | `#292C27` | 41 / 44 / 39 | `--charcoal` | Títulos, preços e conteúdo de leitura |

## Uso no código

A fonte de implementação é o bloco `:root` de `app/globals.css`. `app/catalog.css` e `app/privacy.css` consomem seus tokens; não devem adicionar novos HEX locais para resolver um componente isolado.

| Papel | Token | Origem |
| --- | --- | --- |
| Página e superfícies | `--bg`, `--surface` | Branco quente |
| Texto principal / secundário | `--ink`, `--muted` | Carvão / cinza médio |
| Ação principal / conteúdo claro | `--primary`, `--on-color` | Urucum / branco quente |
| Apoio, seleção e foco | `--green` | Verde folha; nome compatível com os componentes existentes |
| Divisórias | `--line` | Cinza claro |
| Fundo neutro suave | `--soft` | 22% cinza claro + 78% branco quente |
| Fundo de apoio | `--support-soft` | 10% verde folha + 90% branco quente |
| Hover principal / apoio | `--primary-hover`, `--support-hover` | 85% da cor de origem + 15% carvão |
| Contornos de campos | `--control-line` | 72% cinza médio + 28% branco quente |
| Mensagens de erro | `--danger`, `--danger-soft` | Urucum; fundo com 7% urucum + 93% branco quente |
| Sombras e backdrops | `--shadow-soft`, `--overlay`, `--overlay-light` | Carvão com transparência |
| Área de fotografia | `--photo-bg` | Branco puro `#FFFFFF`, para conservar as fotos de produto fornecidas |

As misturas usam `color-mix(in srgb, ...)`; são estados e superfícies derivados, não novas cores da marca. O branco puro é funcional para as fotos, e não substitui o branco quente como fundo geral. O preto nas máscaras CSS controla transparência, sem criar uma cor visível adicional.

## Critérios de aplicação

- Botões principais em urucum, com texto branco quente; hover escurece o próprio urucum. Botões secundários usam contorno/texto verde e preenchimento verde no hover.
- Links de navegação ativos ficam verdes e sublinhados. `aria-current="page"` marca apenas a URL exata; `data-active` também indica a seção em subpáginas, inclusive a loja nas páginas de produto.
- Campos, seletores, seleção de apresentação e foco usam contornos com contraste próprio. Cinza claro é estrutural; não serve para texto, ícone essencial ou contorno que seja a única pista de um controle.
- Aceitar, rejeitar e personalizar cookies mantêm o mesmo peso visual. A nova paleta não privilegia o aceite.
- Não usar o verde-lima nem os antigos fundos beges/esverdeados como cores independentes. Não recolorir fotos ou substituir o grafismo por uma nova ilustração.
- Layout, tipografia, textos, catálogo e regras de compra permanecem no sistema existente. O escopo é a vitrine pública Next.js e seu ícone; o painel nativo WordPress e o banco não recebem alteração de tema.

## Contraste e manutenção

Contrastes calculados em sRGB com as cores finais, antes de transparências de estados desabilitados:

| Combinação | Razão |
| --- | --- |
| Carvão sobre branco quente | 13,17:1 |
| Cinza médio sobre branco quente | 6,53:1 |
| Branco quente sobre urucum | 8,81:1 |
| Branco quente sobre hover urucum | 9,51:1 |
| Verde folha sobre branco quente | 5,56:1 |
| Verde folha sobre fundo de apoio | 4,87:1 |
| Contorno de campo sobre branco quente | 3,43:1 |

`node scripts/check-palette.mjs` confere a correspondência com o SVG, os tokens, os HEX presentes no tema/ícone e essas combinações de contraste. Isso não substitui conferir estilos computados em navegação, hover, foco, formulários e telas responsivas.

## Validação executada em 06/11/2026

- `npm.cmd run typecheck`, `npm.cmd run build` e `node scripts/check-palette.mjs`: aprovados.
- `npx.cmd playwright test tests/storefront.spec.ts`: um teste aprovado, com rotas públicas, SEO, menu móvel, Escape/foco e busca/estado vazio. Não foi repetida a suíte comercial completa, cujo checkout depende das antigas amostras de catálogo.
- Primeira rodada renderizada: Home, `/shop`, produto Palo Santo e `/account` em 1440 × 1000 e 390 × 844, todas HTTP 200 e sem overflow horizontal. Estilos computados confirmaram fundo branco quente, carvão, primários urucum e fotos em branco puro; hover escurecido e foco verde de 2 px conferidos. A seção da loja ficou verde também na página do produto, sem falso `aria-current="page"` nessa subpágina.
- Corrigido na revisão um fundo cinza nativo de `button.text-link` na conta; ele passou a transparente com texto/sublinhado verde. Confirmação final: conta, menu móvel ativo verde/sublinhado, Home móvel com todas as imagens carregadas após rolagem real e preferências de cookies com três ações de peso visual equivalente. Sem novas alterações visuais após essa confirmação.
- Detector Impeccable: um aviso `side-tab` na borda lateral de 3 px do aviso da política de privacidade. Regra preexistente, não introduzida nesta tarefa; preservada para manter o escopo cromático e a estrutura existente. Nenhum outro aviso nos arquivos examinados.
- Capturas, estilos computados e relatórios locais em `artifacts/palette-update/`, fora do Git. A revisão cobriu as amostras e estados descritos, não cada página/produto da loja. Não houve publicação nem mudança de tema administrativo WordPress.
