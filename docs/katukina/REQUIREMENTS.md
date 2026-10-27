# Registro de requisitos Katukina

Versão 0.4 · Revisão 2026-10-19 · Prioridade de todos os requisitos: **a definir pelo responsável**. Papéis e critérios de aceite abaixo são propostas para validação; nenhum domínio inteiro está declarado implementado por constar neste registro. Dependências `Q-*` estão em [MIGRATION.md](MIGRATION.md#dependências-e-perguntas). IDs anteriores preservados; acrescentado REQ-CAT-004 para a carga local de exemplos solicitada pelo responsável.

## Origem e estados

Atualização de implementação em 2026-10-19: o pedido posterior “Implemente tudo que for possível” autorizou o incremento local documentado em [OPERATIONS.md](OPERATIONS.md). A matriz de cobertura desse arquivo distingue execução, cadastros preparatórios e lacunas. Os estados de origem abaixo continuam descrevendo evidência/aprovação do requisito, não percentuais de conclusão. Nenhuma regra comercial ausente foi convertida em aprovação implícita.

- **M**: [Prompt mestre](../../skills/katukina-architecture/references/MASTER_PROMPT.md), com seção indicada.
- **B**: [Baseline de arquitetura](../../skills/katukina-architecture/references/architecture-baseline.md).
- **F**: [Inventário funcional](../../skills/katukina-architecture/references/functional-scope.md), com número da seção.
- **O**: [Levantamento original](../../skills/katukina-architecture/references/newSiteFunctions-original.txt), preservado sem alteração.
- **A**: [Auditoria local](AUDIT.md), evidência de 2026-10-19.
- **U-2026-10-19**: instruções do responsável nesta conversa: instalação nova de WordPress + WooCommerce e frontend headless rápido e preparado para SEO. Prevalece sobre as fontes originais que classificavam WooCommerce como proposta.

**CONFIRMADO** = requisito explícito nas fontes fornecidas ou evidência local identificada; **LEGADO OBSERVADO** = comportamento descrito no levantamento, sem auditoria técnica do sistema; **A VALIDAR** = detalhe funcional/política ainda sem confirmação; **PROPOSTO** = solução recomendada; **BLOQUEADO** = dependência essencial ausente. A existência de uma tela no levantamento não aprova automaticamente sua reconstrução com a mesma tecnologia.

## Plataforma e canais

**Reforço explícito de 2026-10-22:** o responsável exige múltiplas vitrines atendidas por um backend, com seleção, no produto, dos sites em que ele será publicado (PLT-002/CAT-003). A implantação e a política de empresas/estoque/preços por canal continuam a definir; a funcionalidade não está entregue. Ver [auditoria atual](FUNCTIONAL-COVERAGE.md).

Motivação: atender várias lojas sem acoplar publicação, empresa e saldo. Risco principal: assumir compartilhamento obrigatório de estoque ou de dados pessoais.

| ID e descrição | Origem / estado | Papéis propostos | Critério de aceite proposto | Dependências |
| --- | --- | --- | --- | --- |
| REQ-PLT-001 Instalação nova e limpa de WordPress + WooCommerce com vitrine headless | U-2026-10-19, M1, B / CONFIRMADO | Administração técnica | Backend novo atende contratos comerciais; vitrine consome catálogo/carrinho/pedidos sem duplicar regras críticas; frontend rápido e preparado para SEO, com critérios detalhados no plano de início | ADR-001; Q-01 somente para migração; Q-02 para pagamento real |
| REQ-PLT-002 Preparar Katukina, Sacred Incense, Jungle Powder e canais futuros | M1, M4 / CONFIRMADO | Administrador de canais | Catálogo, empresa, moedas, idiomas, acesso e disponibilidade são configuráveis por canal; cenários compartilhados e isolados são testados | Q-03, ADR-002 |
| REQ-PLT-003 Contas administrativas e permissões por operação/canal | F07, O ACCOUNTS / LEGADO OBSERVADO | Administrador, operador | Uma conta sem permissão recebe recusa no servidor; operações relevantes registram ator, contexto e data | Q-03, Q-08 |
| REQ-PLT-004 Site público exclusivamente em Next.js; administração e recursos necessários encaminhados ao WordPress | U-2026-10-19, pedido posterior / CONFIRMADO | Visitante, editor, administrador | Páginas públicas renderizadas pelo Next.js; login/painel/APIs no endereço público; catálogo e conteúdo publicados aparecem na vitrine; nenhum tema WordPress concorrente | ADR-007; escopo entregue e limites em HEADLESS.md |

## Produtos, fornecedores e pessoas

Motivação: preservar identidade e relações comerciais. Riscos: fundir Item com Item Form; interpretar RT PRICE/ORIGIN ITEM sem validação; identificar pessoas somente pelo nome.

| ID e descrição | Origem / estado | Papéis propostos | Critério de aceite proposto | Dependências |
| --- | --- | --- | --- | --- |
| REQ-CAT-001 Item mestre com SKU legado, nome, descrição, pesos, volume e RT PRICE | F04, O ITEMS / LEGADO OBSERVADO | Editor de catálogo | Preservar IDs/campos de origem e unidades; um Item pode ter várias apresentações; significado de RT PRICE documentado antes da conversão | Q-01, Q-10 |
| REQ-CAT-002 Item Form com atividade, forma, peso, volume, imagens, categoria VAT, origem e descrição aduaneira | F04 / LEGADO OBSERVADO | Editor, operador fiscal | Cada apresentação remete ao Item mestre e mantém atributos próprios; SKU de venda não se confunde com lote ou saldo | Q-01, Q-04, Q-10 |
| REQ-CAT-003 Categorias, relacionados, publicação por site e países proibidos | F04 / LEGADO OBSERVADO | Editor, administrador de canais | Alterar publicação em um canal não altera os demais; restrições por destino são verificadas também no servidor do checkout | Q-03, Q-04 |
| REQ-CAT-004 Cadastrar exemplos do catálogo público no WordPress local | U-2026-10-19, pedido posterior com katukina.com / CONFIRMADO | Desenvolvimento, editor | Seis produtos com fonte, apresentação, imagem local e preço observado; visíveis pela API no Next.js, sem inventário real ou duplicação na repetição | SAMPLE_CATALOG.md; não equivale a migração completa |
| REQ-CRM-001 Cadastro de fornecedores e seus vínculos | B, M3.2 / CONFIRMADO | Compras, operação | Fornecedor pode ser vinculado a produtos, contatos e entradas com referência de origem, sem duplicação silenciosa | Q-01, Q-08 |
| REQ-CRM-002 Clientes e contatos com histórico de vínculos | F01, O PEOPLE / LEGADO OBSERVADO | Atendimento | Pessoa mantém IDs de origem e relações com pedidos/mensagens; nomes iguais não são fundidos automaticamente | Q-01, Q-03, Q-08 |
| REQ-CRM-003 Crédito de loja por cliente | F01, O STORE CREDIT / LEGADO OBSERVADO | Financeiro, atendimento autorizado | Crédito, débito, moeda, justificativa, autoria e referência ficam auditáveis; uma tentativa duplicada não altera saldo duas vezes | Q-05, Q-08; regra de validade e estorno A VALIDAR |

## Estoque e produção

Motivação: impedir divergência entre granel, pacotes, reservas e posse física. Riscos: overselling, conversão imprecisa de unidades, baixa repetida e perda de genealogia de lotes.

| ID e descrição | Origem / estado | Papéis propostos | Critério de aceite proposto | Dependências |
| --- | --- | --- | --- | --- |
| REQ-INV-001 Estoque por SKU, lote, proprietário e localização | B, M3.3 / CONFIRMADO | Estoquista | Saldo auditável por dimensão; disponibilidade por canal respeita política de alocação; reconciliação explica ajustes | Q-01, Q-03, Q-06; ADR-003 |
| REQ-INV-002 Histórico, notas, local físico e relatórios de estoque baixo | F04–05 / LEGADO OBSERVADO | Estoquista, compras | Entradas/saídas mantêm autoria e referência; limiar configurável produz lista de reposição coerente com saldo validado | REQ-INV-001 |
| REQ-INV-003 Reservar separadamente da baixa física | M4, B / CONFIRMADO | Operação, serviço de pedidos | Duas reservas concorrentes da última unidade não podem ambas ser aceitas; expiração/liberação e idempotência são testadas conforme política definida | Q-06, ADR-003 |
| REQ-INV-004 Aviso de retorno ao estoque | F05, O STOCK LEVELS / A VALIDAR | Cliente, atendimento | Inscrição autorizada associa apresentação/canal; retorno real dispara aviso no máximo uma vez por evento; cancelamento respeitado | Q-08, REQ-INV-001 |
| REQ-PRD-001 Granel e fracionamento com ordem de produção | B, M3.4 / CONFIRMADO | Produção, estoquista | Ordem registra insumos/lotes, apresentações produzidas, quantidades/unidades, perdas, sobras e custos; consumo/saída atômicos e rastreáveis | Q-01, Q-06; REQ-INV-001 |
| REQ-PRD-002 Cancelamento e correção de produção | M5.6, governança / PROPOSTO | Supervisor de produção | Corrigir por movimentos compensatórios auditados; falha parcial não deixa apenas consumo ou apenas saída | Q-06; REQ-PRD-001 |

## Pedidos e checkout

Motivação: preservar a operação e apresentar condições comerciais antes do pagamento. Riscos: converter status em regra financeira implícita, reutilizar uma reserva expirada, registrar aceite sem contexto ou ocultar variação de preço.

| ID e descrição | Origem / estado | Papéis propostos | Critério de aceite proposto | Dependências |
| --- | --- | --- | --- | --- |
| REQ-ORD-001 Preservar 13 estados e SHORT NOTE visível | F03, O ORDERS / LEGADO OBSERVADO | Atendimento, expedição | Todos os rótulos abaixo e IDs legados são preservados; nota aparece na lista; histórico registra transição, ator e motivo | Q-01, Q-06 |
| REQ-ORD-002 READY TO PROCESS sem baixa física; PACKED AND PENDING com baixa no fluxo relatado | F03, O ORDERS / LEGADO OBSERVADO | Embalagem | Repetição da operação não duplica movimento; reserva e baixa têm registros distintos; regra final validada com operador | Q-06; REQ-INV-003 |
| REQ-ORD-003 Retirada, devolução, reenvio e extravio | F03 / LEGADO OBSERVADO | Atendimento, expedição | Cada cenário tem transições e efeitos sobre estoque/pagamento aprovados; retorno não gera reposição automática sem recebimento/inspeção previstos | Q-06, Q-05 |
| REQ-CHK-001 Escolher país cedo e mostrar preço com VAT aplicável | F02, O CHECKOUT / A VALIDAR | Cliente | País/categoria/canal e vigência determinam cotação; preço mostrado e checkout coincidem; alteração exige nova cotação visível | Q-03, Q-04, Q-05 |
| REQ-CHK-002 Moeda de exibição e revisão final de endereço/itens | F02 / A VALIDAR | Cliente | Moedas de exibição e cobrança são explícitas; cliente revê endereço, quantidades, frete e total antes de pagar | Q-05, Q-07 |
| REQ-CHK-003 Avisos por destino e aceite contextual quando aplicável | F02, O COUNTRIES / A VALIDAR | Cliente, administrador comercial | Aviso/versão, destino, pedido e momento do aceite ficam registrados; bloqueios de produto permanecem aplicados independentemente do aceite | Q-04, Q-08 |

### Estados do legado

Os rótulos são preservados literalmente. A ordem da lista não define uma máquina de estados nem autoriza transições adjacentes. Origem: F03 e O ORDERS.

| Estado | Significado relatado | Efeito sobre estoque conhecido |
| --- | --- | --- |
| IN PROGRESS (IN BASKET) | Carrinho aberto | A VALIDAR |
| ORDERED | Pedido colocado | A VALIDAR |
| PENDING ACTION | Pedido revisado, aguardando pagamento ou cliente | A VALIDAR |
| READY TO PROCESS | Pronto para embalar | Sem baixa física, segundo levantamento |
| PACKED AND PENDING | Embalado | Baixa física relatada; reserva/compensação A VALIDAR |
| READY TO SHIP | Pronto para despacho | A VALIDAR |
| SHIPPED | Enviado | A VALIDAR |
| DELIVERED | Entrega confirmada pelo cliente | A VALIDAR |
| PICKED UP | Retirada no depósito | A VALIDAR |
| BEING RETURNED | Em retorno | A VALIDAR |
| RETURNED | Retornado | A VALIDAR |
| RESHIPPED | Reenviado | A VALIDAR |
| LOST | Extraviado | A VALIDAR |

## Pagamentos, fiscal e logística

### REQ-LOG-003 — Integração Sendcloud e dados aduaneiros

- **Origem/estado:** exigência explicitada pelo responsável em 2026-10-22; **CONFIRMADO como requisito**, implementação ausente na auditoria local.
- **Escopo:** conectar o fluxo logístico ao Sendcloud e enviar a classificação HS adequada ao destino, articulado com FIS-002 e LOG-001. Campos cadastrais isolados não atendem ao requisito.
- **Aceite a verificar:** integração instalada e conectada na conta de testes, dados de produto/pedido mapeados, HS resolvido por destino/vigência com fonte validada, inclusão nos documentos/payloads aplicáveis e tratamento de falhas/repetição sem expedição duplicada. Compatibilidade do fluxo headless e capacidades exatas do plugin/API devem ser verificadas na documentação oficial durante a implementação.
- **Dependências:** conta/credenciais de teste e serviços contratados para homologação; classificação aduaneira validada para dados reais. Isso não impede desenvolver os mapeamentos e testes com dados sintéticos.

Motivação: manter valores e obrigações coerentes por jurisdição e operação. Riscos: atribuir GBP a um valor sem identificação, misturar pagamento com estado logístico ou tratar exemplos de HS/VAT como regra legal.

| ID e descrição | Origem / estado | Papéis propostos | Critério de aceite proposto | Dependências |
| --- | --- | --- | --- | --- |
| REQ-PAY-001 Adaptador do gateway externo | M1, M3.7 / BLOQUEADO: contrato ausente | Financeiro, integração | Validar autenticação e webhook conforme documentação; repetição/fora de ordem não duplica pagamento; conciliação e reembolso testados em sandbox | Q-02, Q-05 |
| REQ-PAY-002 Transferências GBP/EUR e meios por país | B, F06 / LEGADO OBSERVADO | Financeiro | Referência bancária concilia pedido, moeda e valor; confirmação financeira é auditável; método indisponível não aparece nem é aceito no servidor | Q-02, Q-05 |
| REQ-PAY-003 Separar moeda-base, exibição, cobrança, contabilização e liquidação | M4, A / CONFIRMADO como separação de domínio | Financeiro | Registrar moeda/precisão de cada valor e fonte/data do câmbio; nenhum total soma moedas heterogêneas sem regra explícita | Q-05; ADR-005 |
| REQ-FIS-001 VAT por jurisdição, categoria, empresa e vigência | F06, M3.9 / A VALIDAR | Responsável fiscal | Regra configurada produz resultados aprovados para casos de referência; pedido preserva regra/versão utilizada | Q-03, Q-04 |
| REQ-FIS-002 Grupos HS com códigos UK/EU/USA por destino | F04, O ITEMS / A VALIDAR | Responsável aduaneiro | Apresentação referencia grupo; invoice/API usa código validado vigente do destino; ausência gera tratamento explícito | Q-04, Q-07 |
| REQ-LOG-001 Países, transportadoras, serviços, seguro e prazo/calculadora | F02, F06 / LEGADO OBSERVADO; API de tarifas A VALIDAR | Logística, cliente | Configuração limita serviços por destino; prazo é mostrado; seguro incluso/opcional segue contrato verificado; falha de cotação não inventa tarifa | Q-07, Q-04 |
| REQ-LOG-002 BACKOFFICE NOTE, SHIPPING NOTE, CHECKOUT NOTE e CHECKOUT WARNING distintos | F02, O COUNTRIES / LEGADO OBSERVADO | Atendimento, picking, cliente | Nota interna não aparece ao cliente; nota de separação aparece no picking; nota/aviso de checkout aparecem no destino certo | Q-07, Q-08 |
| REQ-FIN-001 Exportar pedidos para contabilidade | F03, A / LEGADO OBSERVADO | Financeiro | Export mantém referências, moeda e regras de conciliação; fontes heterogêneas são mapeadas por cabeçalhos e duplicatas tratadas explicitamente | Q-01, Q-05; ADR-005 |

## Atendimento, marketing e descoberta

Motivação: unificar atendimento preservando origem, consentimento e contexto. Riscos: enviar por conta incorreta, publicar dados privados, reutilizar regras sem consentimento ou indexar dados demonstrativos.

| ID e descrição | Origem / estado | Papéis propostos | Critério de aceite proposto | Dependências |
| --- | --- | --- | --- | --- |
| REQ-MSG-001 Caixa unificada das três contas com filtro de origem | F01, M3.10 / A VALIDAR | Atendimento | Conta de origem/remetente permanece identificada; acesso segue permissões; ações são associadas ao provedor real | Q-08 |
| REQ-MSG-002 Vincular mensagens a pedido, fornecedor ou contato e inserir templates | F01 / LEGADO OBSERVADO para templates; vínculos A VALIDAR | Atendimento | Mensagem admite vínculos autorizados; inserir template não envia; histórico preserva conta e contexto | Q-08, REQ-CRM-002 |
| REQ-MSG-003 E-mail SHIPPED com rastreio e conteúdo de produtos | F03, O POST SHIPPING / A VALIDAR | Atendimento, expedição | Template usa idioma/canal e conteúdo editorial validado; reprocessamento não duplica envio; falhas ficam rastreáveis | Q-08, REQ-ORD-001 |
| REQ-MKT-001 Cupons | F07 / LEGADO OBSERVADO | Marketing | Escopo por canal/moeda, validade, elegibilidade e limites são definidos; aplicação concorrente respeita limite aprovado | Q-03, Q-05 |
| REQ-MKT-002 Mailing, templates, campanhas e histórico | F07 / LEGADO OBSERVADO | Marketing autorizado | Seleção respeita consentimento/descadastro; registra campanha, origem e resultado de envio | Q-08 |
| REQ-MKT-003 Amostras | F07 / LEGADO OBSERVADO | Atendimento, estoque | Cadastro e entrega de amostra preservam referência e impacto de estoque conforme política definida | Q-06 |
| REQ-ANA-001 Volume de pedidos e métricas por canal | F07, A / LEGADO OBSERVADO | Gestão | Filtros mostram período/moeda/canal; duplicatas e critérios de receita são explícitos; totais reconciliam com fontes definidas | Q-03, Q-05 |
| REQ-SEO-001 SEO/GEO/AEO desde a arquitetura | M1, B / CONFIRMADO | Editor, desenvolvimento | HTML, canonical, sitemap, schema correspondente a conteúdo real e redirects são verificáveis; indexação da versão real tem revisão explícita | Q-09; sem promessa de ranking |
| REQ-I18N-001 Idiomas, acessibilidade e conteúdo por mercado | M4 / CONFIRMADO como princípio; cobertura A VALIDAR | Editor, cliente | Idiomas/mercados definidos; navegação por teclado e sem overflow; traduções/URLs preservam semântica e relações entre idiomas | Q-03, Q-09 |
| REQ-MIG-001 Migração reproduzível com IDs, reconciliação e rollback | M5.6, F08 / CONFIRMADO | Migração, operação | Dry-run repetido não duplica entidades; contagens/relações/saldos/URLs reconciliados; ensaio de restauração registrado | Q-01; MIGRATION.md |

## Conflitos e controle de mudança

### REQ-PRIV-001 — Cookies e proteção de dados europeia

- **Origem/estado:** pedido explícito do responsável em 2026-10-27; consulta dos dados do controlador no katukina.com também autorizada. **CONFIRMADO:** política e controle de consentimento na vitrine, com integração real ao storage opcional.
- **Aceite:** nenhuma leitura/gravação de histórico antes do aceite; recusa no primeiro nível; finalidade desmarcada; retirada acessível; limpeza/expiração; escolhas válidas entre abas; carrinho e autenticação independentes; fontes e dados do controlador rastreáveis.
- **Implementação e limites:** [PRIVACY-COOKIES.md](PRIVACY-COOKIES.md). Conformidade integral em produção, retenção de registros comerciais, contratos/transferências e cobertura dos direitos sobre módulos próprios continuam **A VALIDAR**. Não presume apagamento de créditos ou dados preexistentes.

### REQ-UX-001 — Estrutura de categorias e produtos inspirada na iHerb

- **Origem/estado:** pedido do responsável em 2026-10-27 de um esquema de engenharia reversa da categoria pública `br.iherb.com/c/bath-personal-care` e de páginas de produto. **CONFIRMADO:** elaboração do esquema; **PROPOSTO:** implementação detalhada em [CATALOG-UX-BLUEPRINT.md](CATALOG-UX-BLUEPRINT.md). Prioridade a definir.
- **Escopo:** categorias com subcategorias, filtros, ordenação e paginação; produto com galeria, apresentação/variação, preço, disponibilidade e compra. Reutilizar identidade Katukina, rotas Next.js, dados e editores nativos WooCommerce; manter a interface em inglês.
- **Papéis/dependências:** visitante navega e seleciona; editor mantém dados nativos; backend valida compra. Depende de contratos de variações, atributos normalizados para filtros adicionais e dados reais para avaliações/entrega. Não depende de reproduzir a infraestrutura interna da referência.
- **Aceite proposto:** filtros reproduzíveis pela URL, contagens de todo o resultado, seleção vinculada ao SKU correto, galeria das imagens cadastradas, bloqueio de compra indisponível, estados de erro e funcionamento por teclado e em dispositivos móveis. Detalhamento e fases no esquema.
- **Limites/dúvidas:** o acesso automatizado ao vivo da iHerb foi bloqueado; a análise usa conteúdo público indexado, sem comprovar layout exato ou comportamento móvel. Taxonomia editorial e evoluções de avaliações/entrega permanecem a validar. Não amplia a cobertura comercial de Sendcloud, estoque ou multi-site.
- **Implementação autorizada em seguida (2026-10-27):** pedido “implemente”. Categoria/busca com filtros e ordenação, produto com galeria e apresentações, carrinho por SKU, relacionados, adaptação móvel e tratamento de erros implementados. Cobertura, verificações e limites na seção 9 do esquema; avaliações, atributos globais e entrega no produto permanecem condicionais.

- **Correção explícita posterior (2026-10-27):** Presentation deve usar swatches; categorias devem ser lista de links, com revisão da referência Grocery para ampliar os elementos ausentes. Revisão implementada na seção 10 do esquema: categorias hierárquicas, swatches, filtros rápidos/faixas/ofertas/avaliação/marcas, ordenação adicional, tamanho de página e histórico local de produtos. Dados ausentes não são inventados.

### REQ-ADM-001 — Inglês e consistência com WordPress/WooCommerce

- **CONFIRMADO:** solicitação explícita do responsável em 2026-10-22, acompanhada da tela de fornecedores.
- **Escopo:** módulos complementares, menus, campos de produtos/variações, pedidos, perfis, configurações e mensagens operacionais em inglês. Documentação do projeto permanece em português.
- **Aceite:** cadastros abrem em listagem; “Add new” abre formulário separado; nome e ação “Edit” abrem edição; “Back to list” retorna à listagem. Tabelas, botões, campos e avisos usam estilos nativos. Lotes, reservas e fracionamento separam consultas de formulários de ação.
- **Preservação:** mesmos registros, IDs, permissões, nonces, controle de versão, idempotência e regras de estoque. Não traduzir automaticamente conteúdo cadastrado pelo usuário ou reescrever histórico.
- **Relação:** complementa ADR-009; não autoriza um painel paralelo nem amplia integrações comerciais.

1. **Decisão atual × fontes históricas:** WordPress + WooCommerce limpo e frontend Next.js foram confirmados em U-2026-10-19. Isso supera o estado dessas tecnologias como proposta nos originais preservados; infraestrutura e topologia multi-site continuam abertas.
2. **EUR na vitrine × GBP relatado no legado × ENGINE CURRENCY sem código:** não converter nem reinterpretar os três contextos; resolver Q-05 antes de importar valores.
3. **IDs deduplicados no dashboard × identidade multi-site não validada:** usar chave de origem/instância na migração até comprovar unicidade; oito repetições locais não justificam merge global.
4. **Lista de estados × transições desconhecidas:** preservar rótulos e levantar ações/transições antes de codificar baixa, devolução ou reenvio.
5. **Telas descritas × funcionalidades implementadas:** o registro acima é cobertura de escopo; os únicos artefatos de execução observados estão em AUDIT.md.

Nenhum requisito anterior foi removido. Novas informações devem registrar origem/data, requisito afetado, conflito, alternativa e impacto no changelog; recomendações não mudam de estado sem evidência de decisão.
