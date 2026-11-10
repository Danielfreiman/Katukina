# Banner Collections ? home

Pedido de Danilo em 2026-11-10: substituir a se??o ?Everything has roots? por um banner para Collections, com todo o conte?do ? esquerda e imagem tempor?ria.

Implementa??o local: `app/page.tsx` e `.collections-banner` em `app/globals.css`. CTA ?Explore collections? aponta para `/collections`, sem seta. Texto: ?Find your next discovery.? / ?From botanicals and incense to art and shamanic tools, explore our collections and find what speaks to you.?

## Arte de fundo

- Placeholder vetorial: `public/images/home/collections-banner/placeholder.svg`.
- Arte desktop recomendada: **2400 ? 900 px**; exportar em WebP.
- N?o incluir textos nem bot?o na arte: s?o elementos HTML.
- Manter o lado esquerdo claro e visualmente calmo (aproximadamente 50% da largura); concentrar o motivo principal no lado direito.
- O fundo usa `object-fit: cover`: prever cortes nas bordas em diferentes propor??es. No mobile, o recorte prioriza o lado esquerdo, preservando a leitura. Pode ser fornecida uma segunda composi??o mobile se o motivo precisar aparecer tamb?m em telas estreitas.
- Para substituir: salvar a arte nesta pasta, atualizar `src`, `width` e `height` da imagem no banner. O placeholder ? tempor?rio e n?o representa arte final aprovada.

Aceite: texto e CTA alinhados ? esquerda; somente esta se??o alterada; imagem carregada; CTA abre Collections; sem overflow em desktop/mobile; foco e hover preservados.
