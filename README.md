# Katukina — plataforma headless

Site público em Next.js App Router, React e TypeScript, com WordPress + WooCommerce como backend. Rebrand clean em branco, grafite e verde, tipografia Manrope e grafismo original aplicado discretamente. Catálogo, categorias, artigos e páginas publicados no WordPress alimentam o frontend renderizado no servidor.

Carrinho, cupons, cálculo de entrega, conta do cliente e checkout local sem cobrança usam APIs WooCommerce/WordPress. A administração usa Products/Variations, Orders, Users, Settings e Analytics nativos. Campos e operações adicionais ampliam essas áreas; não há painel ou catálogo paralelo. Consulte a [cobertura e instruções](docs/katukina/OPERATIONS.md). Sendcloud, HS integrado, publicação por site e outros requisitos ainda têm implementação pendente, conforme a [auditoria funcional](docs/katukina/FUNCTIONAL-COVERAGE.md).

## Diretrizes e discovery

As referências fornecidas em 19/10/2026 foram integradas ao projeto. Consulte o [discovery Katukina](docs/katukina/README.md) para a auditoria local, requisitos rastreáveis, propostas de arquitetura e plano de migração. A [skill Katukina Architecture](skills/katukina-architecture/SKILL.md) orienta o trabalho, com entrada em [AGENTS.md](AGENTS.md).

WordPress + WooCommerce e Next.js como frontend público exclusivo foram confirmados pelo responsável. O [mapa headless](docs/katukina/HEADLESS.md) descreve rotas, contratos, módulos e limites implementados. Infraestrutura remota e topologia multi-site continuam propostas; a ausência do legado limita a migração, sem impedir o desenvolvimento da base nova.

## Instalar em outro computador

O [guia de instalação local](docs/katukina/LOCAL-SETUP.md) explica pré-requisitos, acesso, atualização, testes e persistência. Instale Git, Node.js >=24.18, npm >=11.16 e Docker com Compose; deixe o Docker em execução. No PowerShell:

```powershell
git clone https://github.com/Danielfreiman/Katukina.git
cd Katukina
npm.cmd ci
npm.cmd --prefix wordpress ci
npm.cmd run setup:local
npm.cmd run dev
```

No macOS/Linux, use `npm` em vez de `npm.cmd`. O setup prepara WordPress/WooCommerce, acesso administrativo, seis produtos com fotos e checkout fictício. O banco de outro computador não acompanha o Git.

**Acesso público de demonstração para instalações novas:** usuário `admin`, senha `Katukina-Local-Test-Only-2026!`. O arquivo efetivo `wordpress/.local-access.json` é preservado se já existir. **ESTE AMBIENTE SÓ PODE SER PUBLICADO APÓS A ROTAÇÃO DAS CREDENCIAIS**, incluindo acesso administrativo, banco, chaves e salts. A senha acima é conhecida e exclusiva para teste local; ver [orientação completa](docs/katukina/LOCAL-SETUP.md#credenciais-públicas-de-demonstração).

## WordPress + WooCommerce local

Site e administração no mesmo endereço: [site Next.js](http://localhost:3001/), [painel WordPress](http://localhost:3001/wp-admin/) e [Products](http://localhost:3001/wp-admin/edit.php?post_type=product). Após a primeira instalação, com o Docker Desktop aberto:

```powershell
npm.cmd run wp:start
npm.cmd run dev
```

O Next.js usa explicitamente 3001 porque 3000 já pertence a outro servidor. O backend interno permanece em `127.0.0.1:8888`, com raiz redirecionada ao Next.js. Parar o frontend com Ctrl+C; `npm.cmd run wp:stop` para o backend preservando dados. Versões e configuração no [guia do backend](wordpress/README.md).

## Executar a vitrine

Abra http://localhost:3001. Para verificar o build local: `npm run build` e `npm start`, com o dev parado. Verificação: `npm run typecheck` e `npm test` (Chromium com `npx playwright install chromium`). Os testes de integração exigem WordPress ativo e credenciais locais; criam e removem registros sintéticos temporários. Use os dois lockfiles com `npm ci` para reproduzir as dependências.

## Estrutura

- `app/`: home, loja/busca, coleções, produtos, jornal, páginas editoriais, rotas de conta/carrinho/checkout, SEO e erros.
- `components/site/` e `components/catalog/`: interface compartilhada e catálogo no servidor.
- `lib/config/`, `lib/wordpress/` e `lib/commerce/`: canal inicial, cliente HTTP privado, conteúdo e catálogo.
- `next.config.ts` e `proxy.ts`: rotas encaminhadas e normalização de URLs.
- `public/images/`: imagens locais.
- `tests/`: testes públicos, mobile, proxy, login e publicação/edição/despublicação reais.
- `wordpress/`: Docker, WooCommerce, plugin `katukina-core`, controles locais e ferramentas WP-CLI.

## SEO, AEO e GEO

HTML de catálogo/conteúdo renderizado no servidor, idioma en-GB, títulos e descrições, canonical por página, Open Graph, Twitter Card, sitemap e robots. JSON-LD WebSite e Product correspondem aos dados publicados; ofertas de compra não são inventadas. Conteúdo editorial usa texto escapado nesta fundação. Não há promessa de posicionamento, citações por IA ou resultados enriquecidos.

Indexação permanece desativada por padrão. Configure `NEXT_PUBLIC_SITE_URL` em conjunto com as URLs públicas do WordPress e só ative `SITE_INDEXABLE=true` quando conteúdo e operação estiverem validados. Consulte `.env.example`. O sitemap acompanha produtos, categorias e conteúdo publicados e exclui rotas transacionais.

## Limites do MVP

Carrinho, checkout fictício, conta e cotação estão integrados: criam clientes e pedidos locais sem cobrança real. Lotes/fracionamento são extensões de Products; campos operacionais de pedidos ficam no editor nativo. A [cobertura atual](docs/katukina/OPERATIONS.md) registra pendências e limites. O protótipo anterior foi preservado fora das rotas ativas.

## Referências e ativos

- Referência visual e conteúdo institucional: https://katukina.com/
- Grafismo reutilizado no protótipo: https://katukina.com/upload/images/Katukina/Katukina-BG-all-border.jpg
- Hero atual: produto publicado no WooCommerce, com imagem da biblioteca local. Fontes e apresentações dos seis exemplos em [SAMPLE_CATALOG.md](docs/katukina/SAMPLE_CATALOG.md).
- Fonte atual: Manrope variável, hospedada localmente via Fontsource. Cormorant Garamond/Inter pertencem ao protótipo preservado.
- Metadata API: https://nextjs.org/docs/app/api-reference/file-conventions/metadata

Assets históricos preservados fora da vitrine ativa: fotografias do catálogo em https://katukina.com/assets/images/items/1871.jpg, https://katukina.com/assets/images/items/1990.jpg e https://katukina.com/assets/images/items/1571.jpg, além da floresta ilustrativa Unsplash `photo-1441974231531-c6227db76b6e`.
