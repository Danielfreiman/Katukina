# Discovery Katukina

**Entradas atuais:** [guia geral do projeto](../PROJECT_GUIDE.md), [mapa das pastas](../PROJECT_STRUCTURE.md), [inventário de todos os documentos](../PROJECT_INVENTORY.md) e [produção dos banners 4:3](BANNERS.md). As entregas datadas abaixo preservam o histórico; não substituem o guia vigente dos banners.

Versão 0.9 · 2026-10-19 · Elaboração técnica: Codex.

O projeto local contém Next.js e WordPress + WooCommerce em Docker. Site e painel usam http://localhost:3001/ e `/wp-admin/`. Após correção explícita do responsável, a administração usa as telas nativas: Products/Variations, Orders, Users, Settings e Analytics. O painel paralelo foi removido; lotes, fracionamento e campos operacionais ampliam essas áreas. Catálogo, conteúdo, carrinho, cotação, conta e checkout fictício funcionam pela API. A [cobertura vigente e ADR-009](OPERATIONS.md) registra pendências reais: integrações comerciais, regras fiscais, outras lojas e migração do legado não estão concluídas.

## Entregas

Controles em 2026-11-16 — **CONFIRMADO por Danilo:** remover sublinhados de pílulas e botões em todo o site, inclusive hover/foco. Regra global em `app/globals.css` cobre botões, links com apresentação de botão, categorias em pílulas, tags, paginação e controles equivalentes. Efeitos de cor, fundo, borda e indicadores de foco continuam regidos pelos estilos dos componentes. Typecheck aprovado.

Categorias em 2026-11-16 — decisão final de Danilo: manter somente os oito ícones originais. Integração automática de fotos desfeita e pasta `public/images/home/category-circles/`, incluindo a foto de teste e suas instruções, removida a pedido. Os registros abaixo sobre fotos e pattern preservam o histórico das decisões substituídas.

Categorias em 2026-11-16 — correção posterior confirmada por Danilo: seção e divisórias seguem a largura das seções vizinhas da home (`.rh-wide`, máximo de 1600 px), substituindo o limite de 1280 px solicitado anteriormente. Navegador confirmou larguras iguais nas três seções em 1920, 1440 e 390 px, sem overflow. Typecheck aprovado.

Categorias em 2026-11-16 — **CONFIRMADO por Danilo:** remover o pattern da seção e preparar imagens para os oito círculos. Pattern removido; especificações e nomes em `public/images/home/category-circles/LEIA-ME.md`. Imagens a fornecer pelo responsável, com integração após o recebimento. Esta decisão substitui a aplicação do pattern registrada abaixo.

Home em 2026-11-16 — ajuste posterior confirmado por Danilo: conteúdo da faixa de categorias limitado a 1280 px, alinhado ao limite do cabeçalho, com fundo em largura total. “Shop by collection” reduzido de até 18 para até 12 produtos por coleção, removendo uma fileira de seis no desktop. Typecheck aprovado; navegador a 1920 px confirmou 12 produtos, contêiner de 1280 px e ausência de overflow horizontal.

Pattern das categorias em 2026-11-16 — **CONFIRMADO por Danilo:** fundo dentro da seção “Shop by category”, atrás dos círculos, ocupando a largura total; conteúdo mantém o contêiner anterior `.rh-wide`, com limite de 1600 px. Reutilizado o grafismo original com o tratamento suave do header. Conferido em navegador a 1920, 1440, 390 e 320 px, com fundo de ponta a ponta, conteúdo centralizado e sem overflow horizontal. Capturas locais em `artifacts/category-full-width-*.png`.

Home em 2026-11-16 — **CONFIRMADO por Danilo:** remover a seção “Discover Katukina”. Removido o carrossel correspondente em `app/page.tsx`; “Shop by collection” passa a seguir as categorias. Os dois testes existentes de home/navegação foram atualizados para verificar o carrossel “New in the catalogue” e aprovados; o seletor antigo dos CTAs dos banners também foi corrigido no teste de composição. Ausência da seção e composição conferidas em navegador a 1440 e 390 px, sem overflow horizontal.

Categorias da home em 2026-11-16 — **CONFIRMADO por Danilo:** reforçar o destaque dos círculos dentro do estilo visual existente. Aplicados contorno verde suave, sombra discreta, ícones maiores, rótulos semibold e estados de hover/foco em `app/reference-home.css`; categorias adicionais com borda leve e alvo mínimo de 44 px. Conferido em navegador a 1440, 800, 390 e 320 px, sem overflow horizontal da página; foco visível, rolagem por teclado e movimento reduzido verificados. Detector de layout sem achados. Capturas locais em `artifacts/category-layout-*.png`.

Ambiente local em 2026-11-16: [recuperação do banco vazio com backup de 10/11 e validação da home, catálogo e painel](LOCAL-RECOVERY-2026-11-16.md).

Navegação do histórico em 2026-11-11: “Recently viewed” usa setas circulares com estados de início/fim e mantém rolagem por toque, links dos produtos e limpeza do histórico. Barra de rolagem visual removida. Validado em navegador a 1440 e 390 px; typecheck aprovado.

Rodapé compacto em 2026-11-11: logo integrada à introdução, links em duas colunas e remoção da assinatura gigante inferior. Conferido em 1440, 800, 390 e 320 px, sem overflow horizontal; altura de 369 px no desktop de 1440 px. Typecheck aprovado.

Fluxo de compra em 2026-11-11: [perfil de desempenho e redução de consultas no carrinho/checkout](COMMERCE-PERFORMANCE-2026-11-11.md).

Carrinho lateral em 2026-11-11: [ícone de folha, sessão WooCommerce e validações](SIDE-CART-2026-11-11.md).

PDP em 2026-11-11: [estrutura iHerb integrada à galeria, opções e compra existentes](PDP-REFERENCE-2026-11-11.md).

Tipografia em 11/11/2026: [sistema e regras](TYPOGRAPHY.md), [inventário por seletor](TYPOGRAPHY-INVENTORY.md) e [revisão com validações](TYPESET-2026-11-11.md).

Categorias em 2026-11-11: [estrutura da referência iHerb com filtros preservados](CATEGORY-REFERENCE-2026-11-11.md).

Atualização do GitHub em 2026-11-09: [16 commits incorporados, conciliação local e validações](GITHUB-INTEGRATION-2026-11-09.md).

Fotos vigentes: [substituição por imagens com marca d’água e exclusão das versões antigas](WATERMARK-PHOTOS-2026-11-09.md), solicitada em 2026-11-09.

Pacote de fotos recebido em 2026-11-09: [WebP de 6 de novembro, compatibilidade e aplicação local](WEBP-PACKAGE-2026-11-06.md).

Atualizações de 2026-11-04: [recebimento e estoque nativo interligados, busca por SKU e testes](STOCK-INTEGRATION-2026-11-04.md); [pattern sutil nos swatches](SWATCH-PATTERN-2026-11-04.md).

Home redesenhada em 2026-11-04: [paleta urucum, preservação do pattern e validações](HOME-URUCUM-2026-11-04.md).

Atualização de fotos por SKU em 2026-11-04: [fonte, critérios de associação e reprodução local](IMAGE-UPDATE-2026-11-04.md).

Atualização de 2026-10-26: a [expansão do backend e sua matriz de implementação](../IMPLEMENTATION_STATUS.md) documentam o novo pedido de auditoria e implementação nativa. Os documentos anteriores abaixo permanecem como evidência histórica; consulte a matriz nova para cobertura, testes executados e bloqueios atuais.

A [auditoria de cobertura funcional de 2026-10-22](FUNCTIONAL-COVERAGE.md) é a referência para comparar o escopo original com a implementação vigente. Sendcloud, HS automático/invoice/API e publicação seletiva multi-site estão pendentes; cadastros preparatórios não equivalem a essas integrações.

| Artefato | Conteúdo |
| --- | --- |
| [Fotos com marca d'água de 2026-11-10](PHOTOS-WATERMARK-2026-11-10.md) | Fonte, correspondência exata, backup e verificação da atualização local das fotos |
| [Assets e logotipo horizontal](ASSETS.md) | Pasta, nome, especificações do SVG e organização dos próximos assets |
| [Contexto do produto e escopo frontend](../../PRODUCT.md) | Público de varejo internacional, responsabilidades, capacidades, limites e decisões abertas para novas tarefas |
| [Tipografia Sora e Source Sans 3](TYPOGRAPHY.md) | Famílias oficiais, escala, pesos, hierarquia por superfície e inventário automatizado por seletor |
| [Fotos WebP de 2026-11-06](PHOTOS-WEBP-2026-11-06.md) | Substituição das fotos do catálogo, remoção das antigas dos uploads, cache privado e recuperação |
| [Paleta urucum e verde folha](PALETTE.md) | Fonte SVG aprovada, cores, funções, estados derivados, contraste e manutenção do tema público |
| [Fotos WebP de 900 × 900 px](CATALOG-WEBP-2026-11-06.md) | Atualização local de todas as mídias do catálogo, correspondência por categoria, backup, validação e reversão |
| [Privacidade e cookies](PRIVACY-COOKIES.md) | Política, consentimento, inventário, fontes públicas e pendências de GDPR/ePrivacy antes de produção |
| [Categorias e produtos](CATALOG-UX-BLUEPRINT.md) | Esquema, implementação, contratos, verificações e limites; [wireframe inicial](CATALOG-WIREFRAMES.html) |
| [Importação Sacred Incense UK](PRODUCT-IMPORT-2026-10-27.md) | Fonte XLSX, produtos/variações, preços atualizados para USD, imagens, reprodução e validação local |
| [Instalação em outro computador](LOCAL-SETUP.md) | Clone, bootstrap, credenciais públicas de teste, rotação obrigatória antes de publicação, atualização e persistência |
| [Cobertura funcional auditada](FUNCTIONAL-COVERAGE.md) | Comparação requisito a requisito com código e configuração local; lacunas de Sendcloud, HS, multi-site e demais domínios |
| [Operação local](OPERATIONS.md) | Administração nativa, cobertura, limites, ADR-009, migração e testes; referência histórica ao ADR-008 |
| [Estrutura headless](HEADLESS.md) | Rotas, integração real de leitura, módulos, execução e limites atuais |
| [Catálogo de exemplo](SAMPLE_CATALOG.md) | Seis produtos do site público cadastrados localmente, fontes, preços e reprodução |
| [Backend local](../../wordpress/README.md) | Docker, versões, acesso, comandos e persistência do WordPress/WooCommerce |
| [Início do desenvolvimento](START.md) | Instalação limpa, fluxo piloto headless, SEO/desempenho e critérios de saída |
| [Auditoria local](AUDIT.md) | Código existente, planilhas, divergências e dependências ausentes |
| [Registro de requisitos](REQUIREMENTS.md) | Origem, estado, papéis, aceite, dependências e riscos por domínio |
| [Arquitetura e ADRs](ARCHITECTURE.md) | Modelo lógico, contratos propostos e decisões ainda abertas |
| [Migração e execução](MIGRATION.md) | Mapeamento inicial, etapas, reconciliação, testes, rollback e pendências |
| [Relatório dos exports](evidence/exports-audit.json) | Contagens, hashes, cabeçalhos e diferenças entre esquemas; sem registros pessoais |
| [Manifesto das fontes](sources/manifest.json) | SHA-256, origem e destino de cada arquivo incorporado |
| [Histórico](CHANGELOG.md) | Mudanças e validações realizadas |

## Fontes incorporadas

Os dois documentos avulsos são idênticos, byte a byte, às versões correspondentes no ZIP. Os sete arquivos do pacote foram lidos e preservados em `skills/katukina-architecture/`.

- [Skill fornecida](../../skills/katukina-architecture/SKILL.md).
- [Prompt mestre](../../skills/katukina-architecture/references/MASTER_PROMPT.md).
- [Baseline de arquitetura](../../skills/katukina-architecture/references/architecture-baseline.md).
- [Inventário funcional](../../skills/katukina-architecture/references/functional-scope.md).
- [Levantamento original](../../skills/katukina-architecture/references/newSiteFunctions-original.txt).
- [Governança](../../skills/katukina-architecture/references/project-governance.md).
- [Metadados da interface da skill](../../skills/katukina-architecture/agents/openai.yaml).
- Cópias avulsas: [KATUKINA_SKILL.md](sources/KATUKINA_SKILL.md) e [KATUKINA_MASTER_PROMPT.md](sources/KATUKINA_MASTER_PROMPT.md).

A skill foi incorporada como orientação deste repositório por [AGENTS.md](../../AGENTS.md). Não houve instalação global nem alteração nas instruções de um Projeto ChatGPT. As fontes originais foram preservadas; a confirmação posterior de WordPress + WooCommerce pelo responsável está registrada no ADR-001 e prevalece sobre o estado anterior de WooCommerce como proposta. As demais recomendações continuam propostas, e referências a sistemas externos não comprovam acesso.

## Reproduzir a auditoria

Execute na raiz do repositório com Python 3, sem dependências adicionais:

```powershell
python -B scripts/audit_legacy_exports.py --output docs/katukina/evidence/exports-audit.json
python -B -m unittest discover -s scripts/tests -v
npm.cmd run typecheck
```

O auditor lê os dois arquivos `export 2026-10-05 *.xlsx`, mantém as fontes intactas e produz somente metadados estruturais e contagens agregadas. Ele exige o formato observado de duas linhas de cabeçalho e datas textuais ISO; não é um importador XLSX genérico. Não calcula tributos, saldos ou totais financeiros, não escolhe uma versão vencedora entre duplicatas e não confirma a unicidade global dos IDs entre sites. Fórmulas são contadas e seus caches lidos, sem avaliação.

## Próxima execução

Avançar da leitura headless de catálogo/conteúdo para o [fluxo piloto](START.md#3-concluir-o-primeiro-fluxo-integrado): contexto comercial de teste, sessão de carrinho e pedido. A ausência do banco legado não bloqueia esse desenvolvimento. Definir autoridade de inventário e políticas mínimas antes da integração operacional de estoque.

Quando disponíveis, incorporar uma cópia do esquema e dos relacionamentos do banco PHP, o código relevante dos fluxos de pedido/estoque e a documentação do gateway. O diretório adicional indicado pelo responsável, `C:\Users\User\Desktop\katukina`, contém outro protótipo Next.js; o material de backend não foi encontrado, e o responsável informou não ter o legado disponível por ora se não estivesse ali. A inspeção está registrada na [auditoria](AUDIT.md#diretório-adicional-indicado-pelo-responsável).

Em paralelo, resolver propriedade do estoque, empresas por canal e regras comerciais. A [matriz de dependências](MIGRATION.md#dependências-e-perguntas) identifica o que cada evidência destrava. As planilhas disponíveis permitem discovery contábil parcial; não contêm o catálogo, os lotes ou o histórico completo de estados.
