# Auditoria da vitrine pública · 26/11/2026

**Decisão confirmada pelo responsável após a auditoria.** As cores e o contraste atuais são definitivos. O escopo aprovado é a estrutura e a otimização da navegação da vitrine. A tabela registra as medições na revisão original.

**Implementado no frontend.** As setas reabrem as sugestões de busca. Escape limpa a seleção e Enter envia o termo ao catálogo via navegação do Next.js. Os links de foto da home incluem categoria e produto no nome acessível. O botão de ampliação inclui “Zoom”. A página de inscrição tem H1 próprio, os resultados do catálogo têm H2 e a faixa de entrega e destino tem uma região nomeada.

## Escopo e resultado

Auditoria local sobre a revisão `6ae1835`. O escopo abrangeu navegação, leitura, acessibilidade, responsividade e recursos da vitrine em `localhost:3001`. As notas e prioridades abaixo correspondem ao diagnóstico anterior às correções de navegação.

| Dimensão | Nota de triagem | Evidência principal |
| --- | --- | --- |
| Acessibilidade | 2/4 | Busca aceita seleção oculta, rótulo de zoom diverge do visível e o banner tem baixo contraste |
| Desempenho | 3/4 | Uma textura compartilhada responde por 886.811 bytes no carregamento observado |
| Tema e tipografia | 3/4 | Existem cores e tamanhos compartilhados. Dois componentes concentram as falhas do verificador tipográfico |
| Responsividade | 3/4 | As 17 rotas couberam nas quatro larguras verificadas. Parte do texto do produto não acompanha o aumento da fonte-base |
| Integridade da implementação | 3/4 | Componentes compartilhados mantêm a identidade coerente. Alguns propagam o mesmo erro para vários cards ou páginas |
| **Total** | **14/20** | **Boa base, com três achados de prioridade alta** |

## Correções priorizadas

| Prioridade | Achado confirmado e impacto | Correção proposta e critério de aceite |
| --- | --- | --- |
| P1 · Busca | Com uma sugestão carregada, a sequência Escape, ↓, Enter abriu um produto com a lista invisível e `aria-expanded=false`. O teste usou uma resposta simulada no navegador. | Em `components/site/product-search.tsx:56`, reabrir a lista ao usar as setas e só ativar uma opção visível. Escape seguido diretamente de Enter deve continuar submetendo o texto ao catálogo. |
| P1 · Contraste da home (registro histórico) | “natural rhythm.” usa o dourado aprovado sobre uma área muito clara. Em 9.837 pixels internos das letras, o contraste com o fundo real variou de **1,69 a 1,84 para 1**. Medição no primeiro slide a 1440 px. | Decisão posterior do responsável em 26/11/2026: manter a composição atual. [Critério de contraste usado na auditoria](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) |
| P1 · Comandos por voz | A galeria mostra “Zoom”, mas o botão se apresenta como “Enlarge product image”. Na home, o axe também apontou 40 links de foto que mostram a categoria e usam só o nome do produto como nome acessível. As duas larguras tiveram o mesmo resultado. | Em `components/catalog/product-gallery.tsx:40`, usar um nome como “Zoom product image”. Em `components/home/reference-widgets.tsx:38`, incluir o rótulo visível e o nome do produto. Conferir os nomes na árvore de acessibilidade, a abertura da galeria e os destinos existentes. [Critério de rótulo no nome do W3C](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html) |
| P2 · Conta | Com uma resposta 503 simulada para a leitura da sessão, a tela exibiu o erro e “Loading your account…” ao mesmo tempo. O segundo anúncio dá a entender que ainda há uma operação em andamento. | Em `components/commerce/account.tsx:88`, distinguir carregamento inicial, erro e sessão carregada. Repetir o teste com falha e sucesso. O ajuste cabe na renderização do componente. |
| P2 · Peso do cabeçalho | Na loja e no produto, o navegador carregou `/images/original-background.jpg`, com **886.811 bytes**. O cabeçalho desktop repete essa textura a 400 px. Uma conversão experimental em memória, na mesma resolução, gerou um WebP de **86.966 bytes**, cerca de **90% menor**. | Em `app/globals.css:369`, servir um derivado local para essa superfície. Comparar o padrão, cor, escala e emendas em telas de densidade simples e dupla. Conferir na rede a economia líquida por rota, pois outra superfície pode usar o original. |
| P2 · Tamanho de texto | O verificador registrou **38 declarações** em pixels, 24 em `app/product-reference.css` e 14 em `app/side-cart.css`. Com a fonte raiz duplicada, a trilha do produto permaneceu em 12 px e o título em 31,68 px. O texto da opção acompanhou a preferência e foi de 14 para 28 px. | Começar pela ficha do produto, em `app/product-reference.css:7` e `:62`. Converter para unidades relativas mantendo o tamanho inicial. Depois revisar a sacola em `app/side-cart.css:40`. Validar fonte a 200%, quebra de títulos e preços e o comando `npm.cmd run typography:check`. |
| P2 · Títulos de navegação | Em `/subscribe`, “Email updates” é um H2 e a página não tem H1. Na loja a 390 px, a barra lateral sai da árvore acessível e o primeiro título de produto passa de H1 diretamente para H3. Isso dificulta navegar pela lista de títulos. | Dar um H1 à página de inscrição, mantendo o H2 da inscrição embutida na ficha. Na loja, identificar os resultados com um H2 antes dos cards, inclusive no celular. Conferir a ordem em `app/subscribe/page.tsx:9`, `components/commerce/subscription.tsx:34` e `components/catalog/product-grid.tsx:71`. |
| P3 · Cabeçalho | No desktop, a faixa com destino e entrega está fora das regiões semânticas da página. O axe repetiu o aviso `region` nas páginas com esse cabeçalho. | Em `components/site/header.tsx:53`, agrupar a faixa numa região identificada, mantendo posição, foco e comportamento do seletor de destino. |

**Contagem por causa, sem duplicar por página ou largura:** nenhum bloqueio P0 confirmado no escopo exercitado, três P1, quatro P2 e um P3.

## Verificações e limites

- Chromium via Playwright em **320, 390, 768 e 1440 px**. Rotas verificadas: home, loja, busca vazia, índice de coleções, coleção Visionary Art, produto Shipibo Embroidery, conta deslogada, sacola e checkout vazios, inscrição, entrega, Journal e artigo, história, privacidade, cookies e 404. A largura do documento coube na viewport nas 68 combinações. A página 404 respondeu com o status esperado.
- O axe-core 4.14.1 foi executado a 390 e 1440 px em 12 rotas representativas. A triagem incluiu contraste sobre a imagem real, navegação por teclado e estados simulados que o scanner sozinho não exercita.
- O gesto de toque sintetizado no Chromium móvel avançou o banner de 01 para 02. Escape fechou o menu mobile e o diálogo de filtros e devolveu o foco aos respectivos botões. As fotos da loja e da galeria verificadas após o carregamento tinham dimensões naturais válidas.
- `npm.cmd run typecheck` passou. `npm.cmd run typography:check` falhou nas 38 declarações descritas. O detector Impeccable encontrou 147 avisos de estilo, incluindo valores históricos e exceções visuais aprovadas. Esses avisos isolados não foram somados como defeitos.
- **A VALIDAR.** Inscrição e entrega devolveram HTTP 500 na primeira passagem concorrente e HTTP 200 nas verificações sequenciais. A causa não foi estabelecida. Registrar a recorrência em uma sessão isolada antes de atribuir uma correção ao frontend.
- Os testes usaram o ambiente local de desenvolvimento. Produção, métricas reais de usuários, Safari/iOS físico, leitor de tela, conta autenticada e checkout com itens ficaram fora da medição. As simulações ocorreram no navegador. Não houve envio de formulários comerciais nem alteração de WordPress, WooCommerce, produtos, pedidos ou estoque.

## Verificação das correções de navegação

Typecheck, build de produção e cinco testes Playwright de busca, navegação e produto passaram. O teste de Escape seguido de Enter também confirmou que a busca abre os resultados no mesmo documento do navegador. O axe-core 4.14.1 verificou nomes acessíveis, ordem de títulos, presença de H1 e regiões de navegação na home, loja, inscrição e produto Shipibo Embroidery. As quatro regras passaram a 390 e 1440 px.

### Continuidade da navegação no catálogo

Na loja e nas coleções, a busca lateral, a ordenação e a quantidade de itens por página usam navegação do Next.js. Refinar uma consulta preserva os critérios ativos na URL e reinicia a paginação. Os links de página apontam para a seção de resultados.

No teste móvel a 390 px, aplicar uma busca fechou os filtros e preservou os sete parâmetros da URL inicial. Voltar e Avançar restauraram o termo de busca correspondente em cada entrada do histórico.
