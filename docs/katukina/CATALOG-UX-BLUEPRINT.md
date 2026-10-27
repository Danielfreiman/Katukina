# Categorias e produtos — esquema de implementação

Data: 2026-10-27. Origem: pedido de engenharia reversa da categoria Bath & Personal Care da iHerb e de sua estrutura de produtos.

**Entrega inicial:** análise pública, auditoria local, wireframes e plano implementável. **CONFIRMADO:** o responsável autorizou a implementação em seguida com “implemente”. O esquema abaixo preserva o planejamento; a cobertura executada está na seção 9. A base permanece WordPress/WooCommerce + Next.js.

[Abrir wireframe interativo](CATALOG-WIREFRAMES.html): alternar Category/Product e Desktop/Mobile. É um arquivo independente, sem chamadas ao backend, com conteúdo ilustrativo em inglês. A documentação permanece em português.

## 1. Evidência e limites da referência

Na [categoria pública da iHerb](https://br.iherb.com/c/bath-personal-care), o HTML indexado apresenta busca, conta/carrinho, departamentos, título, subcategorias, filtros, ordenação, contagem, cartões e paginação. Os cartões combinam imagem, nome/apresentação, preço, avaliações e ações. Esses elementos orientam a descoberta e o refinamento do catálogo.

Na [página pública do produto XyliWhite](https://ml.iherb.com/pr/now-foods-solutions-xyliwhite-toothpaste-gel-refreshmint-6-4-oz-181-g/885), o conteúdo indexado apresenta imagens, opções de sabor/quantidade, avaliações, especificações, descrição e categorias relacionadas. O princípio útil é separar escolha da apresentação, informação do produto e descoberta de alternativas.

Consulta em 2026-10-27. A navegação automatizada direta recebeu HTTP 403/desafio de segurança. O conteúdo indexado varia em idade e região; a referência de produto retornou outra região. Não foram confirmados posicionamento exato, comportamento de hover, versão móvel, checkout nem arquitetura interna da iHerb. Dimensões e interações a seguir são **propostas Katukina**, não uma reprodução visual medida. Preços, estoque, textos comerciais, imagens e identidade da iHerb não serão importados.

## 2. Auditoria do Katukina

| Área | CONFIRMADO no código/API local | Trabalho proposto |
| --- | --- | --- |
| Categoria | `/collections/[slug]` tem título, descrição, grade e paginação anterior/próxima | Hierarquia, subcategorias, filtros, ordenação e paginação numerada |
| Busca | `/shop` aceita busca e lista categorias | Compartilhar o mesmo mecanismo de filtros e cartões com as categorias |
| Cartão | Imagem principal, nome, categoria, preço e descrição | Hierarquia visual compacta, disponibilidade e ação adequada ao tipo |
| Produto | `/products/[slug]` mostra somente a primeira imagem | Galeria navegável, seleção de apresentação e quantidade |
| Compra | `AddToCart` aceita simples; variável mostra “Choose a presentation”, sem seletor | Resolver a variação e enviar seu ID ao carrinho existente |
| Mídia | WooCommerce já tem capas, galerias e fotos das variações, inclusive as editadas | Reutilizar as imagens nativas e seus textos alternativos |
| Atributos | `Presentation` é atributo local de produto; endpoint de atributos globais retornou `[]` | Não oferecer filtros globais de formato/origem sem normalização |
| Disponibilidade | Agregação local: 370 produtos sem estoque, zero em estoque e zero sob encomenda | Filtro “In stock” desligado por padrão; respeitar indisponibilidade |

Evidências de código: [catálogo](../../lib/commerce/catalog.ts), [categoria](../../app/collections/[slug]/page.tsx), [produto](../../app/products/[slug]/page.tsx), [grade](../../components/catalog/product-grid.tsx), [compra](../../components/commerce/add-to-cart.tsx), [BFF do carrinho](../../app/api/commerce/[action]/route.ts).

Consultas GET locais executadas em 2026-10-27 contra `/wp-json/wc/store/v1`:

- `/products?slug=emburana-bark`: pai 403, variável, 11 opções, 15 imagens, USD; `is_in_stock=false` apesar de `is_purchasable=true`.
- `/products?type=variation&parent=403&per_page=100`: 11 filhos; os objetos consultados têm `attributes=[]`. O mapa de opções está em `variations[].attributes` do pai. **Unir por ID**, sem deduzir apresentação pelo nome/SKU.
- `/products/collection-data?calculate_price_range=true&calculate_stock_status_counts=true`: intervalo 53–23759 em unidades menores de USD, contagens acima. Valores são evidência do ambiente, não parâmetros fixos da interface.
- `/products/attributes`: nenhum atributo global cadastrado.

**LEGADO OBSERVADO:** conceitos Item, apresentação/SKU e lote continuam separados. **A VALIDAR:** taxonomia editorial, atributos globais, avaliações publicáveis e regras de entrega. **BLOQUEADO apenas para comparação visual fiel:** acesso ao vivo à referência; isso não bloqueia o esquema ou a implementação local.

## 3. Estrutura das páginas

### Categoria — descoberta e refinamento

```text
Logo Katukina | Busca de produtos                 | Account | Cart
Navegação das categorias
Home > Shop > Categoria
Título da categoria + introdução curta
Subcategorias: [imagem/nome] [imagem/nome] [imagem/nome]
---------------------------------------------------------------
Filtros                  | Total de resultados | Sort by
  Subcategoria           | Filtros ativos removíveis | Clear all
  Price                  | [Produto] [Produto] [Produto]
  In stock               | [Produto] [Produto] [Produto]
                         | Paginação numerada
---------------------------------------------------------------
Texto editorial opcional da categoria | Footer existente
```

Proposta desktop: largura máxima de conteúdo de aproximadamente 1440 px, coluna de filtros de 240 px e grade de 3–4 colunas conforme espaço. Reutilizar fontes, cores, cabeçalho e rodapé Katukina. Subcategorias sem imagem continuam com nome; não inventar categorias a partir da referência.

Proposta móvel: uma coluna estrutural; grade de duas colunas quando legível, uma em larguras menores. Botões “Filters” e “Sort”; filtros em diálogo com aplicar/limpar, contagem e foco restaurado ao fechar. Alterações dentro do diálogo só entram na URL ao aplicar. Paginação permanece navegável e preserva filtros. Não adotar rolagem infinita na primeira etapa.

Cartão: imagem quadrada sem cortar o produto (`contain`), nome, faixa/preço na moeda da API e disponibilidade. Para variável: “Choose options” abre o produto; para simples disponível: “Add to cart”; para indisponível: “View product” e indicação de estoque. Links de imagem/nome separados dos botões, sem controles interativos aninhados. Avaliações, promoções e selos aparecem somente com dados reais e significado definido.

### Produto — apresentação correta antes da compra

```text
Cabeçalho comum + breadcrumb de categoria
---------------------------------------------------------------
Miniaturas | Foto ampliada | Nome + resumo
           |               | Preço/faixa em USD
           |               | Presentation [opções reais]
           |               | SKU + disponibilidade da opção
           |               | Quantity [- 1 +]
           |               | Add to cart / Out of stock
---------------------------------------------------------------
Description | Product details | Reviews (se houver dados)
Produtos relacionados por categoria
Footer existente
```

Proposta desktop: duas colunas principais, galeria e painel de compra; resumo de compra pode permanecer visível ao rolar, sem cobrir conteúdo. No móvel: título, galeria, preço, opções, quantidade, ação e detalhes em sequência. A barra fixa móvel de compra é evolução opcional, após verificar teclado virtual, foco e sobreposição.

Galeria: miniaturas, imagem selecionada, anterior/próxima e ampliação em diálogo acessível. Ao escolher uma variação, mostrar sua foto quando existir, preservando acesso às demais imagens. Sem imagem da opção, usar capa do pai. Manter proporção e espaço reservado para evitar saltos de layout.

As opções iniciais usam exatamente o atributo `Presentation` cadastrado, por exemplo uma única opção composta de formato e peso. Não separar automaticamente em “Weight” e “Form”: isso exigiria mapeamento editorial validado. Uma futura matriz de atributos deve rejeitar combinações inexistentes.

Descrição e especificações usam campos publicados no WooCommerce. Origem, botânica, ingredientes e cuidados só aparecem quando cadastrados e revisados. Não extrair recomendações de uso de nomes ou criar alegações. Avaliações e produtos relacionados são módulos posteriores; não preencher estrelas, contadores ou descontos fictícios.

## 4. Contratos de navegação e dados

### URLs compartilháveis

Preservar `/shop`, `/collections/[slug]` e `/products/[slug]`. Exemplo **proposto**, não rota nova já funcional:

```text
/collections/{slug}?min_price=5.00&max_price=30.00&stock=instock&sort=price-asc&page=2
/shop?q=incense&category={slug}&sort=newest
/products/emburana-bark?variation={id}
```

O parser aceita uma lista fechada: `q`, `category` em busca, `min_price`, `max_price`, `stock`, `sort`, `page`. Preço na URL é decimal na moeda corrente; converter para inteiros em unidades menores sem aritmética imprecisa. Validar mínimo não negativo, máximo ≥ mínimo, página positiva e limite de busca. Remover parâmetros inválidos ou mostrar erro legível, sem repassar argumentos arbitrários ao WordPress. Ao trocar busca/filtro/ordenação, voltar à página 1. Voltar/avançar no navegador restaura o estado. Variação por URL deve pertencer ao produto e estar publicada; valor inválido volta à seleção sem escolher outro SKU silenciosamente.

Primeiras ordenações: `name-asc`, `price-asc`, `price-desc`, `newest`. A padrão proposta é `name-asc`, identificada como “Name: A–Z”; não chamar de “Recommended” sem regra de recomendação. Preço de variável exige teste de contrato para confirmar como a API ordena faixas. Categoria da rota limita o universo; subcategoria navega para sua própria rota. Filtros diferentes combinam com AND.

### Fonte autoritativa e chamadas

| Informação | Fonte e tratamento proposto |
| --- | --- |
| Categorias/hierarquia | Store API `/products/categories`; ampliar tipo com `parent` e imagem quando fornecidos; construir árvore por ID |
| Resultados | `/products` com categoria, busca, preço, disponibilidade, ordenação e paginação validados |
| Contagens/intervalos | `/products/collection-data` com o mesmo universo filtrado, ignorando paginação; nunca contar apenas os cartões da página |
| Produto e galeria | `/products?slug=...`; campos públicos nativos |
| Apresentações | Mapa `variations` do pai + filhos de `/products?type=variation&parent=...`, paginados; junção por ID |
| Preço/SKU/foto/estoque | Filho selecionado; faixa do pai antes da seleção. Conferir limites de quantidade expostos pela API |
| Carrinho | BFF existente `/api/commerce/add`, sessão Cart-Token em cookie HttpOnly; confirmar contrato de adição por ID da variação em teste |
| Entrega/restrição | Backend existente no contexto de destino/checkout; não prometer tarifa ou prazo no produto sem consulta validada |

As APIs públicas de [produtos](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/products/) e [agregações](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/product-collection-data/) suportam a base dessa proposta. A [API de carrinho](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/cart/) requer a sessão/token apropriado para mutações. A documentação upstream não substitui os testes contra a versão instalada.

Na primeira versão, contagens refletem todos os filtros ativos. Para contagens que excluam o próprio filtro, será necessário consultar cada universo sem esse filtro; não apresentar esse comportamento como nativo já validado. Filtro global de formato/origem depende de atributos globais normalizados e associação aos produtos, sem alterar os IDs de variação ou suas apresentações atuais.

WooCommerce continua responsável por produto, variação, mídia, preço e disponibilidade comercial; o serviço operacional existente continua responsável por reservas e movimentos. Abrir página, escolher opção ou filtrar não reserva nem baixa estoque. A mutação de carrinho/checkout deve revalidar preço, quantidade e restrições; a leitura da página pode estar desatualizada.

### Estados e erros

```text
Produto variável aberto → aguardando seleção → opção resolvida
    → indisponível: informa motivo e impede compra
    → disponível: quantidade válida → enviando → carrinho atualizado
                                             → erro/revalidação
```

- Resolver todos os atributos de uma opção antes de habilitar a compra. `is_purchasable` sozinho não garante estoque. Backorders seguem apenas configuração real da API, quando homologados.
- Ao trocar opção, recalcular preço, imagem, SKU, limite de quantidade e disponibilidade; respostas antigas não podem sobrescrever a seleção nova.
- Durante envio, impedir clique repetido. Não repetir automaticamente uma adição após timeout: ela pode já ter sido aplicada. Consultar o carrinho e oferecer reconciliação/retry explícito. Isso não substitui idempotência de checkout/reserva já existente.
- Categoria vazia: “No products found” e limpar filtros. Falha de API: mensagem de indisponibilidade e tentar novamente; não tratar falha como catálogo vazio ou produto inexistente.
- Produto/slug inexistente: 404. Página além da última: recuperar para página válida preservando os filtros. Não exibir rascunhos.

## 5. Componentes e limites de implementação

```text
CategoryPage / ShopPage (servidor: URL, categorias, resultados, metadados)
  Breadcrumbs → CategoryIntro → SubcategoryGrid
  CatalogToolbar → FilterPanel / MobileFilterDialog
  ActiveFilters → ProductGrid → ProductCard → Pagination

ProductPage (servidor: produto, mapa de variações, metadados)
  Breadcrumbs
  ProductGallery (cliente: seleção/ampliação)
  ProductPurchasePanel (cliente: opções/quantidade/estado da compra)
    VariationSelector → Price → Availability → AddToCart existente
  ProductDetails → RelatedProducts → Reviews (etapa posterior)
```

Ampliar `lib/commerce/catalog.ts` e criar um parser de consultas compartilhado. Componentes de dados e HTML inicial permanecem no servidor; apenas interações necessárias viram componentes cliente. Atualmente o cliente WordPress usa `no-store`; qualquer cache futuro precisa separar catálogo público de sessão e definir invalidação por alteração de produto. Não colocar carrinho, destino ou preço personalizado em cache público.

Não criar painel paralelo. Cadastros permanecem em Products/Variations, Categories, Attributes e Media nativos. Campos editoriais extras, se necessários, ampliam esses editores. Administrador/editor mantém dados; visitante navega; servidor valida compra. Somente campos públicos entram nas respostas — sem metadados de fornecedor, custos, importação, estoque interno ou credenciais.

Não criar agora contratos fictícios de multi-site, moeda ou transportadora para preencher a interface. A moeda vem da API atual (USD). Publicação por canal e Sendcloud permanecem com o status registrado em [FUNCTIONAL-COVERAGE.md](FUNCTIONAL-COVERAGE.md).

## 6. Acessibilidade, SEO e desempenho

- Labels em inglês, controles nativos quando possível, foco visível, teclado em filtros/galeria e aviso de alteração de preço/carrinho. Diálogos contêm foco, fecham com Escape e devolvem foco ao acionador. Não comunicar disponibilidade só por cor.
- HTML inicial com produto/lista, H1 único, breadcrumbs e links navegáveis. Manter URLs e canonicals existentes na primeira etapa. Busca/filtros não geram automaticamente páginas indexáveis. Rever separadamente a política atual de paginação `noindex,follow`, sem transformar cada combinação em landing page.
- JSON-LD deve refletir conteúdo visível: produto e breadcrumbs; ofertas/variações somente com preço, moeda e disponibilidade coerentes. Nenhuma avaliação agregada sem avaliações reais. Não liberar indexação do ambiente de teste nesta mudança.
- Carregar imagem principal prioritariamente e demais sob demanda, tamanhos adequados e dimensões reservadas. Não baixar a galeria inteira em resolução máxima na abertura. Carregar filhos por produto, nunca N consultas por cartão.
- Meta de projeto, não medição atual: ausência de overflow em 360/390/768/1440 px; medir LCP/CLS e peso de imagens com catálogo real antes/depois. Um ensaio local não comprova métricas de produção.

## 7. Etapas e aceite

| Etapa proposta | Entrega | Critério de saída |
| --- | --- | --- |
| 1. Contrato de dados | Tipos, junção pai/filho, consultas e parser | IDs/opções/preços conferem com Woo; variação estrangeira e parâmetros inválidos tratados |
| 2. Produto | Galeria, apresentações, quantidade e compra | Opção selecionada altera foto/preço/SKU; SKU correto no carrinho; indisponível não compra |
| 3. Categoria/busca | Subcategorias, filtros, sort, cartões e paginação compartilhados | URL reproduz resultados; totais globais corretos; filtros funcionam também no móvel |
| 4. Conteúdo e acabamento | Detalhes, relacionados, SEO/acessibilidade e imagens | Campos publicados corretos, sem conteúdo inventado; navegação por teclado e dimensões validadas |
| 5. Evoluções condicionais | Atributos globais, reviews, entrega no produto | Somente após dados, regras e contratos correspondentes estarem validados |

Testes para implementação: `npm.cmd run typecheck`, build e Playwright conforme impacto. Cobrir simples e variável com fixture de estoque controlada; catálogo real indisponível; variante sem foto; combinação inválida; mudança rápida de seleção; quantidade inválida; preço/estoque alterado após leitura; falha/timeout na adição; filtro sem resultados; voltar/avançar; paginação; deep link; teclado e móvel. Não mudar estoque do catálogo inteiro para fazer o teste passar.

As etapas são incrementais e reversíveis: manter rotas/IDs, separar componentes e não migrar produtos nesta entrega. Se a futura interface precisar ser revertida, reverter apenas seu código; não restaurar banco sobre pedidos novos. Alterações editoriais futuras exigem manifesto e backup próprios.

## 8. Registro de validação desta entrega

Executados: leitura do código, consultas GET locais de produto/variações/atributos/agregações, consulta de documentação oficial e HTML público indexado. A tentativa de navegação ao vivo da iHerb ficou bloqueada pelo desafio de segurança.

Wireframe conferido com Playwright/Chromium: alternância categoria/produto e desktop/móvel, seleção A/B e retorno à seleção vazia, ausência de erros JavaScript e de overflow horizontal nas duas páginas em desktop, quadro móvel de 390 px e viewport de 360 px. A primeira execução encontrou uma tag `option` malformada; corrigida, a execução completa passou. Capturas locais em `artifacts/catalog-blueprint/`, com revisão visual de produto desktop e categoria móvel. Não foi necessário build/typecheck da aplicação, cujo código não foi alterado.

Na entrega inicial do esquema não houve mudança de aplicação, produtos, estoque, pedidos ou configuração comercial. A implementação autorizada posteriormente está registrada abaixo.

## 9. Implementação autorizada — 2026-10-27

**CONFIRMADO no código:** etapas 1–4 implementadas para os contratos presentes no catálogo local.

- `/shop` e `/collections/[slug]` compartilham busca, filtro de categoria (na busca), preço, disponibilidade, ordenação, totais e paginação numerada. Formulários GET preservam filtros na URL e reiniciam a paginação. Subcategorias usam a hierarquia nativa; a árvore local atual é plana. No móvel, filtros abrem em diálogo com Escape e devolução de foco.
- `/products/[slug]` apresenta galeria, miniaturas, ampliação, seletor de apresentação, quantidade e dados do SKU. Variações explícitas são unidas por ID; URL aceita `variation`, recarga e histórico restauram a opção. Rascunhos e IDs de outros produtos não selecionam uma opção vendável. Foto ausente da variação usa a capa do pai.
- Carrinho mantém o BFF e token existentes. O pedido de adição leva ID da variação e quantidade; WooCommerce revalida preço e disponibilidade. Falha de rede/5xx não repete o POST automaticamente; consulta o carrinho e orienta conferência antes de nova tentativa. Abrir páginas ou selecionar opções não cria reserva/baixa física.
- Cartões compartilhados, detalhes públicos, relacionados por categoria, breadcrumbs, canonicals e noindex das combinações de filtros. Identidade Katukina e idioma inglês preservados. Imagens usam tamanhos responsivos e tratamento de erro; algumas referências antigas apontam para arquivos ausentes. Upload inexistente agora responde 404, evitando redirecionamento incorreto à home, e a interface mostra “Image unavailable”. Não foram alterados os anexos nem os produtos para esconder essa ausência.
- Recuperação da fronteira de erro usa `retry()` da versão Next.js instalada para refazer a consulta, conforme a documentação local.

**Limites explícitos:** não foram criadas avaliações fictícias, novas taxonomias, preços por destino nem integração de entrega no produto. Reviews, atributos globais de formato/origem e cotação no produto continuam condicionais. O seletor cobre combinações explicitamente cadastradas; variações com atributo curinga (“Any…”) exigem resolução adicional e não são oferecidas como uma escolha inferida. Não foi alterado estoque comercial, preço ou moeda dos produtos existentes.

**Verificações:** typecheck, build e sintaxe PHP de `Headless.php` aprovados. Playwright cobre parser monetário, filtros/API, paginação/histórico, diálogos, variações nativas, adição simples/variável, quantidade, atualização de preço/estoque após leitura e resposta perdida sem POST repetido. Fixtures são criadas em categorias/produtos temporários e removidas após o teste; resultado final da execução conjunta no changelog. Revisão visual em 1440 e 390 px; verificações de largura em 1440/768/390/360 px. Não há medição de desempenho em produção nem homologação comercial nesta entrega.


## 10. Revisão: Grocery, categorias em lista e swatches — 2026-10-27

**CONFIRMADO:** o responsável pediu swatches para Presentation, categorias em lista de links e nova comparação com [Grocery da iHerb](https://br.iherb.com/c/grocery). Esta revisão substitui o dropdown de categoria e a grade expansível da primeira implementação. A identidade visual Katukina e o idioma inglês continuam vigentes.

**OBSERVADO na referência pública indexada:** lista hierárquica de categorias com contagens e expansão, filtros por marca/preço/avaliação/ofertas, ordenação, cartões com opções e avaliações, paginação e produtos vistos recentemente. O navegador ao vivo recebeu HTTP 403/Cloudflare; não houve inspeção visual confiável do layout atual ou do comportamento móvel da referência.

**Implementado:**

- Categorias ficam visíveis na lateral, com links, contagens nativas, categoria atual, ancestrais e filhos. Folhas mostram categorias irmãs; listas longas têm “more categories”. No celular, a mesma lista aparece no diálogo de filtros. A troca de categoria preserva busca/filtros/ordenação e volta à primeira página.
- Presentation usa swatches de texto com radios nativos, preço por opção, indicação textual de indisponibilidade, foco e seleção visíveis. Setas do teclado alternam opções; “Clear selection” limpa a escolha. Preço, foto, SKU, quantidade, URL, histórico e carrinho continuam vinculados ao ID real. Opções sem estoque podem ser consultadas, mas não compradas.
- Seções de filtro recolhíveis, faixas de preço em moeda nativa, filtros rápidos por estoque/oferta/avaliação e marcas pesquisáveis quando existirem termos publicados. Marcas não são inferidas do nome do produto. Filtros continuam em GET e preservam valores na ordenação/paginação.
- Ordenação adicional por vendas e avaliação usa `popularity`/`rating` da Store API. Quantidade de resultados: 12, 24 ou 48. Grade com quatro colunas no desktop amplo, duas no celular e cartões com quantidade de apresentações; nota/contagem de avaliações e oferta aparecem apenas quando informadas pela API. Preço anterior é mostrado para produto simples com desconto real.
- Histórico local de até oito produtos consultados, com limpeza explícita. Somente IDs públicos ficam no navegador; a lista busca novamente os produtos publicados e seus preços atuais. Não envia histórico a um serviço externo, não armazena dados do cliente e funciona sem obrigar disponibilidade de localStorage.

**Contratos:** `sale=yes` → `on_sale=true`; `rating=N` → notas N até 5; `brand=slug`; `per_page` limitado a 12/24/48. Valores fora da lista são ignorados; marca inexistente gera aviso. Parâmetros monetários mantêm conversão decimal exata. Referência técnica: [Products Store API](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/products/).

**Limites observados:** a base local não possui marcas, ofertas ou produtos avaliados na consulta anterior às fixtures. Por isso marcas e metadados correspondentes ficam ausentes; os filtros podem retornar lista vazia. Não foram criados selos de certificação, números de vendas, avaliações, promoções, benefícios de assinatura, conteúdo editorial, prazos ou frete grátis para imitar a referência. Filtros de atributos globais, feed completo de reviews e cotação de entrega na página de produto permanecem pendentes de seus contratos/dados. Contagens de categoria são as contagens gerais da taxonomia, não contagens recalculadas para cada combinação de filtros.

**Validação desta revisão:** typecheck e build aprovados. Execução conjunta `npx.cmd playwright test tests/catalog.spec.ts tests/storefront.spec.ts --workers=1`: quatro testes aprovados em 1,8 minuto. Cobertura adicional: categorias em links/expansão, 24 itens por página, histórico e limpeza, oferta real em fixture, preço anterior, swatches por teclado, recarga e retorno no histórico. Regressões cobrem filtros/API, carrinho simples/variável, estoque/preço alterados e resposta perdida. Capturas de categoria/produto e filtros móveis revisadas em `artifacts/catalog-grocery/` (ignoradas pelo Git); ausência de overflow em 1440/768/390/360 px. A primeira execução falhou apenas no teste que procurava o texto anterior do botão após expandir as categorias; o seletor foi corrigido. Marcas e avaliações têm contrato de consulta validado, mas a renderização com dados reais desses dois tipos ainda depende de cadastro; a base atual não os contém.
