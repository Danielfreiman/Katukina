# Fotos WebP fornecidas em 2026-11-06

**CONFIRMADO — pedido do responsável:** atualizar as fotos do projeto com o ZIP `katukina-atualizacao-fotos-webp-2026-11-06.zip`, deixando somente as novas fotos no catálogo e removendo as antigas. O conteúdo do ZIP foi tratado como dados/código a auditar, sem substituir o pedido explícito. A orientação interna de manter arquivos antigos nos uploads foi superada pelo pedido de remoção; cópias privadas de recuperação ficam fora dos uploads públicos.

## Escopo local

O pacote contém 1.710 fotos WebP de 900 × 900 pixels. A prévia identificou correspondências para todas as 1.592 mídias referenciadas por 377 produtos (incluindo sete rascunhos) e 908 variações nesta instalação. A diferença de contagem decorre do reaproveitamento de anexos e dos arquivos adicionais no cache de importação. O placeholder nativo WooCommerce não é uma foto antiga de produto. Grafismo, imagens institucionais e documentos históricos não fazem parte deste pacote de fotos de catálogo.

O processo preserva IDs de anexos, capas, galerias e referências das variações; os arquivos e as miniaturas passam a WebP. Preços, estoque, pedidos e cadastros não são reimportados. O backend continua sendo o WordPress local em Docker, com a vitrine Next.js em `http://localhost:3001/`.

## Fontes e recuperação

- Pacote extraído e auditado: `wordpress/tools/.imports/photos-webp-2026-11-06/`.
- SHA-256 do ZIP recebido: `f3db27b62c99ea8c64e10e518617fd4ca45c4baab895d0d12e233dace5a7a27a`.
- Plano, snapshot e recibos: `wordpress/tools/.imports/catalog-webp-transfer-2026-11-06/`.
- Backup SQL prévio: `wordpress/backups/katukina-2026-11-06T12-15-58-458Z.sql`, SHA-256 `21c6f9783ce27992f1ae786daffe536e9e98fadaf81a9a6b5aed63ce97ffa68f`; restauração em banco temporário isolado validada.
- `wordpress/tools/retire-replaced-photos.php`: confere as fotos novas, identifica somente originais/miniaturas anteriores registrados no snapshot, protege arquivos ainda referenciados, cria e verifica um TAR privado antes de remover os arquivos substituídos dos uploads. Modos `inspect`, `apply` e `verify`, somente WP-CLI local.
- `scripts/sync_webp_catalog_media.mjs`: atualiza nomes, hashes e referências do cache privado de importação; arquiva os arquivos anteriores fora do cache ativo antes de removê-los.

Os arquivos privados acima continuam ignorados pelo Git. Não reexecutar o downloader ou um pacote antigo de JPEGs sobre este cache: uma nova coleta da fonte histórica não representa a seleção de fotos aprovada agora.

Após a retirada dos arquivos antigos, a verificação do instalador original que exige `old_files_retained=true` deixa de se aplicar. Usar a verificação de retirada para conferir o estado final. Para reverter, primeiro restaurar os arquivos do TAR privado nos mesmos caminhos relativos de `wp-content/uploads/`, depois usar o rollback do pacote para restaurar os metadados anteriores. Restaurar somente o SQL não repõe arquivos removidos.

## Validação

Na primeira execução, as 1.592 fotos e miniaturas passaram na conferência, mas o instalador reverteu os vínculos devido a um evento concorrente de WP-Cron em `wp_kat_commands` e `wp_kat_audit`: uma checagem `expire` com resultado `{"expired":0}` às 12:27:15 UTC. Os demais 22 conjuntos de hashes permaneceram iguais. A retomada local reaproveita os WebP e miniaturas já verificados e reconstrói seus metadados sem gerar outra cópia. O comparador desconsidera somente esse evento específico, identificado por sua chave, ação e resultado; o evento permanece no banco e qualquer outra diferença continua causando falha. Código e relatório da primeira tentativa preservados no diretório privado do lote, junto com `resume-generated-media.php`.

- Integridade: 1.717 arquivos do pacote conferidos pelos hashes internos, incluindo as 1.710 fotos.
- WordPress: 1.592 mídias atualizadas e verificadas, sem erros de hash, formato, dimensões ou miniaturas. IDs e referências dos 377 produtos e 908 variações preservados. Dados comerciais/operacionais reconciliados, com a exceção explícita do evento concorrente sem efeito descrito acima.
- Limpeza: 11.151 arquivos antigos (originais e miniaturas) arquivados com hashes conferidos e removidos dos uploads; lista de arquivos antigos restantes vazia. TAR privado: `superseded-uploads.tar`, no diretório do lote, SHA-256 `85aab755126d59ae863d5af80bce7bcf17bd2a225d208d9627439882cb7d04db`.
- Varredura final dos uploads: 9.526 arquivos de imagem, todos WebP (incluindo miniaturas e placeholder nativo), zero JPEG/PNG e zero imagens órfãs.
- Cache: exatamente 1.710 WebP ativos, todos com hashes corretos; antigos arquivados em `original-cache/` no lote privado. Manifesto de importação atualizado com nomes WebP e hashes correspondentes.
- HTTP: 370 produtos públicos conferidos, 1.592 imagens retornando WebP com o hash esperado; dez URLs de originais antigos verificadas após a remoção retornaram 404.
- Navegador: catálogo e dois produtos, larguras 1440 e 390 px, 60 ocorrências de imagens carregadas sem falhas, sem overflow ou erros JavaScript. Capturas e relatórios em `artifacts/photo-update-2026-11-06/`.
- `npm.cmd run typecheck`, sintaxe PHP do script de retirada, `node --check scripts/sync_webp_catalog_media.mjs` e `git diff --check` aprovados.
- `npx.cmd playwright test tests/storefront.spec.ts --timeout=180000`: um teste aprovado. A primeira execução atingiu o limite padrão de 60 segundos na consulta do sitemap; a resposta terminou em HTTP 200, e a repetição com prazo adequado passou em 1,5 minuto. Build não executado: não houve mudança no código da vitrine.

A inicialização do Next.js alterou automaticamente o nível do título no bloco gerado de `AGENTS.md`; esse ajuste foi preservado conforme as instruções do projeto.
