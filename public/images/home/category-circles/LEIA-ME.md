# Fotos de Shop by category

**SUBSTITUÍDO em 16/11/2026:** Danilo voltou a usar ícones brancos com fundo
colorido. Esta pasta preserva as fotos e instruções históricas, mas não é mais
lida pela home. Para o novo pacote, use `public/images/icons/categories/custom/`
e siga o `LEIA-ME.md` dessa pasta. O procedimento abaixo está desativado.

Coloque as imagens nesta pasta. No site local aberto com `npm.cmd run dev`,
cada foto aparece automaticamente em cerca de 1 segundo, sem recarregar.
Substituir o arquivo atualiza a foto; remover o arquivo restaura o ícone original.
Não é necessário cadastrar as fotos no WordPress nem reiniciar o servidor.

## Tamanho e enquadramento

- Recomendado: **600 × 600 px**, proporção quadrada 1:1.
- Formato preferido: **WebP**, idealmente até **150 KB** por imagem.
- Também aceita `.jpg`, `.jpeg`, `.png` e `.avif` (extensão em minúsculas).
- A foto preenche o círculo com recorte central. Centralize o assunto e mantenha
  detalhes importantes nos 70% centrais; as quinas ficam fora do círculo.
- Para ajustar o enquadramento, edite a imagem e salve novamente com o mesmo nome.
- Os nomes também funcionam sem o prefixo numérico: `rape.webp`,
  `sacred-incense.webp`, `beauty-body.webp`, `herbal-teas.webp`, `giftshop.webp`,
  `shamanic-tools.webp`, `kuripe-tepi.webp` e `aromatics.webp`.
  Também são aceitos `beauty-and-body.webp` e `kuripe-and-tepi.webp`.
- Prefira um arquivo por categoria. Se houver vários nomes ou formatos,
  aparece o arquivo modificado mais recentemente. Em caso de empate, tem
  prioridade o nome numerado e, depois, WebP, JPG, JPEG, PNG e AVIF.

| Categoria | Nome recomendado |
| --- | --- |
| Rapé | `01-rape.webp` |
| Sacred Incense | `02-sacred-incense.webp` |
| Beauty & Body | `03-beauty-body.webp` |
| Herbal Teas | `04-herbal-teas.webp` |
| Giftshop | `05-giftshop.webp` |
| Shamanic Tools | `06-shamanic-tools.webp` |
| Kuripe & Tepi | `07-kuripe-tepi.webp` |
| Aromatics | `08-aromatics.webp` |

Os círculos, textos e links mantêm o layout atual. Categorias sem foto usam seus
ícones originais. A verificação contínua funciona somente em desenvolvimento e
pausa em abas ocultas. Em produção, as fotos são lidas no servidor ao carregar a
home; alterações em arquivos devem acompanhar o processo de publicação do site.
