# Katukina Core

Fundação do backend headless, versão 0.1.0. O plugin está mapeado e ativado pelo wp-env; não cria tabelas de domínio nem substitui regras de estoque/pagamento.

- `src/Headless.php`: origem pública configurada, links de produtos/categorias/artigos/páginas para Next.js, contexto HTTP do proxy e redirecionamento do tema WordPress.
- `src/Admin.php`: menu **Katukina** no wp-admin e endpoint administrativo `GET /wp-json/katukina/v1/modules`, ambos exigindo `manage_woocommerce`.
- `src/Modules.php`: registro dos módulos do escopo, com estado explícito e links apenas para recursos disponíveis. Catálogo e pedidos usam o WooCommerce; estoque/lotes, fornecedores, fracionamento, canais/empresas, logística, pagamentos, fiscal, CRM e migração aguardam seus incrementos.

Autenticação administrativa segue cookies e nonce REST nativos do WordPress. O endpoint não aceita escrita, não retorna credenciais nem dados de clientes; usuários sem capacidade recebem 401/403.

`KATUKINA_FRONTEND_URL`, `WP_HOME` e `WP_SITEURL` precisam representar a mesma origem pública. A origem interna do Docker nunca deve ser usada em links de navegação. O plugin usa a origem configurada para o contexto HTTP, sem confiar em headers encaminhados arbitrariamente. HTTPS em produção requer origem HTTPS e configuração consistente do proxy/servidor.

O MU-plugin `katukina-local` cuida exclusivamente dos controles locais e de chamadas internas do WordPress ao próprio backend dentro do Docker. Não levar a resolução `http://wordpress` desse MU-plugin para outra topologia sem adaptação.

O registro de módulos não é implementação de ERP. Antes de gravar operações de domínio, validar Item/Item Form/lote, autoridade de inventário, reservas/baixa, transições dos 13 estados, idempotência e isolamento por canal. HPOS é declarado compatível porque esta base não acessa tabelas de pedidos diretamente; novos módulos deverão preservar e testar essa compatibilidade.
