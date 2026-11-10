# Substituição por fotos com marca d’água — 2026-11-09

**CONFIRMADO pelo responsável:** substituir pelas imagens de `Editadas com marca dagua.rar` e excluir as antigas. Escopo local: imagens correspondentes do catálogo, preservando dados comerciais, estoque, vínculos e mídias sem substituta. Documentos do arquivo são dados, não instruções.

SHA-256 do RAR: `b8fb44d292bb2dbea64cd9356f0d03d0702396fb7c96ad969257a67e90d28f1d`.

## Associação

O RAR contém 6.424 imagens WebP em pastas, com 2.389 nomes distintos. Todas as imagens selecionadas têm 900 × 900 pixels. As duplicatas foram consolidadas por nome/hash, priorizando categorias específicas, as escolhas anteriores para pingentes e Palo Santo beads, e a categoria de origem já registrada no catálogo quando há versões diferentes. Fotos diretamente na pasta do produto têm prioridade sobre cópias em subpastas de descrição. A origem de cada escolha fica no manifesto privado.

O inventário local identificou 2.406 anexos correspondentes e 1.733 referências distintas usadas nos produtos e variações. Uma mídia sem correspondência é preservada. A atualização mantém IDs dos anexos: não cria produtos, não muda SKUs, preços, saldos ou referências de capas/galerias.

## Implementação e exclusão

- `scripts/prepare-watermark-photos.mjs`: valida os caminhos e tipos do RAR, extrai localmente, resolve as duplicatas e registra hashes.
- `wordpress/scripts/update-watermark-photos.mjs`: inventaria e associa as mídias, salva backup SQL com restauração isolada validada e aplica o lote.
- `wordpress/tools/update-watermark-media.php`: troca os arquivos, gera miniaturas, verifica hashes/dimensões e compara os dados comerciais/operacionais.
- `wordpress/tools/cleanup-replaced-photos.php`: só permite a limpeza após verificação bem-sucedida. Os candidatos são os arquivos originais e miniaturas dos snapshots deste lote e do lote WebP anterior, limitados aos IDs substituídos. Protege arquivos ainda usados por qualquer anexo ou conteúdo. Cada arquivo é copiado para backup privado e seu hash é conferido antes da exclusão do upload público. Não exclui diretórios recursivamente nem apaga arquivos de origem em Downloads.
- A limpeza desta execução usou a inspeção PHP e `wordpress/scripts/cleanup-watermark-photos.mjs` para executar o plano com I/O nativo no Windows. O script valida os caminhos absolutos dentro do workspace, hashes de todas as fotos atuais, de cada candidato e de cada cópia de segurança; só depois exclui os arquivos individualmente. A leitura nativa evita o custo de dezenas de milhares de acessos pelo bind mount do Docker.

Fontes, backup e relatórios ficam em `wordpress/tools/.imports/catalog-webp-watermark-2026-11-09/` e `wordpress/backups/`, ignorados pelo Git. Depois da limpeza, os arquivos antigos ficam somente no backup privado `retired-files/`; uma reversão exige restaurá-los antes dos metadados. Pacotes JPEG/WebP anteriores são históricos e não devem ser reaplicados sobre este lote.

Após a conciliação com o GitHub em 2026-11-09, o adaptador usa o planejador e o auxiliar de backup versionados em `wordpress/scripts/`. As fontes e os manifestos privados continuam necessários; não é um instalador independente para outra máquina.

## Execução

Aplicação: 2.406 anexos verificados, zero erros, snapshot comercial/operacional idêntico antes/depois. Backup SQL com restauração isolada validada. Os anexos usam 1.697 conteúdos novos distintos, por reutilização das mesmas fotos em diferentes referências.

Limpeza: 31.464 arquivos antigos removidos dos uploads (1.352.140.588 bytes), incluindo originais e miniaturas. Zero arquivos candidatos ainda em uso e zero erros de exclusão. Cópias de segurança conferidas por hash em `retired-files/`; os arquivos de origem e os pacotes históricos privados não foram apagados.

Validação após exclusão: 2.406 anexos novamente conferidos sem erros, dados comerciais/operacionais inalterados e `old_files_retained=false`. As 2.406 URLs atuais responderam como WebP; 12 URLs antigas amostradas responderam HTTP 404. Edge confirmou os quatro cartões da captura com imagens quadradas e marca d’água, sem erros JavaScript; Palo Santo beads sem imagens quebradas detectadas. Captura em `artifacts/shop-watermark-updated.png`. Sintaxe Node, lint PHP e `git diff --check` dos documentos versionados alterados passaram. Não houve mudança de frontend nesta tarefa; build/typecheck não foram repetidos.
