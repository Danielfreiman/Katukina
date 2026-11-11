# Fotos com marca d'água — 2026-11-10

Pedido de Danilo: atualizar as fotos do site com `Fotos/Editadas com marca dagua.rar`.
Escopo: catálogo do WordPress local, exibido pelo Next.js em http://localhost:3001.
Nenhuma publicação remota foi solicitada ou executada. Conteúdo do arquivo tratado como dados.

## Fonte e correspondência

- SHA-256 do RAR: `b8fb44d292bb2dbea64cd9356f0d03d0702396fb7c96ad969257a67e90d28f1d`.
- Extração privada: `wordpress/tools/.imports/Editadas com marca dagua/`.
- 6.424 fotos WebP, todas verificadas como 900 × 900 px.
- Lote: `catalog-webp-watermark-2026-11-10`, sob `wordpress/tools/.imports/`.
- 1.592 anexos correspondentes às 1.592 imagens referenciadas por 377 produtos e 908 variações.
- Correspondência exata por ID e caminho categoria/produto/arquivo do manifesto anterior `catalog-webp-2026-11-06/manifest.json`. O nome editado atual também é conferido. Nenhuma seleção por nome isolado ou colisão de hash.
- `scripts/prepare_catalog_photo_refresh.py` permite preparar novas trocas com a mesma estrutura e valida todas as fontes antes de criar o manifesto.

## Recuperação

Backup SQL anterior: `wordpress/backups/katukina-2026-11-10T17-52-47-278Z.sql`.
SHA-256: `efde2f2c366f5f497bd0535575d3068be2e1b6d25475d95ed3c3cef4530a251b`.
Restauração em banco temporário isolado aprovada. Recibo copiado para `backup.json` do lote.
Arquivos anteriores permanecem disponíveis para reversão; `before.json` guarda os metadados.

```powershell
node wordpress/scripts/update-catalog-webp.mjs rollback catalog-webp-watermark-2026-11-10
```

O cache histórico de importação não foi reimportado. Não executar importações antigas sobre esta seleção sem reconciliar as fotos com este lote.

## Verificação

Recibos privados: `preflight.json`, `verification.json` e `http-verification.json` no lote.
Checagem visual reproduzível: `output/playwright/check-watermark-photos.js`.
As alterações de layout preexistentes foram preservadas.

Resultados executados:

- Aplicação: 1.592 imagens alteradas e verificadas, zero erros; miniaturas válidas; dados não relacionados a imagens inalterados; arquivos anteriores preservados.
- HTTP/API: 370 produtos públicos, 1.535 referências públicas de imagem, 1.592 arquivos conferidos por hash e MIME, zero erros.
- Navegador: home, catálogo, Abalone Shell e Agua Floresta Florida Water, cada página em 1440 e 390 px. Oito capturas `output/playwright/watermark-*.png`; verificações de fotos carregadas, ausência de overflow e erros JavaScript aprovadas. Home desktop e produto Agua Floresta no celular também inspecionados visualmente. Houve aviso de preload não utilizado imediatamente no navegador, sem falha de imagem.
- `npm.cmd run typecheck`: aprovado.
- Seis testes existentes de `test_prepare_catalog_webp.py`: aprovados. Eles cobrem o mapeador anterior; o novo preparador foi validado com o inventário e pacote reais, sem alegar cobertura unitária própria.
- `git diff --check`: aprovado.

Não houve build, commit, push ou deploy nesta tarefa. A atualização de banco/arquivos é local e privada; um commit dos scripts/documentos não transfere as fotos ou o banco para outro ambiente.

## Revalidação em 2026-11-11

Danilo solicitou atualizar todas as fotos usando o mesmo RAR. O SHA-256 atual confere exatamente com a fonte acima; todas as 1.592 imagens vinculadas ao catálogo já correspondem ao pacote aplicado. Nenhuma reaplicação foi necessária.

- WordPress: 1.592 imagens conferidas, zero erros de arquivo, dimensões, MIME, hash ou miniaturas; arquivos anteriores preservados.
- HTTP/API: 370 produtos públicos, 1.535 referências públicas e 1.592 arquivos conferidos, zero erros.
- Capas e galerias dos 1.285 produtos/variações conferidas contra o inventário anterior, sem divergências.
- Oito páginas/viewport conferidos novamente com Playwright: home, catálogo e dois produtos em desktop e celular; imagens carregadas, sem overflow ou erros JavaScript. Capturas atualizadas; produto Abalone no celular e Agua Floresta no desktop também inspecionados visualmente.
- A comparação histórica geral do verificador retornou `non_image_data_unchanged: false`. Uma conferência específica identificou diferenças somente em `wp_kat_audit` e `wp_kat_commands`; os grupos de produtos, metadados e demais tabelas coincidem com o snapshot. Não houve escrita no banco pelos comandos desta revalidação nem tentativa de restaurar esses registros.
- Recibo adicional privado: `revalidation-2026-11-11.json` no lote. `git diff --check` aprovado. Não foram repetidos typecheck/build, pois nenhum código da aplicação foi alterado.

Escopo local, sem commit, push ou deploy.
