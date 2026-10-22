# Operação local Katukina — histórico substituído

Documento histórico: o responsável rejeitou o painel paralelo e o catálogo separado. A implementação vigente está em [OPERATIONS.md](../OPERATIONS.md), com administração nativa. Links e instruções abaixo retratam a versão anterior e não devem ser usados para operar a versão atual.

Versão 1.0 · 2026-10-19 · Implementação local solicitada pelo responsável: “Implemente tudo que for possível”.

Acesso: [painel Katukina](http://localhost:3001/wp-admin/admin.php?page=katukina), [loja](http://localhost:3001/shop), [carrinho](http://localhost:3001/cart), [checkout](http://localhost:3001/checkout) e [conta](http://localhost:3001/account). Não houve implantação remota nem alteração do site público original.

## Cobertura entregue e limites

| Área / requisitos | Implementação disponível | Limites reais |
| --- | --- | --- |
| Catálogo — CAT-001/002/004 | Item mestre, apresentação, vínculo único ao produto/variação WooCommerce, fornecedor, unidades, conteúdo, localização, VAT category, HS group, descrição aduaneira, IDs de origem; seis exemplos vinculados sem criar saldo | RT PRICE preservado sem interpretação; imagens/preços/categorias continuam no editor WooCommerce |
| Empresas/canais — PLT-002 | Empresas, depósitos, canais, moedas/idioma/destinos separados; canal atribuído ao pedido; lotes isolados por proprietário e depósito | Um frontend ativo. Publicações/preços/traduções por canal são cadastros preparatórios; implantação das outras lojas, câmbio e catálogo independente ainda precisam de definição |
| Acesso — PLT-003 | Capacidades por catálogo, estoque, pedidos, financeiro, CRM, configurações e relatórios; administração em Usuários; API com permissões e nonce | Permissões por operação abrangem todas as empresas desta instalação. Não há isolamento de usuários por empresa/canal; não utilizar como sistema multi-tenant |
| Fornecedores/contatos — CRM-001/002 | Cadastros, contato ligado a fornecedor/usuário, vínculos com itens, lotes e mensagens | Cadastro real depende dos dados da operação; sem importação automática do legado |
| Estoque — INV-001/002/003 | Recebimentos, ajustes compensatórios, lotes, validade, localização, reservas por linha/pedido, liberação, expiração, baixa, relatório agregado de reposição, histórico e reconciliação | Não importar quantidades presumidas; desativar o controle de saldo nativo do SKU antes de adotar lotes. Retorno/reenvio não repõem estoque automaticamente |
| Produção — PRD-001/002 | Fracionamento atômico de um lote de granel para uma apresentação, conservação de conteúdo, perda, sobra, origem, validade e custo total declarado; reversão se saída ainda não movimentada | Sem receitas com vários insumos, consolidação de múltiplos lotes ou rateio contábil automático de custos. Correções após movimentação requerem ajuste supervisionado |
| Pedidos — ORD-001/002/003 | 13 rótulos, SHORT NOTE na lista HPOS, matriz configurável, versão esperada e histórico; PACKED AND PENDING baixa reservas completas uma vez | Matriz vazia inicialmente. Transições de devolução, extravio e reenvio precisam de aprovação operacional; não inferidas da ordem dos rótulos |
| Checkout — CHK-001/002/003, CAT-003 | Carrinho real, alteração/remoção, cupons WooCommerce, país/postcode, cotação, revisão de endereço/itens/total, notas públicas por destino, aceite versionado, bloqueio de países por apresentação no servidor | Somente pagamento fictício local está habilitado. Uma moeda de exibição/cobrança; VAT depende de configuração validada no WooCommerce. Não há conversão cambial |
| Reserva no checkout | Alocação atômica dos SKUs com lotes no canal atual, lote mais antigo primeiro, sem consumo físico | Demonstração permite os seis exemplos sem estoque real. Fora do modo local, item físico sem estoque operacional é recusado. Reserva expirada não autoriza nova tentativa de pagamento |
| Logística — LOG-001/002 | Cadastros de serviços, seguros e contrato; quatro notas separadas; picking imprimível; expedições e rastreio manual; calculadora usa o carrinho WooCommerce | Método de entrega fictício GB sem despacho. Tarifas reais, etiquetas, seguro e tracking automático exigem contratos/credenciais |
| Financeiro — CRM-003, PAY-002/003, FIN-001 | Livro de crédito e recebimentos/reembolsos manuais por moeda, precisão explícita, referência única, saldo sem débito excedente; exportação contábil de pedidos | Não cobra, não confirma pagamento automaticamente nem consome crédito no checkout. Conciliação com extrato/gateway e câmbio continuam dependentes de documentação |
| Fiscal — FIS-001/002 | Registro de jurisdição, categoria/grupo, taxa/código declarado, vigência e fonte de validação | Os registros não instalam alíquotas no motor WooCommerce nem geram invoice aduaneira. Validação fiscal e integração documental pendentes |
| Atendimento — MSG-001/002/003 | Contas de origem, registros manuais/rascunhos, vínculos com pedido/fornecedor/contato, inserção de templates | Sem leitura/sincronização de caixas externas ou envio de mensagens SHIPPED |
| Marketing — MKT-001/002/003, INV-004 | Cupons nativos no carrinho; inscrições/consentimento por finalidade; templates e campanhas com prévia de audiência deduplicada; cadastro de amostras | Sem campanhas enviadas nem disparo automático de retorno ao estoque. Amostras exigem saída de estoque manual com referência comum |
| Conta de cliente | Cadastro/login/logout com cookies nativos WordPress; histórico somente do usuário autenticado; paginação | E-mail desativado localmente; recuperação de senha usa tela nativa e precisa de entrega de e-mail em ambiente real |
| Relatórios — ANA-001, FIN-001 | Estoque, reposição, reservas, produção, créditos, recebimentos, pedidos contábeis, volume por mês/canal/moeda/status e auditoria; CSV exporta todas as páginas do filtro | Valores de moedas diferentes não são somados. Relatório de volume separa pedidos de teste; não equivale a receita contábil reconhecida |
| Migração — MIG-001 | CSV de cadastros com validação sem gravação, cabeçalhos explícitos, IDs de origem, edição com versão e commit atômico até 500 linhas | Não migra pedidos/estoque histórico a partir de CSV genérico. PHP/banco legado e regras de transformação seguem ausentes |

Os recursos de SEO, SSR, sitemap, canonical, conteúdo editorial e visual do rebrand permanecem ativos. Traduções e mercados adicionais não foram inventados. O registro de requisitos contém demandas confirmadas e descrições do legado; esta tabela identifica o que efetivamente existe.

## Como começar a operar

1. Em **Cadastros**, registre empresa, depósito e canal. A instalação contém `LOCAL-DEMO`, uma empresa fictícia, depósito vazio e destino GB para teste. Não representam a pessoa jurídica nem mercados reais da Katukina.
2. Em **Configuração da vitrine**, escolha canal, prazo de reserva e modo local. O prazo inicial de 60 minutos e alocação por ordem de criação do lote são escolhas da demonstração técnica, sujeitas à validação para operação real.
3. Crie Item mestre e apresentação. O SKU comercial aponta para o ID do produto WooCommerce; granel usa conteúdo `1` em sua unidade; embalado usa estoque em `unit` e conteúdo por embalagem. Os seis exemplos já foram vinculados.
4. Use **Receber lote** para entradas realmente conhecidas. Quantidades aceitam ponto decimal e até três casas. Custo é total do lote, na unidade menor da moeda informada; não há cálculo cambial automático.
5. Para fracionar, escolha lote granel, apresentação e quantidade de embalagens, perda e motivo. A saída herda proprietário, depósito, fornecedor, lote de origem e validade.
6. Atribua o canal a pedidos administrativos. Pedidos do checkout recebem o canal automaticamente. No relatório Pedidos, expanda `lines` para obter o ID da linha; reserve lotes com validade em UTC.
7. Cadastre as transições efetivamente aprovadas em **Transições autorizadas**. Atualize estado/SHORT NOTE usando a versão do relatório. Embalagem exige permissão de pedidos **e** estoque.
8. Consulte **Reconciliação de estoque**: nenhuma linha significa que os saldos conferem. Use picking para imprimir itens, lotes/localizações e SHIPPING NOTE. BACKOFFICE NOTE não aparece no contrato público.

Para testar a vitrine: adicione um produto, informe um endereço fictício no Reino Unido, revise a entrega de teste e finalize. O pedido fica `on-hold`, marcado `_katukina_test_order=yes`, sem `date_paid`. A implementação de teste nunca chama gateway externo. O canal, frete e gateway fictícios somente funcionam com `wp_get_environment_type() === 'local'` e modo de teste ativo.

## Contratos e segurança

API administrativa: `/wp-json/katukina/v1/schema`, `/records/{kind}`, `/references/{kind}`, `/command/{action}`, `/settings`, `/report/{type}`, `/picking/{id}`, `/import/{kind}`, `/campaign/{id}/preview`. Endpoints administrativos verificam capacidade no servidor; autenticação por cookie exige `X-WP-Nonce`. Referências de dependências expõem apenas ID/código/nome/atividade, sem textos de mensagens, e-mails ou notas privadas.

Comandos exigem `key` de 16–100 caracteres e payload específico; edições exigem `id` e `version`. Erros de validação são 400, conflito 409, autorização 401/403. As transações gravam resultado e histórico de forma conjunta. Cadastros são desativados, não apagados. Importação usa `commit:false` para prévia; `commit:true` executa o lote atomicamente e exige chave. IDs/relações precisam existir antes da importação dependente.

O Next.js usa `/api/commerce/{action}` como intermediário com allowlist de rotas Store API. O Cart-Token fica em cookie HttpOnly, SameSite=Strict; mutações exigem origem configurada e JSON. Preços e totais vêm do WooCommerce. Checkout transmite total esperado e chave de solicitação, valida o token nativo, serializa tentativas pelo carrinho e armazena resposta mínima para repetição. Nunca gravar credenciais bancárias nos cadastros de canais, contas ou meios de pagamento.

Contas usam `wp_signon`, `wc_create_new_customer`, cookies/sessões nativos, origem verificada, limitação de tentativas e nonce para logout. Histórico usa o ID da sessão, ignorando IDs enviados pelo navegador. A associação de pedido ao cliente valida o cookie WordPress no servidor.

## Execução e reprodução

```powershell
npm.cmd run wp:start
docker exec wp-env-wordpress-1b3bdce6-cli-1 wp eval-file /var/www/html/wp-content/katukina-tools/setup-operations-local.php
npm.cmd run build
npm.cmd run start
docker exec wp-env-wordpress-1b3bdce6-cli-1 wp eval-file /var/www/html/wp-content/katukina-tools/verify-operations.php
npx.cmd playwright test
```

O instalador preserva cadastros existentes e não cria saldo. O teste PHP cria fixtures únicas e remove apenas os próprios dados. O teste de concorrência por navegador mantém registros auditáveis prefixados `browserops-`, desativados e com saldo zero após execução; não são dados comerciais. A suíte também cria/remove produtos, clientes e pedidos temporários identificados como teste.

## Dependências para operação real

Documentação/sandbox do gateway, contratos de transportadoras, contas de e-mail autorizadas, jurisdições/regras fiscais, moedas/idiomas por canal, matriz de estados, prazo de reserva e dados do legado. Ainda são necessários validação comercial, perfis por empresa/canal, estratégia de publicação multi-site, homologação de pagamentos/frete/tributos e revisão operacional antes de uma implantação real.

## Evidências e recuperação

- `verify-operations.php`: 34 asserções aprovadas, incluindo produção/reversão, idempotência, saldo reservado, expiração, permissões, créditos/moedas, aceite e bloqueio por destino, privacidade das notas e reserva de checkout expirada.
- Playwright: cinco cenários cobrem publicação headless/admin, formulários operacionais e reservas concorrentes da última unidade, carrinho/cotação/checkout/repetição, conta/login/logout/privacidade, páginas/SEO/mobile. Os cenários afetados por correções foram repetidos e aprovados.
- `verify-operations-visual.mjs`: 12 combinações de rota/largura, nenhum overflow ou erro JavaScript. Capturas do painel, carrinho, checkout, conta e frete revisadas.
- `backup-local.mjs --verify-restore`: exporta somente a instalação local, grava SQL e manifesto SHA-256 na pasta ignorada `wordpress/backups/`, recusa dump que altere o banco de destino e restaura em esquema novo `katukina_restore_<aleatório>`. O esquema temporário é removido após o teste; nunca substitui o banco em uso. Teste executado com sucesso em 2026-10-19, incluindo tabelas de catálogo, posts, lotes e movimentos.

```powershell
node wordpress/scripts/backup-local.mjs --verify-restore
```

O backup SQL inclui dados pessoais e hashes de autenticação: mantenha a pasta ignorada e fora de relatórios públicos. Mídias e arquivos do projeto precisam de cópia junto com o banco para recuperação completa. Para reverter todo este incremento, pare o frontend, preserve um backup novo, restaure somente o banco Katukina a partir da cópia escolhida e recupere a versão correspondente do plugin. Restaurar o banco anterior mantendo o plugin atual reinstala as tabelas vazias, portanto não equivale a rollback de código. Não restaurar sobre as instâncias dos outros projetos.

Referências técnicas consultadas: implementação instalada do WordPress/WooCommerce/Next.js e documentação oficial da [Store API](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/cart/), [tokens de nonce](https://developer.woocommerce.com/docs/apis/store-api/nonce-tokens/) e [tabelas de plugins WordPress](https://developer.wordpress.org/plugins/creating-tables-with-plugins/).

## ADR-008 — autoridade e consistência dos módulos locais

Decisão técnica para o ambiente de desenvolvimento, reversível por backup. Não aprova regras comerciais históricas, fiscais ou de produção ainda desconhecidas.

O catálogo comercial e os pedidos pertencem ao WooCommerce (CRUD compatível com HPOS). Item mestre, apresentação e lote permanecem entidades distintas. O livro de movimentos Katukina é a autoridade para lotes cadastrados no módulo operacional. Produtos de demonstração sem lotes não representam estoque real. Não haverá sincronização bidirecional silenciosa de saldos WooCommerce e Katukina.

Quantidades são inteiros em milésimos da unidade declarada (`g`, `ml`, `unit`). Apresentações embaladas usam unidades inteiras. Valores monetários são inteiros na unidade menor da moeda explicitamente informada; relatórios nunca somam moedas diferentes. Conversões entre massa e volume não são inferidas. Fracionamento conserva conteúdo na mesma unidade, registra perda declarada e preserva o lote de origem.

Transações InnoDB tornam entradas, reservas, baixas e produção atômicas. Um mutex transacional serializa as escritas operacionais nesta instalação local; é uma escolha simples para o volume atual, com possível evolução para bloqueios por agregado após medição. Uma chave de idempotência identifica cada comando; reutilizar a chave com outro conteúdo é conflito. O resultado é gravado na mesma transação. Edição de cadastros exige versão esperada. O histórico não é apagado: correções são movimentos compensatórios com motivo e ator. Reconciliação compara saldos com movimentos e reservas ativas.

Reservar reduz disponibilidade, sem baixar saldo físico. Expirar/liberar uma reserva devolve disponibilidade. Embalar exige alocação completa das linhas do pedido e baixa somente as reservas ativas, uma única vez. Retorno, reenvio e extravio não repõem estoque automaticamente. Os 13 rótulos são preservados em um estado operacional separado do estado financeiro do WooCommerce. A matriz de transições começa vazia e deve ser configurada conscientemente; a ordem da lista não constitui aprovação de transições.

Cadastros de empresas, depósitos e canais não ativam compartilhamento automático. Cada lote tem proprietário e depósito; alocações precisam corresponder ao canal atribuído ao pedido. Cadastros fiscais guardam jurisdição, vigência e referência de validação. Não instalam alíquotas nem códigos HS presumidos no motor tributário WooCommerce.

Alternativas: apenas saldo nativo WooCommerce (não distingue lotes/granel); ERP externo (sem contrato disponível); escrita direta em tabelas de pedidos (rejeitada em favor do CRUD). Consequências: operação explícita de lotes, rastreabilidade e ausência de promessas sobre regras ainda não aprovadas. Antes de produção: validar matriz, precisão/unidades, política de reserva, autorização por empresa, tributação, checkout e integração de pagamento.

Backup anterior às alterações: `wordpress/backups/before-operations-2026-10-19.sql` (ignorado pelo Git). Nunca restaurar esse arquivo sobre outro projeto ou produção.

## Critérios de aceite

- API administrativa recusa visitantes e perfis sem a capacidade exigida; requisições por cookie exigem nonce WordPress.
- Cadastro preserva código de origem; edição concorrente falha em vez de sobrescrever.
- Saldo e reserva nunca ficam negativos; duas reservas da última unidade não podem ser aceitas.
- Repetição idêntica de comando retorna o resultado original; chave reutilizada com outro conteúdo falha.
- Falha no fracionamento reverte consumo e criação do lote; origem, saída e perda ficam consultáveis.
- Crédito por cliente/moeda não admite débito maior que saldo nem repetição duplicada.
- Notas internas permanecem privadas; exportações são autorizadas e neutralizam fórmulas de planilha.
- Nenhuma integração envia mensagens, cobra ou publica sem configuração e autorização próprias.
