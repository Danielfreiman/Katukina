# Histórico do discovery Katukina
## 2026-11-11 — Espaçamento do campo de busca

- Adicionado padding horizontal de 16 px e vertical de 14 px ao campo da busca no header, afastando placeholder e texto digitado da borda de foco.
## 2026-11-10 — Respiro inicial das páginas de comércio

- Corrigida a ausência de padding superior em conta, sacola, checkout e frete (`page-content commerce-page`). Espaço responsivo entre 32 e 56 px, preservando as páginas com introdução própria.
- Typecheck aprovado e distâncias conferidas no navegador em desktop e celular.
## 2026-11-10 — Ações do header modernizadas

- Pedido do responsável: modernizar busca, conta e sacola. Removidas moldura coletiva e divisórias; ícones com traço fino, rótulos no desktop e área de busca em branco quente. Hover e foco usam verde folha. Mobile mantém ações compactas e conta no menu.
- Typecheck aprovado; conferência local responsiva de navegação e header sticky.
## 2026-11-10 — Contraste no seletor de destino

- Corrigida a herança de texto branco da faixa verde nos seletores de país/moeda. Campo e opções usam texto carvão sobre branco; foco recebe contorno branco externo e controles nativos usam esquema claro.
- Typecheck e diff-check aprovados. Conferência das cores computadas no Edge local.
## 2026-11-10 — Navegação unificada do header

- Correção solicitada pelo responsável: “The shop” passa a “All categories”, mantendo o destino `/shop`; “Our story” fica na mesma faixa das categorias principais. Removido “Journal” do header desktop e mobile. A primeira linha contém marca e ações, sem navegação institucional separada.
- Typecheck aprovado; verificação responsiva local da navegação e do comportamento sticky.
## 2026-11-10 — Busca dinâmica no header

- Pedido do responsável: sugerir produtos enquanto digita. Implementado endpoint público de leitura do catálogo WooCommerce e painel com até seis sugestões, foto, nome, preço e link direto. Consulta a partir de dois caracteres, com espera de 250 ms e cancelamento de requisições anteriores.
- Mantidos Enter para busca completa e link para todos os resultados. Setas e Enter selecionam sugestões; Escape fecha o painel e devolve o foco. Estados de carregamento, nenhum resultado e indisponibilidade anunciados de forma acessível.
- Validação executada: typecheck, paleta/contraste e diff-check; dois testes Playwright aprovados cobrindo catálogo real, limite de resultados, celular, teclado, respostas atrasadas, resultado vazio e falha. Captura local: `artifacts/live-search-mobile.png`. Sem publicação.

## 2026-11-10 — Categorias principais no header

- Removido “Collections” da navegação do header a pedido do responsável. Atalhos confirmados contra o catálogo local: Rapé, Kuripe & Tepi, Sacred Incense, Herbal Teas, Shamanic Tools, Beauty & Body e Giftshop. É uma seleção de navegação, sem alterar a taxonomia WooCommerce.
- Desktop em duas linhas: marca/navegação institucional/ações e faixa de categorias. O header continua sticky; altura e afastamentos acompanham a nova composição. Em larguras menores, categorias entram no menu mobile com rolagem própria e fechamento ao navegar.
- Typecheck e verificação da paleta aprovados; conferência de links, indicação da categoria ativa, ausência de overflow e comportamento sticky no navegador.

## 2026-11-10 — Header acompanha a rolagem

- Pedido do responsável: manter o header visível durante a rolagem. Aplicado `position: sticky` no topo, com a faixa de destino seguindo o fluxo normal.
- Ajustados os afastamentos dos filtros, painel de compra e âncoras para respeitar a altura do header no desktop e celular.
- Validação: typecheck e diff-check aprovados; Edge em 1440 e 390 px confirmou header no topo após rolar 650 px, busca funcional e menu mobile acessível.

## 2026-11-09 — Grade de produtos da Home

- Cabeçalho recomposto a pedido de Danilo: título centralizado “Explore the collection.” com destaque verde, descrição e acesso à loja abaixo; removida a numeração do cabeçalho. Cards preservados. Navegação inferior em superfície branco quente, com título “Explore by category” e links maiores, sem caixas individuais.
- Conferência em 1440, 768, 390 e 320 px sem overflow, mantendo quatro colunas no desktop e duas nas telas menores. Typecheck, paleta e detector Impeccable aprovados; capturas `output/playwright/collection-intro-*.png` e `collection-categories-*.png`.

- Ajuste posterior solicitado por Danilo: CTAs dos cards em verde folha (`#526B35`), passando para urucum (`#782E26`) no hover e foco por teclado. Estados conferidos no navegador; validação de paleta aprovada.

- Pedido de Danilo: quatro produtos por linha e cards mais modernos com a paleta original. Ajuste restrito à coleção da Home, logo após o hero; consulta ampliada para oito produtos, sem alterar o catálogo nas demais rotas.
- Quatro colunas acima de 1000 px e duas abaixo; fotografias preservadas em branco, informações em branco quente, categorias verdes, CTA urucum e quinas retas. Bordas verdes em hover/foco e respeito à preferência por movimento reduzido.
- Validação local: typecheck, verificador de paleta/contraste e detector Impeccable aprovados. Navegador em 1440, 768, 390 e 320 px: oito produtos e imagens carregados, sem overflow horizontal. Capturas em `output/playwright/collection-*.png`. Sem publicação.

## 2026-11-09 ? Hero panor?mico com composi??o de produtos

- Pedido de Danilo: usar a refer?ncia de hierarquia textual, bot?es e ?cones; imagem feita por ele ocupando todo o hero. Removido o cart?o de produto destacado somente do hero. Cat?logo e integra??es preservados.
- T?tulo em duas linhas com destaque verde, CTA urucum, a??o secund?ria para a cole??o e ?cones Lucide de bot?nicos/incensos/objetos. Altura desktop preservada: 825 px na largura de 1440 px (antes: 824,98 px).
- Placeholder WebP 2400 ? 1500 px, 11.960 bytes em `public/images/campaigns/home/katukina-hero.webp`. Instru??es de substitui??o/composi??o em `ASSETS.md`; a imagem definitiva ainda ser? produzida por Danilo.
- Valida??o local: typecheck aprovado; detector Impeccable sem achados. Capturas em 1440, 768, 375 e 320 px sem overflow horizontal e imagem carregada. Evid?ncias em `output/playwright/hero-full-*.png`.
- Console registrou diverg?ncia de hidrata??o em controles de cookies com atributo inline `caret-color: transparent`, fora do hero; causa n?o investigada nesta altera??o. Recorte e legibilidade da composi??o definitiva ainda precisam de confer?ncia quando entregue.

## 2026-11-09 — Interface com quinas retas

- **CONFIRMADO por Danilo:** CTAs e todos os botões sem arredondamento; o padrão de quinas retas se aplica a toda a interface pública e está registrado em `PRODUCT.md`.
- Todas as declarações de `border-radius` em `globals.css`, `catalog.css` e `privacy.css` passam a zero, incluindo campos, cartões, fotos, selos, filtros, conta, carrinho, checkout e cookies. Removido o arredondamento do fundo do favicon. Desenhos do logotipo, ícones e fotografias preservados.
- Validação: typecheck e verificador de paleta/contraste aprovados; Home, loja, conta e carrinho em 1440 e 375 px sem overflow horizontal. Inspeção visual de Home desktop e loja mobile. Controles radio mantêm sua aparência nativa de seleção única; nenhuma regra autoral de arredondamento permanece nos três estilos públicos.

## 2026-11-09 — Urucum exclusivo para CTAs importantes

- **CONFIRMADO por Danilo:** textos destacados e destaques da interface em verde; urucum somente em CTAs clicáveis de ações importantes. Regra registrada em `PALETTE.md` e `PRODUCT.md`, substituindo os usos estáticos anteriores.
- Ênfase “natural” da Home, assinatura textual, cursor de campos, selos de promoção e favicon passam a verde. Mensagens de erro usam carvão/fundo neutro e preservam o texto explicativo. CTAs principais mantêm urucum e texto claro; fotografias preservadas.
- Complemento do header aprovado nesta conversa: faixa superior verde com texto branco, um único contorno verde ao redor do grupo de ícones e navegação com hover/foco verde e sublinhado de 2 px.
- Validação local: typecheck e verificador de paleta/contraste aprovados. Home em 1440 e 375 px sem overflow, destaque verde e CTA urucum confirmados por estilos computados e capturas em `output/playwright/cta-color-rule-*.png`. Tokens de urucum no CSS ficam restritos ao CTA principal e seu hover.

## 2026-11-09 — Ajustes visuais do header

- Pedido de Danilo: fundo branco no cabeçalho e faixa superior, navegação desktop de 12 para 14 px e ícones da direita com contorno retangular verde de 1 px, cantos retos e fundo transparente. Alteração localizada em `app/globals.css`.
- Validação local: typecheck aprovado; navegador em 1440, 1024, 801, 375 e 360 px sem overflow horizontal. Busca e menu abrem e fecham com Escape. Capturas desktop/mobile em `output/playwright/header-1440.png` e `header-375.png`.

## 2026-11-09 — Revisão do init e continuidade visual

- Danilo reconfirmou o público de varejo internacional e a divisão de responsabilidades: frontend/direção visual com ele; backend e regras comerciais com o parceiro. Registro atualizado no `PRODUCT.md`.
- README orienta evolução visual por página/fluxo, com objetivo, critérios de aceite, validação desktop/mobile e registro das decisões. Paleta, tipografia e ativos aprovados permanecem a base; a próxima rodada ainda precisa definir seu alvo e escopo.
- Corrigida a referência antiga à Manrope no README: `app/layout.tsx` carrega Sora e Source Sans 3 com `next/font/google`, em acordo com `TYPOGRAPHY.md`.
- Conferidos o contexto do Impeccable, `buildPath: "comp"`, a configuração existente do modo live e os documentos de produto, paleta, tipografia, catálogo e cobertura funcional. Esta revisão alterou somente documentação; não incluiu auditoria visual nem validação de produção.

## 2026-11-06 — Inicialização do contexto de frontend com Impeccable

- **CONFIRMADO por Danilo:** foco no frontend público Katukina; WordPress/WooCommerce e regras comerciais com o parceiro; público prioritário de cliente final internacional no varejo. Criado [PRODUCT.md](../../PRODUCT.md) com contexto durável, recursos existentes, limites e decisões abertas, ligado ao README e índice de discovery.
- **Escolha explícita de fluxo:** imagem de referência antes do código, registrada somente como configuração em `.impeccable/config.json` (`buildPath: "comp"`). Paleta e ativos já aprovados permanecem em seus documentos; não foi criada ou substituída uma direção visual nesta inicialização.
- Preparado `.impeccable/live/config.json` para `app/layout.tsx`. Detector de CSP retornou `shape: null`, sem sinais; nenhuma política, código de interface, sessão live ou backend foi alterado/iniciado.

## 2026-11-06 — Integração das alterações remotas e locais

- Incorporados os commits remotos `7aa64d3` e `784db73`, com o fluxo WebP e a paleta aprovada. Conflitos de documentação conciliados preservando o histórico da origem e o registro da aplicação/remoção das fotos nesta instalação.
- Validação do conjunto integrado: typecheck, build, verificador de paleta, cinco testes Node do mapeador de fotos, sintaxe do sincronizador Node e do script PHP de retirada, e teste Playwright da vitrine com limite de 180 segundos aprovados. O teste público passou em 1,3 minuto. Banco, mídias e backups privados permanecem fora do Git.

## 2026-11-06 — Fotos WebP e remoção das antigas

- Pedido explícito de usar somente as fotos do ZIP fornecido: 1.592 mídias nativas atualizadas para WebP, preservando vínculos de 377 produtos e 908 variações. Cache privado atualizado com 1.710 WebP.
- 11.151 originais/miniaturas anteriores removidos dos uploads após arquivamento privado verificado. Dez URLs antigas amostradas retornaram 404; 1.592 imagens novas conferidas por HTTP/hash.
- Comparação de dados comerciais aprovada. Uma checagem automática de reservas sem efeito (`expired: 0`) causou a reversão conservadora inicial; evento investigado e preservado, seguida de retomada com as fotos já geradas.
- Typecheck, sintaxes PHP/JS, revisão visual desktop/mobile e teste Playwright da vitrine aprovados. Fontes, recuperação e limites em [PHOTOS-WEBP-2026-11-06.md](PHOTOS-WEBP-2026-11-06.md).

## 2026-11-06 — Paleta urucum, verde folha e neutros

- **CONFIRMADO por Danilo:** adotar as cores e aplicações do SVG aberto no VS Code. Fonte copiada sem alteração para `docs/katukina/design/Katukina_Paleta_e_Aplicacoes.svg`; [paleta e regras de uso](PALETTE.md) documentadas e ligadas ao README/índice.
- Tema público centralizado em seis cores aprovadas: urucum nas ações principais e destaque da Home, verde folha no apoio/navegação/foco, branco quente predominante, cinzas e carvão nos textos/estrutura. Derivados calculados dos tokens para hover, fundos, erros e sobreposições; branco puro reservado às fotos. Ícone do site alinhado. Mesmos layouts, textos e integrações; sem alteração de tema WordPress ou banco.
- Links ativos recebem verde e sublinhado, com `aria-current` apenas na URL exata e marcação de seção nas subpáginas. Estados de seleção e formulários usam os novos tokens; botões de consentimento mantêm peso equivalente.
- `node scripts/check-palette.mjs` verifica fonte, tokens, cores literais e contrastes. Typecheck/build, teste público existente e amostras renderizadas de Home/loja/produto/conta em desktop/celular aprovados. Evidências, alcance da confirmação e aviso preexistente do detector registrados no guia da paleta.

## 2026-11-06 — ZIP de atualização de fotos para outra instalação

- Gerado pacote específico `katukina-atualizacao-fotos-webp-2026-11-06.zip` com 1.710 WebP e instalador de mídia independente dos IDs de anexos da origem. Inclui inspeção, backup SQL com restauração de teste na máquina receptora, aplicação, verificação e reversão; não importa produtos ou preços e preserva arquivos anteriores.
- ZIP, hashes internos e extração conferidos. Cinco testes de identificação aprovados, simulação do inventário antigo completo com IDs diferentes aprovada e inspeção do instalador extraído confirmou 1.592 referências locais já atualizadas, sem nova troca. [Entrega e instruções](CATALOG-WEBP-2026-11-06.md#zip-para-atualizar-somente-as-fotos-em-outra-instalação). A execução na máquina do destinatário permanece a realizar por ele.

## 2026-11-06 — Fotos WebP de 900 × 900 px no catálogo local

- **CONFIRMADO pelo responsável:** substituir as fotos com os arquivos de `Fotos/Editadas`, no WordPress e na vitrine. Duplicatas de nome com versões diferentes seguem a categoria principal registrada na origem, conforme aprovação explícita. [Procedimento, evidências e reversão](CATALOG-WEBP-2026-11-06.md).
- Atualizadas 1.592 mídias usadas por 377 produtos e 908 variações, preservando IDs, capas, galerias e imagens de apresentação. Backup SQL com restauração isolada validada, piloto de três mídias aplicado/revertido e arquivos antigos mantidos. Hashes dos dados de catálogo, pedidos e operações permaneceram iguais.
- Conferidos WebP/dimensões/miniaturas/hashes e HTTP dos 1.592 arquivos; Store API de 370 produtos publicada com novas URLs. Navegador desktop/celular e acesso administrativo conferidos. Typecheck, 19 testes Python e sintaxe dos wrappers aprovados. Limites e timeouts intermediários registrados no guia.
- Cache privado atualizado para 1.710 WebP e novo ZIP privado verificado, sem sobrescrever o pacote anterior. README e instalação local apontam para a versão atual; nenhuma publicação, alteração de outra instalação ou validação de fidelidade de todas as fotos foi realizada.

## 2026-11-03 — Volume como escolha direta

- **Correção confirmada pelo responsável:** Arapiraca Powder exigia selecionar embalagem e depois um único peso, sem escolha real na segunda etapa. Volumes únicos agora selecionam diretamente a variação: 10 ml, 25 ml, 60 ml. Embalagem e peso são detalhes da seleção.
- Regra aplicada a 116 produtos / 304 variações do catálogo migrado. Volumes iguais ou descrições com cortes/origens diferentes não são colapsados. IDs e dados do WooCommerce preservados. Auditor global ampliado para identificar esse padrão também nos atributos estruturados.
- Três testes, TypeScript e Chromium aprovados: Arapiraca, seleção de SKU, peso informativo, Voltar, recarga e mobile.

## 2026-11-03 — Remoção dos filtros rápidos

- **CONFIRMADO pelo responsável:** remover a faixa Quick filters com In stock, On sale e 4 stars & up das páginas de catálogo. Removidos o bloco compartilhado e seus estilos desktop/mobile.
- TypeScript aprovado; nenhuma referência ao bloco permanece nos componentes ou estilos.

## 2026-11-03 — Revisão global das variações exibidas

- **CONFIRMADO pelo responsável:** simplificar todas as opções exibidas, destacando apenas o que muda. Revisados 370 produtos e 908 variações pela API local; relatório antes/depois e IDs em artifacts/option-display-audit.json.
- Nos 222 produtos sem Type/Weight, rótulos mais curtos e ordenação natural; 43 compartilham especificações uma única vez. Nos 37 produtos com tipo único, pesos aparecem sem etapa redundante. Dezoito rótulos técnicos de opção única passam a Single option.
- Beads exibem 25/50/100 beads, mantendo 9 mm e pacote no contexto comum. Materiais, formatos, intensidades, volumes e quantidades diferentes são preservados. Nenhuma alteração no cadastro de origem, preços ou SKUs.
- Auditoria global, cinco testes, TypeScript e Chromium aprovados. Critérios, exemplos e reprodução: [OPTION-DISPLAY-REVIEW.md](OPTION-DISPLAY-REVIEW.md).

## 2026-11-03 — Seleção de tipo e depois peso na vitrine

- **Correção confirmada pelo responsável:** a separação no backend também deve organizar a escolha pública. Produtos com Type/Weight agora mostram primeiro os tipos e, em seguida, apenas os pesos do tipo escolhido, em ordem crescente.
- Trocar o tipo limpa a variação anterior. Preço, SKU, imagem, disponibilidade e compra continuam vinculados ao ID real da combinação; URL, recarga, Voltar e limpeza da seleção preservam o estado esperado. Produtos com outros atributos mantêm a seleção anterior.
- TypeScript e Chromium aprovados: combinações de Emburana bark, preço/SKU, troca de tipo, recarga, Voltar, limpar seleção e largura móvel de 390 px.

## 2026-11-03 — Tipo e peso separados no WooCommerce

- **CONFIRMADO pelo responsável:** separar o tipo do peso no backend. Implementada migração local reversível para atributos nativos Type e Weight, com plano, backup SQL, transação, verificação de identidade e preservação de dados.
- Aplicada a 148 produtos / 377 variações com peso explícito; 222 produtos fora dos critérios preservados. Mesmos IDs, SKUs, preços USD, imagens e estoque. Vitrine mantém textos compactos.
- Plano, TypeScript, migração, repetição segura, verificação de preços e teste do editor nativo e vitrine no Chromium aprovados. Reversão não executada. Procedimento e limites: [OPTION-ATTRIBUTES.md](OPTION-ATTRIBUTES.md).

## 2026-11-03 — Nomes resumidos das opções

- **CONFIRMADO pelo responsável:** reduzir redundâncias nas descrições das variações para facilitar a leitura. A vitrine omite o prefixo já informado no nome do produto, padroniza gr para g e remove o sufixo de uma unidade apenas quando há peso ou volume explícito.
- Formatos, corte fino e embalagens com múltiplas unidades continuam distintos; colisões retornam aos rótulos originais. Dados de origem e IDs não são alterados.
- TypeScript e verificações de transformação aprovados. Chromium confirmou as 11 opções distintas de Emburana bark e ausência de rolagem horizontal em 390 px.

## 2026-11-03 — Opções de produto em linguagem de consumo

- **CONFIRMADO pelo responsável:** substituir o termo técnico presentation na vitrine. Cards usam 1 option / 2 options; seleção e mensagens de compra usam Choose an option. O atributo vindo do catálogo também recebe esse rótulo quando se chama Presentation.
- TypeScript e verificação no Chromium da categoria Aromatics e da página de produto aprovados.

## 2026-11-03 — Simplificação dos filtros laterais

- **CONFIRMADO pelo responsável:** remover os blocos mostrados na captura: disponibilidade/promoções, preço e avaliação, com os controles de aplicar e limpar.
- Removidos na lateral e no diálogo móvel. Busca preservada por Enter ou lupa; marcas, quando disponíveis, aplicam a seleção automaticamente.
- Validação: TypeScript aprovado e verificação no Chromium confirmou ausência dos blocos em desktop/mobile e busca funcional.

## 2026-10-27 — Fotos diferentes após instalação em outro PC

- **CONFIRMADO pelo responsável:** no outro computador foram executados somente clone e `setup:local`. Esse fluxo instala seis amostras com as fotos originais; o catálogo completo e as imagens editadas exigem o pacote privado, ignorado pelo Git.
- Guia de instalação passou a destacar essa diferença no início e a usar explicitamente `katukina-catalog-edited-2026-10-27.zip`, com conferência automática do recibo SHA-256 antes de extrair. Incluída continuação para quem já instalou as amostras, sem apagar o banco. Instalador informa a etapa adicional.
- Verificados SHA-256 do ZIP, os 1.710 arquivos de imagem e a correspondência das 65 fotos fornecidas no RAR. WP-CLI local confirmou 65 imagens, 13 produtos e 29 variações sem divergências. Sintaxe JavaScript do instalador e `git diff --check` aprovados. Não houve nova importação nem acesso ao outro computador nesta verificação; a transferência e execução lá ainda são necessárias.

## 2026-10-27 — Política de cookies e consentimento na vitrine

- Criadas `/cookies` e `/privacy` em inglês, com dados do controlador e contato encontrados em `https://katukina.com/privacy` por orientação do responsável. Textos descrevem a operação local auditada; não copiam integrações nem regras de retenção do legado como se estivessem implementadas.
- Banner com aceitar/rejeitar/personalizar no primeiro nível e peso visual equivalente; opção funcional desmarcada; painel acessível e reabertura permanente. Escolha versionada por 180 dias, mesma duração para recusa; limpeza e desligamento em retirada/expiração entre abas. Falha de persistência mantém opcionais desligados.
- Histórico antes automático passou a depender de consentimento; até oito IDs com validade individual de 30 dias. Dados antigos são removidos; cookie de carrinho e login independem do aceite. Links de privacidade em rodapé, conta, checkout e sitemap.
- Auditoria WP-CLI somente leitura: Katukina Core e WooCommerce são os únicos plugins ativos; nenhuma opção `woocommerce_*retention*` gravada. Referências europeias e pendências de retenção, fornecedores, direitos dos titulares e produção em [PRIVACY-COOKIES.md](PRIVACY-COOKIES.md). A mudança não declara conformidade integral do negócio com GDPR/ePrivacy.
- Oito testes Playwright conjuntos aprovados em 2,1 minutos; um teste adicional de expiração em aba aberta e funcionamento sem JavaScript também passou. Incluídos ausência de leitura opcional prévia, recusa, retirada entre abas, preservação do carrinho, falha de storage, teclado, mobile e regressão de compra por SKU. Capturas revisadas em `artifacts/privacy/`.
- Typecheck e build finais aprovados; `/cookies` e `/privacy` geradas com sucesso. `git diff --check` sem erros de whitespace. Não houve alteração de configuração comercial, instalação de plugins, exclusão de dados preexistentes ou publicação em produção.

## 2026-10-27 — Swatches e revisão da referência Grocery

- Correção explícita do responsável: Presentation passou a usar swatches de texto com preço, disponibilidade, seleção e teclado nativos. Categorias passaram a uma lista lateral de links, com hierarquia, contagens e expansão, também disponível no diálogo móvel.
- Adicionados filtros rápidos, faixas de preço, ofertas, avaliação e marcas quando cadastradas; ordenação por vendas/avaliação, 12/24/48 itens, quatro colunas no desktop amplo e histórico local de até oito produtos vistos. Histórico guarda somente IDs e consulta dados públicos atualizados; limpeza disponível. Cartões exibem opções e metadados comerciais reais, sem fabricar dados.
- Nova consulta ao conteúdo público indexado de Grocery; acesso ao vivo bloqueado por HTTP 403/Cloudflare. Evidências, contratos, cobertura e limites na [seção 10 do esquema](CATALOG-UX-BLUEPRINT.md#10-revisão-grocery-categorias-em-lista-e-swatches--2026-10-27).
- Typecheck e build aprovados. Quatro testes Playwright passaram juntos em 1,8 minuto: consultas, categorias, filtros/oferta real, paginação/tamanho, histórico, swatches por teclado, galeria, carrinho por SKU, respostas incertas, estoque/preço e regressão pública. Revisão visual em desktop/celular e verificações de largura 1440/768/390/360. Fixtures removidas após os testes; produtos comerciais preservados. Um seletor de teste foi corrigido para reconhecer o novo nome do botão após a expansão.

## 2026-10-27 — Implementação das páginas de categoria e produto

- Pedido “implemente” autorizou executar REQ-UX-001. Categorias e busca compartilham filtros, ordenação, agregações da Store API, URLs reproduzíveis, estados vazios/erro e paginação numerada; hierarquia e categorias permanecem nativas. Filtros móveis usam diálogo acessível.
- Produto recebeu galeria/miniaturas/ampliação, seleção de apresentação por ID, preço/SKU/foto/disponibilidade da variação e quantidade validada. Carrinho usa BFF existente, revalidação WooCommerce e nenhuma repetição automática de POST em resposta incerta. Relacionados por categoria, detalhes públicos, breadcrumbs, cartões responsivos e metadados implementados em inglês.
- Revisão visual revelou referências antigas de mídia sem arquivo. Upload ausente deixa de redirecionar para HTML da home e responde 404; componente tenta o original quando uma miniatura responsiva falha e mostra placeholder quando necessário, inclusive se a imagem falhar antes da hidratação. Anexos e produtos existentes preservados.
- Fronteira de erro usa `retry()` conforme documentação da versão Next.js instalada. Não foram alteradas regras comerciais, preços, moeda ou estoque do catálogo existente. Testes de compra criam e removem somente fixtures próprias; não houve pagamento, pedido ou envio de e-mail nesta validação.
- Typecheck, build e sintaxe PHP de `Headless.php` aprovados. Testes, revisão e limites detalhados em [CATALOG-UX-BLUEPRINT.md](CATALOG-UX-BLUEPRINT.md#9-implementação-autorizada--2026-10-27). Avaliações, filtros globais de atributos e entrega no produto permanecem condicionais aos dados/contratos correspondentes.
- Execução conjunta final: `npx.cmd playwright test tests/catalog.spec.ts tests/storefront.spec.ts` — quatro testes aprovados em 1,8 minuto. Cobertura inclui moeda/consultas, filtros, paginação/histórico, mídia ausente, simples/variável, SKU/quantidade, foto herdada, rascunho, preço/estoque alterado após leitura, resposta perdida sem duplicação, teclado e larguras 1440/768/390/360. Falhas intermediárias de seletores ambíguos foram corrigidas nos testes; falha real de imagem anterior à hidratação foi corrigida no componente. O ambiente de desenvolvimento exigiu aguardar a navegação dinâmica por até 20 segundos no teste de paginação.
- Conferência após a limpeza: 370 produtos publicados, 908 variações e nenhum produto/categoria temporário `catalog-fixture-*` restante. Typecheck e build finais também aprovados após a correção de hidratação da imagem.

## 2026-10-27 — Esquema de categorias e produtos

- Registrado REQ-UX-001 a partir do pedido de engenharia reversa da iHerb. [Esquema técnico](CATALOG-UX-BLUEPRINT.md) e [wireframe interativo](CATALOG-WIREFRAMES.html) separam observação pública, auditoria local e proposta de implementação; mantêm identidade Katukina, interface em inglês e administração nativa.
- Código e consultas GET confirmaram a lacuna de seleção de variações/galeria, atributo Presentation local sem taxonomia global e catálogo indisponível. Contratos propostos preservam IDs, carrinho existente, moeda da API, estoque e restrições reais. Nenhum dado comercial foi alterado.
- Referência consultada por HTML público indexado; navegação ao vivo bloqueada por desafio de segurança. Layout e comportamento móvel são propostas, não medições da referência.
- Playwright/Chromium do wireframe: seis combinações de página/tamanho sem overflow horizontal, alternância de telas e seleção A/B/reset aprovadas, sem erros JavaScript. Corrigida uma tag option após falha inicial; nova execução completa aprovada. Revisão visual de produto desktop e categoria móvel. Aplicação não alterada; não executados build ou testes funcionais da loja nesta entrega.

## 2026-10-27 — Fotos editadas do catálogo

- Aplicados os 65 JPEGs de `Editadas.rar` às capas/galerias de 13 produtos e às imagens principais de 29 variações. Doze produtos publicados; Muna permanece em rascunho. Cinquenta conteúdos distintos reutilizados sem duplicar anexos na reexecução.
- Backup anterior, arquivos antigos preservados, hashes/referências conferidos e dados comerciais/históricos inalterados. API pública e duas páginas de produto verificadas no navegador.
- Cache e pacote privado do catálogo atualizados para reproduzir as fotos em outra máquina. Importador de mídia elimina IDs repetidos na galeria para imagens de conteúdo idêntico. [Evidência e limites](PRODUCT-IMPORT-2026-10-27.md#fotos-editadas-fornecidas-em-2026-10-27).

## 2026-10-27 — Reprodução do catálogo e revisão antes do push

- Criado `package_product_catalog.py`: pacote privado com três manifestos e 1.688 imagens, sem contas, clientes, pedidos ou credenciais; hashes das imagens e integridade ZIP verificados. Guia de instalação distingue clone com seis amostras, importação completa e transferência do histórico por banco/uploads.
- Ensaio em cópia dos arquivos preparados para Git, sem banco, uploads ou dependências locais copiados: ambos os `npm ci` com npm 11.16.0, bootstrap WordPress/WooCommerce em banco novo, typecheck, build Next.js 16.4.3, 13 testes Python e sintaxe de 32 arquivos PHP aprovados. Falhas temporárias de DNS resolvidas por nova tentativa; portas isoladas 3002/8889 e outro projeto 8080 preservado.
- Atualizações compatíveis dos lockfiles: frontend sem alertas no `npm audit`; seis alertas remanescentes nas ferramentas de desenvolvimento WordPress, com correção sugerida via versão principal wp-env 12 ainda não homologada. Limite registrado em `LOCAL-SETUP.md`. Bloco de instruções Next.js atualizado automaticamente pela nova versão.
- Verificador USD passou a retornar erro de execução quando encontra divergências, para que a reprodução não prossiga como se a conferência tivesse passado.
- Nove testes Playwright aprovados em uma execução conjunta (6,2 minutos) na base limpa com amostras: painel nativo, APIs, operações, concorrência, checkout, conta e vitrine. Catálogo principal também conferido no navegador após atualização de dependências.
- Pacote de 237.141.808 bytes extraído e importado na instalação nova: 370 produtos, 908 variações e sete rascunhos com imagens; 2.405 linhas reconciliadas e seis IDs iniciais preservados. Aplicação/verificação dos 908 preços USD aprovada, sem mudança de históricos. Teste negativo de preço divergente confirmou a saída de erro do verificador e restaurou a entrada privada, sem gravar no banco.
- Verificação final de navegador da cópia recuperada aprovada: catálogo público em USD, imagens, login e editores nativos. Serviços temporários de teste encerrados com volumes preservados; ambiente principal continua em 3001/8888.

## 2026-10-27 — Preços em USD conforme o site público

- Por instrução posterior do responsável, os 908 SKUs passaram a usar os preços públicos USD do katukina.com, confirmando SKU e quantidade. Nenhum câmbio estimado; seletor USD aplicado em sessão anônima quando necessário.
- WooCommerce e canal local em USD. Backup anterior, transação, reconciliação dos 908 preços sem divergências e checksums históricos preservados. Importador GBP protegido contra mudança acidental da moeda após essa atualização.
- Coletor com cache/atualização explícita e atualizador CLI documentados no [relatório da importação](PRODUCT-IMPORT-2026-10-27.md). Treze testes Python e sintaxe PHP/JS aprovados.

## 2026-10-27 — Cadastro da planilha Sacred Incense UK

Origem: cadastro de todos os produtos do XLSX fornecido; aprovação explícita para usar GBP e os preços da planilha na loja de teste.

- Importados 370 produtos variáveis, 908 variações e sete rascunhos de correspondência ambígua, todos com imagens. SKUs textuais e seis IDs preexistentes preservados; 2.405 linhas de origem reconciliadas sem duplicar SKUs ou somar saldos repetidos.
- Moeda WooCommerce GBP e novo canal fictício `LOCAL-DEMO-GBP`, preservando canal anterior, avisos e pedidos históricos. Saldos da planilha permanecem como referência e a disponibilidade para venda aguarda conferência; pesos, IVA, HS e descontos não foram inferidos.
- Parser, downloader com cache e importador CLI local com backup, prévia, retomada e verificação. Dados privados fora do Git e bloqueados por HTTP. Seção em inglês `Imported source data` nos editores nativos; duplicação WooCommerce remove identidade e metadados da importação.
- Verificações: 11 testes Python, sintaxe PHP/JS, 13 verificações de duplicação em memória, Playwright do catálogo/editor, hash da fonte, preços e quantidades, imagens, preservação dos históricos e reexecução sem novos produtos. [Relatório e reprodução](PRODUCT-IMPORT-2026-10-27.md).
- Docker Desktop recuperado após autorização de reinício; volumes preservados e outro projeto na porta 8080 confirmado acessível.

## 2026-10-22 — Ambiente de teste reproduzível pelo Git

Origem: pedido de commit/push com instruções para outro computador; autorização explícita para incluir credenciais de teste e exigir rotação antes de publicação.

- `LOCAL-SETUP.md` e README descrevem clone, dependências, bootstrap, execução, atualização, testes e persistência. `setup:local`/`wp:setup` iniciam o WordPress, preparam acesso local, importam seis produtos/fotos e configuram o canal fictício. Reexecuções preservam dados e senha existentes; banco já inicializado sem arquivo de acesso não tem sua senha substituída automaticamente.
- Exemplo de acesso público de teste versionado por autorização do responsável. Documentação e AGENTS exigem rotação de credenciais/chaves/salts antes de qualquer publicação. Senha efetiva anterior, exports de clientes, dashboards privados, runtime e backups foram excluídos do commit; `.gitattributes` preserva os nove documentos de origem byte a byte.
- Compose descoberto pelo checkout, sem nomes fixos de containers. Testes usam SKU em vez de IDs locais; runner seleciona npm conforme a plataforma. `typecheck` gera os tipos Next.js em uma cópia nova. `next-env.d.ts` permanece local e é gerado automaticamente.
- Validação em cópia temporária dos arquivos preparados para Git, sem banco, uploads ou dependências copiados: instalação npm pelos dois lockfiles; bootstrap completo em banco novo nas portas isoladas 3002/8889; seis produtos/fotos importados; HPOS, bloqueio de e-mail, noindex e loopback HTTP 200 confirmados. Typecheck, build e cinco testes Python passaram. A reexecução no ambiente anterior também preservou as seis amostras e o acesso existente.
- Node 25.2.1 usado no ensaio. A instalação inicial com npm 11.6.2 mostrou avisos de engines das ferramentas Playground; pré-requisitos corrigidos para Node >=24.18 e npm >=11.16 conforme as dependências fixadas. Windows validado; scripts portáveis não equivalem a ensaio em Linux/macOS.
- Reinstalação real do backend com npm 11.16.0 aprovada; wp-env 11.17.0 executou com essa instalação. Verificação de navegador confirmou login com a credencial de demonstração, APIs, carrinho e Products. Repetição do bootstrap no banco novo preservou senha e os mesmos seis IDs de produtos; backup SQL gerado nessa cópia (sem ensaio de restauração nesta etapa).
- Ensaio completo inicial: seis cenários Playwright aprovados e duas falhas. Corrigido redirecionamento administrativo que fixava 8888; cenário headless passou isoladamente. Corrigida resposta descartada do carregamento do checkout que podia apagar endereços digitados no Strict Mode; checkout real e novo teste de resposta atrasada passaram isoladamente. Total de nove cenários aprovados ao concluir as correções, sem alegar uma nova execução conjunta. Sintaxe dos 30 arquivos PHP próprios e dos scripts Node verificada.

## 2026-10-22 — Auditoria do escopo inicial e lacunas comerciais

Origem: cobrança do responsável sobre Sendcloud, HS integrado, múltiplos sites sobre um backend, escolha de publicação por produto e demais exigências iniciais.

- `FUNCTIONAL-COVERAGE.md` compara todos os domínios/IDs com código e configuração local, distinguindo implementação, cadastro preparatório, ausência e dependência externa. Corrigidas interpretações históricas de exportação contábil, inserção de templates, amostras e publicação por canal.
- Consultas somente leitura confirmaram ausência do Sendcloud, um canal ativo, zero classificações HS/transportadoras/transições/publicações, impostos desativados e apenas gateway fictício habilitado. Nenhum dado pessoal ou credencial foi incluído no relatório.
- Reforçados PLT-002/CAT-003 e ADR-002 quanto ao objetivo funcional de um backend e seleção de produtos por site; registrado LOG-003 para Sendcloud/HS. Isso registra exigências, não conclusão da implementação nem aprovação de políticas fiscais/estoque compartilhado.
- Adicionado `wordpress/tools/audit-functional-coverage.php`, executado por WP-CLI local, que retorna apenas configurações públicas e contagens agregadas. Não houve instalação/configuração de integração comercial nem nova bateria funcional nesta auditoria.

## 2026-10-22 — Administração em inglês e navegação nativa

Origem: pedido explícito para usar inglês nos módulos complementares e seguir a consistência das telas WooCommerce, com listagem inicial e botão para adicionar. Requisito REQ-ADM-001.

- Menus, campos, ajuda, avisos e validações do Katukina Core em inglês, incluindo produtos/variações, pedidos/picking, perfis/créditos, permissões e métodos locais de teste. Dados cadastrados e histórico não foram traduzidos.
- Fornecedores, contatos e cadastros operacionais abrem em listagem com nome clicável e ação Edit. Add new e Back to list separam criação/edição e consulta. Fornecedores exibem referência, e-mail, telefone, país e status; campos usam dimensões e classes nativas. Settings oculta Save changes nas listagens e redireciona criação para o registro salvo.
- Lotes, reservas e fracionamento exibem listas com ações separadas e retorno; cabeçalhos dos relatórios possuem rótulos legíveis. Preservados permissões, nonces, IDs, controle de versão, comandos idempotentes e regras de negócio.
- Investigação da regressão de variações encontrou `WP_SITEURL` regravado pelo wp-env em 8888. O wrapper restaura a origem pública após start por Compose/WP-CLI local, sem segunda resolução remota do wp-env. Verificação headless e teste de variações exigem a mesma origem pública para AJAX.
- Validações executadas: sintaxe PHP do plugin e MU-plugin, sintaxe Node do wrapper, `npm.cmd run typecheck`, inicialização com restauração automática de `WP_SITEURL` e verificação headless (admin em 3001, loopback REST HTTP 200). Capturas de fornecedores, formulário e configurações revisadas.
- Playwright: seis cenários aprovados ao concluir as correções — navegação/lista/criação/edição complementar; produtos e variações; pedidos e configurações; operação/permissões/concorrência; carrinho/checkout; conta/privacidade. A última execução conjunta teve cinco aprovações e uma falha de seletor ambíguo entre registros sintéticos de mesmo nome; o cenário complementar passou isoladamente após restringir o seletor à referência única. A falha anterior de variações foi resolvida pela correção de origem, não apenas pela ampliação da espera.

## 2026-10-19 — Versão 0.8

Origem: “Implemente tudo que for possível”, após a comparação do escopo com a instalação inicial.

- Plugin Katukina Core 0.2.0: cadastros tipados, tabelas InnoDB, capacidades por operação, auditoria, versão esperada e comandos idempotentes; Item/Form separados e vinculados aos seis exemplos. Empresas, depósitos e canais modelados separadamente.
- Estoque por lote com entrada, ajuste, reserva por linha, expiração/liberação, baixa em embalagem, reconciliação e reposição agregada. Fracionamento com conservação de conteúdo, perda, sobra, origem e reversão da saída ainda não movimentada. Matriz de estados permanece vazia; 13 rótulos preservados e SHORT NOTE disponível na lista HPOS.
- Créditos e recebimentos manuais por cliente/pedido e moeda, precisão explícita, referência única e proteção contra saldo negativo; picking, expedições/rastreio manual, quatro notas de país, cadastros fiscais com vigência/fonte, atendimento/templates/consentimento/campanhas em rascunho, CSV e relatórios. Não ativados gateways, envio externo, transporte real ou tributação presumida.
- Next.js: carrinho Store API, quantidades, cupons, país/postcode, cálculo de entrega, revisão final, checkout fictício local com repetição idempotente e conta com autenticação nativa/histórico privado. País e bloqueio por apresentação validados no servidor; aceite versionado não sobrepõe proibição. Reserva operacional automática para SKUs com lotes; sem baixa física no checkout.
- Canal/empresa `LOCAL-DEMO`, destino GB, entrega sem despacho e prazo inicial de reserva de 60 minutos são fixtures explícitas de desenvolvimento. Produtos de exemplo continuam sem quantidades reais. Moeda USD dos exemplos não define política de produção.
- Validações: build/typecheck aprovados; sintaxe PHP e JavaScript; 34 verificações de domínio; cinco cenários de navegador (headless, operação/concorrência, carrinho/checkout, conta e vitrine). Identificados e corrigidos o retorno idempotente no filtro REST, o registro do método de entrega e o retorno ao login após logout. Cenários afetados repetidos após correção.
- Revisão visual das quatro rotas comerciais em 1440/390/320 px: sem overflow ou erros JavaScript, capturas e evidência em `artifacts/operations-visual-verification.json`. Backup SQL antes da instalação e backup posterior com SHA-256; restauração posterior executada em banco temporário isolado e removido após conferência.
- [OPERATIONS.md](OPERATIONS.md) registra ADR-008, cobertura requisito a requisito, limites de operação, contratos e instruções. Fontes originais, planilhas, dashboard e outros projetos locais preservados; sem deploy ou push.

## 2026-10-19 — Versão 0.7

Origem: pedido explícito de rebrand drástico com o padrão de fundo preservado e preferência por visual clean; relato posterior de confusão ao acessar o painel pela porta 8888.

- Nova identidade visual no frontend: Manrope local, branco/grafite/verde, novo símbolo/wordmark/favicon, hero orientado ao produto, estrutura editorial, cards, rodapé e detalhe de produto com atributos reais. Fundo original preservado em baixa opacidade. Fontes/assets antigos permanecem como referência fora da vitrine ativa.
- Busca expansível e menu mobile com fechamento por Escape e retorno de foco. Produtos continuam vindos da Store API; nenhuma regra de preço, estoque ou pagamento foi alterada pelo rebrand.
- Entrada direta em login/painel na porta interna 8888 agora redireciona ao endereço público 3001 antes do formulário. Destino fixado à origem configurada, sem alteração da senha ou da autorização WordPress. Incluídas regressões de ambos os caminhos no teste de integração.
- Build Next.js/TypeScript, lint PHP e os dois testes Playwright passaram. Login validado com as credenciais locais, incluindo encaminhamento de `/wp-admin/` e `/wp-login.php` a partir de 8888. Home, catálogo e produto conferidos em desktop/mobile, com imagens carregadas, Manrope aplicada, sem erros JavaScript e sem overflow até 320 px. Capturas revisadas; evidência em `artifacts/rebrand-verification.json`.

## 2026-10-19 — Versão 0.6

Origem: pedido explícito para consultar katukina.com e cadastrar produtos de exemplo no WordPress novo.

- Cadastrados seis produtos simples, uma apresentação por Item observado: Palo Santo, Myrrh, Benzoe, Harmony, Incense Burning Set e Charcoal Discs. Preservados SKU e IDs separados de Item/Item Form, categorias, apresentação, origem, URL/data da fonte e preço exibido em USD. Descrições resumidas; seis fotos copiadas para a biblioteca local.
- Manifesto e imagens em `wordpress/tools/fixtures/`; importador exclusivo para WP-CLI/local verifica moeda e conflitos e preserva cadastros concluídos. Executada repetição: os mesmos seis IDs foram preservados sem duplicatas. Lint PHP, sintaxe Node e build Next.js aprovados.
- REQ-CAT-004 e SAMPLE_CATALOG.md registram aceite, fontes e reprodução. USD é apenas a moeda de apresentação observada e o padrão local já existente; não define política comercial. Sem estoque físico, impostos, lotes, clientes ou pedidos importados.
- Na verificação da versão compilada, a geração do sitemap encontrou timeout ao solicitar conteúdo completo de páginas WordPress. Consulta reduzida a `slug,modified`, dispensando renderização de blocos para listar URLs; teste agora confere também o status HTTP.
- Após o ajuste, os dois testes Playwright passaram na versão compilada. Conferidos os seis SKUs/preços, imagens locais e páginas individuais (HTTP 200), ausência de imagens quebradas e layout mobile; capturas desktop/mobile revisadas. Evidência em `artifacts/sample-catalog-verification.json`.

## 2026-10-19 — Versão 0.5

Origem: pedido explícito para usar Next.js em todas as páginas públicas, encaminhando administração/recursos necessários ao WordPress e criando a estrutura do escopo.

- Next.js confirmado no ADR-001; acrescentados ADR-007 e REQ-PLT-004. Site e painel no mesmo endereço, porta 3001 porque 3000 já estava ocupada. Backend Docker em 8888; rotas encaminhadas por allowlist, preservação de `/wp-admin/`, contexto HTTP público configurado e chamadas internas mantidas na rede Docker.
- Catálogo, busca, coleções, produto, artigos e páginas passaram a consumir WooCommerce/WordPress no servidor. Metadata, sitemap e schema usam conteúdo publicado. Preservado o código do protótipo fora das rotas ativas. Carrinho/checkout/conta/frete têm estrutura de navegação com indisponibilidade explícita; não criam transações.
- Instalado plugin `katukina-core` com roteamento headless, menu administrativo e registro dos módulos. Catálogo/pedidos/conteúdo têm acesso aos recursos nativos; inventário/lotes, fornecedores, produção, canais, logística, pagamento, fiscal, CRM e migração continuam planejados. Endpoint de módulos exige capacidade administrativa.
- Verificações executadas: TypeScript e build Next.js; lint PHP dos cinco arquivos de plugin/MU-plugin; loopback REST dentro do Docker HTTP 200; testes Playwright de páginas públicas, SEO/404/mobile e integração real, incluindo login, permissões, assets do painel, publicação, busca, categoria, edição, despublicação e artigo. Dados temporários removidos pelos testes. Revisadas capturas desktop/mobile.
- Documentação operacional atualizada e mapa completo em HEADLESS.md. Sem implantação remota, importação de legado ou definição implícita de regras comerciais/multi-site.

## 2026-10-19 — Versão 0.4

Origem: pedido explícito do responsável para criar o ambiente local e instalar as dependências usando o Docker existente. Autor da implementação: Codex.

- Iniciado Docker Desktop e criado ambiente isolado em `wordpress/` com wp-env 11.17.0, WordPress 7.1.3, WooCommerce 11.2.1, PHP 8.3 e MariaDB 11.4. Dependências e lockfile próprios; dependências do frontend preservadas. Site em `127.0.0.1:8888` e banco em porta dinâmica local, separados do projeto preexistente em 8080.
- Ativados HPOS, links permanentes e páginas básicas; questionário inicial dispensado sem inventar dados da empresa. MU-plugin local impede indexação, envio externo de e-mails e rastreamento WooCommerce. Setup repetido confirmou preservação das configurações.
- Senha administrativa aleatória aplicada sem expor o valor na linha de comando. Arquivo de acesso, runtime e dependências confirmados como ignorados pelo Git. Adicionados comandos `wp:*` e guia operacional.
- Validações executadas: sintaxe dos scripts Node; lint PHP do MU-plugin; execução dos helpers WP-CLI; HTTP 200 na home, noindex, REST API, Store API, emissão de Cart Token, login administrativo e painel de Produtos via Chromium/Playwright. Parada e retomada concluídas; repetição da verificação confirmou login/configuração preservados. PHP 8.3.35, MariaDB 11.4.13 e banco saudável observados após reinício. `git diff --check` passou.
- Atualizados auditoria, plano de início, índice, READMEs e diretrizes; registrado ADR-006. Integração da vitrine, catálogo sintético, regras comerciais, plugin de domínio e backup/restore seguem pendentes. Nenhum dado legado foi importado, e nenhuma hospedagem remota foi criada.

## 2026-10-19 — Versão 0.3

Origem: o responsável confirmou uma instalação nova e limpa de WordPress + WooCommerce e reafirmou frontend headless rápido e preparado para SEO. Autor da atualização técnica: Codex.

- ADR-001 aceito para a camada comercial WordPress/WooCommerce limpa e a arquitetura headless. Next.js, plugin modular próprio, infraestrutura e demais ADRs permanecem propostas; as alternativas anteriores foram preservadas como histórico da decisão.
- Atualizado REQ-PLT-001 com a nova origem explícita, preservando os 38 IDs. Atualizados AGENTS.md, READMEs, auditoria e plano de migração para refletir a decisão mais recente sem alterar as fontes originais.
- Criado START.md com sequência recomendada: ambiente reproduzível, modelo mínimo, fluxo comercial de teste, SEO/desempenho e ampliação operacional. Separado o início da aplicação nova das dependências de migração e gateway real.
- Consultada documentação oficial de WordPress, WooCommerce e Next.js; referências junto às recomendações. Esta atualização é documental: não instalou WordPress/WooCommerce nem criou integração, hospedagem ou cobrança.

## 2026-10-19 — Versão 0.2

Origem: resposta do responsável indicando `C:\Users\User\Desktop\katukina` como possível localização do legado e informando que não o teria por ora caso não fosse encontrado ali. Autor da inspeção e atualização: Codex.

- Inspecionado o diretório indicado somente para leitura. Inventariados 26 arquivos fora de dependências/build/caches, incluindo ocultos/ignorados; lidos README/package.json e verificados trechos relevantes de código/scripts.
- Confirmado outro protótipo de frontend Next.js, com catálogo estático e sacola/favoritos no navegador. Não encontrados código PHP, dump/banco, backup compactado ou documentação do gateway no escopo pesquisado.
- Atualizados AUDIT.md, MIGRATION.md e o índice. Q-01 e Q-02 continuam pendentes; registrada a indisponibilidade atual do legado informada pelo responsável. Sem mudança de requisito ou aprovação dos ADRs.
- Nenhum arquivo do diretório adicional foi alterado. Não houve mudança de aplicação nem necessidade de repetir testes de código nesta atualização documental.

## 2026-10-19 — Versão 0.1

Autor: Codex, execução técnica do pedido de leitura e aplicação dos arquivos fornecidos. Não há registro de aprovação de stack final ou de operação em produção.

- Lidos integralmente KATUKINA_SKILL.md, KATUKINA_MASTER_PROMPT.md e os sete arquivos de skill.zip. Confirmada identidade binária entre os documentos avulsos e suas versões no pacote.
- Preservadas nove cópias de arquivos em `skills/katukina-architecture/` e `docs/katukina/sources/`, com manifesto SHA-256; o ZIP original permaneceu em Downloads.
- Criado AGENTS.md para aplicar as diretrizes no contexto deste repositório; README passa a apontar para o discovery. Nenhuma instalação global da skill foi realizada.
- Inspecionados código da vitrine, importador/dashboard e dois exports XLSX; registrados achados e limitações em AUDIT.md.
- Criado auditor somente de leitura, sem dependências externas, com relatório estrutural/agregado. Encontradas 4.777 linhas, 4.769 IDs distintos, oito IDs repetidos e 26 células numéricas incompatíveis. Esquemas de 127 e 131 colunas; ENGINE CURRENCY sem código identificado.
- Criados 38 requisitos rastreáveis, cinco ADRs propostos, modelo lógico, contratos iniciais e plano de migração com dez dependências identificadas. Preservados os 13 estados do levantamento; transições não foram inventadas.
- Validações executadas: cinco testes unitários do auditor aprovados, auditoria dos XLSX concluída e `npm.cmd run typecheck` aprovado. Verificados os hashes das nove fontes incorporadas e das duas planilhas, 30 links locais, IDs únicos dos 38 requisitos, os 13 estados e as referências às dez dependências. `git diff --check` passou para a alteração rastreada; os nove novos arquivos de autoria técnica também passaram na conferência de espaços finais e término de linha.
- Sem alteração no código da vitrine/dashboard, banco, planilhas ou configuração de produção; sem commit, push, deploy ou envio de mensagens externas.

## Alterações futuras

Adicionar data, autor, origem/evidência, IDs de requisitos/ADRs afetados, conflito, impacto e resultado dos testes apropriados. Atualizar o estado de uma decisão apenas quando houver decisão real identificável; preservar as fontes originais.
