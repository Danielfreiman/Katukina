# Arquitetura proposta e decisões Katukina

Versão 0.5 · 2026-10-19 · **ADR-001 ACEITA para WordPress + WooCommerce limpo e frontend Next.js**. Docker conforme ADR-006, headless conforme ADR-007. O pedido posterior “Implemente tudo que for possível” autorizou a implementação local do [ADR-008](OPERATIONS.md#adr-008--autoridade-e-consistência-dos-módulos-locais): livro transacional, idempotência, reserva separada da baixa, precisão e reconciliação. Isso concretiza a alternativa local do ADR-003, sem aprovar políticas comerciais. Infraestrutura remota e decisões comerciais dos ADRs 002–005 continuam abertas. Não houve benchmark de produção.

## Fronteiras e fonte autoritativa

Proposta: separar catálogo editorial, oferta por canal, estoque/produção, pedidos, financeiro, logística e atendimento. Cada informação tem um proprietário lógico; projeções para vitrine/dashboard são derivadas e reconciliáveis. O sistema atual em produção não foi inspecionado para determinar a autoridade vigente.

| Informação | Autoridade futura proposta | Consumidores e condição |
| --- | --- | --- |
| Item, apresentação, mídia e conteúdo | Catálogo WordPress/WooCommerce, com extensão de domínio quando necessária | Vitrines leem publicação por canal; mapeamento de Item/Item Form para produto/variação deve ser validado |
| Lotes, movimentos, reservas, disponibilidade | Serviço de domínio de inventário, integrado ao WordPress | Checkout/pedidos solicitam operações; não gravam saldos paralelos |
| Preço e cotação | Domínio comercial, contextualizado por canal/empresa/destino | Frontend mostra cotação; pedido guarda snapshot e versão das regras |
| Pedido e histórico de estados | Pedidos no WooCommerce, com extensão operacional proposta | Usar APIs de domínio do WooCommerce; pagamentos/expedição mantêm seus fatos e solicitam transições válidas |
| Pagamento e liquidação | Registro interno conciliado com provedor/banco | Callback isolado não substitui reconciliação; protocolo depende de Q-02 |
| Crédito do cliente | Registro financeiro por cliente/moeda/empresa | Ajustes possuem referência e autoria; política de uso depende de Q-05 |
| Envio e rastreio | Domínio de expedição conciliado com transportadora | Eventos não equivalem automaticamente a retorno de mercadoria ao estoque |

## Modelo lógico inicial

Proposta para revisão do domínio, sem DDL ou tabelas criadas. WooCommerce está escolhido como camada comercial; extensões próprias permanecem propostas. Nomes abaixo são vocabulário de domínio, sem implicar duplicar tabelas de produtos/pedidos já atendidas pelo WooCommerce. O mapeamento de PK/FK da migração depende do legado; o modelo novo pode ser desenvolvido com dados de teste. IDs internos não substituem a referência `(sistema_origem, instância_origem, tipo, legacy_id)`.

| Entidade | Campos e unidades principais | Relações, restrições e ciclo |
| --- | --- | --- |
| `legal_entity`, `sales_channel`, `warehouse` | IDs; código do canal; mercado/idiomas; local | Canal, proprietário e depósito separados; vínculos explícitos e auditados; dado fiscal da empresa com acesso restrito |
| `item`, `item_form` | Identificador legado, nome; SKU, peso/volume com unidade, estado ativo | Uma apresentação pertence a um mestre; escopo de unicidade de SKU A VALIDAR; desativação preserva pedidos históricos |
| `channel_listing`, `price_list` | Canal, apresentação, publicação, valor decimal, moeda, vigência | Preços e catálogo independentes do saldo; regra contra sobreposição de vigência a definir; histórico de alterações |
| `supplier`, `contact`, `customer` | IDs de origem, referências e dados de contato | PII com permissões e retenção A VALIDAR; não deduplicar por nome; vínculos históricos preservados |
| `inventory_lot` | Lote, apresentação/insumo, proprietário, depósito/local, unidade | Granel separado de embalagem; genealogia e origem preservadas; estado bloqueado/disponível a definir |
| `inventory_movement` | Tipo, quantidade decimal/unidade, dimensão de estoque, referência, ator/data | Registro auditável; correções compensam o original; unicidade por chave de operação; índice por dimensão/data proposto |
| `inventory_reservation` | Dimensão, quantidade, pedido/contexto, expiração, estado | Reservada/consumida/liberada/expirada como estados propostos; índice para expiração; transição condicional e atômica |
| `production_order`, `production_input/output` | Quantidade/unidade consumida/produzida, perdas/sobras, lotes, referência de custo | Genealogia entrada→saída; unidades compatíveis ou conversão explícita; custo e regra de cancelamento A VALIDAR |
| `order`, `order_line`, `order_status_history` | Canal/empresa, apresentação, quantidade, snapshot de preço/regra, moeda, estado legado, nota | PII de endereço separada de logs operacionais; histórico de transição com versão/ator; máquina de estados depende de Q-06 |
| `payment_transaction`, `customer_store_credit` | Valor decimal, moeda, provedor/referência, estado, evento de origem | Sem float para cálculo de valores; precisão/rounding dependem de Q-05; eventos únicos por provedor/conta; compensações auditadas |
| `tax_rule`, `hs_code_group`, `destination_rule` | Jurisdição, categoria, empresa, vigência, código/string, fonte/validador | Sem alíquotas/códigos pré-assumidos; validação especializada; snapshots no pedido/invoice |
| `shipment`, `support_message`, `consent_record` | Pedido, provedor, rastreio; conta de origem; texto/versão de aceite e data | Acesso e retenção por finalidade; credenciais fora das entidades/logs; conteúdo de cliente não entra em eventos públicos |

Índices, precisão numérica, política de exclusão/anonimização e limites de retenção precisam de volumes, regras operacionais e validação de dados. Proposta de auditoria comum: ator, instante UTC, canal/empresa quando aplicáveis, referência de operação e correlação; não registrar segredos ou payloads pessoais completos.

## ADR-001 Camada comercial e reaproveitamento do frontend

**Estado e origem:** ACEITA para WordPress + WooCommerce limpo, arquitetura headless e Next.js como frontend público exclusivo. A escolha de Next.js foi confirmada pelo responsável após a versão 0.3 deste documento. A fundação do plugin Katukina foi implementada no pedido de estrutura; políticas comerciais e lógica dos módulos permanecem pendentes.

**Contexto e alternativas históricas:** a versão 0.1 comparava WordPress + WooCommerce, camada comercial própria e serviço externo. A decisão do responsável resolve a escolha da camada comercial; a comparação prévia deixa de ser condição para começar. A implementação de estoque/fracionamento e o mapeamento de estados ainda exigem validação de domínio.

**Recomendação de implementação:** iniciar WordPress/WooCommerce em desenvolvimento e homologação com versões estáveis compatíveis e fixadas; evoluir o frontend Next.js já existente; usar um plugin modular `katukina-core` para capacidades de domínio adicionais. Provar catálogo, apresentação, carrinho e pedido de teste antes de expandir o backoffice. Manter os dados de migração em uma frente separada.

**Consequências e trade-offs:** aproveitar produtos, pedidos e recursos comerciais do WooCommerce reduz o escopo a desenvolver, mas exige avaliar a compatibilidade de extensões, APIs headless e políticas de estoque. Domínios próprios aumentam a responsabilidade de manutenção e testes. Custos e desempenho ainda sem medição; autorização e regras transacionais ficam no backend.

**Validação:** provar produto/apresentação, sessão de carrinho, pedido no WooCommerce e isolamento; Q-03/Q-06 para políticas operacionais e Q-02 para o gateway real. Q-01 condiciona a migração, sem bloquear o ambiente novo. **Reversão:** incrementos versionados, backup/restore de homologação e contratos de domínio preservados; mudança de camada comercial exigiria nova decisão do responsável. **Gatilho de revisão:** incompatibilidade funcional relevante demonstrada em testes. A instalação local foi realizada posteriormente, conforme ADR-006; os fluxos integrados continuam pendentes.

## ADR-002 Canais, empresas e WordPress Multisite

**Atualização de requisito — 2026-10-22:** confirmado pelo responsável o objetivo funcional de múltiplos sites atendidos por um backend e seleção de publicação por produto/site. Isso prevalece sobre qualquer indefinição anterior desse objetivo; não decide WordPress Multisite nem aprova compartilhamento de estoque, empresa, preços ou dados. A [auditoria de cobertura](FUNCTIONAL-COVERAGE.md) confirma que o código atual ainda possui uma origem/canal global e não entrega essa seleção.

**Contexto:** três lojas citadas; compartilhamento de estoque, empresa e dados ainda desconhecido.

**Alternativas:** WordPress central com canais explícitos; WordPress Multisite; instalações separadas com integração.

**Recomendação:** modelar canal/empresa/depósito separadamente agora e adiar topologia física. Um núcleo central tende a simplificar operações compartilhadas, mas exige isolamento de acesso rigoroso; instalações separadas aumentam independência e custo de operação/sincronização. Multisite não resolve por si as políticas de saldo e propriedade.

**Consequências:** todas as consultas comerciais exigem contexto autorizado; custo e escala dependem do isolamento definido. **Validação:** preencher matriz Q-03 e testar leitura/escrita entre canais/empresas. **Reversão:** manter identidade de origem e contratos por contexto para permitir separação. **Gatilho de revisão:** nova empresa, exigência de isolamento ou conflitos de operação.

## ADR-003 Autoridade de inventário e consistência

**Contexto:** o levantamento separa reserva/baixa, e inclui granel, lotes e produção. Não existe inventário transacional local.

**Alternativas:** saldo mantido por camada comercial; domínio próprio com movimentos/reservas; sistema externo de estoque.

**Recomendação:** avaliar um domínio de inventário único, com movimentos auditáveis, reservas e operações transacionais. Plugins próprios/tabelas de domínio no WordPress são uma opção proposta, sem esquema físico aprovado. A disponibilidade deverá derivar da política validada de saldos utilizáveis, reservas e alocações por canal.

**Consequências:** evita múltiplos escritores de saldo; adiciona responsabilidade por concorrência, reconciliação e recuperação. Operações exigem idempotência e permissões por dimensão. Eventos só são disponibilizados após commit; outbox é uma alternativa a avaliar, sem fila/provedor escolhidos.

**Validação:** Q-01/Q-03/Q-06; última unidade concorrente, repetição após timeout, expiração simultânea, embalagem, retorno, produção parcial e reconciliação. **Reversão:** migrar projeções a partir dos movimentos e referências preservadas, com corte controlado; não apagar o histórico. **Gatilho de revisão:** descoberta de um sistema autoritativo existente ou falha nos testes operacionais.

## ADR-004 Integrações por adaptadores

**Contexto:** gateway não documentado; transportadoras e e-mail descritos sem contratos disponíveis.

**Alternativas:** acoplamento direto em telas/hooks; adaptadores por capacidade; plataforma intermediária de integração.

**Recomendação:** contratos de pagamento, frete e mensageria separados de provedores. Implementação de autenticação, webhooks e reembolsos fica BLOQUEADA até Q-02; transportadoras e caixas dependem de Q-07/Q-08. Não presumir HMAC, tipos de evento ou APIs específicas.

**Consequências:** testes por contrato e substituição de provedor ficam mais simples; exige tratamento explícito de retry, timeout, duplicatas e reconciliação. Custo de infraestrutura só deve ser estimado após volumes e capacidades conhecidas. Segredos ficam fora do código e dos logs.

**Validação:** sandbox real, assinatura/autenticação conforme manual, moeda, eventos repetidos/fora de ordem, falha/reembolso, rastreio e envio contextual. **Reversão:** alternar adaptador preservando referências externas e conciliação de operações pendentes. **Gatilho de revisão:** recebimento de documentação ou mudança de provedor.

## ADR-005 Importação de exports e identidade de origem

**Contexto:** duas fontes com 127/131 colunas, oito IDs repetidos e 26 células numéricas incompatíveis; ENGINE CURRENCY sem código.

**Alternativas:** importar por posição/última ocorrência; mapear por cabeçalho e preservar versões; aguardar banco para qualquer análise.

**Recomendação:** realizar discovery com os arquivos atuais e preparar importação por cabeçalho qualificado, mantendo arquivo/hash/linha e identidade de instância. O auditor implementado é leitura agregada; ETL e merge de registros continuam propostas. Importação por posição pode trocar campos entre grupos de moeda. Esperar o banco impediria aproveitar evidências já disponíveis.

**Consequências:** staging e relatórios aumentam o trabalho inicial, mas permitem reexecução e comparação. Valores incompatíveis vão para quarentena; ausente não equivale a zero. Somente valores com moeda e precisão verificadas entram na reconciliação financeira. Dados pessoais ficam em staging restrito.

**Validação:** reexecução idêntica, fonte intacta, contagens por origem, conflitos entre versões, Q-01/Q-05 e revisão de moeda. **Reversão:** remover somente o lote importado no ambiente de teste usando mapa de IDs; produção requer plano de cutover e restauração ensaiado. **Gatilho de revisão:** acesso ao banco ou mudança de export.

## ADR-006 Ambiente local de desenvolvimento

**Estado e origem:** ACEITA para desenvolvimento local com Docker, por pedido explícito do responsável em 2026-10-19. Escolha técnica executada: wp-env 11.17.0 em pacote separado, sem alterar dependências do frontend; configuração e operação em [wordpress/README.md](../../wordpress/README.md). Homologação remota permanece proposta.

**Contexto e alternativas:** backend inexistente e Docker instalado. Hospedagem imediata adicionaria configuração/custo externo; instalação manual de PHP/banco aumentaria dependências globais. wp-env gerencia containers e fontes do WordPress/WooCommerce, com configuração no repositório e dados locais separados.

**Decisão implementada:** WordPress 7.1.3, WooCommerce 11.2.1, PHP 8.3, MariaDB 11.4, HPOS ativo e portas restritas ao loopback. Porta 8888 para preservar o projeto preexistente em 8080. Banco em volume Docker, runtime e credenciais ignorados pelo Git. Apenas um ambiente de desenvolvimento; testes adicionais podem ser habilitados quando necessários.

**Consequências e trade-offs:** configuração reproduzível e isolamento entre projetos, com custo local de recursos do Docker Desktop. PHP/MariaDB acompanham as séries de manutenção; não há fixação de digest das imagens. Site local disponível enquanto Docker e containers estiverem ativos. Nenhuma definição de tributação, moeda comercial, estoque ou compartilhamento entre canais decorre dessa instalação.

**Validação:** versões/HPOS por WP-CLI, HTTP/API/login no navegador e persistência entre parada/retomada. **Reversão:** parar o ambiente conserva dados; exportar banco e mídias antes de substituir infraestrutura. Backup/restore ainda não ensaiado. **Gatilho de revisão:** necessidade de homologação remota, novas extensões, incompatibilidade demonstrada ou requisitos de implantação definidos.

## ADR-007 Frontend público e encaminhamento ao WordPress

**Estado e origem:** ACEITA para Next.js servindo o site público e encaminhando administração/recursos necessários ao WordPress, por pedido explícito de 2026-10-19. Implementação e rotas em [HEADLESS.md](HEADLESS.md).

**Alternativas:** subdomínio administrativo separado, proxy de borda dedicado ou rewrites do Next.js. Escolha técnica local: allowlist de rewrites no Next.js, sem outro serviço obrigatório. A infraestrutura de borda de produção permanece em aberto.

**Consequências:** um endereço público para site, painel, APIs e mídias; WordPress gera seus links nessa origem e não serve um tema público concorrente. A barra de `/wp-admin/` é preservada para evitar redirecionamento Apache à origem interna. Cookies e nonce continuam nativos do WordPress. O painel depende do processo Next.js nesta topologia. Porta 3001 escolhida porque 3000 já estava ocupada; backend interno em 8888.

**Dados e SEO:** leitura no servidor pela Store API e REST editorial, sem chaves administrativas no cliente nem cache persistente neste incremento. Fonte do catálogo e conteúdo é WordPress/WooCommerce. Não há autoridade de inventário ou política fiscal nova implícita. Schema e sitemap usam publicações reais; rotas transacionais preparadas permanecem indisponíveis/noindex.

**Validação:** login no mesmo endereço, recursos administrativos, permissões, publicação/edição/despublicação, páginas SSR, erros, sitemap e mobile. **Reversão:** parar Next.js, remover plugin/configuração headless e restaurar origem interna antes de expor o tema de teste; preservar banco/mídias. **Gatilho de revisão:** hospedagem remota, isolamento por canal, limites do proxy, cache por contexto ou novos requisitos de checkout.

## Contratos iniciais para revisão

Todos os caminhos abaixo são **PROPOSTOS, não implementados**. Namespace de domínio `katukina/v1`, a integrar ao WordPress/WooCommerce escolhido no ADR-001; usar Store API para capacidades comerciais atendidas por ela e REST administrativa somente entre servidores autorizados. Regras comuns: autorização no servidor; contexto de canal/empresa verificado contra o usuário; IDs não encontrados fora do escopo retornam 404; erros incluem código estável e referência de correlação, sem dados pessoais. A separação das APIs está documentada pelo [WooCommerce](https://developer.woocommerce.com/docs/apis/).

| Método e recurso | Entrada / validações | Permissão / resposta / efeitos |
| --- | --- | --- |
| GET `/katukina/v1/catalog/items` | `channel`, `locale`, paginação; canal publicado e idioma permitido | Leitura pública só de dados publicados; 200 com Item e apresentações, sem custo/estoque interno; sem evento; GET sem mutação |
| POST `/katukina/v1/inventory/reservations` | `item_form_id`, contexto de estoque, `quantity` decimal e `unit`, referência de pedido; quantidade positiva, unidade compatível e estoque utilizável | Serviço comercial autorizado; 201 com reserva/estado/expiração; 409 se saldo insuficiente ou chave conflitar; evento `inventory.reservation.created.v1` após commit |
| POST `/katukina/v1/production-orders/{id}/complete` | Versão esperada, entradas/saídas/perdas com lotes e unidades; ordem válida e conversões aprovadas | Produção autorizada; 200 com movimentos e genealogia; 409 se versão/saldo mudou; 422 se unidades/regras inválidas; evento `production.completed.v1` após commit |
| POST `/katukina/v1/orders/{id}/transitions` | Estado esperado, estado desejado, motivo, chave de operação; matriz de transições ainda depende de Q-06 | Papel autorizado para a transição; 200 com nova versão/histórico; 409 para concorrência e 422 para transição não permitida; efeitos de estoque definidos pela política, nunca pelo nome isolado do estado |

Mutação sem autenticação recebe 401; autenticada sem capacidade recebe 403; payload malformado recebe 400. Proposta de idempotência: chave no escopo da operação e empresa, hash canônico do pedido, resultado persistido e repetição com o mesmo payload retornando o resultado original; payload diferente com a mesma chave retorna conflito. Janela de retenção, ordem dos eventos e recuperação de operação interrompida são A VALIDAR. Operações sem política definida não devem ser liberadas ao checkout.

Critério para passar a implementação: requisitos do fluxo, papel autorizado, dados/unidades, máquina de estados, fonte autoritativa, dependências externas e aceite verificável definidos. A conclusão deste documento não atende sozinha a esse critério.
