# Product — Katukina

<!-- impeccable:product-schema 1 -->

Registro de contexto do produto para o trabalho de frontend. Público e divisão de responsabilidades confirmados por Danilo em 06/11/2026. Complementa a documentação técnica em `docs/katukina/`; não transforma propostas históricas em requisitos aprovados.

**Reconfirmado por Danilo em 09/11/2026:** manter o foco no cliente final internacional de varejo, com Danilo conduzindo o frontend e a direção visual e o parceiro responsável pelo backend e pelas regras comerciais. O contexto existente permanece válido para a continuidade do projeto.

## Platform

web

## Users

O público prioritário é o **cliente final internacional, no varejo**, conforme confirmação de Danilo. A experiência deve ajudá-lo a descobrir produtos, compreender suas apresentações, comparar as opções disponíveis e seguir o fluxo de compra.

Danilo é o responsável pela direção visual e pelo desenvolvimento do frontend com assistência de IA. A operação administrativa e comercial permanece no WordPress/WooCommerce mantido pelo parceiro.

Atacado e outros canais aparecem no levantamento do ecossistema, mas não definem o público prioritário desta vitrine. Países prioritários, perfis detalhados dos compradores e necessidades específicas de localização ainda precisam de definição.

## Product Purpose

A vitrine pública Katukina apresenta o catálogo de botânicos, incensos, arte e objetos da marca, com navegação por categorias, informações de produto e escolha de apresentação. Conteúdo editorial e institucional complementa a descoberta.

O frontend deve tornar compreensíveis as opções, o preço e a disponibilidade fornecidos pelo backend e manter continuidade entre catálogo, produto, carrinho, entrega, conta e checkout. Sucesso nesta etapa significa uma experiência coerente, utilizável e fiel aos dados reais, validada em navegador e em tamanhos de tela representativos. Metas numéricas de conversão ou desempenho comercial ainda não foram definidas.

## Operating Context

- Projeto existente em Next.js App Router, React e TypeScript; desenvolvimento conduzido no Windows e VS Code.
- **Escopo confirmado desta etapa: frontend público.** WordPress/WooCommerce e regras comerciais ficam sob responsabilidade do parceiro. O backend existente continua sendo consumido por APIs; as integrações atuais devem ser preservadas.
- Comunicação de trabalho em português do Brasil; conteúdo público atual em inglês, com `en-GB` no documento HTML. Novos idiomas não estão aprovados.
- Site local em `http://localhost:3001/`; administração em `/wp-admin/` na mesma origem; backend Docker interno em `127.0.0.1:8888`. Portas 3000 e 8080 pertencem a outros projetos.
- Entradas técnicas: [discovery](docs/katukina/README.md), [instalação local](docs/katukina/LOCAL-SETUP.md), [arquitetura headless](docs/katukina/HEADLESS.md) e [cobertura atual](docs/IMPLEMENTATION_STATUS.md). Algumas seções antigas são históricas: usar as decisões posteriores e as evidências de escopo indicado.

## Capabilities and Constraints

### Frontend existente

- Home, loja/busca, coleções, categorias, paginação e filtros consomem o catálogo WooCommerce.
- Páginas de produto têm galeria, ampliação, seleção de apresentação/variação, identificação de SKU, quantidade, preço e disponibilidade.
- Conteúdo institucional, jornal, páginas editoriais e políticas têm rotas públicas próprias.
- Carrinho, conta, cotação e checkout de teste já possuem integração local; sua existência não comprova operação comercial em produção.
- Metadata, canonical, robots e sitemap fazem parte da base pública. Ambientes locais permanecem sem indexação por padrão.

### Limites de responsabilidade

- O WooCommerce é a fonte autoritativa de produtos, apresentações, preços, disponibilidade e dados comerciais. Não recriar esse catálogo ou suas regras no frontend.
- O consumo de contratos e a apresentação de seus estados pertencem ao frontend. Mudanças de contratos, autenticação, regras de estoque, impostos, pagamentos, frete, banco ou integrações comerciais exigem coordenação com o parceiro e escopo explícito.
- Preservar os editores e painéis nativos WordPress/WooCommerce; não criar uma administração comercial paralela.
- Checkout local é de teste, sem cobrança real. Homologação de gateway, transportadoras, regras fiscais e migração do legado permanecem dependências específicas do backend/negócio, conforme sua documentação.
- Manter produto mestre, apresentação/SKU, lote, reserva e baixa física como conceitos distintos; não deduzir regras de negócio pela aparência da interface.
- Alterações de frontend devem preservar preços, estoque, pedidos, mídia e integrações existentes. Dados simulados, quando necessários para uma atividade isolada, precisam ser identificados como teste.
- Banco, uploads, pacotes privados, exports e credenciais têm ciclo separado do Git. Sincronizar código não sincroniza esses dados entre computadores.

## Brand Commitments

- **Botões e CTAs confirmado em 11/11/2026:** usar o raio compartilhado de 8 px, via `--radius-control`, inclusive nos CTAs dos banners. Esta decisão substitui a regra histórica de quinas retas para botões de ação. Preservar as geometrias específicas já existentes de controles circulares, busca e header.

- **Tipografia revisada em 11/11/2026:** Sora para títulos e navegação/ações principais; Source Sans 3 para leitura, dados e campos. Pesos 400/600/700, escala em rem e inventário de seletores em [TYPOGRAPHY.md](docs/katukina/TYPOGRAPHY.md). Famílias oficiais preservadas; dependências de fontes históricas removidas.


- **CTAs confirmado em 09/11/2026:** usar CTAs sem setas. Prefer?ncia expl?cita de Danilo para os pr?ximos ajustes.

- Nome do produto: Katukina. Preservar referências de marca e ativos aprovados por Danilo.
- A referência cromática aprovada está em [PALETTE.md](docs/katukina/PALETTE.md), com o SVG original preservado. Esse documento e os estilos existentes governam as cores; este registro não os duplica.
- **Confirmado em 09/11/2026:** verde nos textos destacados e destaques da interface; vermelho urucum exclusivo de CTAs clicáveis de ações importantes. Sua presença sinaliza uma ação prioritária. Detalhes e exceção das fotografias em `PALETTE.md`.
- **Cards confirmado em 11/11/2026:** raio compartilhado de 8 px (`--radius-card`) em cards de campanha, produto, categoria, conteúdo e resumo de compra, incluindo home e páginas internas. Esta decisão substitui a orientação anterior de quinas retas somente nesses cards; elementos circulares e controles mantêm a geometria existente.

- **Geometria confirmada em 09/11/2026 (histórico; cards atualizados em 11/11/2026):** toda a interface pública usa quinas retas (`border-radius: 0`), incluindo CTAs, botões, campos, cartões, imagens, selos e diálogos. Novos componentes devem seguir esse padrão. Preservar os desenhos do logotipo, ícones e fotografias originais.
- As fotos editadas fornecidas por Danilo são evidência dos produtos. Preservar a identidade de cada produto/apresentação e seus vínculos; não criar detalhes, rótulos ou acessórios fictícios para preencher lacunas.
- Textos factuais, origem, relações com comunidades e condições comerciais devem ter fonte verificável. Não inventar depoimentos, certificações, benefícios, parcerias ou alegações de produção/homologação.

## Evidence on Hand

- Implementação ativa em `app/`, `components/site/`, `components/catalog/`, `components/commerce/`, `lib/wordpress/` e `lib/commerce/`.
- [Paleta e fonte aprovada](docs/katukina/PALETTE.md), [categorias e produtos](docs/katukina/CATALOG-UX-BLUEPRINT.md) e [histórico das fotos/importação](docs/katukina/CATALOG-WEBP-2026-11-06.md). Resultados datados de importação não substituem inspeção do catálogo atual.
- [Matriz de implementação](docs/IMPLEMENTATION_STATUS.md), [operações nativas](docs/katukina/OPERATIONS.md) e [contratos](docs/API_CONTRACTS.md) para distinguir recursos existentes, parciais e pendentes.
- [Privacidade e cookies](docs/katukina/PRIVACY-COOKIES.md) e testes em `tests/` para os fluxos públicos e integrados existentes.
- O código legado e serviços externos não foram disponibilizados integralmente. Não afirmar migração concluída, acesso a produção ou homologação externa a partir dos testes locais.

## Product Principles

1. Priorizar a compreensão do produto e de sua apresentação pelo cliente de varejo internacional.
2. Manter fidelidade às fotografias, ao conteúdo e aos dados comerciais de origem, inclusive estados vazios, indisponibilidade e erros.
3. Preservar a direção de marca aprovada e validar a experiência renderizada em vez de concluir apenas pela leitura do código.
4. Manter a fronteira entre apresentação no frontend e autoridade comercial no backend, com contratos e responsabilidades claros.
5. Preferir manutenção simples, mudanças localizadas e documentação rastreável para dar continuidade ao trabalho com IA.

## Accessibility & Inclusion

A base já possui navegação por teclado, foco visível, controles semânticos, tratamento de estados, consentimento de cookies e verificações de contraste/responsividade. Evoluções do frontend devem preservar esses recursos e conferir seus estados reais em navegador. Necessidades específicas de tecnologias assistivas e pesquisas com compradores ainda não foram definidas pelo responsável.

## Open Decisions

- Primeira página ou fluxo a receber a próxima rodada de trabalho e seus critérios de aceite.
- Diferencial comercial a comunicar, sustentado por evidências fornecidas pelo negócio.
- Países/idiomas prioritários adicionais, políticas comerciais e conteúdo final validado pelo parceiro/responsável.
- Metas de sucesso mensuráveis e destino de hospedagem/homologação. A existência da base local não confirma decisões de infraestrutura remota.
