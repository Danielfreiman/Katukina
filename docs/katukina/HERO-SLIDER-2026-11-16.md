# Hero com três fundos rotativos

**Atualização posterior em 16/11/2026:** Danilo pediu integrar as imagens em edição e remover o overlay. A nova arte de incenso salva na pasta anterior foi copiada para `desktop/banner-01.webp`, preservando a origem. Removida a camada clara do hero; texto e botão continuam. Em desenvolvimento, `/api/home-hero-media` fornece versões atuais dos arquivos e o hero consulta a cada 2 segundos, sem polling em produção. A pasta autoritativa para as próximas trocas é `public/images/home/hero-slider/`. Referências à camada clara abaixo são históricas e foram substituídas.

**CONFIRMADO por Danilo em 16/11/2026:** transformar o hero em três banners rotativos com imagem preenchendo a área inteira. As artes serão produzidas por ele. Na clarificação, pediu manter os textos e o botão atuais; somente o fundo muda. Sempre preparar pastas, nomes e tamanhos, exclusivamente WebP.

## Arquivos para produção

Pasta base: `public/images/home/hero-slider/`.

| Banner | Desktop, 2400 × 900 px | Celular, 1080 × 1350 px |
| --- | --- | --- |
| 1 | `desktop/banner-01.webp` | `mobile/banner-01.webp` |
| 2 | `desktop/banner-02.webp` | `mobile/banner-02.webp` |
| 3 | `desktop/banner-03.webp` | `mobile/banner-03.webp` |

Guia de composição e exportação: [LEIA-ME dos banners](../../public/images/home/hero-slider/LEIA-ME.md). No desktop, assunto à direita; no celular, assunto na metade inferior. Não inserir textos ou botões na arte. O site mantém título, descrição, CTA e links, com camada clara para leitura. Nenhuma arte nova foi criada nesta implementação.

## Implementação

- `lib/home-hero-media.ts`: detecta os seis arquivos, ignora ausentes e adiciona versão por data/tamanho à URL.
- `components/home/hero-slider.tsx`: alterna banners disponíveis a cada 6,5 segundos, com setas, indicadores, pausa/reprodução, teclado e gesto horizontal. Interação manual e foco pausam; hover suspende; movimento reduzido desativa reprodução automática. Aba oculta não avança.
- `app/modern-home.css`: fundo completo com recorte central proporcional, composição móvel até 640 px e controles com alvos de 44 px. A imagem avulsa do pote sai do hero.
- Zero arquivos: fundo liso e conteúdo atual. Um banner: imagem fixa. Dois ou três: controles e rotação. Arquivos existentes das outras versões não são sobrescritos.
- Recarregar a página depois de salvar as artes. No ambiente publicado, incluir arquivos na publicação. Não modifica backend, preços, produtos ou regras comerciais.

As dimensões, intervalo e comportamento de fallback são escolhas de implementação; o pedido confirmado é o hero full com três banners e conteúdo atual mantido.

## Validação executada

- Atualização local posterior: typecheck aprovado; nova arte 2400 × 900 px carregada; overlay ausente e sem overflow em 1440/390 px; consulta sem cache confirmada. Teste de resposta atualizada do manifesto confirmou troca e recuperação da URL da imagem sem recarregar. Capturas desktop/celular inspecionadas. Ainda sem WebP próprio para celular: usa a alternativa desktop com recorte.

- `npm.cmd run typecheck`: aprovado após implementação e ajuste do controle de reprodução.
- `npx.cmd playwright test tests/reference-home.spec.ts`: aprovado após remover os arquivos temporários; preservados título, vitrines, abas, navegação e layout responsivo da home.
- Conferência no navegador com seis WebP temporários, reutilizados de imagens locais somente para teste: rotação automática, pausa e retomada, setas, indicadores, retorno do último ao primeiro, teclado, gesto touch e movimento reduzido aprovados. Imagens temporárias removidas ao final, sem alterar as fontes.
- Fontes desktop/celular e ausência de overflow verificadas em 1920, 1440, 768, 640, 390 e 320 px. Capturas com imagens de teste inspecionadas em desktop/celular; não representam as artes finais de Danilo.
- Estado sem imagens confirmado: título e botão atuais, fundo liso e ausência de controles vazios. As seis artes finais permanecem pendentes de produção pelo responsável.
