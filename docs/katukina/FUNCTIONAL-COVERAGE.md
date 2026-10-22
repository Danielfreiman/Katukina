# Auditoria de cobertura funcional — 2026-10-22

## Conclusão

O escopo inicial **não está concluído**. Existe uma base local WordPress/WooCommerce + Next.js, com catálogo e checkout de teste e um núcleo operacional de estoque. Sendcloud, HS automático por destino/invoice/API e seleção de produtos por site não estão implementados. A revisão de idioma e navegação administrativa não entregou essas integrações.

Esta auditoria compara os [requisitos](REQUIREMENTS.md), o [inventário funcional original](../../skills/katukina-architecture/references/functional-scope.md) e o [documento original](../../skills/katukina-architecture/references/newSiteFunctions-original.txt) com o código vigente e consultas locais somente leitura. Prevalece sobre afirmações de cobertura da versão antiga do painel removido. Não reexecuta nem substitui uma homologação funcional completa.

**Dois eixos distintos:** CONFIRMADO/LEGADO OBSERVADO/PROPOSTO/A VALIDAR/BLOQUEADO descrevem evidência e decisões. Implementado localmente/parcial/ausente descrevem cobertura de implementação. Uma tela, campo ou API isolada não implica uma funcionalidade entregue de ponta a ponta.

## Evidência da instalação local

Consulta executada em 2026-10-22 por WP-CLI:

- Plugins ativos: `woocommerce` 11.2.1 e `katukina-core` 0.3.0; obrigatório: `katukina-local` 0.1.0. Inativos: Akismet 5.7.2 e Hello Dolly 1.7.2. **Sendcloud não instalado.**
- Uma empresa, um depósito e um canal ativos. Existem também registros sintéticos inativos de testes; contagem não representa dados reais da operação.
- Nenhum registro HS, transportadora ou transição operacional configurado. Nenhuma publicação por canal cadastrada.
- WordPress Multisite desativado. Isso sozinho não impede múltiplas vitrines sobre um backend; o que falta é a implementação de canais e publicação efetivamente consumida por cada vitrine.
- Moeda local USD; impostos desativados; checkout fictício ativo; único gateway habilitado: `katukina_local_test`.
- Origem pública e painel em `http://localhost:3001`.

Reprodução sem dados pessoais ou credenciais:

```powershell
docker exec wp-env-wordpress-1b3bdce6-cli-1 wp plugin list --fields=name,status,version --skip-update-check --format=json
docker exec wp-env-wordpress-1b3bdce6-cli-1 wp eval-file /var/www/html/wp-content/katukina-tools/audit-functional-coverage.php
```

## Matriz do escopo inicial

Referências PHP desta tabela são relativas a `wordpress/plugins/katukina-core/src/`.

| Requisitos / área | Cobertura atual | O que falta / limite | Evidência principal |
| --- | --- | --- | --- |
| PLT-001/004 — WordPress/WooCommerce, frontend Next.js | Implementado localmente | Operação comercial e implantação remota não homologadas | `Headless.php`, `next.config.ts`, `app/`, `lib/wordpress/` |
| PLT-002 — vários sites em um backend | Parcial estrutural | Só uma vitrine e um canal global; faltam resolução por site, contexto por requisição e vitrines adicionais | `Commerce.php:7`, `Headless.php:6`, `lib/config/site.ts:4` |
| CAT-003 — escolher sites de cada produto | Ausente | Não há associação editável produto→sites consumida pelo catálogo, busca, produto, sitemap ou checkout. Schema antigo `publication` não constitui solução: escrita/importação estão descontinuadas (410) | Original: linha 90; `NativeCatalog.php:30`, `Registry.php:112`, `OperationsApi.php:54`, `lib/commerce/catalog.ts` |
| PLT-003 — permissões | Parcial | Permissões por operação existem; não há isolamento por empresa/canal | `Permissions.php:6–16` |
| CAT-001/002 — Item/Item Form | Parcial | Produtos/variações nativos, metadados de origem, conteúdo, fornecedor, volume e IDs. Falta compra de variações na vitrine; peso líquido separado e interpretação de RT PRICE não concluídos | `NativeCatalog.php:30–47,152`, `app/products/[slug]/page.tsx:76` |
| CAT-003 — categorias, relacionados e países proibidos | Parcial | Categorias/relacionados nativos e bloqueio por destino existem; publicação independente por site falta | `NativeCatalog.php`, `Commerce.php:52–68` |
| CAT-004 — seis exemplos locais | Implementado localmente | Exemplos não equivalem a catálogo ou estoque real migrado | `SAMPLE_CATALOG.md` |
| CRM-001 — fornecedores | Implementado no escopo cadastral | Cadastro e vínculos com produtos, contatos e lotes; não comprova gestão completa de compras | `Registry.php:12`, `Inventory.php:13`, `NativeAdmin.php` |
| CRM-002 — clientes e contatos | Parcial | Usuários/clientes nativos, contatos e vínculos existem; histórico importado e atendimento integrado não | `Registry.php:13`, `CustomerAccount.php`, `NativeAdmin.php` |
| CRM-003 — crédito por cliente | Parcial | Livro manual por cliente/moeda com idempotência; sem resgate automático no checkout | `Finance.php:6`, `NativeAdmin.php:208` |
| INV-001 — estoque por SKU/lote/proprietário/localização | Parcial | Núcleo de lotes implementado; sem saldos reais importados e sem disponibilidade comercial completa entre sites | `Inventory.php:13–48`, `Commerce.php:70` |
| INV-002 — histórico e estoque baixo | Parcial | Histórico e API agregada existem; falta fluxo administrativo completo de reposição agregada | `OperationsApi.php:93`, `NativeAdmin.php:166` |
| INV-003 — reserva separada de baixa | Implementado no escopo local | Transações, mutex, idempotência, expiração, liberação e reconciliação. Políticas reais ainda a validar; sem liberação imediata identificada por cancelamento/reembolso | `Database.php:56`, `Inventory.php:49–122,156` |
| INV-004 — aviso de retorno ao estoque | Ausente como fluxo completo | Cadastro de inscrição existe; faltam inscrição pública, evento e envio | `Registry.php:27`, `OperationsApi.php:73` |
| PRD-001 — granel/fracionamento/ordem de produção | Parcial | Uma entrada de granel→uma apresentação; consumo/perda/sobra rastreáveis. Sem planejamento/liberação de ordem, múltiplas entradas/saídas ou rateio automático de custo | `Inventory.php:124` |
| PRD-002 — reversão/correção | Parcial | Reversão somente antes de movimentos posteriores da saída; demais correções exigem processo definido | `Inventory.php:144` |
| ORD-001 — 13 estados e SHORT NOTE | Parcial | Rótulos, nota HPOS e motor de transição existem; matriz atual está vazia | `Workflow.php:6,27,58`; consulta local |
| ORD-002 — baixa em PACKED AND PENDING | Implementado no escopo local | Exige reservas completas/válidas e não duplica baixa; falta homologação do fluxo operacional real | `Inventory.php:95`, `Workflow.php:27` |
| ORD-003 — retirada/devolução/reenvio/extravio | Ausente como fluxos completos | Estados existem; políticas, efeitos e automações não foram implementados | `Workflow.php:27`; requisitos de transições A VALIDAR |
| CHK-001 — país desde o início, VAT no preço | Parcial | País no carrinho/cotação/checkout, sem contexto por país no catálogo desde a primeira visita. Impostos locais estão desativados | `components/commerce/cart.tsx`, `lib/commerce/catalog.ts`; consulta local |
| CHK-002 — moeda escolhida e revisão final | Parcial | Revisão de endereço/itens/totais existe; uma moeda, sem seletor/conversão | `components/commerce/checkout.tsx`, `OperationsApi.php:45` |
| CHK-003/LOG-002 — avisos por país e aceite | Implementado no escopo local | Quatro notas separadas e aceite registrado; conteúdo comercial real ainda requer configuração e validação | `Commerce.php:52–68`, `NativeOrders.php:63` |
| PAY-001 — gateway externo real | Ausente; integração real BLOQUEADA pelo contrato/credenciais pendentes | Só gateway fictício local; faltam adaptador, callbacks, conciliação, falhas e reembolso integrado | `LocalGateway.php`, `components/commerce/checkout.tsx:325` |
| PAY-002 — transferências e meios por país | Parcial | Ledger manual existe; sem conciliação bancária e seleção completa de meios por destino | `Finance.php`, `Registry.php:21`, `OperationsApi.php:54` |
| PAY-003 — moedas e liquidação | Parcial | Valores do ledger separados por moeda/precisão; sem câmbio e liquidação real | `Finance.php`, `NativeAdmin.php:142` |
| FIS-001 — VAT por país/categoria/empresa/vigência | Parcial estrutural; regras A VALIDAR | Usa motor/configurações nativas, sem regras reais homologadas; impostos desativados neste ambiente | `NativeCatalog.php`, `OPERATIONS.md`; consulta local |
| FIS-002 — HS por destino e invoice/API | Parcial cadastral, automação ausente | Campo de grupo é texto livre; registros por país/vigência/fonte existem, mas estão vazios. Falta seletor de grupo, resolução UK/EU/USA, snapshot, invoice e payload externo | Original: linhas 111–117; `Registry.php:20`, `NativeCatalog.php:41` |
| LOG-001/003 — transportadoras/Sendcloud | Ausente como integração real | Nenhum plugin Sendcloud ou adaptador; frete nativo e método local fictício. Faltam tarifas reais, etiquetas, seguro, prazo e tracking sincronizado | `LocalShipping.php`, `Modules.php:14`; plugins/contagens locais |
| FIN-001 — exportação contábil | Parcial | API JSON de pedidos disponível; exportação final para contador, campos/reconciliação e fluxo de download não comprovados na versão atual | `OperationsApi.php:112–124` |
| MSG-001 — caixa unificada | Ausente | Cadastros de contas não leem/sincronizam e-mails | `Registry.php:24`, `NativeAdmin.php:151` |
| MSG-002 — vínculos e inserir templates | Parcial | Vínculos persistidos; selecionar `template_id` não insere o corpo da mensagem no formulário atual | `Registry.php:26,112–132`, campos genéricos em `NativeAdmin.php` |
| MSG-003 — e-mail SHIPPED com rastreio e cuidados | Ausente | Sem evento/envio/template operacional completo. E-mail externo suprimido localmente | `Workflow.php:27`, `NativeOrders.php:58`, `wordpress/mu-plugins/katukina-local.php` |
| MKT-001 — cupons | Implementado no escopo de uma loja | Recursos nativos e carrinho integrados; política por canais independentes não entregue | `components/commerce/cart.tsx`, WooCommerce |
| MKT-002 — mailing/campanhas/histórico | Parcial cadastral | Prévia de audiência e rascunhos; sem disparo, opt-out operacional e histórico de entrega | `OperationsApi.php:73–79`, `Registry.php:27–28` |
| MKT-003 — amostras | Parcial, cadastro/API | Sem tela própria no admin vigente e sem saída de estoque automática vinculada | `Registry.php:29`, `NativeAdmin.php:7–16` |
| ANA-001 — análises por canal | Parcial | Analytics nativo e APIs de agregação; sem experiência consolidada multi-site nem definição contábil final | `OperationsApi.php:98–124`, `Modules.php` |
| SEO-001 — SEO/GEO/AEO | Parcial | SSR, metadata, canonical, schema, sitemap e robots; sem redirects do legado, conteúdo/mercados completos e validação em produção | `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/products/[slug]/page.tsx` |
| I18N-001 — idiomas/mercados/acessibilidade | Parcial | Vitrine e extensões em inglês; campo idioma de canal não ativa traduções/URLs/mercados | `lib/config/site.ts:7`, `app/layout.tsx:40` |
| MIG-001 — migração reproduzível | Parcial em ferramentas; migração real BLOQUEADA | Auditor de exports, IDs, fixtures e importações limitadas não migram o legado completo; faltam PHP/banco e mapeamentos validados | `scripts/audit_legacy_exports.py`, `MIGRATION.md`, `OperationsApi.php:139` |
| ADM-001 — inglês e consistência nativa | Implementado localmente | Refere-se somente à interface e seus fluxos de edição; não encerra os demais requisitos | `NativeAdmin.php`, `NativeCatalog.php`, `NativeOrders.php`; changelog 2026-10-22 |

## Correções de interpretação da documentação anterior

- O histórico do painel removido mencionava exportação CSV e inserção de templates. A auditoria do código vigente não encontrou esses fluxos completos nas telas nativas. Não apresentá-los como entregues.
- `publication` continua aparecendo no schema histórico, mas os caminhos de escrita/importação são 410. Não há publicação seletiva por canal disponível.
- Os 13 rótulos não significam 13 fluxos operacionais implementados. No runtime auditado, há zero regras de transição.
- HS group/HS code são campos preparatórios; o runtime tem zero classificações e nenhum consumidor que selecione o código para invoice/Sendcloud.
- Permissões por operação não equivalem a isolamento de empresas ou canais. O estado `wordpress_multisite=false` também não deve ser confundido com a ausência conceitual de arquitetura headless multi-site: a lacuna é o fluxo funcional não implementado.
- Testes anteriores verificam cenários específicos de desenvolvimento. Não atestam transportadoras, pagamentos, impostos, e-mail ou múltiplas vitrines reais.

## Dependências e trabalho que pode avançar

**CONFIRMADO na conversa de 2026-10-22:** Sendcloud como integração esperada; HS correto por destino encaminhado à integração; múltiplos sites atendidos por um backend, com escolha dos produtos publicados em cada site. Isso reforça PLT-002/CAT-003/FIS-002 e especifica LOG-003. Não significa que essas funções foram entregues.

**Não bloqueado pelo legado:** associação produto→canais nos editores nativos, resolução de canal no frontend/API, filtros consistentes de catálogo/busca/sitemap/checkout, seleção de variações, resolvedor de grupos HS com dados sintéticos, preparação e testes de contratos da integração logística, melhorias de exportação e de templates.

**BLOQUEADO ou A VALIDAR para uso real:** conta/credenciais e serviços comerciais de transporte, códigos HS e regras fiscais validados, documentação/credenciais do gateway externo, contas de e-mail autorizadas, políticas de devolução/reenvio e dados do legado para migração. Não atribuir todas as lacunas a essas dependências: há implementação nova faltando que pode ser feita com dados de teste.

**PROPOSTA de sequência técnica, sem prioridade comercial presumida:** publicação por canais e compra de variações; grupos HS/resolução por destino e integração Sendcloud; fechamento dos fluxos operacionais/financeiros; atendimento/marketing/relatórios; homologação e migração quando as fontes estiverem disponíveis. Critérios de aceite devem demonstrar dois sites com catálogos distintos, código HS correto no pedido/documento/payload e fluxo de expedição validado na conta de testes, não apenas telas de configuração.
