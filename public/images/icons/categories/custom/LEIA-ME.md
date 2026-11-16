# Novo pacote de ícones brancos — Shop by category

Coloque os novos ícones nesta pasta. Eles substituem os ícones atuais
automaticamente em cerca de 1 segundo no site local (`npm.cmd run dev`),
sem recarregar a página. Salvar novamente atualiza a versão mostrada.
Remover um arquivo restaura o ícone original da categoria.

## Formato e tamanho

- Preferido: **SVG**, prancheta quadrada com `viewBox="0 0 128 128"`.
- Alternativa: **PNG ou WebP transparente**, **512 × 512 px**.
- Desenho **branco puro**, centralizado, com margem livre ao redor.
- Não inclua fundo, círculo, texto ou bordas no arquivo: o site aplica o fundo
  claro das fotos dos produtos (`--soft`), pattern suave atrás do ícone,
  contorno verde da mesma cor do ícone e linha branca interna.
- O ícone é exibido em **64 × 64 px no desktop** e **44 × 44 px no celular**,
  mantendo sua proporção. Use espessuras e margens consistentes entre os oito.
- Os arquivos continuam brancos; o site usa sua transparência como máscara para
  apresentá-los em verde sobre o fundo claro, sem alterar os SVG/PNG/WebP originais.

| Categoria | Nome recomendado |
| --- | --- |
| Rapé | `01-rape.svg` |
| Sacred Incense | `02-sacred-incense.svg` |
| Beauty & Body | `03-beauty-body.svg` |
| Herbal Teas | `04-herbal-teas.svg` |
| Giftshop | `05-giftshop.svg` |
| Shamanic Tools | `06-shamanic-tools.svg` |
| Kuripe & Tepi | `07-kuripe-tepi.svg` |
| Aromatics | `08-aromatics.svg` |

Para PNG/WebP, altere somente a extensão, em minúsculas. Os mesmos nomes sem
numeração também funcionam. `beauty-and-body` e `kuripe-and-tepi` são aceitos.
Prefira um arquivo por categoria; havendo vários, aparece o mais recentemente
modificado. Em empate, vence o nome numerado e a ordem SVG, PNG, WebP.

Os SVG originais permanecem na pasta superior como fallback. As fotografias de
`public/images/home/category-circles/` estão preservadas, mas não são mais usadas
nesta seção. A atualização contínua funciona em desenvolvimento com a aba visível.
