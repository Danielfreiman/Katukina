# Operação local — WordPress e WooCommerce nativos

Versão 1.1 · 2026-10-19 · Katukina Core 0.3.0.

Atualização em 2026-10-26: Katukina Core 0.4.0 amplia produção, canais/preços explícitos, alfândega, estoque e comunicação. Consulte a [matriz atual](../IMPLEMENTATION_STATUS.md), o [mapa das telas nativas](../ADMIN_UI_MAP.md) e os [contratos](../API_CONTRACTS.md). O conteúdo abaixo preserva a situação anterior e não deve ser usado para concluir que as novas integrações externas foram homologadas.

**Cobertura revisada em 2026-10-22:** consulte a [auditoria requisito a requisito](FUNCTIONAL-COVERAGE.md). O escopo inicial está incompleto: Sendcloud não instalado, classificação HS automática/invoice/API ausente e publicação seletiva de produtos em múltiplos sites ausente. As extensões administrativas não comprovam integração comercial.

### Atualização de interface — 2026-10-22

REQ-ADM-001 confirma inglês nas extensões administrativas. Os nomes atuais são **Suppliers**, **Lots and repacking**, **Contacts and support**, **Operational audit**, **Operations**, **Origin and packaging**, **Picking and shipping** e **Store credit**; a tabela histórica abaixo descreve as mesmas áreas em português.

Fornecedores, contatos e cadastros em Settings → Operations abrem primeiro uma listagem. **Add new** abre o formulário; o nome do registro e **Edit** abrem sua edição; **Back to list** retorna à listagem. Em configurações, **Save changes** só aparece no formulário. Lotes, reservas e produções possuem listas e ações separadas, mantendo os links existentes de produto/pedido. Textos e mensagens do plugin são em inglês; conteúdo já cadastrado e histórico não são traduzidos automaticamente.

Durante a validação foi identificado `WP_SITEURL` gerado pelo wp-env com porta 8888, impedindo o AJAX de variações pela origem 3001. O wrapper de inicialização agora restaura a origem pública configurada; a verificação headless e o teste de variações conferem essa correspondência.

**CONFIRMADO pelo responsável:** usar os recursos e telas nativos de WordPress + WooCommerce. O catálogo separado de Item/Form e o painel paralelo foram rejeitados. Next.js permanece como frontend público exclusivo, consumindo APIs.

## Onde administrar

| Função | Área responsável | Complemento do projeto |
| --- | --- | --- |
| Produtos e apresentações | [Products](http://localhost:3001/wp-admin/edit.php?post_type=product) | Aba “Origem e apresentação” no produto; campos específicos em cada variação |
| Nome, descrição, SKU, preços, imagens, categorias, atributos, relacionados, peso e classe fiscal | Editor nativo | Nenhum cadastro comercial paralelo |
| Várias apresentações de um item | Produto variável e variações WooCommerce | Conteúdo, unidade, origem, localização, restrições por destino e IDs do legado nos metadados |
| Uma apresentação | Produto simples | Os seis exemplos mantêm IDs, imagens, preços, tipos e URLs |
| Estoque simples | Inventory do produto/variação | Regras nativas do WooCommerce |
| Lotes e fracionamento | Products → Lotes e fracionamento | Entradas, ajustes, reservas, produção, reversão e reconciliação |
| Fornecedores | Products → Fornecedores | Cadastro complementar ausente do núcleo WooCommerce |
| Pedidos e pagamento | [WooCommerce → Orders](http://localhost:3001/wp-admin/admin.php?page=wc-orders) | Metabox “Separação e expedição”: canal, SHORT NOTE, etapa operacional, rastreio e picking |
| Frete | Settings → Shipping | Zonas e métodos nativos. Método fictício depende da zona habilitada; não substitui tarifas por filtro |
| Impostos | Settings → General / Tax | Habilitação e alíquotas nativas; nenhum cadastro paralelo de VAT |
| Pagamentos | Settings → Payments | Gateways WooCommerce; teste local sem cobrança. Gateway externo pendente |
| Moeda, países de venda, cupons e relatórios comerciais | Settings → General, Marketing → Coupons, Analytics | Recursos nativos; limites adicionais do canal seguem explícitos |
| Clientes e acesso | WooCommerce → Customers / WordPress → Users | Livro de crédito e permissões operacionais no perfil do usuário |
| Conteúdo | Posts, Pages e Media | Publicação consumida pelo Next.js |
| Empresas, depósitos, canais, avisos por país, referências HS e transições | [Settings → Operação](http://localhost:3001/wp-admin/admin.php?page=wc-settings&tab=katukina) | Regras ausentes do núcleo |
| Contatos e atendimento complementar | Users → Contatos e atendimento | Registros e rascunhos, sem leitura/envio externo |
| Auditoria operacional | Tools → Auditoria operacional | Histórico dos comandos do plugin |

O menu principal “Katukina”, seu JavaScript e seu CSS foram removidos. O endereço antigo redireciona para Products. Não existe outra tela para cadastrar produtos.

## Catálogo e estoque

`WC_Product` e `WC_Product_Variation` são a autoridade do catálogo. O plugin lê nome, SKU, descrição, classe fiscal, peso e limite de estoque diretamente desses objetos. Dados específicos ficam em metadados `_kat_*` no mesmo produto. Editor WooCommerce, API e importação nativa usam o mesmo ciclo de gravação.

Produto pai representa o item mestre; variações representam apresentações. Um produto simples representa um item com uma apresentação. Para fracionar granel mantido como produto separado, “Produto de origem (ID)” aponta para o mesmo produto mestre das embalagens. Isso não cria outro catálogo.

Linhas antigas `item`/`form` em `wp_kat_records` guardam identificadores de correspondência exigidos pelas chaves dos lotes existentes. Nas linhas migradas, `data` contém somente `native_product_id`. Leituras internas projetam os dados atuais do WooCommerce; não sincronizam uma segunda cópia editável. Órfãos de testes anteriores permanecem inativos para explicar o histórico. Exclusões conservam um retrato histórico sem torná-lo um produto ativo.

O primeiro recebimento exige controle de quantidade nativo desativado naquele SKU. A partir daí, origem, tipo e unidades ficam protegidos contra alterações incompatíveis com o histórico. Produtos sem lote continuam no estoque nativo, inclusive no checkout. O ledger não é obrigatório para todos os produtos.

Lotes preservam proprietário, depósito, fornecedor, validade, localização e origem da produção. Reserva reduz disponibilidade, não saldo físico; a baixa ocorre em `PACKED AND PENDING`. Fracionamento suporta um lote de entrada e uma apresentação de saída, conservação de conteúdo, perdas explícitas e reversão de saída ainda não movimentada. Transações, mutex, idempotência e reconciliação do ADR-008 foram preservados.

## Pedidos e configurações

Use o editor nativo e seu botão Update / Atualizar. O status financeiro continua no controle WooCommerce. Os 13 rótulos do legado permanecem como etapas operacionais; a lista mostra somente transições configuradas em Settings → Operação. A matriz continua vazia inicialmente. Não foram inventadas regras de devolução, extravio ou reenvio.

SHORT NOTE aparece na lista HPOS e no editor. Rastreio é manual; picking imprimível mostra as notas de expedição, sem notas internas do país. O link de reservas leva à extensão de lotes com o pedido selecionado.

Canal `LOCAL-DEMO`, empresa/depósito de teste, destino GB, USD dos exemplos e reserva inicial de 60 minutos são fixtures locais. Checkout fictício precisa estar habilitado em Settings → Operação. Tarifas são calculadas pelos métodos das zonas WooCommerce; não há contratação nem despacho.

## Limites atuais

- A revisão de 2026-10-22 também identificou lacunas frente ao histórico do painel substituído: o seletor de template apenas salva a referência, sem inserir o corpo; relatório contábil está disponível como API JSON, sem fluxo final de exportação identificado; amostras têm cadastro/API sem tela nativa nem baixa integrada. Não considerar essas funções integralmente entregues.

- Carrinho, cupons, cotação, revisão, checkout fictício idempotente e conta continuam ligados ao WooCommerce/WordPress por API. O frontend oferece compra de produtos simples; seleção de variações no Next.js ainda precisa ser implementada. A administração nativa de variações está disponível.
- Crédito possui livro por cliente e moeda; ainda não é consumido automaticamente no checkout.
- Atendimento, templates, inscrições e campanhas são registros/rascunhos. Sem conexão IMAP/API, newsletter enviada ou disparo de retorno ao estoque.
- Impostos, gateway externo, tarifas, etiquetas e seguros dependem de documentação, configuração e credenciais. Nenhuma alíquota ou classificação legal foi presumida.
- Outros sites, idiomas, câmbio e compartilhamento entre empresas permanecem pendentes. Esta instalação atende uma vitrine local.
- Produtos usam importação/exportação nativa. Rotas antigas de escrita/importação de `item`, `form`, `publication`, `tax` e `payment_method` retornam 410. Referências internas identificam produtos para as operações de lotes.
- APIs e registros históricos complementares foram preservados; isso não significa que todo o escopo esteja completo ou tenha interface operacional final.
- Migração real depende do PHP/banco legado ausente. Nenhuma quantidade real, cliente real ou integração comercial foi importada.

## ADR-009 — Administração nativa e catálogo único

**Origem:** correção explícita do responsável em 2026-10-19. **Status:** diretriz confirmada; implementação técnica local.

**Contexto:** a versão 0.2.0 adicionou uma aplicação administrativa paralela com itens/apresentações duplicando Products/Variations. Esse caminho foi rejeitado.

**Decisão:** usar produtos, variações, pedidos, usuários, conteúdo, configurações comerciais e Analytics nativos. Estender editores e menus existentes apenas para lacunas reais. Remover o painel e bloquear escrita no catálogo antigo. Ledger e operações sem equivalente nativo permanecem como extensão WordPress.

**Alternativa rejeitada:** apenas reorganizar o painel antigo, conservando duas fontes de catálogo. **Consequência:** integrações comerciais usam APIs WooCommerce; correspondências antigas do inventário ficam como detalhes internos.

**Reversibilidade:** backup `wordpress/backups/before-native-admin-2026-10-19.sql` anterior à migração e `_kat_catalog_migration_source` com valores originais por produto. `wordpress/tools/migrate-native-catalog.php` é local, transacional e reexecutável sem duplicação. Rollback exige restaurar código e snapshot em ambiente isolado; restaurar sobre novas operações perderia trabalho posterior.

**Verificação:** 34 verificações de domínio adaptadas para produtos nativos; testes de navegador para catálogo, variações, pedidos HPOS, configurações, concorrência, checkout e conta. Resultados executados constam no changelog. Hooks conferidos no código instalado e na [documentação de campos de produtos](https://developer.woocommerce.com/docs/features/products/adding-a-custom-field-to-variable-products/) e [integração HPOS](https://developer.woocommerce.com/docs/features/orders/high-performance-order-storage/recipe-book/).

A [versão anterior](history/OPERATIONS-1.0.md) permanece como histórico, incluindo o ADR-008. Sua navegação foi substituída.
