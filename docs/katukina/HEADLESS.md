# Estrutura headless Katukina

Versão 0.3 · 2026-10-19. Origem: frontend Next.js confirmado, rebrand e pedido posterior de implementar tudo que fosse possível localmente. Carrinho, cotação, checkout de teste, conta e painel operacional agora estão disponíveis. A cobertura atual e seus limites estão em [OPERATIONS.md](OPERATIONS.md); as seções abaixo sobre a entrega inicial permanecem como histórico quando indicam módulos pendentes.

O intermediário `/api/commerce/{action}` mantém Cart-Token em cookie HttpOnly e encaminha apenas operações permitidas à Store API. Conta usa sessão nativa WordPress por endpoints AJAX específicos. Checkout local cria pedido sem pagamento; valida país, restrições do SKU, aviso versionado e total esperado. Estoque operacional é reservado de forma transacional e só baixado na embalagem. Não existe gateway real homologado.

## Acesso e execução

Atualização de catálogo em 2026-10-27: categorias/busca compartilham filtros de preço/disponibilidade, ordenação, totais e paginação. Produtos têm galeria ampliável, escolha de variação por ID, quantidade, preço/SKU/foto da opção e compra pelo carrinho existente. Dados comerciais continuam autoritativos no WooCommerce; tratamento de falta de estoque e resposta incerta não cria adição automática duplicada. Relacionados usam categorias nativas. [Cobertura e limites](CATALOG-UX-BLUEPRINT.md#9-implementação-autorizada--2026-10-27); testes em `tests/catalog.spec.ts`. O catálogo importado permanece sem estoque disponível; os testes de compra usam produtos temporários, sem modificar esses saldos.

- Site: http://localhost:3001/
- Administração: http://localhost:3001/wp-admin/
- Products nativo: http://localhost:3001/wp-admin/edit.php?post_type=product
- Configurações complementares: http://localhost:3001/wp-admin/admin.php?page=wc-settings&tab=katukina
- Backend interno: `http://127.0.0.1:8888`. A raiz redireciona ao Next.js.

A porta 3000 já pertence a outro servidor; o Next.js deste projeto usa explicitamente 3001. Na raiz:

```powershell
npm.cmd run wp:start
npm.cmd run dev
```

Para verificar: `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build`. O Playwright usa o WordPress real local e o arquivo de acesso ignorado pelo Git; cria dados sintéticos temporários e remove apenas esses registros. O teste de integração depende do Docker ativo. Para produção local, após build, parar o dev e usar `npm.cmd start` na mesma porta.

## Rotas e responsabilidades

| Caminho público | Responsável | Comportamento deste incremento |
| --- | --- | --- |
| `/` | Next.js | Home com catálogo publicado no WooCommerce |
| `/shop`, `/collections`, `/collections/[slug]` | Next.js | Catálogo, busca, categoria e paginação pela Store API |
| `/products/[slug]` | Next.js | Produto renderizado no servidor, metadata, canonical e schema; inexistente/rascunho retorna 404 |
| `/journal`, `/journal/[slug]` | Next.js | Artigos publicados no WordPress |
| `/pages/[slug]` | Next.js | Páginas editoriais publicadas; exclui páginas transacionais nativas do WooCommerce |
| `/about` | Next.js | Apresentação institucional inicial preservando referências do protótipo |
| `/shipping`, `/cart`, `/checkout`, `/account` | Next.js | Estrutura de navegação com indisponibilidade explícita, noindex e sem criação de pedido/pagamento |
| `/sitemap.xml`, `/robots.txt` | Next.js | Sitemap de catálogo/conteúdo publicado; exclusão de rotas administrativas/transacionais |
| `/wp-admin/**`, `/wp-login.php` | WordPress via proxy Next.js | Administração e autenticação nativas no mesmo endereço |
| `/wp-json/**` | WordPress via proxy Next.js | REST WordPress, Store API e APIs administrativas com suas permissões nativas |
| `/wp-content/uploads/**`, `/wp-content/plugins/**`, `/wp-content/themes/**`, `/wp-includes/**` | WordPress via proxy Next.js | Mídias, CSS e scripts necessários ao painel |
| `/wp-cron.php`, `/wc-api/**` | WordPress via proxy Next.js | Infraestrutura WordPress/WooCommerce; não representa gateway implementado |

Não existe proxy genérico de páginas públicas para o WordPress. `xmlrpc.php`, logs e ferramentas locais não estão incluídos nas rotas encaminhadas. A normalização de barras preserva `/wp-admin/`, evitando ciclos de redirecionamento; outras páginas têm URL canônica sem barra final.

## Código e contratos

```text
app/                              páginas públicas, metadata, sitemap e erros
components/site/                  cabeçalho, rodapé, introduções e conteúdo
components/catalog/               catálogo renderizado no servidor
lib/config/site.ts                origem e primeiro canal local Katukina
lib/wordpress/                    cliente HTTP privado e conteúdo editorial
lib/commerce/catalog.ts           contrato de leitura da Store API
next.config.ts + proxy.ts         allowlist do proxy e normalização de URLs
wordpress/plugins/katukina-core/  roteamento headless e registro de módulos
tests/                            verificações públicas e integração real
```

`WORDPRESS_INTERNAL_URL` é somente do servidor Next.js. `NEXT_PUBLIC_SITE_URL` é a origem pública e precisa coincidir com `WP_HOME`, `WP_SITEURL` e `KATUKINA_FRONTEND_URL`. As leituras usam APIs públicas, sem chaves administrativas no browser. O acesso ao painel usa cookies e nonce WordPress; o endpoint de módulos exige `manage_woocommerce`.

Catálogo e conteúdo são renderizados no servidor e lidos sem cache persistente nesta etapa, para refletir edição/despublicação sem valores obsoletos. A home trata indisponibilidade explicitamente; outras páginas usam a fronteira de erro, sem substituir falha por produtos fictícios. O texto editorial é convertido em texto e escapado pelo React; rich text, blocos e previews de rascunho são incrementos posteriores. Preços seguem a resposta do WooCommerce, sem alegar que país, VAT ou moeda comercial já estejam aprovados; ofertas de compra não são anunciadas no schema.

O antigo protótipo (`components/storefront.tsx`, `lib/content.ts`) foi preservado como referência e saiu das rotas ativas. Sua sacola em localStorage e seu catálogo demonstrativo não alimentam a nova vitrine.

O WooCommerce local recebeu [seis exemplos do catálogo público](SAMPLE_CATALOG.md), com fotos na biblioteca e preços observados em USD. Esses cadastros alimentam a vitrine pela API. O sitemap solicita apenas `slug` e `modified` das páginas/artigos, evitando renderizar blocos WooCommerce durante a geração da lista de URLs.

## Limites e próximos incrementos

O rebrand solicitado preserva apenas o grafismo de fundo como referência visual: Manrope local, branco/grafite/verde, novo símbolo e wordmark, hero com produto da API, busca expansível, menu mobile, cards e detalhe de produto com apresentação/origem. Não depende de serviços de fontes externos no navegador. Menu e busca podem ser fechados com Escape, devolvendo foco ao controle que os abriu.

O painel deve ser aberto em `http://localhost:3001/wp-admin/`. Em ambiente local, abrir diretamente `localhost:8888/wp-admin/` ou `/wp-login.php` encaminha para o endereço público antes do formulário. A checagem de proxy somente evita esse redirecionamento de conveniência; não autentica nem concede permissões. Credenciais continuam no arquivo local ignorado `wordpress/.local-access.json`, sem alteração de senha.

O registro do plugin separa módulos disponíveis e planejados. Não há compartilhamento implícito de estoque, empresa ou dados entre Katukina, Sacred Incense e Jungle Powder. Apenas Katukina está configurada neste ambiente. Item mestre, apresentação e lote seguem conceitos distintos a validar; um produto WooCommerce não substitui automaticamente esse modelo.

Próximo incremento comercial: definir contexto mínimo de canal/empresa/destino, autoridade de saldo para o piloto, sessão de carrinho e regras sintéticas de teste; então conectar carrinho e pedido. Em paralelo, detalhar os módulos de inventário, fornecedores, produção e expedição. Gateway real e migração dependem das evidências já registradas. Homologação, CDN, cache por contexto, métricas de produção e backup/restore ainda não foram implementados.

Referências técnicas consultadas: [rewrites do Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites), [barras finais](https://nextjs.org/docs/app/api-reference/config/next-config-js/skipTrailingSlashRedirect), [Store API de produtos](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/products/) e [URLs do WordPress](https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#wp_siteurl). Conferida também a documentação embarcada em `node_modules/next/dist/docs/` para a versão instalada.
