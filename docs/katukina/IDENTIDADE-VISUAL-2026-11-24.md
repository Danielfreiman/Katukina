# Identidade visual Katukina.com na vitrine

**24/11/2026 · CONFIRMADO pelo responsável.** Aplicar o manual fornecido à vitrine pública Next.js e manter as cores individuais das três campanhas da home. A distribuição das assinaturas entre cabeçalho e rodapé foi uma escolha de implementação. A verificação descrita abaixo corresponde ao ambiente local.

## Origem e conferência das artes

| Fonte recebida | SHA-256 |
| --- | --- |
| Katukina_Identidade_Visual.ai | `1C67D237958A8962997445B8596775B667DD4FE55B97EF3A2EA82366DAEEFC3E` |
| Katukina_Identidade_Visual.pdf | `9ACA73C009C96DE03686668B8D6760BC759A5421A711DE33044A4C29ACCB2C4D` |

O PDF está arquivado no projeto. O editável fornecido fica na pasta de origem `IDV/Logotipo/`. As pranchetas 01 a 05 apresentam as variantes, a construção, as proporções, a paleta e a tipografia. As pranchetas 06 e 07 contêm as artes finais. Na extração, os 16 caminhos preenchidos de cada assinatura coincidiram entre AI e PDF, incluindo transformações e cores. [Consultar o manual](design/Katukina_Identidade_Visual.pdf)

## Como aplicar a marca

| Superfície | Aplicação |
| --- | --- |
| Cabeçalho | Assinatura horizontal da prancheta 06, com símbolo à esquerda. O link para a home tem nome acessível “Katukina.com — home”. |
| Rodapé | Assinatura vertical da prancheta 07, com nome centralizado abaixo do símbolo. A composição aproveita a largura da primeira coluna. |
| Favicon | Os quatro contornos do símbolo sobre quadrado branco quente em `app/icon.svg`. |
| Catálogo | O componente `BrandMark` referencia o símbolo bicolor compartilhado nos estados que exibem a marca, incluindo a falha de carregamento da foto. |

Para substituir uma assinatura, exportar a prancheta inteira com fundo transparente e nome em curvas. O símbolo mede 120 × 53 módulos. A margem em cada lado mede 13,25 módulos, um quarto da altura do símbolo. Na horizontal, o intervalo entre símbolo e nome mede 19 módulos. Na vertical, o nome ocupa 80% da largura do símbolo. O lettering usa Sora Bold 700, com “.com” a 57,7% do corpo de “Katukina”, na mesma linha de base. A vitrine dimensiona os SVGs proporcionalmente. [Arquivos e dimensões](ASSETS.md#assinaturas-vigentes-em-24112026)

## Cores e exceções

| Cor | HEX | Uso |
| --- | --- | --- |
| Carvão | `#292C27` | Copa, letras de “Katukina” e texto principal |
| Verde folha | `#526B35` | Base, tronco, sufixo “.com” e navegação |
| Urucum | `#782E26` | Ações principais, como o botão de busca |
| Branco quente | `#F7F7F2` | Fundo de página, cabeçalho, rodapé e respiro |
| Cinza claro | `#D3D4CF` | Divisórias e bordas |
| Cinza médio | `#595957` | Legendas e textos complementares |

O responsável reconfirmou o dourado `#F4AC30` de “natural rhythm.”, o marrom `#582F12` do destaque de “Rapé” e o azul `#80ADDE` de “Sananga”. Na home, o fundo de apoio do Giftshop passou a verde folha, e os textos dos banners de corpo e de campanha usam os tokens de branco quente e carvão. A seção Conexão Ancestral segue a identidade da ONG. [Paleta e estados derivados](PALETTE.md) · [Identidade da ONG](CONEXAO-ANCESTRAL.md)

## Manutenção e validação

Os tokens estão em `app/globals.css`. As aplicações compartilhadas ficam em `app/modern-storefront.css` e as campanhas em `app/modern-home.css`. Os componentes de marca ficam em `components/site/`. As referências para trabalhos futuros estão em [PRODUCT.md](../../PRODUCT.md) e [DESIGN.md](../../DESIGN.md).

Comandos executados na atualização, todos aprovados:

```powershell
npm.cmd run typecheck
npm.cmd run build
node scripts/check-palette.mjs
npx.cmd playwright test tests/reference-home.spec.ts tests/storefront-navigation.spec.ts --timeout=180000
```

A auditoria conferiu os tokens, as cores dos SVGs, as exceções dos títulos e sete combinações de contraste. O texto secundário sobre branco quente atingiu 6,53:1 e o texto do botão principal, 8,81:1. Essas razões se referem a cores sólidas. A leitura dos títulos sobre fotografias depende de cada arte.

Os dois testes Playwright passaram. Na inspeção do cabeçalho e do rodapé em 320, 390 e 1440 px, ambas as assinaturas carregaram na proporção das pranchetas, com fundo computado `rgb(247, 247, 242)` e sem rolagem horizontal na página. O favicon respondeu HTTP 200. Com a foto de produto bloqueada no navegador, o catálogo exibiu o símbolo com contornos de 360 × 159 unidades.
