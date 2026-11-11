# Pastas e responsabilidades

Referência local em 11/11/2026. Caminhos relativos ao repositório `website-katukina-2027`, salvo indicação. O [inventário](PROJECT_INVENTORY.md) lista as pastas e os documentos encontrados; este mapa explica sua função.

## Workspace do cliente, fora do repositório

| Pasta em `Katukina.com/` | Responsabilidade |
| --- | --- |
| `Assets Site/` | Criação visual, referências e arquivos editáveis; banners organizados em `Banners/Home/` |
| `Fotos/Originais/` | Fontes fotográficas preservadas |
| `Fotos/Editadas/` | Tratamentos com correspondência de nomes e subpastas |
| `Fotos/Editadas com marca dagua/` | Exportações tratadas com marca d’água |
| `Fotos/_Marca-dagua/` | Arquivos de apoio da marca d’água |
| `Documentos/` | Pacotes recebidos e materiais de referência do cliente/parceiro; não são os manuais do código |
| `.local-backups/` | Backups locais; preservar antes de substituições |
| `.vscode/` | Configurações locais de trabalho |
| `website-katukina-2027/` | Repositório Git e aplicação |

Essas pastas existentes foram mantidas nos caminhos originais. A organização acrescenta destinos e orientação, sem mover em massa fotos, backups ou documentos recebidos.

## Código e rotas

| Pasta/arquivo | Função e onde alterar |
| --- | --- |
| `app/page.tsx` | Composição da home e consultas das vitrines |
| `app/layout.tsx` | Fontes, metadados, estilos globais, header/footer e provedores |
| `app/shop/`, `app/collections/`, `app/products/` | Busca/loja, categorias e detalhes de produtos; `[slug]` identifica rota dinâmica |
| `app/about/`, `app/journal/`, `app/pages/` | Conteúdo institucional/editorial e páginas WordPress |
| `app/account/`, `app/cart/`, `app/checkout/`, `app/shipping/`, `app/subscribe/` | Fluxos do cliente e relacionamento |
| `app/privacy/`, `app/cookies/` | Páginas de privacidade e cookies |
| `app/api/search/`, `app/api/commerce/` | Rotas intermediárias do frontend para busca e comércio |
| `app/robots.ts`, `app/sitemap.ts` | Descoberta e política de indexação |
| `app/error.tsx`, `app/not-found.tsx` | Estados de erro e página inexistente |
| `app/globals.css` | Base e tokens compartilhados |
| `app/catalog.css`, `app/category-reference.css` | Catálogo e apresentação das categorias |
| `app/reference-home.css` | Home ativa, incluindo os banners 4:3 |
| `app/storefront.css`, `app/privacy.css` | Navegação compartilhada e consentimento |
| `app/layout-refinement.css` | Refinamento opcional local; controle em `scripts/layout-refinement.mjs` |
| `app/home.css` | Estilos da composição anterior; não usar como medida dos banners atuais |
| `components/home/` | Carrossel de campanhas, vitrines e abas da home |
| `components/catalog/` | Filtros, cards, galerias, seleção e compra de produtos |
| `components/commerce/` | Conta, carrinho, checkout, entrega e assinatura |
| `components/site/` | Header, footer, busca, marca e elementos compartilhados; contém componentes de etapas anteriores |
| `components/privacy/` | Consentimento e preferências |
| `lib/commerce/` | Consulta/normalização de catálogo, opções e tipos comerciais |
| `lib/wordpress/` | Cliente HTTP, conteúdo WordPress e tratamento textual |
| `lib/config/` | Configuração de site/canal |
| `lib/privacy/` | Regras de consentimento |
| `lib/content.ts`, `components/storefront.tsx` | Material de etapas anteriores; verificar imports antes de reutilizar/remover |

## Imagens e arquivos de criação

| Pasta | Uso vigente |
| --- | --- |
| `public/images/brand/` | Marca vetorial aprovada |
| `public/images/home/banners/` | **Três campanhas atuais**, cada uma com arquivo independente; [especificações](katukina/BANNERS.md) |
| `public/images/editorial/` | Fotos independentes dos cards editoriais; preservadas ao retirar as pastas de hero antigo |
| `public/images/home/collection/`, `journal/` | Fundos de composição anterior; conferir uso antes de produzir |
| `public/images/home/category-band/`, `category-cards/` | Fundo decorativo ainda referenciado e preparação de cards; não são pastas de banners |
| `public/images/` (arquivos soltos) | Fotografias e grafismo compartilhados por outras rotas; não renomear sem conferir referências |

`public/` é acessível pelo navegador: retirar o prefixo `public` para obter a URL. Nunca colocar mestres ou documentos privados ali. Para trocar o banner Tepi & Kuripe da primeira dobra, usar `banners/tepi-kuripe.webp`, pois `forest.jpg` é compartilhado.

As pastas antigas `hero-01/`, `hero-02/`, `hero-03/` e `collections-banner/` foram retiradas de `public/images/home/` em 11/11/2026. Uma cópia de segurança ficou em `Katukina.com/.local-backups/banners-antigos-<data-hora>/`, fora do site. O destino único dos banners novos é `public/images/home/banners/`.

## Backend, scripts e verificações

| Pasta/arquivo | Responsabilidade |
| --- | --- |
| `wordpress/plugins/katukina-core/src/` | Módulos PHP de domínio; [descrição](../wordpress/plugins/katukina-core/README.md) |
| `wordpress/plugins/katukina-core/assets/` | Scripts administrativos próprios |
| `wordpress/mu-plugins/` | Configuração do ambiente local/headless |
| `wordpress/scripts/` | Inicialização, backup, importação, mídia e verificação; ler o script e seu manual antes de rodar mutações |
| `wordpress/tools/` e `fixtures/` | Ferramentas PHP/WP-CLI e dados sintéticos |
| `wordpress/.runtime/` | Runtime Docker persistente local, fora do Git |
| `wordpress/backups/` | Banco e pacotes privados, fora do Git |
| `scripts/` | Preparação/auditoria de catálogo, fotos, planilhas, paleta e documentação |
| `scripts/tests/` | Testes Python dos preparadores/auditores |
| `tests/` | Testes Playwright de frontend e integração |
| `lib/commerce/*.test.mjs`, `wordpress/scripts/*test.mjs` | Testes próximos da implementação |
| `output/` | Relatórios, logs e capturas de trabalhos locais; verificar se há arquivos rastreados antes de limpar |
| `artifacts/`, `test-results/`, `.playwright-cli/` | Evidências/resultados locais de ferramentas; não necessários ao visitante |

## Documentação e configuração

| Local | Uso |
| --- | --- |
| `README.md`, `PRODUCT.md`, `AGENTS.md` | Entrada técnica, contexto e instruções para agentes |
| `docs/PROJECT_GUIDE.md` | Entrada geral de manutenção |
| `docs/*.md` | Arquitetura, APIs, banco, admin, testes, status e migração |
| `docs/adr/` | Decisões arquiteturais |
| `docs/katukina/` | Manuais temáticos, design, discovery e histórico |
| `docs/katukina/design/`, `templates/` | Referências de design e modelos documentais |
| `docs/katukina/evidence/` | Evidência técnica agregada; preservar sem dados pessoais |
| `docs/katukina/history/`, `sources/` | Histórico e fontes originais preservadas |
| `skills/katukina-architecture/` | Orientação fornecida pelo responsável e referências originais |
| `.impeccable/` | Preferências e configuração de trabalho visual; sessões locais fora do Git |
| `package.json`, `package-lock.json` | Comandos e dependências reproduzíveis do frontend |
| `wordpress/package.json`, `wordpress/package-lock.json` | Comandos/dependências do ambiente WordPress |
| `next.config.ts`, `proxy.ts` | Configuração e encaminhamento de requisições |
| `tsconfig.json`, `playwright.config.ts` | TypeScript e testes de navegador |
| `.env.example` | Exemplo público das variáveis; valores reais ficam em `.env.local` |
| `.gitignore`, `.gitattributes` | Exclusões de arquivos locais e regras Git |
| `.git/`, `node_modules/`, `.next/`, `*.tsbuildinfo`, `next-env.d.ts` | Controle de versão ou arquivos gerados; não reorganizar manualmente |

Arquivos desconhecidos/soltos devem ter sua origem conferida antes de mover ou apagar. Este trabalho não removeu arquivos preexistentes.
