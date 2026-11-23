# Auditoria de espaçamentos e raios da vitrine · 23/11/2026

## Correções implementadas e verificadas em 23/11

| Ajuste | Resultado medido na vitrine local |
| --- | --- |
| Título de formulário | De 42 para **18 px** até o primeiro campo ou texto em conta, entrega e inscrição. O checkout com item também mede 18 px. Na ficha de produto, o aviso de estoque usa 12 px dentro do painel. |
| Inscrição por e-mail | Campo e botão medem **280 px** em tela de 320 px, **350 px** em 390 px e **440 px** em 768, 1024 e 1440 px. O aviso de estoque mantém largura própria. |
| Campos e seletores | **8 px** de raio nos campos comerciais conferidos, inclusive país, e-mail, cupom e endereço. |
| Abertura da loja | **24 px** entre a trilha e a introdução em `/shop` e na busca por “incense”. A coleção Sacred Incense mede 12 px. |

Playwright em Chromium verificou **45 combinações** de nove páginas ou estados e cinco larguras (320, 390, 768, 1024 e 1440 px), todas sem overflow horizontal no documento. A conta estava anônima. A ficha abriu a variação sem estoque 776 de Palo Santo beads. Carrinho e checkout receberam um item simulado no navegador. Os dois testes de inicialização e revisão de endereço do checkout passaram, assim como o typecheck e o build de produção com Webpack. O detector de layout retornou zero alertas.

[Comparação visual da entrega e da inscrição antes e depois](evidence/spacing-radius-formularios-antes-depois.webp)

## Diagnóstico anterior às correções

**Confirmado localmente.** As 13 seções visíveis na home mantêm o intervalo previsto nas cinco larguras. Os cards de produto também mantêm a mesma sequência de raios na home, loja, coleção e relacionados. A prioridade está nos formulários. Há espaço duplicado após títulos, campos com acabamento diferente do padrão documentado e um formulário de inscrição que ocupa toda a largura da vitrine no desktop.

## Medidas da home

Valores em pixels CSS, arredondados. A margem lateral foi medida da borda da janela à borda externa de um bloco `.mh-wrap`. O intervalo é a distância entre bordas de duas seções consecutivas. A soma considera as 12 transições da home com o conteúdo disponível na sessão.

| Largura | Margem lateral por lado | Duas laterais | Intervalo entre seções | Soma dos 12 intervalos |
| ---: | ---: | ---: | ---: | ---: |
| 320 | 20 | 40 | 32 | 384 |
| 390 | 20 | 40 | 32 | 384 |
| 768 | 26,1 | 52,2 | 32 | 384 |
| 1024 | 34,8 | 69,6 | 34,8 | ≈ 418 |
| 1440 | 49 | 98 | 48 | 576 |

**Distância até o conteúdo.** Na home, a faixa Conexão Ancestral acrescenta 40 px internos por borda vertical em 390 px e 72 px em 1440 px. Da borda inferior da seção anterior ao início da grade interna, são **72 px no celular** e **120 px no desktop**. A cor de fundo começa logo após o intervalo externo de 32 ou 48 px. Essa distinção explica por que a faixa parece mais espaçosa mesmo seguindo a grade da home. A faixa de serviços termina a 20 e 28,8 px do rodapé, respectivamente, conforme a composição registrada no projeto.

## Prioridades propostas

| Prioridade | Evidência confirmada | Efeito e ajuste proposto |
| --- | --- | --- |
| P2 · Títulos de formulário | Em conta, entrega e inscrição, há **42 px** entre o título do formulário e o próximo elemento. A margem inferior de 24 px do título se soma ao `gap` de 18 px do formulário flexível. Na entrega e na inscrição, essa distância supera até o intervalo de 32 px entre grandes seções da home no celular. | O primeiro campo ou texto de orientação fica separado do seu título. Deixar o formulário controlar essa distância. Testar **18 px** e conferir as três telas, incluindo o formulário de aviso de estoque que compartilha o componente. |
| P2 · Largura da inscrição | Em `/subscribe`, o campo de e-mail e o botão têm **1.342 px** de largura a 1440 px. Na conta, o campo de e-mail ocupa **440 px** na mesma janela. A 390 px, ambos ocupam **350 px**. | Para uma tarefa de um campo, a confirmação fica excessivamente larga. Experimentar o limite de 440 px já usado na conta, aplicado apenas à inscrição independente. Preservar a largura disponível no celular. |
| P3 · Raio dos campos | Busca do cabeçalho, ordenação do catálogo e quantidade no produto usam **8 px**. Campos de texto de conta, inscrição, entrega, cupom do carrinho e checkout usam **0 px**. Na entrega, o seletor de país também tem 0 px. | A forma do controle muda durante a mesma jornada. Aplicar o token `--radius-field` aos campos de texto e seleção comerciais. Preservar o tratamento específico de checkboxes e rádios. |
| P3 · Abertura do catálogo | Na loja, a distância entre a trilha de navegação e o início da introdução é **45 px** em 390 e 1440 px. Na coleção Sacred Incense é **12 px**. Na loja, as margens colapsam e o intervalo efetivo é 45 px. | Em 390 px, a trilha fica mais distante da própria introdução do que a introdução dos resultados (32 px). Testar 16–24 px na abertura da loja e comparar com a coleção, que apresenta o título diretamente. |

As prioridades são de hierarquia visual e consistência. Nenhum dos quatro achados demonstrou bloqueio de compra. Os valores sugeridos dependem de aprovação visual.

[Recortes dos campos e controles da entrega, loja e inscrição](evidence/spacing-radius-2026-11-23.webp)

## Referências de padding e raio por superfície

| Superfície | Confirmado no navegador |
| --- | --- |
| Loja, detalhe de coleção, índice de coleções e About | O conteúdo principal começa a 20 px da lateral em 390 px e a aproximadamente 49 px em 1440 px. Na coleção há 20 px entre a campanha e o trilho, e 24 px entre o trilho e a área de resultados nas duas larguras. |
| Produto | Entre o fim das informações e o início dos relacionados há 32 px em 390 px e 48 px em 1440 px. A navegação interna tem 20 px de padding vertical por lado. |
| Cards de produto | Na home, loja, coleção e relacionados, o contorno externo tem raio de 10 px, a foto 8 px e o CTA 8 px. O mesmo acabamento atravessa as quatro superfícies. |
| Campanhas e faixa institucional | Os três cards de campanha da home têm raio de 9 px e padding de 20 px em 390 px e 28,8 px em 1440 px. O banner “Make room for a little ritual” usa raio de 12 px. Na Conexão Ancestral, o CTA usa 16 px e as fotos usam 14 px no celular e 21,6 px no desktop. A seção tem direção visual própria registrada no projeto. |
| Carrinho, checkout e entrega | O painel de resumo usa raio externo de 10 px e padding de 18 px em 320/390, 22 px em 768 e 28 px em 1024/1440. No carrinho e checkout com item, o bloco de totais interno tem raio de 12 px. O guia associa o resumo de compra ao raio de painel de 12 px. Vale explicitar no guia a qual camada essa referência se aplica. |
| Journal, páginas editoriais e políticas | No índice do Journal, o card tem raio de 10 px e padding de 24 px a 390 px. No artigo curto, restam 358 px até o rodapé em 390 × 900. A altura mínima de 65vh do conteúdo contribui para esse espaço. Em privacidade há 12 px entre subtítulo e parágrafo. |
| Regras de design | O guia registra 32 px para seção. A implementação usa `clamp(32px, 3.4vw, 48px)`. Registrar a faixa fluida deixaria a especificação coerente com a vitrine e com a auditoria de 18/11. |

## Cobertura e verificação

Chromium local via Playwright com janelas de 320, 390, 768, 1024 e 1440 px de largura por 900 px de altura. Foram lidos estilos computados e retângulos de layout após o carregamento das fontes. Capturas de 390 e 1440 px complementaram as medidas. O alcance é o frontend público.

- **17 rotas, 85 combinações de rota e largura.** Home, loja, índice de coleções, coleção Sacred Incense, produto Palo Santo beads, Journal, artigo Hello world, página editorial Sample Page, About, entrega, inscrição, privacidade, cookies, carrinho vazio, checkout vazio, conta anônima e página 404.
- **10 verificações adicionais.** Carrinho e checkout com um item, nas mesmas cinco larguras. O navegador recebeu dados simulados no formato da fixture do projeto. Nenhum pedido foi enviado.
- **Resultado de geometria.** Todas as 95 combinações mantiveram a largura do documento dentro da janela. Os trilhos têm rolagem interna. O detector estático `detect --json --scope layout app components` retornou zero alertas. Os achados da tabela vieram do layout renderizado. `npm.cmd run typecheck` passou.
- **Limites.** Conta autenticada, overlays abertos, zoom, outros navegadores e dispositivo físico ficam fora destas medidas. A auditoria avalia padding, intervalos e raios. Uma nota global de acessibilidade, desempenho ou qualidade visual exigiria verificações adicionais.

## Fontes e continuidade

Base de cálculo em [globals.css](../../app/globals.css), [layout-refinement.css](../../app/layout-refinement.css), [modern-storefront.css](../../app/modern-storefront.css), [modern-home.css](../../app/modern-home.css) e [CSS da Conexão Ancestral](../../components/home/conexao-ancestral.module.css). Referências do projeto no [guia visual](../../DESIGN.md), na [direção da seção institucional](CONEXAO-ANCESTRAL.md) e na [auditoria de 18/11](LAYOUT-2026-11-18.md).

Ordem proposta para uma rodada de implementação: `$impeccable layout` nos formulários e na abertura da loja, seguida de `$impeccable polish` nos raios dos controles e de uma nova medição nos mesmos estados.
