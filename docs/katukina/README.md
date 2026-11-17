# Discovery Katukina

CTA do banner ritual em 17/11/2026 ? **CONFIRMADO por Danilo:** descer o botao no mobile. Acao alinhada na base do bloco, com recuo inferior de 32 px e altura minima do banner preservada. Artes desktop e mobile fornecidas na pasta e detectadas localmente.

Banner ritual em 17/11/2026 ? **CONFIRMADO por Danilo:** melhorar o layout e deixar a arte de fundo para ele fornecer. Mensagem e CTA agrupados ? esquerda, respiro ampliado e produto avulso removido para receber a composi??o. Fundo liso enquanto os arquivos n?o existem. Pasta `public/images/home/ritual-banner/`: `ritual-incense-desktop.webp` (2400 ? 560 px) e `ritual-incense-mobile.webp` opcional (960 ? 960 px). **A VALIDAR:** arte e contraste ap?s fornecimento. Valida??o executada: typecheck aprovado; Playwright em 1440, 768, 390 e 320 px sem overflow, destino do link preservado e capturas revisadas; detector de layout sem achados.

Faixa superior neutra em 17/11/2026 — **CONFIRMADO por Danilo:** remover o verde da faixa “Nature. Culture. Connection.”. Fundo em branco quente, texto cinza e seletor de país com texto escuro; foco adaptado à superfície clara. Faixa de navegação verde com pattern preservada.

Faixa de navegação em 17/11/2026 — **CONFIRMADO por Danilo:** aplicar verde folha e pattern à faixa de categorias do cabeçalho. Reutilizado `original-background.jpg` em camada tonal; links, ícones, contorno do seletor e foco em branco quente, com estados hover/aberto ajustados para leitura sobre verde.

Azul de Sananga em 17/11/2026 — **CONFIRMADO por Danilo:** trocar novamente a palavra “Sananga” do terceiro hero para azul. Restaurado `#80ADDE`, mantendo itálico e composição em desktop/mobile. Substitui a reversão para verde registrada anteriormente.

Enquadramento dos cards mobile em 17/11/2026 — **CONFIRMADO por Danilo:** deslocar para a esquerda as imagens de Rapé e Kuripe & Tepi somente no mobile. Após pedido de ampliar o deslocamento, posição horizontal do fundo em 90% nos dois primeiros cards até 540 px, preservando preenchimento `cover`, textos e botões.

Acabamento das categorias em 17/11/2026 — **CONFIRMADO por Danilo:** refinar sutilmente a seção “Shop by category”. Aplicadas sombras suaves aos cards, fotos circulares e setas, traçado interno discreto e realce no hover, preservando verde, grafismo, conteúdo e navegação. Validação local: `npm.cmd run typecheck` passou; Playwright em 1600, 768 e 390 px sem overflow da página, 37 cards, avanço do carrossel e foco visível conferidos. Capturas desktop, tablet e mobile revisadas.

Controles centralizados no mobile em 17/11/2026 — **CONFIRMADO por Danilo:** centralizar horizontalmente os controles dos três banners abaixo do CTA em telas de até 640 px. Alinhamento desktop preservado.

Fundo integral do hero mobile em 17/11/2026 — **CONFIRMADO por Danilo:** a imagem deve preencher toda a largura e altura, inclusive atrás do CTA e dos controles. Restaurado `cover` centralizado, removida a faixa inferior separada e mantida a altura `max(640px, 125vw)`. Danilo ajustará a posição dos produtos na arte ao espaço disponível. Esta decisão substitui o encaixe `contain` e a reserva inferior na área da imagem.

Encaixe das artes mobile em 17/11/2026 — **CONFIRMADO por Danilo:** corrigir o corte das artes 1080 × 1350 px. Até 640 px, usar `object-fit: contain`, centralizado na base da área de imagem. Arte integral e proporção preservadas, sem aumentar a altura do hero; eventuais sobras mostram o fundo do banner. Desktop mantém `cover`.

Destino mobile revisado em 17/11/2026 ? **CONFIRMADO por Danilo:** mover as artes mobile para `public/images/home/hero-slider/mobile/`, preservando os nomes `banner-01-mobile.webp`, `banner-02-mobile.webp` e `banner-03-mobile.webp` e o tamanho 1080 ? 1350 px. Movidos os arquivos 01 e 03 existentes; 02 ainda pendente. Vers?o diferente de 01 j? presente no destino preservada em `.local-backups/hero-mobile-move-2026-11-17/` antes da movimenta??o. Esta decis?o substitui o destino junto das imagens desktop.

Correção da altura mobile do hero em 17/11/2026 — **CONFIRMADO por Danilo:** não aumentar a altura vertical. Restaurado `max(640px, 125vw)`; CTA e controles acomodados dentro da altura original, com textos centralizados e CTA abaixo da área da imagem. Substitui o acréscimo de 120 px registrado anteriormente.

Composição mobile do hero em 17/11/2026 — **CONFIRMADO por Danilo:** centralizar títulos e descrições dos três banners e colocar o CTA centralizado abaixo da imagem. Até 640 px, a área da arte mantém sua altura e ganha faixa inferior de 120 px para CTA e controles, sem alterar a composição desktop.

Links auxiliares do hero em 17/11/2026 — **CONFIRMADO por Danilo:** remover os textos “Sacred incense” e “Herbal teas” e seus ícones abaixo do CTA do banner 01.

Controles compactos do hero em 17/11/2026 — **CONFIRMADO por Danilo:** reduzir fortemente o bloco. Botões de 24 × 24 px, ícones de 12 px e indicadores de 5 px; bloco com aproximadamente 154 × 28 px quando os seis controles estão visíveis. Alinhamento esquerdo preservado.

Imagens mobile do hero em 17/11/2026 ? **CONFIRMADO por Danilo:** artes mobile pr?prias, salvas na mesma pasta das desktop. Destino `public/images/home/hero-slider/desktop/`; nomes `banner-01-mobile.webp`, `banner-02-mobile.webp` e `banner-03-mobile.webp`; 1080 ? 1350 px, WebP sRGB. Desktop mant?m nomes e 2400 ? 900 px. Mobile usado at? 640 px; nomes antigos na pasta `mobile/` preservados como alternativa.

Controles do hero em 17/11/2026 — **CONFIRMADO por Danilo:** alinhar o bloco de navegação à esquerda, na mesma borda do texto do banner. Aplicado o mesmo recuo responsivo do contêiner `.mh-wrap`, preservando a posição inferior e os controles existentes.

Cor do título do banner 03 em 17/11/2026 — **CONFIRMADO por Danilo:** aplicação de `#80adde` à palavra “Sananga” desfeita a pedido do responsável; restaurada a cor anterior `var(--green)`.

Texto do terceiro hero em 17/11/2026 — **CONFIRMADO por Danilo:** título “The Spirit of Sananga”, com Sananga em itálico; subtítulo “Rooted in Amazonian tradition. Discover our pure Katukina and Matses extracts, crafted for clarity, focus, and deep connection.”; botão “Discover the Collection”. Redação fornecida pelo responsável, substituindo a anterior; destino `/collections/sananga` preservado.

Revisão do terceiro hero em 17/11/2026 — **CONFIRMADO por Danilo:** substituir Kuripes & Tepis por Sananga. Implementados título “The essence of Sananga”, descrição e CTA “Explore Sananga” para `/collections/sananga`; categoria confirmada na API local WooCommerce (slug `sananga`). Mantido fundo liso enquanto aguarda a arte `banner-03.webp`. Esta decisão substitui o tema anterior registrado abaixo.

Terceiro hero em 17/11/2026 — **CONFIRMADO por Danilo:** completar os três banners com Kuripes e Tepis; arte será produzida por ele. Conteúdo e CTA para `/collections/kuripe-and-tepi` implementados. O terceiro banner já participa da rotação sobre fundo liso enquanto aguarda `banner-03.webp`; salvar a arte nas pastas desktop/mobile do hero a integra automaticamente no desenvolvimento local. Dimensões e composição no [guia dos banners](../../public/images/home/hero-slider/LEIA-ME.md).

Revisão da cor do banner 02 em 17/11/2026 — **CONFIRMADO por Danilo:** substituir `#f60259` por `#582f12` somente na palavra “Rapé” do título “Authentic Brazilian Rapé”.

Cor do título do banner 02 em 17/11/2026 — **CONFIRMADO por Danilo:** aplicar `#f60259` somente à palavra “Rapé” em “Authentic Brazilian Rapé”, substituindo `#F2AC59`.

Cards de produtos em 16/11/2026 — **CONFIRMADO por Danilo:** remover a lupa sobre as imagens. Links das fotografias e botões de acesso ao produto preservados.

Alinhamento dos cards em 16/11/2026 — **CONFIRMADO por Danilo:** equilibrar o respiro acima e abaixo do conteúdo e destacar títulos sobre as contagens. Padding vertical de 28 px no desktop e 24 px no celular; espaço de 16 px após a imagem, títulos em 16 px/peso 700 com área mínima de duas linhas, contagens em 12 px/peso 400.

Pattern nos cards em 16/11/2026 — **CONFIRMADO por Danilo:** reaplicar o grafismo padrão apenas dentro dos cards de categorias, sobre o verde folha. Reutilizado `public/images/original-background.jpg`, com mistura tonal escura e fotos/textos acima da camada decorativa. Esta exceção substitui a orientação de fundo liso somente nesses cards.

Carrossel de categorias em 16/11/2026 — **CONFIRMADO por Danilo:** incluir as 37 categorias da captura fornecida, excluindo Uncategorized. As oito categorias em destaque permanecem primeiro; demais categorias seguem no carrossel horizontal com fotos do catálogo, contagens reais, setas, arraste e teclado. Verde folha e círculos brancos preservados.

Cards de categorias em 16/11/2026 — **CONFIRMADO por Danilo:** destacar a seção com fundo verde folha oficial (#526B35), títulos e contagens em branco quente, mantendo círculos brancos para as fotografias. Hover escurece o verde e foco de teclado permanece visível.

Imagens das categorias em 16/11/2026 — **CONFIRMADO por Danilo:** eliminar o recorte retangular aparente nas fotos de produtos. Fundo circular ajustado para branco puro, correspondente ao fundo das fotografias; encaixe integral (`contain`) e respiro preservados.

Espaçamento da navegação em 16/11/2026 — **CONFIRMADO por Danilo:** separar um pouco mais as categorias, mantendo o conjunto centralizado. Gap desktop ampliado de 18 para 30 px; regra compacta preservada para telas menores.

Logotipo em 16/11/2026 — **CONFIRMADO por Danilo:** ampliar um pouco no cabeçalho. Largura desktop ajustada de 205 para 230 px, mantendo proporções e tamanhos móveis.

Navegação em 16/11/2026 — **CONFIRMADO por Danilo:** aproximar “All categories” dos links de categorias e centralizar o conjunto na faixa branca do cabeçalho.

Transição do overlay em 16/11/2026 — **CONFIRMADO por Danilo:** final mais sutil nos três cards. Mantida largura de 70%, com redução gradual da opacidade em etapas até zero, preservando a maior intensidade à esquerda.

Overlay dos três cards em 16/11/2026 — **CONFIRMADO por Danilo:** reduzir sua largura. Camada limitada aos 70% à esquerda, com transição para transparente; 30% à direita mostram a arte sem escurecimento.

Busca do cabeçalho em 16/11/2026 — **CONFIRMADO por Danilo:** reduzir a largura da barra. Limite desktop definido em 650 px; no celular, preservada a largura disponível da linha.

Descrições nos cards em 16/11/2026 — **CONFIRMADO por Danilo:** pequenos textos abaixo dos títulos Rapé, Kuripe & Tepi e Herbal Teas. Redação em inglês, mantendo links e fundos WebP. Na conferência inicial, `01-rape.webp` já estava na pasta; os fundos 02 e 03 ainda não haviam sido salvos.

Cabeçalho em 16/11/2026 — **CONFIRMADO por Danilo:** removido o bloco editorial “Get inspired / The Katukina journal” com o ícone de livro, liberando espaço para a busca. Link Journal da navegação preservado.

Título do banner 02 em 16/11/2026 — **FORNECIDO por Danilo:** “Authentic Brazilian Rapé”, mantendo “Rapé” em `#F2AC59`. Subtítulo e CTA anteriores preservados.

Copy final do banner 02 em 16/11/2026 — **FORNECIDA E CONFIRMADA por Danilo:** título “Authentic Rapé”; subtítulo “Grounding blends sourced from the heart of the Amazon. Browse our signature varieties and find the right size for your journey.”; CTA “Shop Blends” para `/collections/rape`. Substitui a redação anterior de Rapé. Texto de origem e posicionamento fornecido pelo responsável, não resultado de verificação independente.

Texto do banner 02 em 16/11/2026 — **CONFIRMADO por Danilo:** conteúdo específico sobre Rapé. Título “Discover Rapé.”, descrição da coleção e apresentações disponíveis, CTA “Explore Rapé” para `/collections/rape`. Conteúdo alterna junto com a imagem 02; demais banners preservam o texto anterior.

Título do hero em 16/11/2026 — Danilo solicitou desfazer a troca para “Sacred Incense”. Restaurado “Find your natural rhythm.”, mantendo “natural rhythm.” em `#F4AC30`.

Correção de pasta em 16/11/2026 — nova troca de imagem havia sido salva em `home/banners/sacred-incense.webp`, fora da pasta observada. Arte atual copiada para `home/hero-slider/desktop/banner-01.webp`. Pastas sem uso `hero-01`, `hero-02` e `hero-03` arquivadas fora de `public`, em `artifacts/unused-hero-folders-20261116-153804`. Imagens do visual antigo transferidas para `public/images/legacy-storefront/banners/`, com referências ativas e snapshots atualizados. Windows bloqueou a remoção da pasta antiga `home/banners`; seus arquivos de imagem foram retirados e foi deixado aviso apontando a pasta correta.

Atualização imediata dos heros em 16/11/2026 — **CONFIRMADO por Danilo:** detectar imagens salvas na pasta e atualizar sem recarregar. Implementado observador das pastas desktop/mobile com eventos enviados ao navegador no desenvolvimento local, agrupando gravações por 120 ms; polling de 2 s mantido como recuperação.

Atualização de imagens e remoção do overlay em 16/11/2026 — **CONFIRMADO por Danilo:** integrar as novas artes e retirar a camada clara do hero. Nova arte encontrada em `public/images/home/banners/sacred-incense.webp` copiada sem alteração para `hero-slider/desktop/banner-01.webp`, preservando o original. Hero local verifica os arquivos da pasta `hero-slider` a cada 2 segundos; alterações em outras pastas não são sincronizadas automaticamente. Textos e botão mantidos, sem overlay.

Hero full com três banners em 16/11/2026 — **CONFIRMADO por Danilo:** fundos rotativos, mantendo título, descrição e botão atuais. Artes futuras sempre WebP, com variantes desktop/celular. Pastas, nomes, dimensões e funcionamento em [HERO-SLIDER-2026-11-16.md](HERO-SLIDER-2026-11-16.md). Substitui a foto avulsa ampliada do incenso no hero.

Cards abaixo do hero em 16/11/2026 — **CONFIRMADO por Danilo:** três cards de categoria, na ordem Rapé, Kuripe & Tepi e Herbal Teas, preparados para fundos que ele produzirá. Novas imagens sempre WebP, com pastas, nomes e dimensões documentados. Arquivos: [guia dos fundos 1600 × 900 px](../../public/images/home/promotion-cards/LEIA-ME.md). Sem imagens, exibir fundo liso; preços e fotos avulsas removidos somente desses três cards. Validação: typecheck e teste Playwright da home aprovados; nomes/links conferidos, sem overflow em 1440/768/390 px; carregamento de WebP após recarregar confirmado com arquivo temporário removido ao final. Capturas desktop/mobile inspecionadas.

Faixa de navegação em 16/11/2026 — **CONFIRMADO por Danilo:** fundo branco puro (`#FFFFFF`) na faixa de categorias/menu do visual moderno, conforme captura fornecida.

Ampliação do incenso no hero em 16/11/2026 — **CONFIRMADO por Danilo:** aumentar a imagem principal. Área visual ampliada, fotografia ocupando toda a largura disponível da coluna, com proporção preservada e altura responsiva no celular.

Simplificação do hero em 16/11/2026 — **CONFIRMADO por Danilo:** retirar do hero a foto complementar de Kuripe & Tepi e a legenda com nome/preço do Palo Santo, mantendo somente a imagem do incenso na área visual. Demais seções preservadas.

Remoção do pattern em 2026-11-16 — **CONFIRMADO por Danilo:** fundos lisos no visual moderno, incluindo navegação, hero, banners e rodapé. Paleta oficial mantida; arte original e versão antiga preservadas.

Paleta oficial e identidade xamânica em 2026-11-16 — **CONFIRMADO por Danilo:** manter a estrutura moderna e aplicar as seis cores oficiais em toda a vitrine. Grafismo original reutilizado; visual antigo preservado. Direção vigente em [PALETTE.md](PALETTE.md) e implementação/validação em [Modern Storefront](MODERN-STOREFRONT-2026-11-16.md).

Alternância de visual em 2026-11-16 — **CONFIRMADO por Danilo:** preservar as versões antiga e nova para comparação. Comandos e limites em [Alternar o visual](../../visual-versions/README.md); validação da reversão em [Modern Storefront](MODERN-STOREFRONT-2026-11-16.md). O novo permanece ativo.

**Entradas atuais:** [guia geral do projeto](../PROJECT_GUIDE.md), [mapa das pastas](../PROJECT_STRUCTURE.md), [inventário de todos os documentos](../PROJECT_INVENTORY.md) e [produção dos banners 4:3](BANNERS.md). As entregas datadas abaixo preservam o histórico; não substituem o guia vigente dos banners.

Versão 0.9 · 2026-10-19 · Elaboração técnica: Codex.

O projeto local contém Next.js e WordPress + WooCommerce em Docker. Site e painel usam http://localhost:3001/ e `/wp-admin/`. Após correção explícita do responsável, a administração usa as telas nativas: Products/Variations, Orders, Users, Settings e Analytics. O painel paralelo foi removido; lotes, fracionamento e campos operacionais ampliam essas áreas. Catálogo, conteúdo, carrinho, cotação, conta e checkout fictício funcionam pela API. A [cobertura vigente e ADR-009](OPERATIONS.md) registra pendências reais: integrações comerciais, regras fiscais, outras lojas e migração do legado não estão concluídas.

## Entregas

Redesign Zilly Home 05 em 2026-11-16 — **CONFIRMADO por Danilo:** substituir toda a estética, inclusive cores, usando as seções das sete capturas fornecidas e os produtos existentes. Implementadas nova home comercial, paleta esmeralda/amarela, campanhas coloridas, categorias fotográficas, vitrines variadas, jornal e chrome compartilhado. Preservados catálogo, apresentações, preços, busca e carrinho. Escopo, limites e validação em [MODERN-STOREFRONT-2026-11-16.md](MODERN-STOREFRONT-2026-11-16.md). Substitui a direção visual dos ajustes anteriores abaixo.

Cards de produtos em 2026-11-16 — pedido de Danilo para modernizar os cards com mais informações e CTA. Home com imagem quadrada, painel sobreposto, categoria, SKU, opções, descrição quando disponível, preço, estoque e link de ação permanente. Componente unificado também em From the collection. Escopo e validações em [PRODUCT-CARDS-2026-11-16.md](PRODUCT-CARDS-2026-11-16.md).

Círculos claros em 2026-11-16 — **CONFIRMADO por Danilo:** usar nos círculos o fundo das pílulas e ajustar ícones/textos. Aplicado `--support-soft` aos círculos, com ícones, legendas e contorno em verde folha; pattern suavizado para 12%, linha branca e hover preservados. Typecheck aprovado; Playwright confirmou correspondência exata dos oito fundos com as pílulas, cores verdes e ausência de overflow em 1780/390 px. Capturas `artifacts/category-light-circles-*.png` inspecionadas. Atualiza a combinação anterior em [PALETTE.md](PALETTE.md).

Pílulas de coleções em 2026-11-16 — **CONFIRMADO por Danilo:** igualar visual, cores e traçados de Shop by collection às pílulas de categorias acima. Ambos compartilham regras CSS de fundo `--support-soft`, texto/contorno verde folha, linha branca interna, tipografia, dimensões, espaçamento e hover/foco. Coleção selecionada mantém preenchimento verde e texto branco para indicar o painel ativo. Respeitado movimento reduzido e preservado funcionamento das abas. Typecheck aprovado; Playwright comparou estilos computados em 1780/390 px, seleção de abas, movimento reduzido e ausência de overflow. Capturas desktop/mobile `artifacts/collection-pills-*.png` inspecionadas.

Correção do contorno no hover em 2026-11-16 — **CONFIRMADO por Danilo:** corrigir o traço superior cortado e manter o destaque verde folha. Causa observada: elevação de 4 px ultrapassava o topo do scrollport dos carrosséis. Adicionada folga vertical interna com compensação de margens aos trilhos de produtos e à grade de coleções da home; mesmo ajuste no carrossel de produtos vistos recentemente. Preservados alinhamento, rolagem, hover e borda em `--green` (alias de `--leaf`, `#526B35`). Typecheck aprovado; Playwright verificou primeiro/último card dos trilhos e coleções em 1780/390 px, cor verde, topo dentro do scrollport, ausência de overflow da página e movimento reduzido. Captura desktop `artifacts/product-hover-border-fixed-desktop.png` inspecionada.

Faixa de navegação em 2026-11-16 — **CONFIRMADO por Danilo:** aplicar verde folha à faixa das categorias do header. Fundo `--leaf`, textos/ícones brancos e pattern original sutil preservado; estados interativos claros com texto verde. Typecheck aprovado; Playwright confirmou cores, hover, abertura e Escape do menu All categories e ausência de overflow móvel. Captura `artifacts/header-leaf-green.png` inspecionada. Detalhes em [PALETTE.md](PALETTE.md).

Efeito nos cards de produtos em 2026-11-16 — **CONFIRMADO por Danilo:** adicionar feedback ao passar o mouse sobre os cards mostrados na home. Implementados elevação de 4 px, contorno verde, sombra suave e zoom de 3,5% na imagem, também nos cards compartilhados do catálogo. Destaque de contorno/sombra disponível ao foco interno por teclado; movimento e zoom desativados com `prefers-reduced-motion`. Efeito de elevação restrito a ponteiro preciso com hover. Typecheck aprovado; Playwright confirmou hover/zoom e movimento reduzido na home e em `/shop`, além de ausência de overflow em 390 px. Captura desktop `artifacts/product-hover-desktop.png` inspecionada. Conteúdo, preços e links preservados.

Harmonização das categorias em 2026-11-16 — **CONFIRMADO por Danilo:** ajustar a seção à paleta do site. Implementado verde folha nos círculos com ícones brancos e contorno verde escurecido; pílulas claras esverdeadas com texto/contorno verde, preenchimento verde e texto branco no hover/foco. Escolha visual de implementação descrita em [PALETTE.md](PALETTE.md). Typecheck aprovado; Playwright confirmou oito ícones, 18 pílulas, hover, foco por teclado e ausência de overflow em 1440/390 px. Contrastes 5,98:1 e 4,87:1; capturas desktop/mobile inspecionadas. Substitui as cores cinza/carvão anteriores, preservando estrutura e navegação.

Pílulas cinza/carvão em 2026-11-16 — **CONFIRMADO por Danilo:** ajustar as pílulas para acompanhar os círculos. Fundo em `#595957`, contorno em `#292C27` e texto branco; linhas internas e hover preservados. Typecheck aprovado; Playwright confirmou as cores nas 18 pílulas. Captura desktop inspecionada.

Círculos cinza e carvão em 2026-11-16 — **CONFIRMADO por Danilo:** fundo dos círculos em `#595957` e contorno externo em carvão `#292C27`, usando `--medium-gray` e `--charcoal`. Pílulas mantidas na configuração anterior. Typecheck aprovado; Playwright confirmou as cores nos oito círculos e preservação das cores das pílulas. Captura desktop inspecionada.

Conjunto de categorias em 2026-11-16 — **CONFIRMADO por Danilo:** fundo dos círculos em `#617871`, contorno em `#203931` e pílulas acompanhando essas cores. Ambos usam os mesmos tokens locais da seção; textos das pílulas e ícones brancos, linhas brancas internas, pattern dos círculos e hover preservados. Typecheck aprovado; Playwright confirmou as cores nos oito círculos e 18 pílulas, texto branco, manutenção da cor no hover e ausência de overflow em 1440/390 px. Captura desktop inspecionada.

Contorno externo dos círculos em 2026-11-16 — **CONFIRMADO por Danilo:** usar `#88B8A8` no traçado externo, mantendo 4 px e o restante da composição. Typecheck aprovado; Playwright confirmou a cor nos oito círculos. Captura desktop inspecionada.

Círculos escuros com ícones em 2026-11-16 — **CONFIRMADO por Danilo:** voltar aos ícones e usar `#203931` no fundo dos círculos. As oito fotografias ficam desativadas no manifesto, sem apagar os arquivos; os ícones do pacote voltam a aparecer em branco. Preservados contorno verde, linha branca interna, pattern sutil, hover e pílulas claras. Typecheck aprovado; Playwright confirmou oito ícones, fundo correto, nenhuma fotografia ativa e ausência de overflow em 1440/390 px. Captura desktop inspecionada.

Fotos nas demais categorias em 2026-11-16 — **CONFIRMADO por Danilo:** está substituindo também as outras categorias. Habilitada a leitura de fotos para os oito círculos, mantendo ícone/pattern enquanto não houver fotografia ou em caso de erro. As fotos seguem a versão mais recente por categoria, com atualização automática local a cada segundo. Na conferência, Rapé, Sacred Incense, Beauty & Body e Herbal Teas carregaram fotografias; quatro categorias mantinham ícones. Typecheck aprovado; Playwright confirmou polling, oito categorias e ausência de overflow em 1440/390 px. Captura desktop inspecionada. Substitui a limitação anterior de teste somente em Rapé.

Teste da foto de Rapé em 2026-11-16 — **CONFIRMADO por Danilo:** voltar a testar imagem somente no círculo de Rapé, usando a nova `public/images/home/category-circles/01-rape.webp`. Prévia habilitada explicitamente apenas para `rape`; as outras sete categorias continuam com ícones, mesmo havendo fotos históricas na pasta. Foto com recorte central, borda verde e linha branca preservadas, sem pattern sobre a fotografia. Manifesto `/api/home-category-media` mantém ícones e fotos de teste atualizados a cada segundo em desenvolvimento. Falha de carregamento, inclusive anterior à hidratação, restaura o ícone. Typecheck aprovado; Playwright confirmou foto de Rapé, sete ícones, polling, fallback de imagem e ausência de overflow em 1440/390 px. Capturas desktop/mobile inspecionadas.

Atualização do pacote de ícones em 2026-11-16 — **CONFIRMADO por Danilo:** reaplicar `icones-xamanicos-brancos.zip`, agora com SHA-256 `90338bdbb1d015e7b9c8e7522fa960eb45bd15f1d08e371f16590dfbb6672d45`. Os oito SVGs foram comparados por hash: somente `sacred-incense.svg` mudou (480 → 662 bytes). Versão anterior preservada em backup local de `artifacts/`; os oito arquivos instalados correspondem ao novo ZIP. Playwright confirmou os oito ícones carregados, nova versão de Sacred Incense usada também na máscara, ausência de erros JavaScript e de overflow em 1440/390 px. Captura desktop inspecionada; cores, contornos e pattern preservados.

Contorno e intensidade do pattern em 2026-11-16 — **CONFIRMADO por Danilo:** contorno dos círculos no mesmo verde dos ícones e pattern mais transparente. Aplicado `--green` (`#526B35`) à borda externa de 4 px dos círculos e reduzida a opacidade do pattern de 50% para 25%. Typecheck aprovado; Playwright confirmou borda igual à cor do ícone e opacidade de 25% nos oito círculos. Captura desktop inspecionada.

Pattern dentro dos círculos em 2026-11-16 — **CONFIRMADO por Danilo:** aplicar o grafismo da marca dentro de cada círculo, atrás dos ícones. Reutilizado `public/images/original-background.jpg` em camada circular própria, com escala de 360 px, tons neutros, multiplicação e opacidade de 50%; ícones e linha branca permanecem em camadas superiores. Base clara, pílulas e hover preservados. Typecheck aprovado; Playwright confirmou oito fundos circulares, camadas, passagem dos eventos do ponteiro e hover, além de ausência de overflow em 1440/390 px. Capturas finais desktop/mobile inspecionadas.

Fundo claro das categorias em 2026-11-16 — **CONFIRMADO por Danilo:** usar nos círculos e nas pílulas a mesma cor clara do fundo das fotos dos produtos. Ambos consomem `--soft`, o mesmo token de `.rh-product-photo`, com contorno em `--line`. Ícones e textos apresentados em verde para preservar legibilidade sobre o fundo claro; os SVG brancos fornecidos permanecem intactos, usados como máscara alfa. Mantidos linha branca interna, hover e detecção automática do pacote. Typecheck aprovado; Playwright confirmou correspondência exata dos fundos com os produtos, oito máscaras de ícones carregadas, contraste do texto de 5,19:1, hover e ausência de overflow em 1440/390 px ou erros JavaScript. Capturas desktop/mobile inspecionadas.

Pílulas verde folha em 2026-11-16 — **CONFIRMADO por Danilo:** estender o verde `#526B35` às pílulas, no fundo e no contorno, acompanhando os círculos. Texto das pílulas passa para branco para manter contraste; linha branca interna e hover preservados. Typecheck aprovado; Playwright confirmou as 18 pílulas, as cores no hover e ausência de overflow em 390 px. Captura desktop inspecionada.

Círculos verde folha em 2026-11-16 — **CONFIRMADO por Danilo:** fundo e contorno externo dos oito círculos passam para `#526B35`, consumindo o token aprovado `--leaf`. Mantidos ícones brancos, linha branca interna e hover. As pílulas permanecem com a configuração anterior. Playwright confirmou a cor nos oito círculos e no hover; captura desktop inspecionada.

Pacote de ícones brancos em 2026-11-16 — **CONFIRMADO por Danilo:** instalar e substituir pelo pacote fornecido `icones-xamanicos-brancos.zip` (SHA-256 `8881005d4d19e1a340e08591421de5f53644ea91e640016e4d96a34542ba3bfb`). Os oito SVGs de `svg/`, com prancheta `128 × 128`, foram copiados sem alteração para `public/images/icons/categories/custom/`, usando os nomes simples já suportados pela integração. As prévias não foram incorporadas. Playwright confirmou os oito ícones personalizados carregados, ausência de erros JavaScript e layout sem overflow em 1440 e 390 px. Capturas desktop/mobile inspecionadas; mantidos fundo `#9EAA8F`, contornos, pílulas e hover existentes.

Retorno aos ícones em 2026-11-16 — **CONFIRMADO por Danilo:** substituir as fotos por ícones brancos e preencher círculos e pílulas com `#9EAA8F`, usando um contorno mais forte do mesmo tom. Aplicado contorno `#6B7B59` como escolha de implementação, preservando a linha branca interna e o hover. Ícones originais apresentados em branco até o recebimento do novo pacote; fotos preservadas e retiradas da integração ativa. Nova pasta e especificações: [`public/images/icons/categories/custom/LEIA-ME.md`](../../public/images/icons/categories/custom/LEIA-ME.md). SVG/PNG/WebP transparentes, nomes com ou sem numeração, detecção local a cada segundo e versão por alteração de arquivo. Typecheck aprovado; Playwright confirmou os oito ícones, as cores nos dois grupos e no hover, layout sem overflow em 1440/390/320 px, contraste dos textos das pílulas de 5,80:1 e inclusão/substituição/remoção de SVG sem recarregar. Arquivo temporário removido; capturas desktop/mobile inspecionadas. Esta decisão substitui o uso das fotos registrado abaixo.

Fotos ao vivo, ajuste em 2026-11-16 — **CONFIRMADO por Danilo:** continuar incluindo fotos e vê-las em tempo real. `sacred-incense.webp` foi encontrado sem prefixo numérico; ampliada a resolução dos nomes para aceitar tanto o nome numerado quanto o nome simples e o slug da categoria, preservando os arquivos fornecidos. Havendo mais de um candidato, vence o mais recentemente modificado. Guia da pasta atualizado. Rapé e Sacred Incense carregaram no navegador com 600 × 600 px; Playwright confirmou consultas automáticas sucessivas em aproximadamente 1 segundo sem recarregar a página. Typecheck aprovado; captura da seção com as duas fotos inspecionada.

Pílulas das categorias em 2026-11-16 — **CONFIRMADO por Danilo via Impeccable/layout:** aproximar as categorias complementares da linguagem dos círculos, por pertencerem à mesma seção. Contorno compartilhado em `#7E9563`, borda de 2 px e linha branca interna de 1 px com recuo de 2 px; fundo branco quente, texto verde semibold e hover/foco com elevação de 2 px, proporcional aos círculos de 6 px. Mantidos os links, a hierarquia e a rolagem; trilho com folga para não cortar sombra/foco e movimento reduzido preservado. Typecheck aprovado e detector de layout sem achados. Playwright verificou as 18 pílulas, alvos de pelo menos 44 px, ausência de overflow da página em 1920/1440/800/390/320 px, hover, foco, movimento reduzido, setas e rolagem por teclado. Contraste de texto: 5,56:1 normal e 4,87:1 no hover. Capturas desktop, mobile e hover inspecionadas sem sobreposição do consentimento.

Hover das categorias em 2026-11-16 — **CONFIRMADO por Danilo:** fazer os círculos subirem ao passar o mouse. Aplicada elevação de 6 px e sombra com transição de 220 ms; efeito equivalente no foco por teclado, contornos verde/branco preservados e texto estável. Movimento desativado com `prefers-reduced-motion: reduce`, mantendo o feedback por cor/sombra. Playwright confirmou elevação e retorno, ausência de recorte, foco de teclado, movimento reduzido e layout móvel em 390 px sem overflow. Captura desktop inspecionada; `npm.cmd run typecheck` aprovado.

Recuo do traçado branco das categorias em 2026-11-16 — **CONFIRMADO por Danilo:** mover a linha branca para dentro e, após visualizar 4 px de recuo, reduzir. Recuo final de 2 px a partir da borda interna do contorno verde, mantendo linha branca de 2 px e contorno verde de 4 px. Verificado nos oito círculos com Playwright; captura desktop inspecionada.

Traçado interno das categorias em 2026-11-16 — **CONFIRMADO por Danilo:** acrescentar linha branca interna. Aplicado traçado de 2 px em branco puro, dentro do contorno externo de 4 px em `#7E9563`, sem alterar dimensões ou bloquear links. Playwright confirmou os dois contornos nos oito círculos em 1440 e 390 px, sem overflow horizontal; captura desktop inspecionada.

Contorno das categorias, ajuste posterior em 2026-11-16 — **CONFIRMADO por Danilo:** substituir `#475537` por `#7E9563` somente na borda dos oito círculos, mantendo 4 px. Cor conferida no navegador com Playwright.

Cor final do contorno das categorias em 2026-11-16 — **CONFIRMADO por Danilo:** usar especificamente `#475537`, substituindo o carvão solicitado anteriormente somente nesse contorno. Mantida a espessura de 4 px. Playwright confirmou a cor nos oito círculos e no hover; captura desktop inspecionada.

Contorno das categorias em 2026-11-16 — **CONFIRMADO por Danilo:** usar o carvão da marca no traçado ao redor de cada círculo, substituindo os pedidos anteriores de branco e verde. Borda de 4 px em `var(--charcoal)` (`#292C27`), mantida no hover, com foco de teclado preservado. Playwright confirmou os oito contornos em 1440 e 390 px, sem overflow horizontal, e cor preservada no hover. Captura desktop inspecionada; typecheck aprovado durante este ajuste.

Fotos das categorias em 2026-11-16 — **CONFIRMADO por Danilo:** preparar novamente a substituição dos oito ícones por fotos fornecidas pelo responsável, com atualização automática durante os ajustes. Esta instrução substitui a decisão anterior de manter somente os ícones. Pasta e especificações em [`public/images/home/category-circles/LEIA-ME.md`](../../public/images/home/category-circles/LEIA-ME.md): 600 × 600 px, WebP preferido, nomes numerados por categoria. Sem foto, o ícone original permanece. Em desenvolvimento, a home consulta um manifesto a cada segundo enquanto a aba está visível; a versão da URL muda conforme a data de modificação e o tamanho do arquivo. Inclusão, substituição e remoção foram verificadas com Playwright sem recarregar a página, restaurando o ícone ao final e removendo a foto temporária. Recorte circular e ausência de overflow conferidos em 1440, 390 e 320 px; capturas desktop/mobile inspecionadas. `npm.cmd run typecheck` aprovado. Fotos finais **A FORNECER** pelo responsável; atualização contínua restrita ao desenvolvimento.

Controles em 2026-11-16 — **CONFIRMADO por Danilo:** remover sublinhados de pílulas e botões em todo o site, inclusive hover/foco. Regra global em `app/globals.css` cobre botões, links com apresentação de botão, categorias em pílulas, tags, paginação e controles equivalentes. Efeitos de cor, fundo, borda e indicadores de foco continuam regidos pelos estilos dos componentes. Typecheck aprovado.

Categorias em 2026-11-16 — decisão final de Danilo: manter somente os oito ícones originais. Integração automática de fotos desfeita e pasta `public/images/home/category-circles/`, incluindo a foto de teste e suas instruções, removida a pedido. Os registros abaixo sobre fotos e pattern preservam o histórico das decisões substituídas.

Categorias em 2026-11-16 — correção posterior confirmada por Danilo: seção e divisórias seguem a largura das seções vizinhas da home (`.rh-wide`, máximo de 1600 px), substituindo o limite de 1280 px solicitado anteriormente. Navegador confirmou larguras iguais nas três seções em 1920, 1440 e 390 px, sem overflow. Typecheck aprovado.

Categorias em 2026-11-16 — **CONFIRMADO por Danilo:** remover o pattern da seção e preparar imagens para os oito círculos. Pattern removido; especificações e nomes em `public/images/home/category-circles/LEIA-ME.md`. Imagens a fornecer pelo responsável, com integração após o recebimento. Esta decisão substitui a aplicação do pattern registrada abaixo.

Home em 2026-11-16 — ajuste posterior confirmado por Danilo: conteúdo da faixa de categorias limitado a 1280 px, alinhado ao limite do cabeçalho, com fundo em largura total. “Shop by collection” reduzido de até 18 para até 12 produtos por coleção, removendo uma fileira de seis no desktop. Typecheck aprovado; navegador a 1920 px confirmou 12 produtos, contêiner de 1280 px e ausência de overflow horizontal.

Pattern das categorias em 2026-11-16 — **CONFIRMADO por Danilo:** fundo dentro da seção “Shop by category”, atrás dos círculos, ocupando a largura total; conteúdo mantém o contêiner anterior `.rh-wide`, com limite de 1600 px. Reutilizado o grafismo original com o tratamento suave do header. Conferido em navegador a 1920, 1440, 390 e 320 px, com fundo de ponta a ponta, conteúdo centralizado e sem overflow horizontal. Capturas locais em `artifacts/category-full-width-*.png`.

Home em 2026-11-16 — **CONFIRMADO por Danilo:** remover a seção “Discover Katukina”. Removido o carrossel correspondente em `app/page.tsx`; “Shop by collection” passa a seguir as categorias. Os dois testes existentes de home/navegação foram atualizados para verificar o carrossel “New in the catalogue” e aprovados; o seletor antigo dos CTAs dos banners também foi corrigido no teste de composição. Ausência da seção e composição conferidas em navegador a 1440 e 390 px, sem overflow horizontal.

Categorias da home em 2026-11-16 — **CONFIRMADO por Danilo:** reforçar o destaque dos círculos dentro do estilo visual existente. Aplicados contorno verde suave, sombra discreta, ícones maiores, rótulos semibold e estados de hover/foco em `app/reference-home.css`; categorias adicionais com borda leve e alvo mínimo de 44 px. Conferido em navegador a 1440, 800, 390 e 320 px, sem overflow horizontal da página; foco visível, rolagem por teclado e movimento reduzido verificados. Detector de layout sem achados. Capturas locais em `artifacts/category-layout-*.png`.

Ambiente local em 2026-11-16: [recuperação do banco vazio com backup de 10/11 e validação da home, catálogo e painel](LOCAL-RECOVERY-2026-11-16.md).

Navegação do histórico em 2026-11-11: “Recently viewed” usa setas circulares com estados de início/fim e mantém rolagem por toque, links dos produtos e limpeza do histórico. Barra de rolagem visual removida. Validado em navegador a 1440 e 390 px; typecheck aprovado.

Rodapé compacto em 2026-11-11: logo integrada à introdução, links em duas colunas e remoção da assinatura gigante inferior. Conferido em 1440, 800, 390 e 320 px, sem overflow horizontal; altura de 369 px no desktop de 1440 px. Typecheck aprovado.

Fluxo de compra em 2026-11-11: [perfil de desempenho e redução de consultas no carrinho/checkout](COMMERCE-PERFORMANCE-2026-11-11.md).

Carrinho lateral em 2026-11-11: [ícone de folha, sessão WooCommerce e validações](SIDE-CART-2026-11-11.md).

PDP em 2026-11-11: [estrutura iHerb integrada à galeria, opções e compra existentes](PDP-REFERENCE-2026-11-11.md).

Tipografia em 11/11/2026: [sistema e regras](TYPOGRAPHY.md), [inventário por seletor](TYPOGRAPHY-INVENTORY.md) e [revisão com validações](TYPESET-2026-11-11.md).

Categorias em 2026-11-11: [estrutura da referência iHerb com filtros preservados](CATEGORY-REFERENCE-2026-11-11.md).

Atualização do GitHub em 2026-11-09: [16 commits incorporados, conciliação local e validações](GITHUB-INTEGRATION-2026-11-09.md).

Fotos vigentes: [substituição por imagens com marca d’água e exclusão das versões antigas](WATERMARK-PHOTOS-2026-11-09.md), solicitada em 2026-11-09.

Pacote de fotos recebido em 2026-11-09: [WebP de 6 de novembro, compatibilidade e aplicação local](WEBP-PACKAGE-2026-11-06.md).

Atualizações de 2026-11-04: [recebimento e estoque nativo interligados, busca por SKU e testes](STOCK-INTEGRATION-2026-11-04.md); [pattern sutil nos swatches](SWATCH-PATTERN-2026-11-04.md).

Home redesenhada em 2026-11-04: [paleta urucum, preservação do pattern e validações](HOME-URUCUM-2026-11-04.md).

Atualização de fotos por SKU em 2026-11-04: [fonte, critérios de associação e reprodução local](IMAGE-UPDATE-2026-11-04.md).

Atualização de 2026-10-26: a [expansão do backend e sua matriz de implementação](../IMPLEMENTATION_STATUS.md) documentam o novo pedido de auditoria e implementação nativa. Os documentos anteriores abaixo permanecem como evidência histórica; consulte a matriz nova para cobertura, testes executados e bloqueios atuais.

A [auditoria de cobertura funcional de 2026-10-22](FUNCTIONAL-COVERAGE.md) é a referência para comparar o escopo original com a implementação vigente. Sendcloud, HS automático/invoice/API e publicação seletiva multi-site estão pendentes; cadastros preparatórios não equivalem a essas integrações.

| Artefato | Conteúdo |
| --- | --- |
| [Fotos com marca d'água de 2026-11-10](PHOTOS-WATERMARK-2026-11-10.md) | Fonte, correspondência exata, backup e verificação da atualização local das fotos |
| [Assets e logotipo horizontal](ASSETS.md) | Pasta, nome, especificações do SVG e organização dos próximos assets |
| [Contexto do produto e escopo frontend](../../PRODUCT.md) | Público de varejo internacional, responsabilidades, capacidades, limites e decisões abertas para novas tarefas |
| [Tipografia Sora e Source Sans 3](TYPOGRAPHY.md) | Famílias oficiais, escala, pesos, hierarquia por superfície e inventário automatizado por seletor |
| [Fotos WebP de 2026-11-06](PHOTOS-WEBP-2026-11-06.md) | Substituição das fotos do catálogo, remoção das antigas dos uploads, cache privado e recuperação |
| [Paleta urucum e verde folha](PALETTE.md) | Fonte SVG aprovada, cores, funções, estados derivados, contraste e manutenção do tema público |
| [Fotos WebP de 900 × 900 px](CATALOG-WEBP-2026-11-06.md) | Atualização local de todas as mídias do catálogo, correspondência por categoria, backup, validação e reversão |
| [Privacidade e cookies](PRIVACY-COOKIES.md) | Política, consentimento, inventário, fontes públicas e pendências de GDPR/ePrivacy antes de produção |
| [Categorias e produtos](CATALOG-UX-BLUEPRINT.md) | Esquema, implementação, contratos, verificações e limites; [wireframe inicial](CATALOG-WIREFRAMES.html) |
| [Importação Sacred Incense UK](PRODUCT-IMPORT-2026-10-27.md) | Fonte XLSX, produtos/variações, preços atualizados para USD, imagens, reprodução e validação local |
| [Instalação em outro computador](LOCAL-SETUP.md) | Clone, bootstrap, credenciais públicas de teste, rotação obrigatória antes de publicação, atualização e persistência |
| [Cobertura funcional auditada](FUNCTIONAL-COVERAGE.md) | Comparação requisito a requisito com código e configuração local; lacunas de Sendcloud, HS, multi-site e demais domínios |
| [Operação local](OPERATIONS.md) | Administração nativa, cobertura, limites, ADR-009, migração e testes; referência histórica ao ADR-008 |
| [Estrutura headless](HEADLESS.md) | Rotas, integração real de leitura, módulos, execução e limites atuais |
| [Catálogo de exemplo](SAMPLE_CATALOG.md) | Seis produtos do site público cadastrados localmente, fontes, preços e reprodução |
| [Backend local](../../wordpress/README.md) | Docker, versões, acesso, comandos e persistência do WordPress/WooCommerce |
| [Início do desenvolvimento](START.md) | Instalação limpa, fluxo piloto headless, SEO/desempenho e critérios de saída |
| [Auditoria local](AUDIT.md) | Código existente, planilhas, divergências e dependências ausentes |
| [Registro de requisitos](REQUIREMENTS.md) | Origem, estado, papéis, aceite, dependências e riscos por domínio |
| [Arquitetura e ADRs](ARCHITECTURE.md) | Modelo lógico, contratos propostos e decisões ainda abertas |
| [Migração e execução](MIGRATION.md) | Mapeamento inicial, etapas, reconciliação, testes, rollback e pendências |
| [Relatório dos exports](evidence/exports-audit.json) | Contagens, hashes, cabeçalhos e diferenças entre esquemas; sem registros pessoais |
| [Manifesto das fontes](sources/manifest.json) | SHA-256, origem e destino de cada arquivo incorporado |
| [Histórico](CHANGELOG.md) | Mudanças e validações realizadas |

## Fontes incorporadas

Os dois documentos avulsos são idênticos, byte a byte, às versões correspondentes no ZIP. Os sete arquivos do pacote foram lidos e preservados em `skills/katukina-architecture/`.

- [Skill fornecida](../../skills/katukina-architecture/SKILL.md).
- [Prompt mestre](../../skills/katukina-architecture/references/MASTER_PROMPT.md).
- [Baseline de arquitetura](../../skills/katukina-architecture/references/architecture-baseline.md).
- [Inventário funcional](../../skills/katukina-architecture/references/functional-scope.md).
- [Levantamento original](../../skills/katukina-architecture/references/newSiteFunctions-original.txt).
- [Governança](../../skills/katukina-architecture/references/project-governance.md).
- [Metadados da interface da skill](../../skills/katukina-architecture/agents/openai.yaml).
- Cópias avulsas: [KATUKINA_SKILL.md](sources/KATUKINA_SKILL.md) e [KATUKINA_MASTER_PROMPT.md](sources/KATUKINA_MASTER_PROMPT.md).

A skill foi incorporada como orientação deste repositório por [AGENTS.md](../../AGENTS.md). Não houve instalação global nem alteração nas instruções de um Projeto ChatGPT. As fontes originais foram preservadas; a confirmação posterior de WordPress + WooCommerce pelo responsável está registrada no ADR-001 e prevalece sobre o estado anterior de WooCommerce como proposta. As demais recomendações continuam propostas, e referências a sistemas externos não comprovam acesso.

## Reproduzir a auditoria

Execute na raiz do repositório com Python 3, sem dependências adicionais:

```powershell
python -B scripts/audit_legacy_exports.py --output docs/katukina/evidence/exports-audit.json
python -B -m unittest discover -s scripts/tests -v
npm.cmd run typecheck
```

O auditor lê os dois arquivos `export 2026-10-05 *.xlsx`, mantém as fontes intactas e produz somente metadados estruturais e contagens agregadas. Ele exige o formato observado de duas linhas de cabeçalho e datas textuais ISO; não é um importador XLSX genérico. Não calcula tributos, saldos ou totais financeiros, não escolhe uma versão vencedora entre duplicatas e não confirma a unicidade global dos IDs entre sites. Fórmulas são contadas e seus caches lidos, sem avaliação.

## Próxima execução

Avançar da leitura headless de catálogo/conteúdo para o [fluxo piloto](START.md#3-concluir-o-primeiro-fluxo-integrado): contexto comercial de teste, sessão de carrinho e pedido. A ausência do banco legado não bloqueia esse desenvolvimento. Definir autoridade de inventário e políticas mínimas antes da integração operacional de estoque.

Quando disponíveis, incorporar uma cópia do esquema e dos relacionamentos do banco PHP, o código relevante dos fluxos de pedido/estoque e a documentação do gateway. O diretório adicional indicado pelo responsável, `C:\Users\User\Desktop\katukina`, contém outro protótipo Next.js; o material de backend não foi encontrado, e o responsável informou não ter o legado disponível por ora se não estivesse ali. A inspeção está registrada na [auditoria](AUDIT.md#diretório-adicional-indicado-pelo-responsável).

Em paralelo, resolver propriedade do estoque, empresas por canal e regras comerciais. A [matriz de dependências](MIGRATION.md#dependências-e-perguntas) identifica o que cada evidência destrava. As planilhas disponíveis permitem discovery contábil parcial; não contêm o catálogo, os lotes ou o histórico completo de estados.
