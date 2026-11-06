# Tipografia Katukina ? Sora e Source Sans 3

**CONFIRMADO por Danilo em 06/11/2026:** Sora como fam?lia principal e Source Sans 3 como apoio, ambas do Google Fonts. Substitui a Manrope na vitrine p?blica Next.js. A [paleta aprovada](PALETTE.md) permanece vigente. O painel nativo WordPress n?o recebe essas altera??es de tema.

## Fam?lias e fun??es

| Fam?lia | Token | Aplica??o |
| --- | --- | --- |
| Sora vari?vel | `--font-display` / `--font-sora` | T?tulos h1?h3, marca tipogr?fica, assinatura do rodap?, navega??o e a??es `.button` / `.text-link` |
| Source Sans 3 vari?vel | `--font-body` / `--font-source-sans` | Corpo, descri??es, pre?os, metadados, textos editoriais, pol?ticas e campos de formul?rio |
| Apoio t?cnico | `--font` | Alias de `--font-body` para compatibilidade dos componentes existentes |

As fam?lias s?o carregadas por `next/font/google` em `app/layout.tsx`, com subconjuntos `latin` e `latin-ext`, eixos vari?veis e `display: swap`. Sora oferece pesos 100?800; Source Sans 3, 200?900. Usamos o estilo normal; n?o presumir it?lico real sem carreg?-lo explicitamente. Licen?a SIL Open Font License nas duas fam?lias.

O build baixa e hospeda os arquivos de fonte no pr?prio frontend (`/_next/static/media/`). O visitante n?o precisa conectar-se aos servidores do Google Fonts. A primeira gera??o do build pode precisar de acesso ? rede. O fallback ajustado do Next.js e Arial/sans-serif mant?m o conte?do dispon?vel durante o carregamento.

Fontes oficiais: [Sora no Google Fonts](https://fonts.google.com/specimen/Sora), [metadados Sora](https://raw.githubusercontent.com/google/fonts/main/ofl/sora/METADATA.pb), [Source Sans 3 no Google Fonts](https://fonts.google.com/specimen/Source+Sans+3), [metadados Source Sans 3](https://raw.githubusercontent.com/google/fonts/main/ofl/sourcesans3/METADATA.pb).

## Hierarquia e encaixe

- Corpo base: `1rem` (16 px com a configura??o padr?o), entrelinha 1,65. Descri??es principais, textos editoriais e pol?ticas: `1rem`, entrelinha 1,75, medida m?xima de 68 caracteres tipogr?ficos (`68ch`). Metadados e r?tulos compactos mant?m sua escala contextual.
- T?tulos: Sora com peso vari?vel 550 como base, entrelinha 1,12 e tracking ?0,035 em. Os pesos espec?ficos j? existentes continuam dispon?veis. N?o comprimir letras al?m de ?0,04 em.
- Hero: escala fluida at? 6 rem no desktop; adapta??o espec?fica entre 801 e 1100 px e abaixo de 600 px. O conte?do e as colunas existentes s?o preservados.
- Produto: t?tulo fluido entre 1,75 e 2,25 rem em telas pequenas; nomes completos, sem truncamento ou altura fixa. Quebra emergencial para palavras extensas.
- Marca e assinatura do rodap? s?o texto e passam a usar Sora. N?o s?o arquivos de logotipo redesenhados. A assinatura se dimensiona em `cqw` pelo cont?iner do rodap? para acompanhar a largura dispon?vel tamb?m sob amplia??o. Fotos e grafismo original permanecem preservados.
- Inputs, selects e textareas herdam a fam?lia de apoio; campos comerciais usam 1 rem. N?o misturar fontes locais em componentes isolados.

## Manuten??o e escopo

Implementa??o em `app/layout.tsx`, `app/globals.css`, `app/catalog.css` e `app/privacy.css`. Manrope, Inter e Cormorant Garamond podem permanecer nas depend?ncias para refer?ncias/prot?tipos hist?ricos; a vitrine atual n?o importa Manrope.

Ao alterar fontes, conferir home, cat?logo, produto com nome extenso, conta/formul?rios e pol?ticas; validar fonte carregada, fallback, zoom, desktop e mobile. Valida??o local n?o equivale a publica??o em produ??o nem modifica o tema do WordPress.

Evid?ncias desta altera??o: `artifacts/typography-update/` (artefatos locais, fora do Git). Resultados executados s?o registrados no changelog ap?s a confer?ncia.
