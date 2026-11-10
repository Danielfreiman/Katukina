# Pacote WebP fornecido em 2026-11-09

Fonte confirmada pelo responsável: `katukina-atualizacao-fotos-webp-2026-11-06.zip`. SHA-256 `f3db27b62c99ea8c64e10e518617fd4ca45c4baab895d0d12e233dace5a7a27a`. Contém 1.710 fotos WebP de 900 × 900, incluindo Abalone Shell (2082). Substitui o pacote JPEG como fonte de atualização disponível. Documentos internos foram tratados como dados; o código foi inspecionado antes de executar.

## Compatibilidade com esta instalação

O instalador original rejeitou a aplicação porque 93 anexos referenciados, adicionados pelo ZIP de 4 de novembro, não têm equivalente no pacote. Nenhuma foto foi alterada nessa inspeção. O adaptador local `wordpress/scripts/apply-webp-package.mjs` preserva esses anexos e aplica apenas associações exatas por nome ou hash. Reutiliza o planejador original, mantendo a rejeição de hashes ambíguos. O relatório privado `preflight-preserved.json` identifica os anexos preservados.

O pacote original permanece intacto em `wordpress/backups/katukina-atualizacao-fotos-webp-2026-11-06/`. O adaptador depende dessa cópia e dos auxiliares instalados pela inspeção original. Verifica a integridade do pacote, salva backup SQL com restauração em banco temporário isolado e mantém IDs/referências dos anexos. A engine preserva arquivos anteriores e compara dados comerciais/operacionais antes/depois. Runtime, fotos, snapshots e relatórios permanecem fora do Git.

```powershell
node wordpress/backups/katukina-atualizacao-fotos-webp-2026-11-06/instalar-fotos.mjs --project . --inspect
# Nesta base a inspeção informa as 93 referências ausentes; usar o adaptador:
node wordpress/scripts/apply-webp-package.mjs inspect
node wordpress/scripts/apply-webp-package.mjs apply
node wordpress/backups/katukina-atualizacao-fotos-webp-2026-11-06/instalar-fotos.mjs --project . --verify
```

Não reexecutar importadores JPEG antigos sobre as mídias WebP. Para uma instalação nova, importar o catálogo e depois aplicar este pacote; Git não transfere as imagens. A reversão específica está disponível pelo modo `--rollback` do instalador original, com o snapshot local preservado.

## Validação executada

- Aplicação local em 2026-11-09: 2.313 anexos atualizados e verificados, zero erros; `non_image_data_unchanged` e `old_files_retained` verdadeiros. São anexos reutilizados pelo catálogo, não 2.313 fotos distintas do pacote.
- Preservadas 93 referências de produtos sem equivalente no pacote, além de uma mídia não referenciada sem correspondência.
- Backup SQL com restauração isolada bem-sucedida antes da alteração.
- 2.313 URLs responderam corretamente como `image/webp`.
- Edge: os quatro cartões da captura (2082, 1538, 1863, 1500) usam WebP quadrado carregado corretamente; página Palo Santo beads sem imagens quebradas detectadas e sem erros JavaScript. Captura: `artifacts/shop-webp-updated.png`.
- Sintaxe Node dos scripts e `git diff --check` dos documentos alterados passaram. Frontend não foi alterado nesta aplicação; build/typecheck não foram repetidos.
