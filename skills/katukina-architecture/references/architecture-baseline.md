# Katukina — baseline de arquitetura v0.3 (2026-10-19)

## Objetivo confirmado
Transformar o Katukina.com, hoje em aplicação PHP autoral, em plataforma de e-commerce headless com WordPress no backend, controles operacionais avançados, SEO/GEO/AEO forte e capacidade estrutural de servir múltiplos sites.

## Confirmado / informação fornecida
- Backend WordPress; arquitetura headless.
- Estoque; cadastro de fornecedores; produtos bulk/granel; ordens de produção/fracionamento; funcionalidades futuras.
- Legado PHP autoral, possivelmente sem exportação ampla de produtos; analisar banco via phpMyAdmin. A estrutura real não foi inspecionada.
- Gateway de pagamento em ambiente externo, documentação a receber.
- Transferências em GBP e EUR; no legado a moeda-base do backend é GBP.
- Multi-site desde a fundação. Sites citados como canais no levantamento: Katukina, Sacred Incense, Jungle Powder (wholesale).
- SEO, GEO, AEO como requisitos explícitos.

## Propostas ainda não aprovadas
- Next.js/React/TypeScript para frontends; Tailwind CSS.
- WooCommerce como camada comercial do WordPress.
- Plugins WordPress próprios com tabelas específicas para operações transacionais.
- API/BFF versionada; eventos assíncronos e filas; MySQL/MariaDB, Redis, CDN/WAF, CI/CD, observabilidade.
- WordPress central com `sales_channels`, ao invés de assumir WordPress Multisite.
- Estoque autoritativo por ledger de movimentações, com reservas e sincronização de disponibilidade comercial.
- Hospedagem, escalabilidade e limites de isolamento por empresa ainda não definidos.

## Modelo lógico inicial (não esquema físico final)
product/item; item_form/variant/SKU; supplier; supplier_product; inventory_lot; warehouse; inventory_movement; inventory_reservation; production_order; production_input/output; sales_channel; channel_listing; price_list; currency_policy; tax_rule; destination_rule; hs_code_group; carrier/service; shipment; payment_transaction; customer; contact; customer_store_credit; support_message; order; order_status_history; consent_record.

Separar explicitamente: produto e apresentação; insumo a granel e pacote final; disponibilidade e posse física; canal e empresa vendedora; preço e câmbio; tributação e HS; pedido e transação financeira.

## Integrações e regras condicionais
- Gateways: adapters com webhooks autenticados, reconciliação, idempotência, reembolsos. Sem definir protocolo até receber documentação.
- Transportadoras: PostNL e modalidades DHL são exemplos fornecidos; preço via API é desejo, validar cobertura e contratos.
- Mensageria: caixas de e-mail de múltiplas contas; integração IMAP/API a escolher, sem presumir envio e leitura disponíveis.
- Tributação: país de entrega, categoria VAT, regime do comerciante e destino; validar legislação e definições com responsável especializado.
- Customs: grupo HS com códigos por jurisdição e vigência, escolha por destino e categoria; classificação requer revisão.

## Migração e qualidade
Auditar cópia de banco e arquivos; mapear PK/FK, imagens, variantes, consumidores, pedidos, estado de estoque e URL; ETL versionado e reexecutável; relatórios de validação; preservar IDs legacy; plano de redirecionamentos, cutover e rollback.

## Pendências prioritárias
1. Inventário real das tabelas e arquivos do sistema PHP; permissões/acesso à leitura.
2. Documentação do gateway externo, pagamentos por transferência e impostos.
3. Comportamento real das telas Sacred Incense e quais fluxos devem ser mantidos/alterados.
4. Regras de empresa/estoque compartilhado por domínio e depósitos.
5. Lista de mercados, idiomas, entidades de venda, moedas e status comerciais por canal.
6. Padrões operacionais de embalagem, consumo, perdas, ajustes e devoluções.
7. Integração das transportadoras e exigências contábeis por país.

## Não equivalências importantes
Uma lista de telas não é um contrato de API nem garantia de cobertura. WooCommerce não é sinônimo de ERP. Exibir VAT incluído não implica alíquota universal. Status de pedido não define sozinho o compromisso do saldo. Reservar estoque não implica baixá-lo. Multi-site não implica Multisite WordPress.
