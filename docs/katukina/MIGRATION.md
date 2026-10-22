# Migração e próximas etapas Katukina

Versão 0.3 · 2026-10-19 · Plano de execução **PROPOSTO**, com instalação nova de WordPress + WooCommerce e frontend headless **CONFIRMADOS** pelo responsável. Executado até agora: incorporação das fontes e discovery local descrito em AUDIT.md. Nenhum banco foi alterado, nenhum importador de produção foi executado e nenhum sistema externo foi conectado.

O diretório adicional `C:\Users\User\Desktop\katukina`, indicado pelo responsável, foi verificado: contém outro protótipo de frontend e não forneceu código PHP, banco ou manual do gateway. O responsável informou não ter o legado disponível por ora caso não fosse encontrado ali. Q-01 e Q-02 permanecem pendentes; retomar as etapas dependentes quando surgirem essas evidências, sem repetir a solicitação de localização já respondida.

A decisão de instalação limpa permite avançar no [desenvolvimento novo](START.md) com dados sintéticos. Q-01 limita a migração e a validação histórica; Q-02 limita o gateway real. Nenhuma delas bloqueia a criação do ambiente ou a prova técnica de catálogo, carrinho e pedido de teste. Essa sequência substitui a ordem estritamente dependente do legado nas versões 0.1/0.2.

## Sequência e critérios de saída

| Etapa | Ação e entregável | Critério de saída / estado atual |
| --- | --- | --- |
| 1. Evidência local | Preservar anexos; auditar repositório e exports; registrar hashes, requisitos e lacunas | EXECUTADA; relatório agregado reproduzível, fontes intactas e testes do auditor passando |
| 2. Base nova e fluxo piloto | Preparar WordPress/WooCommerce limpo, plugin base, catálogo sintético e frontend headless conectado | A INICIAR; produto publicado/atualizado e pedido de teste visível no WooCommerce, conforme START.md |
| 3. Políticas por canal | Resolver empresas, depósitos, mercados, idiomas, moedas, catálogo/preço e permissões | A VALIDAR; matriz Q-03/Q-04/Q-05/Q-06 com responsável e evidência |
| 4. Contratos externos e prova comercial | Implementar sobre WooCommerce escolhido no ADR-001; exercitar autoridade de estoque/reserva/pedido e sandbox de pagamento | Gateway real BLOQUEADO por Q-02; pedido de teste disponível sem ele; políticas de estoque dependem de Q-03/Q-06 |
| 5. Auditoria do legado, staging e ETL em paralelo | Quando houver cópia de leitura, inventariar tabelas/PK/FK/arquivos/URLs; implementar extratores e mapa de IDs versionados | Auditoria do banco BLOQUEADA por Q-01; carga futura deve permitir reexecução sem duplicar e explicar conflitos |
| 6. Implementação incremental | Catálogo/canais, inventário, produção, pedidos, checkout, integrações, atendimento e descoberta em incrementos | Ordem PROPOSTA por dependência; cada fluxo atende critérios do registro e testes críticos |
| 7. Ensaio e corte | Dry-run integral, conciliação, ensaio de restauração, redirects, operação assistida e corte controlado | PENDENTE; critérios de aceite aprovados e evidência de recuperação; execução de produção depende de autorização específica |

## Mapeamento inicial dos exports

O destino é lógico e ainda não corresponde a tabelas criadas. A cópia do banco é necessária para validar a identidade de cada domínio; exports contábeis não substituem itens de pedido, produtos ou inventário.

| Origem | Destino proposto | Transformação e validação |
| --- | --- | --- |
| Arquivo/hash/planilha/linha | Registro de staging e origem | Preservar integralmente; cada lote identifica versão do extrator e da transformação |
| `order id`, `invoice code` | Referências do pedido/documento | Preservar como identificadores; confirmar unicidade por instância/empresa; não deduplicar globalmente |
| `order date`, `date paid` | Datas de origem do pedido/pagamento | Preservar texto e precisão; timezone/hora A VALIDAR; data sem hora não ganha horário inventado |
| `RT or WS` | Classificação comercial de origem | Não converter diretamente em site, empresa ou canal; precisa de tabela de correspondência |
| `name`, `vat #` | Dados de pessoa/documento, em staging restrito | Não usar nome como chave; preservar células incompatíveis, sem despejar PII em logs |
| `paid Y/N`, `paid into` | Indicador/conta de origem | Não inferir transação liquidada, provedor, chargeback ou estado logístico apenas pelo indicador |
| `shipped to country`, `EU / non EU` | Destino/classificação registrados | Preservar classificação histórica; não recalcular situação tributária sem regra vigente comprovada |
| `order currency`, `rate` | Moeda e taxa registradas | Confirmar sentido, fonte, instante e precisão do câmbio; não inferir a moeda-base pelo rótulo |
| `ENGINE CURRENCY · ...` | Valores na moeda-base identificada | Bloquear importação financeira sem Q-05; reconciliação com precisão e rounding aprovados |
| `ORDER CURRENCY · ...` | Valores na moeda do pedido | Decimal e moeda explícitos; ausente não é zero; soma somente dentro de moedas homogêneas |
| Grupos VAT, Shipping, Fees, Insurance, ajustes, TO PAY | Snapshot contábil da origem | Usar grupo + subgrupo + título; aceitar versões de esquema; não escolher alíquotas pela posição |
| Campos sem título / valores incompatíveis | Quarentena e referência de célula | Manter valor/tipo original em staging; resolução documentada, sem coerção silenciosa |

Produtos, apresentações, lotes, fornecedores, links de contato, linhas de pedido, histórico dos 13 estados, URLs e mídias aguardam levantamento real. Para cada tabela, preencher: origem, chave, FK, tipo/unidade, destino, transformação, volume, órfãos, dados pessoais, índice, regra de deduplicação, teste e responsável.

## Dry-run, idempotência e reconciliação

1. Capturar cópia consistente de banco/arquivos e manifesto de hashes, data e escopo. Validar leitura/restore em ambiente isolado antes de transformar.
2. Extrair para staging com versão e proveniência. Preservar ID original, instância, tabela, linha/chave e payload original sob controle de acesso. Não carregar credenciais.
3. Validar tipos/unidades/chaves; classificar órfãos, duplicatas, conflitos e dados incompletos. As 26 incompatibilidades locais não têm política de correção definida.
4. Transformar por regras versionadas. Usar mapa único `(origem, instância, tipo, legacy_id) → id_destino`; registrar hash do conteúdo para detectar mudança. Retry não cria uma nova entidade.
5. Carregar em ambiente de teste na ordem das dependências: contextos e pessoas; catálogo/apresentações; lotes/saldos de abertura; pedidos/linhas/histórico; financeiro/logística; mídia/URLs. A ordem final depende das FK reais.
6. Comparar contagens por entidade/origem/canal, relações órfãs, amostras escolhidas por cenário e totais por moeda. Para estoque: abertura + movimentos = fechamento por SKU/lote/local/proprietário/unidade, com reservas reconciliadas separadamente.
7. Reexecutar o mesmo lote, depois uma versão alterada controlada. Confirmar ausência de duplicação e identificação explícita de conflitos. Produzir relatório de aceitos/rejeitados/pendentes e explicações das diferenças.
8. Testar URLs/redirects com inventário real; não redirecionar indiscriminadamente para a home. Verificar canonical, idioma e dados estruturados do conteúdo efetivo.

O relatório de discovery existente não soma valores financeiros, converte câmbio nem executa essas etapas de carga. Seu propósito é preparar evidência de entrada.

## Corte e rollback

Definir responsáveis, janela, ponto de recuperação, prazo de recuperação e critérios de abortar com a operação. A estratégia de sincronização incremental/congelamento só pode ser escolhida após medir o legado. Evitar dois sistemas escrevendo saldos simultaneamente sem uma autoridade definida.

Antes do corte: backup consistente com restauração ensaiada, contagens conciliadas, lote final identificado, redirects validados, observabilidade e plano de continuidade. Registrar pedidos/pagamentos recebidos durante a janela e reconciliá-los antes de reabrir operações.

Se o ensaio falhar: manter o legado como operação vigente e corrigir staging/transformação. Se um corte autorizado precisar ser revertido: suspender novas gravações conforme plano, preservar o journal posterior ao corte, restaurar destino/roteamento previstos e reconciliar pedidos/pagamentos antes da retomada. Restaurar apenas um backup não desfaz cobranças externas. Cancelamentos/reembolsos exigem os fluxos autorizados do provedor e do financeiro.

Reversão desta entrega local: retirar somente os novos documentos, referências e scripts introduzidos nesta etapa e o acréscimo correspondente ao README, preservando arquivos/alterações preexistentes. Não há alteração de banco ou integração a reverter.

## Testes a implementar conforme cada fluxo

| Domínio | Cenários obrigatórios antes da liberação |
| --- | --- |
| Estoque | Última unidade concorrente; mesma operação duas vezes; timeout; expiração; unidade/precisão; ajustes; saldo por empresa/canal; reconciliação |
| Produção | Consumo/saída atômicos; falta de insumo; perdas/sobras; conversão incompatível; cancelamento e genealogia |
| Pedido | Transições aprovadas; conflito de versão; reserva versus baixa; picking, retirada, devolução, reenvio e extravio |
| Pagamento | Autenticação do provedor; callback repetido/fora de ordem; valor/moeda divergentes; falha, reembolso e conciliação |
| Checkout | País cedo; produto proibido; alteração de destino; VAT aprovado; frete/seguro; moeda de cobrança; revisão final e aceite contextual |
| Canais e acesso | Isolamento de leitura/escrita; catálogo/preço por canal; estoque compartilhado apenas por política; logs sem PII/segredos |
| E-mail | Conta/remetente corretos; template contextual; autorização; descadastro; retry sem duplicação; falha rastreável |
| Descoberta e UX | HTML real; schema consistente; canonical/hreflang conforme idiomas; redirects; teclado/mobile; métricas antes/depois |
| Migração | Reexecução idempotente; origem intacta; rejeitados/órfãos explicados; totais por moeda; restore ensaiado |

## Dependências e perguntas

Responsáveis abaixo são papéis sugeridos, não pessoas designadas. Não inserir senhas/tokens nas respostas ou no repositório.

| ID | Informação/evidência necessária | Responsável sugerido | O que destrava |
| --- | --- | --- | --- |
| Q-01 | Cópia de esquema/dump de leitura e código PHP relevante; identificação de instâncias; mídia e URLs; origem dos exports | Responsável técnico do legado | Modelo físico do legado, mapa de IDs, validação histórica e ETL; não condiciona a base nova |
| Q-02 | Nome/manual do gateway, sandbox, autenticação, eventos, moedas, conciliação, reembolso; fluxo de transferência | Responsável de pagamentos | Adaptador e testes de pagamento |
| Q-03 | Para cada site: empresa vendedora, depósitos, estoque compartilhado/isolado, catálogo/preços, mercados, idiomas e permissões | Responsável operacional/comercial | Isolamento, topologia e autoridade de dados |
| Q-04 | Regras fiscais/aduaneiras vigentes com fonte/validador, VAT category, HS, países/produtos bloqueados e vigência | Responsável fiscal/aduaneiro | Cotação real, invoice, restrições e aceite contextual |
| Q-05 | Código de ENGINE CURRENCY, precisão/arredondamento, sentido da taxa, moedas de cobrança/contabilização/liquidação e política de crédito | Financeiro/contabilidade | Importação financeira e preços/câmbio |
| Q-06 | Matriz de transições e papéis; momento de reserva/baixa; expiração; embalagem; devolução/reenvio; unidades, perdas, sobras e custos | Estoque/expedição/produção | Inventário transacional e máquina de estados |
| Q-07 | Contratos/serviços PostNL e DHL, destinos, tarifas, seguro, prazos e integração de etiquetas/rastreio | Logística | Cotação, expedição e notas por destino |
| Q-08 | Provedores das três caixas, escopos de acesso, papéis, consentimento/descadastro e retenção | Atendimento/administrador | Caixa unificada, CRM e campanhas |
| Q-09 | Inventário real de URLs/idiomas, conteúdo e mídia, configuração de indexação e métricas existentes | Conteúdo/SEO | Redirects, i18n, schema real e medição |
| Q-10 | Significado de RT PRICE, ORIGIN ITEM, Item Form e unicidade de SKU | Catálogo/operação | Modelo e transformação de produtos |

Essas dependências limitam a próxima etapa operacional, não a documentação e auditoria local já entregues. Nenhuma aprovação de tecnologia, regra fiscal ou operação em produção foi presumida.
