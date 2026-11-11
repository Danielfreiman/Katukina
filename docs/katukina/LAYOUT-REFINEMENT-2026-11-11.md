# Refinamento de layout — 11/11/2026

Solicitado por Danilo: afinar o site público, preservar a ideia visual, o padrão de cantos e todos os elementos/seções, com opção de reversão.

## Implementação

A apresentação adicional está isolada em `app/layout-refinement.css`, importada por `app/layout.tsx`. Os estilos anteriores permanecem intactos, inclusive as alterações locais que já existiam antes desta tarefa. Não há alteração de conteúdo, estrutura das páginas, imagens, contratos ou regras comerciais.

- Margens laterais fluidas compartilhadas, preservando as larguras máximas distintas da home e das páginas internas.
- Ritmo entre seções comerciais, títulos e blocos narrativos da home.
- Abertura do catálogo sem padding acumulado sobre as margens existentes.
- Recuos consistentes nas informações e ações dos cards do catálogo.
- Quebra de breadcrumbs, ordenação e títulos de prateleiras quando necessário.
- Leitura editorial, respiro de formulários/resumos e legibilidade do rodapé.
- Áreas de toque ampliadas nos controles de navegação da home.

O raio compartilhado de 8 px dos cards e os demais raios existentes não são redefinidos. As ocultações responsivas e os estados indisponíveis preexistentes também são preservados.

### Segunda rodada: header e busca

**Substituída por solicitação posterior de Danilo:** após integrar `88468e9`, restaurar header, busca e navegação de categorias como na atualização, sem faixa verde. O bloco local de refinamento do header foi removido; os estilos-base do header e categorias em `globals.css` foram recuperados de `origin/main`. A faixa superior de aviso permanece branca. Os demais refinamentos continuam ativos e os estilos remotos de busca/controles em `storefront.css` foram preservados. Conferência em 1440 e 390 px sem overflow, sem pattern de fundo na navegação e busca com raio remoto de 12 px. Capturas: `output/playwright/header-upstream-no-green-*.png`.

Danilo pediu posteriormente para harmonizar o header e a barra de pesquisa com o restante do site. Essa rodada amplia somente a camada reversível:

- Header e navegação passam a acompanhar o limite de largura de 1600 px da home.
- Busca com moldura de 8 px, botão interno com raio de 4 px e recuo de 4 px; mantém CTA urucum, lupa e todos os comportamentos.
- Painel de sugestões com raio de 8 px; foco visível no conjunto e botão sem deslocamento no hover.
- Grid de logo, busca e ações, com duas linhas no celular e alvos dos ícones de 44 px.
- Contraste corrigido no botão “All categories”, que usava verde sobre fundo verde.

Validação: `live-search.spec.ts` (2 testes) e `storefront-navigation.spec.ts` aprovados; `typecheck` aprovado; detector sem achados. Capturas em `output/playwright/header-refined-*.png`, incluindo 320, 390, 801, 1024, 1440 e 1770 px, categorias abertas e sugestões desktop/mobile. Medidas em `header-refinement-metrics.txt`. A mesma opção `off/on` desativa/ativa esta rodada junto ao refinamento anterior.

## Comparar e reverter

Na raiz `website-katukina-2027`:

```powershell
node scripts/layout-refinement.mjs off
```

Recarregue `http://localhost:3001/`. Isso desativa somente a importação desta camada visual, preservando todas as alterações anteriores.

Para reativar:

```powershell
node scripts/layout-refinement.mjs on
```

Consultar estado:

```powershell
node scripts/layout-refinement.mjs status
```

Os comandos resolvem o arquivo pelo caminho do próprio script; também funcionam da pasta pai com `node website-katukina-2027/scripts/layout-refinement.mjs off` (ou `on`). Não usam Git reset/restore e não apagam arquivos.

## Evidências locais

- `npm.cmd run typecheck`: aprovado.
- Detector Impeccable sobre a nova folha CSS: nenhum achado.
- Alternância `off`, `status`, `on`, `status`: aprovada, encerrando ativado.
- Teste existente `storefront-navigation.spec.ts`: aprovado (menu, busca, navegação e larguras de 320, 390, 801, 1024 e 1440 px).
- Teste existente `reference-home.spec.ts`: aprovado na repetição após uma interrupção de navegação durante a primeira execução. Confere campanhas, trilhas, abas por teclado, imagens e ausência de overflow em 320, 390, 768, 1024 e 1440 px.
- Capturas e medidas responsivas: `output/playwright/layout-after-*.png` e `output/playwright/layout-verification.txt`.
- A primeira varredura foi interrompida em `/shipping`; a retomada gerou as capturas de entrega, assinatura e busca vazia antes de outra interrupção na navegação para o artigo. Registros preservados nos arquivos `layout-verification*.txt`.
- O servidor de desenvolvimento apresentou `__webpack_modules__[moduleId] is not a function` durante a varredura e foi reiniciado, preservando o runtime WordPress e os arquivos do projeto. A confirmação após reinício está em `output/playwright/layout-confirmation.txt`.
- O primeiro reinício não resolveu o cache de compilação. Com o servidor parado, `.next` foi movida para `artifacts/next-cache-before-layout-restart` (backup local ignorado pelo Git) e regenerada pelo Next. A home voltou a responder HTTP 200 e abriu no navegador com título correto e sem erros no console inicial; logs em `output/layout-dev-clean.*.log`. A confirmação anterior em `layout-confirmation.txt` registra a tentativa ainda com o cache antigo.
- Na rodada do header, esse backup foi transferido para `../.local-backups/next-cache-before-layout-restart`, fora da raiz Next.js, pois seus arquivos TypeScript gerados estavam sendo incluídos pelo typecheck. O backup foi preservado e o typecheck voltou a passar.
- O navegador já apresentava aviso de hidratação na busca antes da aplicação desta camada; sua correção funcional permanece fora desta tarefa visual.
- Validação local; sem publicação em produção.
