# Auditoria local Katukina

Versão 0.7 · Inspeção em 2026-10-19 · Escopo: repositório, anexos, exports, backend local, headless, catálogo, rebrand e operação local. A classificação CONFIRMADO indica evidência local ou requisito documental, conforme a origem; não certifica produção.

## Incremento operacional posterior

O pedido “Implemente tudo que for possível” resultou no plugin 0.2.0, com cadastros, lotes, reservas, fracionamento, matriz configurável de estados, créditos, picking e relatórios; Next.js agora usa carrinho, cotação, conta e checkout de teste. A [matriz de cobertura atual](OPERATIONS.md) substitui as afirmações históricas de indisponibilidade abaixo. Não há estoque importado, pagamento real, integração de caixas de e-mail/transportadoras, implantação multi-site ou regras fiscais aprovadas. Os documentos originais permanecem preservados.

## Atualização headless posterior

Incrementos posteriores confirmados: seis apresentações do catálogo público foram cadastradas como exemplos com imagens locais e preços observados, documentadas em [SAMPLE_CATALOG.md](SAMPLE_CATALOG.md). O frontend recebeu o rebrand clean solicitado, preservando o grafismo original. Login pela origem pública validado; acessos diretos a login/painel em 8888 são encaminhados a 3001. Build e dois testes integrados passaram após as alterações; revisão de home/catálogo/produto em desktop/mobile não encontrou imagens quebradas, erros JavaScript ou overflow até 320 px.

Site público Next.js e painel WordPress agora usam `http://localhost:3001/` e `/wp-admin/`. A porta 3000 já estava ocupada e foi preservada. Catálogo, categorias, produtos, artigos e páginas são lidos do backend e renderizados no servidor. O plugin `katukina-core` está ativo, com roteamento headless e registro de módulos; chamadas internas WordPress→WordPress permanecem funcionais dentro do Docker. O [mapa de estrutura](HEADLESS.md) é a referência atual de rotas e limites.

Os testes integrados confirmaram login pelo proxy, permissões do endpoint administrativo, assets, publicação/edição/despublicação de produto, busca, categoria, sitemap e artigo. Registros sintéticos removidos após o teste. Typecheck, build, sintaxe PHP e loopback REST passaram. A sacola demonstrativa anterior saiu das rotas ativas; carrinho e checkout reais continuam pendentes. O restante desta auditoria preserva evidências do discovery e da instalação inicial.

## Estado verificado

| Achado | Estado e evidência | Implicação |
| --- | --- | --- |
| Vitrine Next.js/React/TypeScript | CONFIRMADO no código: `package.json`, `app/`, `components/storefront.tsx` | Base visual reaproveitável; stack final continua A VALIDAR |
| Três produtos estáticos, preços demonstrativos em EUR | CONFIRMADO: `lib/content.ts`, `app/products/[slug]/page.tsx` | Não usar como catálogo, preço-base ou moeda de cobrança reais |
| Sacola em localStorage, com limite de quantidade e validação local | CONFIRMADO: `components/storefront.tsx` | Não cria pedido, reserva ou compromisso de estoque |
| Vitrine ainda sem integração comercial com backend | CONFIRMADO no código: árvore `app/`, `lib/`, dependências | A instalação posterior do WordPress não conecta automaticamente sacola, pedidos e estoque |
| WordPress 7.1.3 e WooCommerce 11.2.1 instalados em Docker | CONFIRMADO: `wordpress/.wp-env.json`, containers locais e verificação WP-CLI | Base limpa disponível em `localhost:8888`, HPOS ativo; módulos de domínio e fluxo headless pendentes |
| Metadata, canonicals, sitemap, robots e JSON-LD básicos | CONFIRMADO: `app/layout.tsx`, `app/page.tsx`, `app/sitemap.ts`, `app/robots.ts` | Há uma base técnica de descoberta; conteúdo real, redirects, i18n e medição ainda faltam |
| Indexação condicionada a `SITE_INDEXABLE === "true"` | CONFIRMADO no código e exemplo de ambiente | O padrão da aplicação é noindex; a configuração efetiva de produção não foi auditada |
| Dashboard estático separado | CONFIRMADO: `dashboard/README.txt`, `prepare_data.py`, `dist/app.js` | Consulta exports; não é backoffice transacional |
| Consolidação do dashboard usa o último registro por ID na ordem carregada | CONFIRMADO: `new Map(...[r.id,r])` em `dashboard/dist/app.js` | Convenção de visualização não deve virar política de migração |
| Arquivos locais de dashboard incluem linhas e colunas originais | CONFIRMADO: importador e `dashboard/dist/data.js` | Há dados pessoais; relatório de discovery contém apenas metadados e agregados |
| WordPress/headless, multi-site, estoque, fornecedores, granel/fracionamento e SEO/GEO/AEO | CONFIRMADO documentalmente: baseline e prompt mestre | Requisitos do destino; ausência no MVP registrada acima |
| Instalação nova e limpa de WordPress + WooCommerce; frontend headless rápido e preparado para SEO | CONFIRMADO pelo responsável na conversa em 2026-10-19 | ADR-001 atualizado; implementação nova pode começar com dados de teste, enquanto a migração aguarda o legado |

Nenhuma conexão foi feita ao painel Sacred Incense, phpMyAdmin, banco de produção, caixas de e-mail, gateway ou transportadoras. Os caminhos administrativos do levantamento são referências documentais. Não foram identificados dump SQL, código PHP legado ou manual do gateway entre os arquivos locais pesquisados neste workspace e no diretório adicional descrito abaixo. O PHP adicionado em `wordpress/` pertence à nova instalação local, não ao legado.

## Backend local criado após a auditoria inicial

Origem: pedido explícito do responsável para criar o ambiente e instalar dependências usando o Docker já disponível. Docker Desktop iniciado; criado projeto isolado com WordPress, CLI e MariaDB, separado dos containers preexistentes da porta 8080. PHP 8.3.35 e MariaDB 11.4.13 observados nesta execução; as configurações acompanham as séries 8.3 e 11.4.

O site está publicado somente em `127.0.0.1:8888`, e o banco em porta dinâmica também de loopback. Senha administrativa gerada e armazenada em arquivo local ignorado pelo Git. Indexação, rastreamento WooCommerce e envio externo de e-mails desativados para o ambiente local. Setup idempotente configura links permanentes, páginas básicas e HPOS, dispensando o questionário comercial sem atribuir país/empresa fictícios.

Guia operacional e scripts: [wordpress/README.md](../../wordpress/README.md). Não foram importados produtos, clientes ou pedidos. Configurações comerciais padrão da instalação não são decisões aprovadas. Integração frontend/backend, transações de teste e backup/restore permanecem etapas posteriores.

## Diretório adicional indicado pelo responsável

Em 2026-10-19, o responsável indicou `C:\Users\User\Desktop\katukina` como possível localização do legado e informou que, se não estivesse ali, não o teria disponível por ora.

**CONFIRMADO por inspeção local:** o diretório existe e contém outro protótipo de frontend Next.js/React/TypeScript, identificado como `katukina-modern` em `package.json`. O README descreve uma prévia visual com preços ilustrativos e sem backend de estoque, checkout, pagamentos, autenticação ou newsletter. `src/app/page.tsx` contém catálogo estático, sacola e favoritos em localStorage; a revisão da seleção informa que não é possível fazer pedidos.

Foi feito inventário recursivo incluindo arquivos ocultos e ignorados, excluindo dependências, build e caches (`node_modules`, `.next`, `.git`, `vendor`, ambientes Python e `__pycache__`). Nos 26 arquivos restantes não foram encontrados código PHP, dumps/bancos locais, arquivos compactados de backup, documentos PDF/Word ou candidatos por nome ligados a gateway/WordPress. Foram lidos README e package.json e inspecionadas referências de integração no código-fonte e nos scripts. Nenhum arquivo desse diretório foi alterado.

**Disponibilidade atual:** Q-01 (legado/banco) e Q-02 (documentação do gateway) continuam sem as evidências necessárias. A indicação adicional não revela um backend operacional; o responsável já informou a indisponibilidade do legado caso não fosse encontrado nesse local. Não é necessário repetir a solicitação enquanto não houver material novo.

## Exports inspecionados

Leitura independente do XML dos XLSX, sem usar o dashboard como fonte de contagem. Evidência completa: [exports-audit.json](evidence/exports-audit.json).

| Arquivo | Linhas de dados | Colunas | Período em `order date` | Células numéricas incompatíveis |
| --- | ---: | ---: | --- | ---: |
| `export 2026-10-05 16-21-21.xlsx` | 2.055 | 127 | 2025-10-05 a 2026-10-05 | 12 |
| `export 2026-10-05 16-26-20.xlsx` | 2.722 | 131 | 2024-10-06 a 2025-10-05 | 14 |
| Total | 4.777 | Esquemas diferentes | 2024-10-06 a 2026-10-05 | 26 |

- São 4.769 IDs de pedido distintos e oito IDs presentes em mais de uma linha. Não há ID vazio nem repetição dentro de uma mesma planilha.
- Não foram encontradas diferenças nos campos comuns das oito duplicatas, usando rótulos qualificados por grupo/coluna. Isso não prova que campos exclusivos sejam equivalentes nem que IDs sejam únicos entre empresas ou instâncias do legado.
- As duas fontes têm duas colunas sem título, nenhuma fórmula e nenhuma célula do tipo erro do Excel. As 26 incompatibilidades são conteúdo não numérico em célula declarada numérica; não foram transformadas em zero ou corrigidas silenciosamente.
- A primeira fonte tem colunas de `11% VAT` ausentes na segunda. A segunda tem `13% VAT` e `15% VAT` ausentes na primeira, nos dois grupos de moeda. Esses rótulos são evidência do export, sem validar a aplicabilidade das alíquotas.
- `order currency` contém AUD, CAD, DKK, EUR, GBP, SEK e USD. O código de `ENGINE CURRENCY` não está identificado no formato. A informação de GBP como moeda-base vem do levantamento e exige reconciliação com os exports.
- `RT or WS` classifica varejo/atacado conforme rótulo legado; não há evidência de que identifique domínio, empresa vendedora ou depósito.
- O hash de cada planilha coincide com o hash armazenado no dashboard local. As contagens também coincidem com seus agregados, sem reimportar ou sobrescrever o dashboard.

## Lacunas e ações

| Lacuna | Estado | Ação concreta |
| --- | --- | --- |
| Esquema real do PHP, PK/FK, catálogo, apresentações, mídia e URLs | BLOQUEADO para auditoria de banco: cópia não disponível | Obter cópia de leitura e executar inventário previsto em MIGRATION.md |
| Relação entre canal, empresa, estoque, local e moeda | A VALIDAR | Preencher matriz de operação por canal antes de definir isolamento físico |
| Reservas, baixa, retorno e reenvio | LEGADO OBSERVADO apenas para baixa em PACKED AND PENDING | Reproduzir operações em ambiente de teste e levantar matriz de transições |
| Contrato do gateway | BLOQUEADO para implementação do adaptador | Obter ambientes, autenticação, moedas, estados, webhooks, reconciliação e reembolso |
| Regras VAT, HS, países proibidos e seguro | A VALIDAR | Levantar configurações vigentes, responsáveis e evidências por jurisdição/canal |
| Formato heterogêneo e células incompatíveis nos exports | CONFIRMADO localmente | Mapear por cabeçalhos, preservar tipos originais e criar quarentena no ETL |
| Site final, checkout e operação multi-site | A VALIDAR para implementação completa | Resolver ADRs e dependências antes das integrações transacionais |

## Validação realizada

Cinco testes unitários do novo auditor passaram: esquemas distintos/duplicatas, preservação das fontes/ausência de nomes no relatório, número inválido, conflito entre versões, ausência de entradas, endereçamento e rótulos tributários agrupados (alguns casos no mesmo teste). A execução sobre os dois XLSX produziu o relatório agregado. `npm.cmd run typecheck` passou para a vitrine existente.

Para a instalação posterior: `npm.cmd run wp:verify` passou com Chromium/Playwright, confirmando home HTTP 200/noindex, REST API WordPress, Store API de produtos/carrinho, Cart Token, login administrativo e painel de Produtos. O setup repetido preservou as configurações. `wp:stop` e `wp:start` concluíram; nova verificação confirmou a persistência de credenciais e opções. WP-CLI confirmou versões, HPOS e controles locais após reinício; MariaDB saudável e portas de loopback conferidas com Docker. Sintaxe Node, lint PHP do MU-plugin e `git diff --check` passaram. Essas verificações não abrangem checkout integrado nem restauração de backup.

Não foram executados build, testes de navegador, teste de gateway, auditoria fiscal ou migração de banco nesta etapa. O código da vitrine e do dashboard não foi modificado.
