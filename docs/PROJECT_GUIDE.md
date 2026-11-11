# Guia geral do projeto Katukina

Revisado em 11/11/2026. Entrada principal para Danilo e para quem mantém o projeto. Este guia descreve o checkout local; não certifica o estado de produção. Fontes detalhadas e histórico continuam nos documentos vinculados.

## Comece pela sua tarefa

| Preciso de… | Consultar |
| --- | --- |
| Produzir as imagens dos banners da primeira dobra | [Banners: tamanhos, nomes e entrega](katukina/BANNERS.md) |
| Encontrar uma pasta, arquivo ou documento | [Estrutura e responsabilidades](PROJECT_STRUCTURE.md) e [inventário automático](PROJECT_INVENTORY.md) |
| Entender onde salvar PSD, AI, imagens e fotos | [Organização do workspace](../../LEIA-ME.md) e [assets vigentes](katukina/ASSETS.md) |
| Instalar ou iniciar o site | [Instalação local](katukina/LOCAL-SETUP.md) e [backend](../wordpress/README.md) |
| Entender o público e o escopo do trabalho | [Produto](../PRODUCT.md) |
| Alterar cores, fontes ou interface | [Paleta](katukina/PALETTE.md), [tipografia](katukina/TYPOGRAPHY.md), [home atual](katukina/HOME-REFERENCE-2026-11-11.md), [categorias](katukina/CATEGORY-REFERENCE-2026-11-11.md) e [refinamento local](katukina/LAYOUT-REFINEMENT-2026-11-11.md) |
| Entender backend, regras ou integrações | [Arquitetura](ARCHITECTURE.md), [APIs](API_CONTRACTS.md), [banco](DATABASE_SCHEMA.md), [admin](ADMIN_UI_MAP.md) e [implementação](IMPLEMENTATION_STATUS.md) |
| Administrar catálogo, estoque e pedidos | [Operação](katukina/OPERATIONS.md) e [plugin](../wordpress/plugins/katukina-core/README.md) |
| Atualizar fotos de produtos | [Procedimento com correspondência, backup e reversão](katukina/PHOTOS-WATERMARK-2026-11-10.md) |
| Verificar requisitos, migração e pendências | [Discovery](katukina/README.md), [requisitos](katukina/REQUIREMENTS.md), [decisões abertas](OPEN_DECISIONS.md), [migração](MIGRATION_PLAN.md) e [cobertura](katukina/FUNCTIONAL-COVERAGE.md) |
| Testar uma mudança | [Estratégia de testes](TEST_STRATEGY.md) e [rotina abaixo](#rotina-de-trabalho) |
| Entender decisões anteriores | [Histórico Katukina](katukina/CHANGELOG.md), [histórico técnico](CHANGELOG.md) e [ADRs](adr/ADR-010-native-backend-expansion.md) |

## Como o site funciona

O visitante acessa o Next.js. Produtos, variações, preços, clientes e pedidos vêm do WordPress/WooCommerce. O plugin Katukina Core amplia as telas nativas para as operações específicas. A pasta `public/` contém imagens estáticas do frontend; fotos associadas a produtos permanecem na biblioteca WordPress.

Danilo conduz design e frontend. Backend e regras comerciais são responsabilidade do parceiro. Documentos antigos podem descrever propostas ou etapas substituídas: usar a instrução mais recente e a evidência do código, mantendo o histórico identificado. A home atual usa banners 4:3; as antigas medidas de hero panorâmico/vertical não são especificações da primeira dobra vigente.

## Rotina de trabalho

Na pasta `website-katukina-2027`, com dependências instaladas e Docker aberto:

```powershell
npm.cmd run wp:start
npm.cmd run dev
```

Site: `http://localhost:3001/`. Administração: `http://localhost:3001/wp-admin/`. Backend interno: `http://127.0.0.1:8888/`. Se a porta 3001 já responde corretamente, reutilizar o servidor. O comando `dev` ocupa o terminal; executar verificações em outro terminal.

```powershell
npm.cmd run typecheck
npx.cmd playwright test tests/reference-home.spec.ts
git diff --check
```

O teste da home requer backend com catálogo local. Testes administrativos/comerciais podem criar registros sintéticos; consultar a estratégia antes de executar a suíte completa. Build: `npm.cmd run build`, com o servidor de desenvolvimento parado. Verificação integrada do ambiente: `npm.cmd run wp:verify`. Parada do backend preservando dados: `npm.cmd run wp:stop`.

Na pasta pai `Katukina.com`, somente os atalhos declarados no `package.json` local são encaminhados ao repositório: `dev`, `wp:start`, `wp:stop`, `wp:status`, `wp:verify` e `typecheck`.

## Manutenção da organização

1. Antes de editar, conferir `git status --short` e preservar trabalho existente.
2. Salvar arquivos de criação em `Assets Site`; publicar apenas exportações aprovadas em `public/`.
3. Para fotos de produtos, preservar IDs e associações WordPress. Não substituir globalmente pelo nome do arquivo.
4. Ao alterar uma área, atualizar seu documento temático e registrar mudança/validação em `docs/katukina/CHANGELOG.md`.
5. Ao criar ou remover pastas/documentos, executar `node scripts/document-project.mjs` para atualizar o inventário.
6. Conferir desktop e celular após trocar imagens ou estilos. Teste local não equivale a aprovação visual nem publicação.

Não armazenar credenciais, dados de clientes, bancos ou PSD/AI dentro de `public/`. Runtime, backups e segredos são locais. Git não transporta automaticamente o banco ou as pastas irmãs de design/fotos.

## Cobertura e limites desta documentação

O índice, o mapa e o inventário cobrem a estrutura existente do projeto, suas áreas funcionais e os documentos detalhados disponíveis. Especificações dos banners foram conferidas no código atual. Documentos históricos não foram revalidados requisito por requisito; pagamentos, logística, tributação, migração e produção continuam sujeitos aos estados e pendências das respectivas matrizes. Consulte a data de cada evidência.
