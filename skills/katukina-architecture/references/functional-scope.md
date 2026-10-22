# Inventário funcional v0.2 — Katukina e backoffice multi-site
Fonte: requisitos conversados no projeto + `newSiteFunctions-original.txt` (levantamento fornecido, originalmente em inglês/neerlandês). Os links abaixo servem de referências do legado, não de telas auditadas. O nome atual das telas não define a tecnologia futura.

## 01 E-mail e CRM
- Caixa unificada para info@katukina.com, info@sacred-incense.co.uk, info@junglepowder.com; selecionar/filtrar contas e operar mensagens preservando origem.
- Vincular e-mail a pedido, fornecedor ou outro contato.
- Templates inseríveis em mensagens; legado `/admin/email_templates/`.
- Entidades clientes `/admin/customers/`, fornecedores `/admin/suppliers/`, contatos `/admin/contacts/`, com histórico de vínculos.
- Créditos por cliente (`store credit`) no perfil, com gestão; exemplo `/admin/customer/26771`.

## 02 Checkout e países
- País de entrega escolhido desde o início; preços exibidos já com VAT aplicável (onde aplicável), para evitar surpresa no checkout.
- Seleção de moeda de exibição; confirmar endereço e itens antes de pagar.
- Lista de países atendidos `/admin/countries/`, transportadoras ativas por destino (PostNL, DHL Express, DHL Parcel citadas), seguro incluso ou opcional por configuração, tempo estimado visível na vitrine e calculadora `/shipping`.
- `BACKOFFICE NOTE` por país: problemas de alfândega, devoluções e histórico; `SHIPPING NOTE` no picking; `CHECKOUT NOTE` informativa; `CHECKOUT WARNING` destacada.
- Informar taxas locais/direitos de importação e exigências para produtos regulados, com aceite explícito registrado quando necessário. Não tratar aceite como garantia de legalidade ou transferência automática de responsabilidade.
- Permitir métodos de pagamento por país `/admin/payment_methods/`.

## 03 Pedidos e expedição
- Listagem com status e `SHORT NOTE` visível na visão geral; legado `/admin/orders/` e exemplo `/admin/order/204139`.
- Estados do legado (não reduzir sem mapeamento):
  1. `IN PROGRESS (IN BASKET)` — carrinho aberto.
  2. `ORDERED` — pedido colocado.
  3. `PENDING ACTION` — revisão feita; aguarda pagamento ou interação com cliente.
  4. `READY TO PROCESS` — pronto para embalar; não baixa fisicamente ainda.
  5. `PACKED AND PENDING` — empacotado; baixa física de estoque no fluxo atual.
  6. `READY TO SHIP` — pronto para despachar.
  7. `SHIPPED` — enviado.
  8. `DELIVERED` — confirmado pelo cliente.
  9. `PICKED UP` — retirado no depósito.
  10. `BEING RETURNED` — em retorno.
  11. `RETURNED` — retornado.
  12. `RESHIPPED` — reenviado.
  13. `LOST` — extraviado.
- Email `SHIPPED` com rastreio + conteúdo configurável sobre armazenamento/uso e informações de produtos (ex.: raw tobacco Mapacho).
- Exportar dados para contabilidade `/admin/orders_accounting/`.

## 04 Catálogo, apresentações, imagens
- `ITEM` (item mestre) `/admin/items/`, exemplo `/admin/item/1588`: preço RT (sem definição fornecida), SKU, nome, descrição, peso líquido/bruto, volume, sites ativos, categoria, relacionados e países proibidos.
- `ITEM FORM` (apresentação específica; ex. frasco 10/25/60 ml), exemplo `/admin/item_form/3179`: ativo/inativo, VAT%, VAT category, origin item, customs description, stock count, stock history, stock note, physical location, forma/volume/peso líquido, imagens e HS code.
- Categorias `/admin/categories/`, categorias VAT `/admin/vat_categories/`.
- HS code groups por categoria de produto (rapé, sananga, raw tobacco, CDs como exemplos), com códigos por UK, EU, USA e associação à apresentação. Seleção conforme destino para invoice e API. Exemplos fornecidos no arquivo NÃO devem ser assumidos como códigos legais válidos.
- Publicação por site: Sacred Incense, Katukina, Jungle Powder wholesale e canais futuros.

## 05 Estoque, fornecedores e fracionamento
- Relatório de estoque e baixo estoque `/admin/reports/stock_levels` e aviso de retorno (`back in stock`) para clientes.
- Histórico de entradas/saídas, notas e localizações; cadastro de fornecedor; controle de bulk/granel e apresentações embaladas.
- Ordens de produção para fracionamento, consumo de matéria-prima, perdas/sobras, lotes, custo e rastreabilidade; detalhamento ainda a levantar.
- Diferenciar reserva e débito de saldo disponível da baixa física; preservar comportamento atual documentado.

## 06 Logística, fiscal e pagamentos
- Gestão de transportadoras, zonas, serviços `/admin/shipping_zones/`; desejo de usar APIs para tarifas, sem afirmar integração já existente.
- Seguro depende de país e transportadora; ex. PostNL incluído, DHL opcional de acordo com configuração descrita (validar contrato real).
- VAT por país da UE e categoria de item, e regras por site/jurisdição.
- Métodos de pagamento e gateway externo cuja documentação ainda será fornecida.
- Transferências em GBP e EUR; moeda-base GBP no backend legado.

## 07 Marketing, amostras, analytics e acesso
- Cupons `/admin/coupons/`.
- Ações de e-mail em massa para assinantes `/admin/group_actions/`, histórico `/admin/group_action_history/`, modelos `/admin/group_email_templates/` — respeitar consentimento e descadastro.
- Amostras `/admin/samples/`.
- Volume de pedidos `/admin/reports/order_volume`.
- Contas administrativas e permissões `/admin`.
- Sites `/admin/sites/`, exemplo `/admin/site/3`, com configurações por canal.

## 08 Migração / plataforma pública
- Extrair dados de aplicação PHP autoral (verificar DB via phpMyAdmin, mídias, URLs, tipos e relacionamentos).
- SEO/GEO/AEO forte; HTML renderizado e dados estruturados corretos; SEO técnico, conteúdo, redirects e métricas.
- Backend WordPress e arquitetura headless, apta a múltiplos sites.

## Notas de rastreabilidade
- Caminhos `/admin/...` são referências de telas fornecidas, não caminhos que a nova aplicação deve copiar.
- `RT PRICE`, `ORIGIN ITEM`, `ITEM FORM`, e políticas de empresa/tributos precisam de definição terminológica.
- Uso de uma caixa unificada não implica que credenciais estarão disponíveis.
- Eventos de status, devolução e reenvio exigem regras detalhadas; não inventar transições nem tratamento contábil.
