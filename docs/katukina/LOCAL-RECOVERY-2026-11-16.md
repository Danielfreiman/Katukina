# Recuperação do ambiente local em 16/11/2026

## Falha observada

CONFIRMADO nesta execução. A home respondia HTTP 200 com coleções indisponíveis e categorias vazias. O endpoint interno `/wp-json/wc/store/v1/products` respondia HTTP 302 para `/wp-admin/install.php`. A conexão local configurada apontava para o banco `wordpress`, sem tabelas. O volume MySQL atual tinha criação em 16/11/2026. A causa da substituição ou perda do volume anterior permanece A VALIDAR.

## Recuperação executada

O backup local `wordpress/backups/katukina-2026-11-10T17-52-47-278Z.sql` foi restaurado somente após confirmar banco vazio, ambiente `local`, ausência de comandos de troca de banco no dump e SHA-256 correspondente ao recibo. O recibo já registrava ensaio isolado de restauração. Os uploads existentes foram reutilizados. Os dados recuperados correspondem ao snapshot de 10/11/2026. Alterações de banco posteriores ao snapshot permanecem A VALIDAR.

## Validações executadas

- WordPress instalado, 370 produtos publicados, WooCommerce e Katukina Core ativos.
- API de produtos HTTP 200 com JSON e total de 370 produtos.
- `npm.cmd run wp:verify` aprovado com home, noindex, APIs WordPress/WooCommerce, emissão de token de carrinho, login administrativo e administração nativa de produtos.
- Navegador headless em 1440 × 1000 com 335 links de produtos na home, nenhuma mensagem de coleção indisponível e nenhum erro JavaScript capturado. Quatro imagens de produtos amostradas responderam HTTP 200 como WebP. Captura da home inspecionada visualmente.
- O primeiro ensaio de navegador encontrou o Chromium do Playwright ausente. `npx.cmd playwright install chromium --only-shell` instalou o runtime e permitiu repetir a validação com sucesso.

O Next.js continua em `http://localhost:3001/`, com WordPress em `/wp-admin/` pela mesma origem e backend interno em `127.0.0.1:8888`. Não houve alteração de código da aplicação nesta recuperação.
