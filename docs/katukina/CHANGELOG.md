# Histórico do discovery Katukina

## 2026-10-27 — Reprodução do catálogo e revisão antes do push

- Criado `package_product_catalog.py`: pacote privado com três manifestos e 1.688 imagens, sem contas, clientes, pedidos ou credenciais; hashes das imagens e integridade ZIP verificados. Guia de instalação distingue clone com seis amostras, importação completa e transferência do histórico por banco/uploads.
- Ensaio em cópia dos arquivos preparados para Git, sem banco, uploads ou dependências locais copiados: ambos os `npm ci` com npm 11.16.0, bootstrap WordPress/WooCommerce em banco novo, typecheck, build Next.js 16.4.3, 13 testes Python e sintaxe de 32 arquivos PHP aprovados. Falhas temporárias de DNS resolvidas por nova tentativa; portas isoladas 3002/8889 e outro projeto 8080 preservado.
- Atualizações compatíveis dos lockfiles: frontend sem alertas no `npm audit`; seis alertas remanescentes nas ferramentas de desenvolvimento WordPress, com correção sugerida via versão principal wp-env 12 ainda não homologada. Limite registrado em `LOCAL-SETUP.md`. Bloco de instruções Next.js atualizado automaticamente pela nova versão.
- Verificador USD passou a retornar erro de execução quando encontra divergências, para que a reprodução não prossiga como se a conferência tivesse passado.
- Nove testes Playwright aprovados em uma execução conjunta (6,2 minutos) na base limpa com amostras: painel nativo, APIs, operações, concorrência, checkout, conta e vitrine. Catálogo principal também conferido no navegador após atualização de dependências.
- Pacote de 237.141.808 bytes extraído e importado na instalação nova: 370 produtos, 908 variações e sete rascunhos com imagens; 2.405 linhas reconciliadas e seis IDs iniciais preservados. Aplicação/verificação dos 908 preços USD aprovada, sem mudança de históricos. Teste negativo de preço divergente confirmou a saída de erro do verificador e restaurou a entrada privada, sem gravar no banco.
- Verificação final de navegador da cópia recuperada aprovada: catálogo público em USD, imagens, login e editores nativos. Serviços temporários de teste encerrados com volumes preservados; ambiente principal continua em 3001/8888.

## 2026-10-27 — Preços em USD conforme o site público

- Por instrução posterior do responsável, os 908 SKUs passaram a usar os preços públicos USD do katukina.com, confirmando SKU e quantidade. Nenhum câmbio estimado; seletor USD aplicado em sessão anônima quando necessário.
- WooCommerce e canal local em USD. Backup anterior, transação, reconciliação dos 908 preços sem divergências e checksums históricos preservados. Importador GBP protegido contra mudança acidental da moeda após essa atualização.
- Coletor com cache/atualização explícita e atualizador CLI documentados no [relatório da importação](PRODUCT-IMPORT-2026-10-27.md). Treze testes Python e sintaxe PHP/JS aprovados.

## 2026-10-27 — Cadastro da planilha Sacred Incense UK

Origem: cadastro de todos os produtos do XLSX fornecido; aprovação explícita para usar GBP e os preços da planilha na loja de teste.

- Importados 370 produtos variáveis, 908 variações e sete rascunhos de correspondência ambígua, todos com imagens. SKUs textuais e seis IDs preexistentes preservados; 2.405 linhas de origem reconciliadas sem duplicar SKUs ou somar saldos repetidos.
- Moeda WooCommerce GBP e novo canal fictício `LOCAL-DEMO-GBP`, preservando canal anterior, avisos e pedidos históricos. Saldos da planilha permanecem como referência e a disponibilidade para venda aguarda conferência; pesos, IVA, HS e descontos não foram inferidos.
- Parser, downloader com cache e importador CLI local com backup, prévia, retomada e verificação. Dados privados fora do Git e bloqueados por HTTP. Seção em inglês `Imported source data` nos editores nativos; duplicação WooCommerce remove identidade e metadados da importação.
- Verificações: 11 testes Python, sintaxe PHP/JS, 13 verificações de duplicação em memória, Playwright do catálogo/editor, hash da fonte, preços e quantidades, imagens, preservação dos históricos e reexecução sem novos produtos. [Relatório e reprodução](PRODUCT-IMPORT-2026-10-27.md).
- Docker Desktop recuperado após autorização de reinício; volumes preservados e outro projeto na porta 8080 confirmado acessível.

## 2026-10-22 — Ambiente de teste reproduzível pelo Git

Origem: pedido de commit/push com instruções para outro computador; autorização explícita para incluir credenciais de teste e exigir rotação antes de publicação.

- `LOCAL-SETUP.md` e README descrevem clone, dependências, bootstrap, execução, atualização, testes e persistência. `setup:local`/`wp:setup` iniciam o WordPress, preparam acesso local, importam seis produtos/fotos e configuram o canal fictício. Reexecuções preservam dados e senha existentes; banco já inicializado sem arquivo de acesso não tem sua senha substituída automaticamente.
- Exemplo de acesso público de teste versionado por autorização do responsável. Documentação e AGENTS exigem rotação de credenciais/chaves/salts antes de qualquer publicação. Senha efetiva anterior, exports de clientes, dashboards privados, runtime e backups foram excluídos do commit; `.gitattributes` preserva os nove documentos de origem byte a byte.
- Compose descoberto pelo checkout, sem nomes fixos de containers. Testes usam SKU em vez de IDs locais; runner seleciona npm conforme a plataforma. `typecheck` gera os tipos Next.js em uma cópia nova. `next-env.d.ts` permanece local e é gerado automaticamente.
- Validação em cópia temporária dos arquivos preparados para Git, sem banco, uploads ou dependências copiados: instalação npm pelos dois lockfiles; bootstrap completo em banco novo nas portas isoladas 3002/8889; seis produtos/fotos importados; HPOS, bloqueio de e-mail, noindex e loopback HTTP 200 confirmados. Typecheck, build e cinco testes Python passaram. A reexecução no ambiente anterior também preservou as seis amostras e o acesso existente.
- Node 25.2.1 usado no ensaio. A instalação inicial com npm 11.6.2 mostrou avisos de engines das ferramentas Playground; pré-requisitos corrigidos para Node >=24.18 e npm >=11.16 conforme as dependências fixadas. Windows validado; scripts portáveis não equivalem a ensaio em Linux/macOS.
- Reinstalação real do backend com npm 11.16.0 aprovada; wp-env 11.17.0 executou com essa instalação. Verificação de navegador confirmou login com a credencial de demonstração, APIs, carrinho e Products. Repetição do bootstrap no banco novo preservou senha e os mesmos seis IDs de produtos; backup SQL gerado nessa cópia (sem ensaio de restauração nesta etapa).
- Ensaio completo inicial: seis cenários Playwright aprovados e duas falhas. Corrigido redirecionamento administrativo que fixava 8888; cenário headless passou isoladamente. Corrigida resposta descartada do carregamento do checkout que podia apagar endereços digitados no Strict Mode; checkout real e novo teste de resposta atrasada passaram isoladamente. Total de nove cenários aprovados ao concluir as correções, sem alegar uma nova execução conjunta. Sintaxe dos 30 arquivos PHP próprios e dos scripts Node verificada.

## 2026-10-22 — Auditoria do escopo inicial e lacunas comerciais

Origem: cobrança do responsável sobre Sendcloud, HS integrado, múltiplos sites sobre um backend, escolha de publicação por produto e demais exigências iniciais.

- `FUNCTIONAL-COVERAGE.md` compara todos os domínios/IDs com código e configuração local, distinguindo implementação, cadastro preparatório, ausência e dependência externa. Corrigidas interpretações históricas de exportação contábil, inserção de templates, amostras e publicação por canal.
- Consultas somente leitura confirmaram ausência do Sendcloud, um canal ativo, zero classificações HS/transportadoras/transições/publicações, impostos desativados e apenas gateway fictício habilitado. Nenhum dado pessoal ou credencial foi incluído no relatório.
- Reforçados PLT-002/CAT-003 e ADR-002 quanto ao objetivo funcional de um backend e seleção de produtos por site; registrado LOG-003 para Sendcloud/HS. Isso registra exigências, não conclusão da implementação nem aprovação de políticas fiscais/estoque compartilhado.
- Adicionado `wordpress/tools/audit-functional-coverage.php`, executado por WP-CLI local, que retorna apenas configurações públicas e contagens agregadas. Não houve instalação/configuração de integração comercial nem nova bateria funcional nesta auditoria.

## 2026-10-22 — Administração em inglês e navegação nativa

Origem: pedido explícito para usar inglês nos módulos complementares e seguir a consistência das telas WooCommerce, com listagem inicial e botão para adicionar. Requisito REQ-ADM-001.

- Menus, campos, ajuda, avisos e validações do Katukina Core em inglês, incluindo produtos/variações, pedidos/picking, perfis/créditos, permissões e métodos locais de teste. Dados cadastrados e histórico não foram traduzidos.
- Fornecedores, contatos e cadastros operacionais abrem em listagem com nome clicável e ação Edit. Add new e Back to list separam criação/edição e consulta. Fornecedores exibem referência, e-mail, telefone, país e status; campos usam dimensões e classes nativas. Settings oculta Save changes nas listagens e redireciona criação para o registro salvo.
- Lotes, reservas e fracionamento exibem listas com ações separadas e retorno; cabeçalhos dos relatórios possuem rótulos legíveis. Preservados permissões, nonces, IDs, controle de versão, comandos idempotentes e regras de negócio.
- Investigação da regressão de variações encontrou `WP_SITEURL` regravado pelo wp-env em 8888. O wrapper restaura a origem pública após start por Compose/WP-CLI local, sem segunda resolução remota do wp-env. Verificação headless e teste de variações exigem a mesma origem pública para AJAX.
- Validações executadas: sintaxe PHP do plugin e MU-plugin, sintaxe Node do wrapper, `npm.cmd run typecheck`, inicialização com restauração automática de `WP_SITEURL` e verificação headless (admin em 3001, loopback REST HTTP 200). Capturas de fornecedores, formulário e configurações revisadas.
- Playwright: seis cenários aprovados ao concluir as correções — navegação/lista/criação/edição complementar; produtos e variações; pedidos e configurações; operação/permissões/concorrência; carrinho/checkout; conta/privacidade. A última execução conjunta teve cinco aprovações e uma falha de seletor ambíguo entre registros sintéticos de mesmo nome; o cenário complementar passou isoladamente após restringir o seletor à referência única. A falha anterior de variações foi resolvida pela correção de origem, não apenas pela ampliação da espera.

## 2026-10-19 — Versão 0.8

Origem: “Implemente tudo que for possível”, após a comparação do escopo com a instalação inicial.

- Plugin Katukina Core 0.2.0: cadastros tipados, tabelas InnoDB, capacidades por operação, auditoria, versão esperada e comandos idempotentes; Item/Form separados e vinculados aos seis exemplos. Empresas, depósitos e canais modelados separadamente.
- Estoque por lote com entrada, ajuste, reserva por linha, expiração/liberação, baixa em embalagem, reconciliação e reposição agregada. Fracionamento com conservação de conteúdo, perda, sobra, origem e reversão da saída ainda não movimentada. Matriz de estados permanece vazia; 13 rótulos preservados e SHORT NOTE disponível na lista HPOS.
- Créditos e recebimentos manuais por cliente/pedido e moeda, precisão explícita, referência única e proteção contra saldo negativo; picking, expedições/rastreio manual, quatro notas de país, cadastros fiscais com vigência/fonte, atendimento/templates/consentimento/campanhas em rascunho, CSV e relatórios. Não ativados gateways, envio externo, transporte real ou tributação presumida.
- Next.js: carrinho Store API, quantidades, cupons, país/postcode, cálculo de entrega, revisão final, checkout fictício local com repetição idempotente e conta com autenticação nativa/histórico privado. País e bloqueio por apresentação validados no servidor; aceite versionado não sobrepõe proibição. Reserva operacional automática para SKUs com lotes; sem baixa física no checkout.
- Canal/empresa `LOCAL-DEMO`, destino GB, entrega sem despacho e prazo inicial de reserva de 60 minutos são fixtures explícitas de desenvolvimento. Produtos de exemplo continuam sem quantidades reais. Moeda USD dos exemplos não define política de produção.
- Validações: build/typecheck aprovados; sintaxe PHP e JavaScript; 34 verificações de domínio; cinco cenários de navegador (headless, operação/concorrência, carrinho/checkout, conta e vitrine). Identificados e corrigidos o retorno idempotente no filtro REST, o registro do método de entrega e o retorno ao login após logout. Cenários afetados repetidos após correção.
- Revisão visual das quatro rotas comerciais em 1440/390/320 px: sem overflow ou erros JavaScript, capturas e evidência em `artifacts/operations-visual-verification.json`. Backup SQL antes da instalação e backup posterior com SHA-256; restauração posterior executada em banco temporário isolado e removido após conferência.
- [OPERATIONS.md](OPERATIONS.md) registra ADR-008, cobertura requisito a requisito, limites de operação, contratos e instruções. Fontes originais, planilhas, dashboard e outros projetos locais preservados; sem deploy ou push.

## 2026-10-19 — Versão 0.7

Origem: pedido explícito de rebrand drástico com o padrão de fundo preservado e preferência por visual clean; relato posterior de confusão ao acessar o painel pela porta 8888.

- Nova identidade visual no frontend: Manrope local, branco/grafite/verde, novo símbolo/wordmark/favicon, hero orientado ao produto, estrutura editorial, cards, rodapé e detalhe de produto com atributos reais. Fundo original preservado em baixa opacidade. Fontes/assets antigos permanecem como referência fora da vitrine ativa.
- Busca expansível e menu mobile com fechamento por Escape e retorno de foco. Produtos continuam vindos da Store API; nenhuma regra de preço, estoque ou pagamento foi alterada pelo rebrand.
- Entrada direta em login/painel na porta interna 8888 agora redireciona ao endereço público 3001 antes do formulário. Destino fixado à origem configurada, sem alteração da senha ou da autorização WordPress. Incluídas regressões de ambos os caminhos no teste de integração.
- Build Next.js/TypeScript, lint PHP e os dois testes Playwright passaram. Login validado com as credenciais locais, incluindo encaminhamento de `/wp-admin/` e `/wp-login.php` a partir de 8888. Home, catálogo e produto conferidos em desktop/mobile, com imagens carregadas, Manrope aplicada, sem erros JavaScript e sem overflow até 320 px. Capturas revisadas; evidência em `artifacts/rebrand-verification.json`.

## 2026-10-19 — Versão 0.6

Origem: pedido explícito para consultar katukina.com e cadastrar produtos de exemplo no WordPress novo.

- Cadastrados seis produtos simples, uma apresentação por Item observado: Palo Santo, Myrrh, Benzoe, Harmony, Incense Burning Set e Charcoal Discs. Preservados SKU e IDs separados de Item/Item Form, categorias, apresentação, origem, URL/data da fonte e preço exibido em USD. Descrições resumidas; seis fotos copiadas para a biblioteca local.
- Manifesto e imagens em `wordpress/tools/fixtures/`; importador exclusivo para WP-CLI/local verifica moeda e conflitos e preserva cadastros concluídos. Executada repetição: os mesmos seis IDs foram preservados sem duplicatas. Lint PHP, sintaxe Node e build Next.js aprovados.
- REQ-CAT-004 e SAMPLE_CATALOG.md registram aceite, fontes e reprodução. USD é apenas a moeda de apresentação observada e o padrão local já existente; não define política comercial. Sem estoque físico, impostos, lotes, clientes ou pedidos importados.
- Na verificação da versão compilada, a geração do sitemap encontrou timeout ao solicitar conteúdo completo de páginas WordPress. Consulta reduzida a `slug,modified`, dispensando renderização de blocos para listar URLs; teste agora confere também o status HTTP.
- Após o ajuste, os dois testes Playwright passaram na versão compilada. Conferidos os seis SKUs/preços, imagens locais e páginas individuais (HTTP 200), ausência de imagens quebradas e layout mobile; capturas desktop/mobile revisadas. Evidência em `artifacts/sample-catalog-verification.json`.

## 2026-10-19 — Versão 0.5

Origem: pedido explícito para usar Next.js em todas as páginas públicas, encaminhando administração/recursos necessários ao WordPress e criando a estrutura do escopo.

- Next.js confirmado no ADR-001; acrescentados ADR-007 e REQ-PLT-004. Site e painel no mesmo endereço, porta 3001 porque 3000 já estava ocupada. Backend Docker em 8888; rotas encaminhadas por allowlist, preservação de `/wp-admin/`, contexto HTTP público configurado e chamadas internas mantidas na rede Docker.
- Catálogo, busca, coleções, produto, artigos e páginas passaram a consumir WooCommerce/WordPress no servidor. Metadata, sitemap e schema usam conteúdo publicado. Preservado o código do protótipo fora das rotas ativas. Carrinho/checkout/conta/frete têm estrutura de navegação com indisponibilidade explícita; não criam transações.
- Instalado plugin `katukina-core` com roteamento headless, menu administrativo e registro dos módulos. Catálogo/pedidos/conteúdo têm acesso aos recursos nativos; inventário/lotes, fornecedores, produção, canais, logística, pagamento, fiscal, CRM e migração continuam planejados. Endpoint de módulos exige capacidade administrativa.
- Verificações executadas: TypeScript e build Next.js; lint PHP dos cinco arquivos de plugin/MU-plugin; loopback REST dentro do Docker HTTP 200; testes Playwright de páginas públicas, SEO/404/mobile e integração real, incluindo login, permissões, assets do painel, publicação, busca, categoria, edição, despublicação e artigo. Dados temporários removidos pelos testes. Revisadas capturas desktop/mobile.
- Documentação operacional atualizada e mapa completo em HEADLESS.md. Sem implantação remota, importação de legado ou definição implícita de regras comerciais/multi-site.

## 2026-10-19 — Versão 0.4

Origem: pedido explícito do responsável para criar o ambiente local e instalar as dependências usando o Docker existente. Autor da implementação: Codex.

- Iniciado Docker Desktop e criado ambiente isolado em `wordpress/` com wp-env 11.17.0, WordPress 7.1.3, WooCommerce 11.2.1, PHP 8.3 e MariaDB 11.4. Dependências e lockfile próprios; dependências do frontend preservadas. Site em `127.0.0.1:8888` e banco em porta dinâmica local, separados do projeto preexistente em 8080.
- Ativados HPOS, links permanentes e páginas básicas; questionário inicial dispensado sem inventar dados da empresa. MU-plugin local impede indexação, envio externo de e-mails e rastreamento WooCommerce. Setup repetido confirmou preservação das configurações.
- Senha administrativa aleatória aplicada sem expor o valor na linha de comando. Arquivo de acesso, runtime e dependências confirmados como ignorados pelo Git. Adicionados comandos `wp:*` e guia operacional.
- Validações executadas: sintaxe dos scripts Node; lint PHP do MU-plugin; execução dos helpers WP-CLI; HTTP 200 na home, noindex, REST API, Store API, emissão de Cart Token, login administrativo e painel de Produtos via Chromium/Playwright. Parada e retomada concluídas; repetição da verificação confirmou login/configuração preservados. PHP 8.3.35, MariaDB 11.4.13 e banco saudável observados após reinício. `git diff --check` passou.
- Atualizados auditoria, plano de início, índice, READMEs e diretrizes; registrado ADR-006. Integração da vitrine, catálogo sintético, regras comerciais, plugin de domínio e backup/restore seguem pendentes. Nenhum dado legado foi importado, e nenhuma hospedagem remota foi criada.

## 2026-10-19 — Versão 0.3

Origem: o responsável confirmou uma instalação nova e limpa de WordPress + WooCommerce e reafirmou frontend headless rápido e preparado para SEO. Autor da atualização técnica: Codex.

- ADR-001 aceito para a camada comercial WordPress/WooCommerce limpa e a arquitetura headless. Next.js, plugin modular próprio, infraestrutura e demais ADRs permanecem propostas; as alternativas anteriores foram preservadas como histórico da decisão.
- Atualizado REQ-PLT-001 com a nova origem explícita, preservando os 38 IDs. Atualizados AGENTS.md, READMEs, auditoria e plano de migração para refletir a decisão mais recente sem alterar as fontes originais.
- Criado START.md com sequência recomendada: ambiente reproduzível, modelo mínimo, fluxo comercial de teste, SEO/desempenho e ampliação operacional. Separado o início da aplicação nova das dependências de migração e gateway real.
- Consultada documentação oficial de WordPress, WooCommerce e Next.js; referências junto às recomendações. Esta atualização é documental: não instalou WordPress/WooCommerce nem criou integração, hospedagem ou cobrança.

## 2026-10-19 — Versão 0.2

Origem: resposta do responsável indicando `C:\Users\User\Desktop\katukina` como possível localização do legado e informando que não o teria por ora caso não fosse encontrado ali. Autor da inspeção e atualização: Codex.

- Inspecionado o diretório indicado somente para leitura. Inventariados 26 arquivos fora de dependências/build/caches, incluindo ocultos/ignorados; lidos README/package.json e verificados trechos relevantes de código/scripts.
- Confirmado outro protótipo de frontend Next.js, com catálogo estático e sacola/favoritos no navegador. Não encontrados código PHP, dump/banco, backup compactado ou documentação do gateway no escopo pesquisado.
- Atualizados AUDIT.md, MIGRATION.md e o índice. Q-01 e Q-02 continuam pendentes; registrada a indisponibilidade atual do legado informada pelo responsável. Sem mudança de requisito ou aprovação dos ADRs.
- Nenhum arquivo do diretório adicional foi alterado. Não houve mudança de aplicação nem necessidade de repetir testes de código nesta atualização documental.

## 2026-10-19 — Versão 0.1

Autor: Codex, execução técnica do pedido de leitura e aplicação dos arquivos fornecidos. Não há registro de aprovação de stack final ou de operação em produção.

- Lidos integralmente KATUKINA_SKILL.md, KATUKINA_MASTER_PROMPT.md e os sete arquivos de skill.zip. Confirmada identidade binária entre os documentos avulsos e suas versões no pacote.
- Preservadas nove cópias de arquivos em `skills/katukina-architecture/` e `docs/katukina/sources/`, com manifesto SHA-256; o ZIP original permaneceu em Downloads.
- Criado AGENTS.md para aplicar as diretrizes no contexto deste repositório; README passa a apontar para o discovery. Nenhuma instalação global da skill foi realizada.
- Inspecionados código da vitrine, importador/dashboard e dois exports XLSX; registrados achados e limitações em AUDIT.md.
- Criado auditor somente de leitura, sem dependências externas, com relatório estrutural/agregado. Encontradas 4.777 linhas, 4.769 IDs distintos, oito IDs repetidos e 26 células numéricas incompatíveis. Esquemas de 127 e 131 colunas; ENGINE CURRENCY sem código identificado.
- Criados 38 requisitos rastreáveis, cinco ADRs propostos, modelo lógico, contratos iniciais e plano de migração com dez dependências identificadas. Preservados os 13 estados do levantamento; transições não foram inventadas.
- Validações executadas: cinco testes unitários do auditor aprovados, auditoria dos XLSX concluída e `npm.cmd run typecheck` aprovado. Verificados os hashes das nove fontes incorporadas e das duas planilhas, 30 links locais, IDs únicos dos 38 requisitos, os 13 estados e as referências às dez dependências. `git diff --check` passou para a alteração rastreada; os nove novos arquivos de autoria técnica também passaram na conferência de espaços finais e término de linha.
- Sem alteração no código da vitrine/dashboard, banco, planilhas ou configuração de produção; sem commit, push, deploy ou envio de mensagens externas.

## Alterações futuras

Adicionar data, autor, origem/evidência, IDs de requisitos/ADRs afetados, conflito, impacto e resultado dos testes apropriados. Atualizar o estado de uma decisão apenas quando houver decisão real identificável; preservar as fontes originais.
