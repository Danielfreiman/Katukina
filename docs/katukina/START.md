# Início do desenvolvimento headless Katukina

Versão 0.3 · 2026-10-19. **CONFIRMADO pelo responsável:** WordPress + WooCommerce limpo, Docker local e Next.js como frontend público exclusivo, rápido e preparado para SEO. **IMPLEMENTADO:** ambiente local, leitura headless de catálogo/conteúdo e plugin base com roteamento e registro de módulos; detalhes em [HEADLESS.md](HEADLESS.md). **PROPOSTO:** homologação remota e os incrementos comerciais abaixo. O escopo multi-site segue preservado sem assumir compartilhamento de dados ou estoque.

A recomendação é começar com um fluxo comercial completo e pequeno em homologação, usando dados de teste. O acesso ao PHP legado é necessário para migrar e validar comportamentos históricos; a base nova pode avançar sem ele. A integração de pagamento real depende da documentação do gateway.

## Responsabilidades propostas

| Camada | Tecnologia e responsabilidade |
| --- | --- |
| Frontend público | Evoluir o Next.js/TypeScript existente: catálogo, produto, conteúdo, carrinho, checkout e apresentação por canal/idioma |
| Backend comercial | WordPress + WooCommerce: conteúdo, produtos/apresentações comerciais, clientes, pedidos e regras comerciais configuradas |
| Operações Katukina | Plugin `katukina-core`, dividido em módulos: canais, fornecedores, inventário/lotes, produção, estados operacionais e adaptadores |
| Dados transacionais | Produtos e pedidos pelas APIs do WooCommerce; tabelas próprias apenas para domínios que exijam modelo adicional, após desenho e testes |
| Integração frontend/backend | Store API para catálogo/carrinho/checkout; REST administrativa somente no servidor; endpoints próprios apenas para capacidades de domínio adicionais |

A distinção entre API comercial pública e API administrativa consta da [documentação do WooCommerce](https://developer.woocommerce.com/docs/apis/). Uma API pública de carrinho não dispensa a proteção de sessão: Cart Tokens identificam o carrinho e permitem uso headless; checkout exige token de carrinho ou nonce. [Cart Tokens](https://developer.woocommerce.com/docs/apis/store-api/cart-tokens/), [Checkout API](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/checkout/).

## 1 Preparar desenvolvimento e homologação

Instalação local implementada: wp-env 11.17.0 no Docker, WordPress 7.1.3, WooCommerce 11.2.1, PHP 8.3 e MariaDB 11.4. Site e banco publicados somente em loopback, credenciais locais fora do Git, HPOS ativado, indexação e envio externo de e-mails desativados. O código/configuração está em `wordpress/`. Homologação remota com a mesma combinação compatível permanece proposta. Testar atualizações antes de promovê-las. O wp-env oferece ambientes locais de WordPress para construir e testar plugins; seu runtime Docker permite configurar PHP e banco. [Documentação do wp-env](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/).

WooCommerce e o plugin base Katukina estão instalados; a lógica dos módulos de domínio continua pendente. O MU-plugin local contém controles de desenvolvimento e roteamento de chamadas internas dentro do Docker. Adicionar extensões somente para uma necessidade definida e com compatibilidade verificada. Repositório versiona código próprio, configuração sem segredos e dados sintéticos de teste. Banco, uploads, credenciais e dependências geradas têm ciclo separado. Homologação deve impedir indexação e capturar e-mails de teste sem enviar a clientes; nesta etapa local o envio está suprimido, sem captura.

HPOS, o armazenamento de pedidos em tabelas dedicadas do WooCommerce, está ativado no ambiente local. Verificar todas as extensões antes de adicioná-las. Código próprio usa APIs CRUD do WooCommerce para pedidos; a documentação orienta evitar dependência direta de `wp_posts`/`wp_postmeta` para esses dados. A declaração de compatibilidade depende de validação efetiva. [Guia HPOS](https://developer.woocommerce.com/docs/features/orders/high-performance-order-storage/recipe-book/).

**Saída verificável:** ambiente recriável, versões identificadas, plugin ativável, catálogo sintético carregado, logs de desenvolvimento e backup/restore de teste verificados. Instalação limpa não significa que o site de produção já esteja pronto.

**Progresso:** instalação, controles locais, plugin base e leitura de catálogo/conteúdo concluídos. Catálogo sintético permanente, lógica dos módulos de domínio e ensaio de backup/restore permanecem pendentes; parada/retomada preservando dados não substitui restauração de backup.

## 2 Definir o modelo mínimo antes de gravar transações

Propor Katukina como primeiro canal do piloto, sem dispensar testes de isolamento com um segundo canal sintético. Resolver empresa vendedora, moeda-base de teste e de operação, catálogo, depósito e papéis. Modelar canais desde o início; a escolha entre uma instalação central, Multisite e instalações separadas permanece no ADR-002.

Testar o mapeamento de Item mestre e Item Form: um produto com três apresentações vendáveis deve preservar IDs, unidades e vínculos. Produto variável/variações do WooCommerce é um candidato de mapeamento, sem assumir que resolve insumos, lotes ou produção. Definir a autoridade de estoque, reserva e baixa antes de implementar a sincronização operacional com pedidos.

Os 13 estados do levantamento precisam de matriz de transição e correspondência com o estado comercial do WooCommerce. Proposta: separar estado operacional de embalagem/expedição de pagamento, preservando referências; evitar que uma mudança de rótulo dispare baixa, e-mail ou efeito financeiro indevido. Regras desconhecidas permanecem pendentes.

**Saída verificável:** modelo Item/apresentação/lote/canal revisado, papéis e políticas mínimas explícitos, casos de teste e autoridade de estoque definidos para o incremento operacional. Questões Q-03/Q-05/Q-06 podem ser resolvidas pelo responsável sem acesso ao código PHP.

## 3 Concluir o primeiro fluxo integrado

Criar de cinco a dez produtos de teste, incluindo um Item com três apresentações. Demonstrar:

1. Cadastro no WordPress/WooCommerce e publicação no frontend.
2. Categoria e produto com conteúdo e metadados no HTML, URLs estáveis e tratamento de produto inexistente.
3. Carrinho persistido no backend para aquela sessão, isolado de outros clientes.
4. Escolha de país, atualização do total e revisão de itens/endereço com regras sintéticas claramente identificadas em homologação.
5. Pedido de teste criado e visível no WooCommerce usando método offline de teste, sem cobrança real; pagamento não deve ser considerado liquidado apenas pela criação do pedido.
6. Alteração de produto refletida no frontend e repetição/timeout tratados sem pedidos ou efeitos de estoque indevidamente duplicados.

O saldo nativo usado numa prova técnica isolada não equivale a aprovar a política final de lotes, reservas ou baixa em PACKED AND PENDING. Antes de transformar a prova em operação, integrar a autoridade escolhida no ADR-003 e testar a última unidade concorrente e a repetição da baixa. A migração não precisa estar pronta para demonstrar esse fluxo.

Para o gateway real, validar a integração do início ao fim tão logo exista documentação. Cada método pode exigir `payment_data` diferente; suporte a um plugin ou aos blocos de checkout não comprova automaticamente que a interface headless estará pronta. [Contrato do Checkout API](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/checkout/).

**Primeiro marco:** alterar um produto no backend, vê-lo atualizado no frontend e criar um pedido de teste consistente, rastreável e sem depender do catálogo estático atual. Só depois expandir a cobertura do backoffice.

## 4 Desempenho e SEO no primeiro incremento

Recomendação: entregar conteúdo de produto/categoria renderizado no servidor; pré-renderizar e revalidar conteúdo público onde adequado. ISR permite atualizar conteúdo pré-renderizado sem reconstruir todo o site. Carrinho, conta e checkout precisam de dados atuais por sessão, sem cache público de informações pessoais. [ISR no Next.js](https://nextjs.org/docs/app/guides/incremental-static-regeneration), [cache e hospedagem](https://nextjs.org/docs/app/guides/self-hosting).

Preço e disponibilidade dependentes de país, moeda, empresa, canal ou perfil não podem reutilizar cache de outro contexto. Projetar chaves de cache e revalidação, com atualização autenticada a partir do backend. O fechamento do pedido deve recalcular e validar valores/estoque na autoridade comercial; a cache pública não é fonte autoritativa.

Incluir canonical, title/description, Open Graph, sitemap, robots, dados estruturados coerentes com produto/oferta reais, hreflang quando houver idiomas e redirecionamentos quando as URLs antigas forem conhecidas. O frontend implementa esses elementos; instalar um plugin de SEO no WordPress não substitui sua integração no headless. O Next.js oferece APIs de metadata e convenções para essas rotas. [Metadata](https://nextjs.org/docs/app/getting-started/metadata-and-og-images), [sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap).

**Saída verificável:** HTML contém conteúdo/metadados essenciais, sitemap só inclui URLs canônicas publicadas, edição invalida a versão esperada, dados privados não vazam entre sessões, e cenários móveis passam em medição de laboratório com condições registradas. Medir Core Web Vitals reais após lançamento e ajustar orçamento de desempenho com base nos resultados; não prometer nota ou posicionamento antecipadamente.

## 5 Ampliar operações e preparar migração

Após o primeiro fluxo, avançar por dependências: inventário e reservas consolidados; fornecedores/lotes; granel e fracionamento; estados operacionais/picking; gateway e transportadoras; atendimento/CRM; relatórios e demais canais. Uma única base modular é o ponto de partida proposto; não há justificativa comprovada para microserviços ou múltiplos saldos independentes agora.

Em paralelo, manter IDs de origem e contratos de importação preparados. Quando houver acesso ao legado, executar o [plano de migração](MIGRATION.md), reconciliando pessoas, catálogo, estoque, pedidos, moedas e URLs. Uma instalação limpa não elimina o trabalho de transferência e validação dos dados históricos.

## Escopo da primeira implementação proposta

Ambiente limpo + plugin base + catálogo de teste + conexão do frontend + carrinho/pedido de teste + SEO técnico inicial + testes do fluxo. Gateway real, fiscal de produção, compartilhamento de estoque, importação definitiva e ativação de canais adicionais entram quando suas regras e dependências estiverem definidas. A recomendação de sequência não constitui aprovação automática das tecnologias ainda propostas.
