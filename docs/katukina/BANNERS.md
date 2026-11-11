# Banners da home: produção e entrega

Especificação vigente em **11/11/2026**, conferida em `components/home/reference-widgets.tsx` (`HomeCampaigns`) e `app/reference-home.css` (`.rh-campaign`). Estas são as campanhas em dupla da captura de Danilo. Substituem as instruções de hero panorâmico/vertical para esta área.

## Tamanho e formato

**Produzir cada imagem em 2400 × 1800 px, proporção 4:3, WebP, perfil sRGB.** Essa resolução é uma recomendação de produção; o layout exige proporção, não pixels fixos. Cobre telas com um banner próximo de 1000 px e dá margem para telas de alta densidade. Meta de peso: até 500 KB por arte, ajustando compressão conforme a fidelidade de produtos e rótulos. DPI não determina o tamanho exibido no navegador.

As três campanhas usam a **mesma imagem no desktop e no celular**. Acima de 1100 px, aparecem duas por vez, com intervalo de 16 px. Até 1100 px, aparece uma por vez. O quadro mantém 4:3 em todas as larguras; não é necessário exportar uma versão vertical/mobile para este componente. Uma versão exclusiva por dispositivo exigiria implementação adicional.

Na captura de referência, cada quadro tem aproximadamente **792 × 594 px**. Com conteúdo máximo de 1600 px, cada quadro em dupla mede `(1600 − 16) / 2 = 792 px` de largura. Essa é a exibição, não o tamanho recomendado do arquivo. O tamanho real varia com a janela e os recuos do layout.

## Arquivos exatos

Raiz das exportações publicadas: `website-katukina-2027/public/images/home/banners/`.

| Campanha | Nome a substituir | Destino do clique | Mestre sugerido |
| --- | --- | --- | --- |
| Discover your natural rhythm | `discover-katukina.webp` | `/shop` | `discover-katukina.psd` |
| Explore Tepi & Kuripe | `tepi-kuripe.webp` | `/collections/kuripe-and-tepi` | `tepi-kuripe.psd` |
| Explore Sacred Incense | `sacred-incense.webp` | `/collections/sacred-incense` | `sacred-incense.psd` |

As campanhas rodam em sequência; não existe imagem fixa “da esquerda” ou “da direita”. A captura mostra o par 2 e 3. Os títulos e descrições permanecem editáveis no componente, separados das fotos.

Os três caminhos estão ligados ao componente. As imagens iniciais são cópias das que já apareciam, preservando sua aparência; **não são novas artes aprovadas nem foram redimensionadas**. A campanha Tepi & Kuripe substituiu Our Story; `tepi-kuripe.webp` mantém provisoriamente a foto anterior até Danilo salvar a nova arte por cima. Novas artes 4:3 são produzidas por Danilo. As pastas antigas de hero foram retiradas da área pública e arquivadas em `.local-backups/`, fora do site.

## Composição no Photoshop/Illustrator

- Criar somente a fotografia/composição. Não gravar títulos, descrições, botões, setas, contador, cantos arredondados ou overlay na imagem.
- O site coloca texto branco no topo esquerdo e um degradê escuro sobre a foto. Reservar aproximadamente os **40% superiores** como região visualmente tranquila; é orientação de composição, não um recorte aplicado pelo código.
- Concentrar objetos/produtos na metade inferior e/ou à direita, com margem de segurança de aproximadamente 8% nas bordas. Preservar os rótulos e os elementos importantes.
- `object-fit: cover` centralizado preenche o quadro. Uma arte 4:3 encaixa na proporção atual; arquivos verticais ou panorâmicos sofrem corte.
- A tipografia muda de escala no celular. Conferir também 320/390 px antes de considerar a composição aprovada.

## Pastas de trabalho de Danilo

Fora do Git e da pasta pública:

```text
Katukina.com/Assets Site/Banners/Home/
  01 Discover Katukina/
    Referencias/
    Editaveis/
    Exportacoes/
  02 Tepi & Kuripe/
    Referencias/
    Editaveis/
    Exportacoes/
  03 Sacred Incense/
    Referencias/
    Editaveis/
    Exportacoes/
```

`Referencias/`: imagens-base e referências de composição. `Editaveis/`: PSD/AI com camadas e vínculos. `Exportacoes/`: WebP candidato, com o nome definitivo. Para versões, usar subpastas por data (`2026-11-11`), mantendo o nome final dentro delas. O site lê exclusivamente os arquivos em `public/images/home/banners/`, não a pasta de trabalho.

## Como colocar uma arte no site

1. Salvar o mestre na pasta da campanha em `Editaveis/`.
2. Exportar WebP 2400 × 1800 px em sRGB para `Exportacoes/`, com o nome da tabela.
3. Guardar uma cópia da exportação pública anterior fora de `public/` antes de sobrescrever.
4. Copiar o WebP aprovado para `public/images/home/banners/`, mantendo exatamente o nome.
5. Com o servidor local ativo, abrir `http://localhost:3001/`, atualizar com Ctrl+F5 e navegar pelas três campanhas usando os controles.
6. Conferir em desktop e celular: carregamento, texto legível, recorte, rótulos, peso e destino do clique.

URLs diretas para conferir cada imagem:

- `/images/home/banners/discover-katukina.webp`
- `/images/home/banners/tepi-kuripe.webp`
- `/images/home/banners/sacred-incense.webp`

Se o navegador conservar a versão anterior, abrir a URL com `?v=20261111` para diagnosticar cache. Trocar o arquivo local não publica a alteração em produção. Para desfazer, restaurar a exportação anterior com o mesmo nome.

## Outras áreas visuais

O banner institucional abaixo das vitrines usa `forest.jpg` via CSS. Cards editoriais usam fotografias compartilhadas e arquivos próprios em `public/images/editorial/`. Fotos de produto vêm do WooCommerce. As antigas pastas `hero-01/`, `hero-02/`, `hero-03/` e `collections-banner/` foram removidas da área pública, com backup externo. Fundos e cards de outras áreas não são destinos destes três banners. Ver [assets](ASSETS.md) e [estrutura](../PROJECT_STRUCTURE.md) antes de produzir artes para outras áreas.
