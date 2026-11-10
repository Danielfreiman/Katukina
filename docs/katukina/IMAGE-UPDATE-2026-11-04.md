# Atualização de fotos por SKU — 2026-11-04

**CONFIRMADO pelo responsável:** localizar as fotos nas pastas do ZIP fornecido e atualizar os produtos correspondentes no ambiente local. Documentos dentro do arquivo são dados, não instruções.

Fonte: `drive-download-20261104T160519Z-1-001.zip`. Inventário: 1.163 JPEGs, 974 nomes distintos. SKUs são comparados como texto, preservando zeros iniciais. Capas usam o código do produto (`ITEM.jpg`); apresentações usam o SKU exato (`ITEM-FORM_01.jpg`); fotos adicionais entram na galeria nativa do produto. Sem capa ou imagem principal disponível, mantém-se a referência existente.

SHA-256 do ZIP: `087081d07bf734c8ef91d5a63f90ca2c75ab459ec59b869de4802fd2e84e9202`.

O responsável confirmou priorizar categorias específicas sobre `Exclusive Sale` e `Expected Stock`; para Palo Santo beads (1995), escolheu explicitamente `Aromatics/Palo Santo beads`. Os pingentes 1720/1722 usam sua categoria específica `Aromatherapy Pendants`. Essas escolhas resolvem os 166 nomes com conteúdos diferentes em mais de uma pasta.

Mapeamento final: 934 nomes de foto, 814 conteúdos distintos, 140 produtos, 115 capas e 364 imagens principais de variações. **A VALIDAR / não aplicar:** 37 nomes referentes a oito códigos de produto ausentes no catálogo e três arquivos `IMG_*.JPG` sem SKU. A [lista de pendências](evidence/image-update-pending-2026-11-04.csv) inclui o caminho de origem e o motivo. Não associar por semelhança de nome.

## Reprodução local

As fontes extraídas por hash, o catálogo consultado, os manifestos, referências anteriores e relatórios ficam em `wordpress/tools/.imports/sku-images-2026-11-04/`, ignorado pelo Git. As imagens antigas são preservadas na biblioteca; o atualizador reutiliza anexos pelo SHA-256 e usa o bloqueio de importação existente. Backup SQL fica em `wordpress/backups/`. A execução é restrita a WP-CLI com ambiente `local`.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/prepare-sku-images.ps1 -Archive 'CAMINHO_DO_ZIP'
node wordpress/scripts/update-sku-images.mjs export
node scripts/match-sku-images.mjs
node wordpress/scripts/update-sku-images.mjs inspect
node wordpress/scripts/update-sku-images.mjs apply
node wordpress/scripts/update-sku-images.mjs verify
```

`apply` cria backup antes de importar. O verificador confere o hash do arquivo original, capa, galeria e imagem da variação; o relatório de aplicação compara o snapshot dos dados comerciais e operacionais antes/depois. Para reverter apenas as referências, usar `before.json`; o backup SQL é a alternativa para restauração integral local. Não houve alteração de produção.

A cópia local das mídias e o banco atualizado precisam acompanhar uma transferência do ambiente. A atualização original não reconstruiu o pacote de outubro; essa lacuna foi corrigida na revisão de 2026-11-09 abaixo.

## Validação executada

- Aplicação em duas etapas: 669 anexos na primeira e 145 adicionais após a escolha de pastas; os anexos anteriores foram reutilizados pelo hash.
- Reconciliação final: 934 fotos, 140 produtos e 364 variações, sem erros de arquivo ou referência. Snapshot comercial/operacional idêntico antes/depois em ambas as etapas.
- API pública: 140 produtos encontrados e capas correspondentes conferidas; 814 URLs de imagens responderam com sucesso e tipo de conteúdo de imagem.
- Playwright com Edge instalado: páginas dos SKUs 1720, 1995 e 0595 responderam HTTP 200, sem imagens quebradas ou erros JavaScript. O Chromium gerenciado pelo Playwright não estava instalado; foi usado o Edge disponível.
- `npm.cmd run typecheck`, sintaxe dos scripts Node, lint PHP dos dois utilitários e `git diff --check` dos arquivos versionados alterados nesta tarefa passaram. Não foi executado build; o frontend não foi modificado nesta tarefa.
- Backups SQL anteriores às duas aplicações foram salvos. A restauração integral não foi ensaiada nesta execução.

## Revisão do pacote — 2026-11-09

**CONFIRMADO por auditoria local:** o cache privado de importação ainda referenciava as fotos de outubro. A API em `localhost:3001` já servia as capas de novembro para os 140 produtos; 814 URLs de imagem responderam corretamente. As páginas de 1720, 1995 e 0595 passaram no Edge, sem imagens quebradas ou erros JavaScript. A inspeção posterior dos elementos renderizados revelou fotos antigas adicionais nas galerias de 1720 e 1995: anexos importados com URL de origem vazia não eram reconhecidos para substituição. O atualizador agora identifica esses anexos pelo nome original estrito de SKU, usando o arquivo associado no WordPress. A biblioteca preserva os anexos antigos; as referências de galeria são substituídas quando existe foto aprovada com o mesmo nome.

`node scripts/sync-sku-catalog-media.mjs` atualiza o cache portátil usando o manifesto aprovado, valida os 934 hashes e preserva as imagens/cache anteriores em `sku-images-2026-11-04/original-cache/` e `media-before.json`. O mapeamento usa a chave de importação explícita, preservando os zeros iniciais nos SKUs e nomes de arquivo. O pacote atualizado é `wordpress/backups/katukina-catalog-sku-2026-11-04.zip`, com recibo SHA-256 adjacente. O gerador verifica todos os hashes e a integridade do ZIP.

As instruções de instalação e a mensagem do bootstrap agora apontam para esse pacote. Transferir o pacote continua necessário entre computadores; Git não transporta fotos nem banco. Não executar a importação completa sobre um catálogo operacional existente apenas para trocar fotos.

Validação da reaplicação: 934 fotos, 140 produtos, 364 variações, zero erros e zero anexos novos; snapshot comercial e operacional idêntico antes/depois. Backup SQL salvo antes da alteração. As galerias renderizadas de 1720 e 1995 deixaram de incluir os anexos antigos substituídos. Lint PHP e verificações de sintaxe Node passaram. O ZIP validado contém 1.911 arquivos; SHA-256 `423f39dde3d8fe9ab76c7f38351e8aa32c0769639f0f8d34d2902b93ab543836`.

### Correção adicional após captura da listagem

A captura do responsável mostrou um caso não coberto pela primeira verificação: produtos sem arquivo `ITEM.jpg` mantinham a capa antiga mesmo quando essa capa era uma foto `ITEM-FORM_01.jpg` com substituta aprovada. Confirmado nos SKUs 1538, 1863 e 1500. O atualizador agora substitui também a capa pelo nome exato do anexo atual; preserva-a somente quando não há substituta correspondente. A verificação passou a rejeitar referências antigas substituíveis tanto na capa quanto na galeria. Abalone Shell (2082), também na captura, não possui arquivo correspondente no inventário do ZIP e mantém a foto existente.

Reaplicação concluída com 934 fotos verificadas, zero erros, zero anexos novos e dados comerciais/operacionais preservados. O teste específico da listagem passou no Edge: capas da API e `currentSrc` dos cartões 1538, 1863 e 1500 correspondem aos hashes aprovados, e os quatro cartões carregam sem imagens quebradas. Captura local em `artifacts/shop-corrected-photo-covers.png`.
