# Home moderna e vermelho urucum — 2026-11-04

**CONFIRMADO:** o responsável solicitou redesenhar a home com visual mais moderno e acrescentar vermelho urucum. Durante a implementação, reforçou que o pattern original não deve ser completamente retirado. Escopo local, sem publicação.

Implementação: fundo marfim, vermelho urucum `#b7432b` (hover `#91331f`), verde existente, tipografia ampliada e composição com fotografia, produto em destaque, três caminhos de coleção, quatro produtos reais e chamadas para história e journal. O arquivo original `public/images/original-background.jpg` permanece intacto e aparece na abertura e no bloco urucum; filtros e opacidade CSS adaptam o contraste. Mantido o inglês da vitrine existente.

Os produtos e preços continuam vindo da Store API WooCommerce, incluindo as fotos atualizadas. A seleção editorial usa quatro slugs existentes; não infere popularidade nem disponibilidade. Catálogo indisponível mantém uma mensagem e link de recuperação. Sem mudança em estoque, checkout, painel ou dados do backend.

Arquivos principais: `app/page.tsx`, `app/home.css`, tokens em `app/globals.css`. Estilos da nova home usam classes próprias; o ponto da marca recebe o novo urucum também no cabeçalho compartilhado. A asserção do título no teste existente foi atualizada para o texto novo.

Validações executadas:

- `npm.cmd run typecheck` e `npm.cmd run build`: aprovados.
- Teste Playwright existente `storefront.spec.ts`, com Edge instalado: aprovado, incluindo SEO, rotas públicas, menu mobile, foco após Escape e busca.
- Inspeção Playwright da home em 1440, 1024, 768, 390 e 320 px: sem overflow horizontal, imagens quebradas ou erros JavaScript; pattern original presente.
- Onze destinos únicos dos links da home: HTTP 200.
- Revisão visual das capturas desktop e mobile; arquivos em `artifacts/home-modern-*.png` e relatório local `artifacts/home-modern-qa.json`.
- `git diff --check` dos arquivos versionados desta alteração: aprovado.

**A VALIDAR:** apreciação visual final pelo responsável. A implementação não implica publicação em produção.

## Ajuste do kenê em largura total

Em 2026-11-04, o responsável solicitou estender o kenê até a largura máxima da página. O fundo da abertura passou para uma seção de largura total; o conteúdo mantém o alinhamento e a largura máxima anteriores. Removida a máscara lateral que ocultava o grafismo à direita. O arquivo original permanece intacto.

Validação: typecheck aprovado; Playwright confirmou fundo de borda a borda em 1920, 1440, 390 e 320 px, sem overflow horizontal. Captura local: `artifacts/home-kene-full-width.png`.
