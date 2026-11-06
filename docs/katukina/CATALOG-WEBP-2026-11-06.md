# Fotos do catálogo em WebP — 2026-11-06

## ZIP para atualizar somente as fotos em outra instalação

Para quem já tem o site e catálogo instalados, enviar `wordpress/backups/katukina-atualizacao-fotos-webp-2026-11-06.zip`. Esse pacote é específico para troca de fotos; o ZIP `katukina-catalog-webp-2026-11-06.zip` mencionado abaixo continua sendo o pacote do catálogo completo para instalação nova.

O ZIP de atualização contém 1.710 WebP, instalador Node, mecanismo PHP local, conferência interna SHA-256 e `LEIA-ME.txt` com comandos de inspeção, aplicação, verificação e reversão. Não contém SQL, credenciais, pedidos nem IDs de anexos desta máquina. O instalador descobre os IDs na instalação receptora por nomes/fontes e hashes, exige cobertura de todas as mídias referenciadas por produtos/variações e bloqueia ambiguidades. Os arquivos de origem e as mídias não relacionadas são preservados. O backup SQL com restauração de teste é criado na máquina receptora antes da troca. O cache de importação anterior dessa máquina não é substituído; não reexecutar importações de mídia de um ZIP JPEG antigo.

Arquivo: 108.877.563 bytes; 1.718 entradas; SHA-256 `f3db27b62c99ea8c64e10e518617fd4ca45c4baab895d0d12e233dace5a7a27a`. O recibo externo `.zip.json` acompanha o pacote. Extração e hashes de todas as entradas foram conferidos. O instalador extraído executou `--inspect` no ambiente local: 1.592 referências cobertas, todas já atualizadas, nenhuma troca realizada. Cinco testes de identificação passaram, incluindo IDs diferentes, cobertura incompleta e hashes ambíguos. Simulação adicional com o inventário antigo completo e IDs deslocados identificou corretamente as 1.592 trocas. Isso não equivale a execução na máquina do destinatário; ele deve rodar a inspeção antes de aplicar.

Gerar novamente em um caminho novo, preservando ZIPs existentes:

```powershell
python -B scripts/package_photo_update.py --output wordpress/backups/NOVO-NOME.zip
```

Os comandos para o destinatário estão em [LEIA-ME do pacote](templates/PHOTO-UPDATE-README.txt). Node e Docker do projeto são suficientes no destino; Pillow é usado somente ao gerar o ZIP na origem.

## Escopo e decisão

**CONFIRMADO pelo responsável:** atualizar as fotos do catálogo local no WordPress/WooCommerce e, por consequência, na vitrine Next.js, usando `Katukina.com/Fotos/Editadas`. Em 2026-11-06, o responsável aprovou priorizar a categoria principal do produto quando cópias com o mesmo nome tiverem conteúdos diferentes. A categoria é obtida da URL de origem registrada em `media.json`; não é inferida pelo tamanho do arquivo ou pela data de modificação.

A origem contém 6.424 WebP, todos com 900 × 900 px, em 2.389 nomes distintos e 2.045 conteúdos distintos. Existem 228 nomes com conteúdos diferentes entre pastas; 153 nomes usados nos dados de importação foram resolvidos pela categoria principal. As imagens de descrição arquivadas em subpastas são distintas das fotos de galeria com nome igual. As variações fora da lista de galeria também entram no mapeamento.

O plano contempla as 1.592 mídias referenciadas pelos 377 produtos (incluindo rascunhos) e 908 variações. O placeholder padrão WooCommerce não tem foto correspondente e é preservado. Arquivos adicionais da pasta de origem não criam produtos nem ampliam galerias automaticamente. Componentes antigos não utilizados e fotos editoriais sem correspondência de catálogo não são substituídos.

## Proteções

- Execução somente em WP-CLI com `WP_ENVIRONMENT_TYPE=local`, usando exclusivamente o Compose deste checkout.
- SQL anterior com SHA-256 e restauração validada em banco temporário isolado; recibo conferido novamente antes de aplicar.
- Plano privado por ID de mídia, arquivo de origem e hashes antes/depois. Todos os arquivos são validados antes da primeira troca.
- IDs de anexos, capas, galerias, variações, títulos e textos alternativos preservados. Novos arquivos WebP e miniaturas recebem novas URLs; GUID do anexo permanece como identificador histórico.
- Imagens antigas e seus tamanhos derivados permanecem nos uploads. Os arquivos fornecidos em `Fotos/Editadas` nunca são alterados.
- Snapshot dos caminhos, MIME e metadados dos anexos permite reversão de imagens sem restaurar pedidos ou estoque. Erros durante a aplicação tentam restaurar esse snapshot.
- Hashes dos registros de produto/variação, seus metadados, pedidos e tabelas operacionais são comparados antes/depois. O arquivo de plano não pode mudar em uma reexecução.
- Reexecução do mesmo lote ignora mídias já atualizadas; não executar enquanto outra pessoa edita mídias ou dados do catálogo.

O lote não altera preços, disponibilidade, impostos, pedidos ou regras de negócio. A vitrine consulta o WordPress com `cache: "no-store"`. URLs novas evitam reutilizar o arquivo antigo do cache do navegador. Nenhuma publicação ou operação em outra máquina está incluída.

## Reproduzir em outro lote local

Requisitos: ambiente local existente, Python com Pillow para ler WebP e Node/Docker do projeto. Os testes de mapeamento usam apenas a biblioteca padrão Python. Não executar `setup:local` para esta atualização.

1. Criar inventário e plano, usando um nome novo de lote. O parâmetro de prioridade de categoria exige aprovação do responsável; essa regra foi aprovada para esta execução.

```powershell
node wordpress/scripts/update-catalog-webp.mjs inventory catalog-webp-AAAA-MM-DD
python -B scripts/prepare_catalog_webp.py --source 'CAMINHO/Fotos/Editadas' --batch catalog-webp-AAAA-MM-DD --prefer-primary-category
```

2. Conferir `preflight.json`: dimensões/formato válidos, nenhum conflito de mapeamento e nenhuma referência de catálogo sem correspondência. Criar backup com teste de restauração:

```powershell
node wordpress/scripts/backup-local.mjs --verify-restore
```

Copiar o recibo `.sql.json` gerado para `wordpress/tools/.imports/<lote>/backup.json`, preservando o SQL no caminho indicado pelo recibo. Não publicar esses arquivos. O wrapper rejeita backup ausente, alterado ou sem restauração validada.

3. Aplicar e verificar:

```powershell
node wordpress/scripts/update-catalog-webp.mjs apply catalog-webp-AAAA-MM-DD
node wordpress/scripts/update-catalog-webp.mjs verify catalog-webp-AAAA-MM-DD
node wordpress/scripts/verify-catalog-webp-http.mjs catalog-webp-AAAA-MM-DD
```

4. Após aprovação das verificações, atualizar os dados de reprodução privada e criar um novo ZIP (sem sobrescrever o anterior):

```powershell
python -B scripts/sync_catalog_webp.py --batch catalog-webp-AAAA-MM-DD
python -B scripts/package_product_catalog.py --output wordpress/backups/katukina-catalog-webp-AAAA-MM-DD.zip
```

O sincronizador preserva o `media.json` anterior no lote e os arquivos JPEG do cache. O novo `media.json` passa a usar arquivos WebP e hashes novos, incluindo as imagens adicionais do cache que não eram anexos ativos no WordPress. O ZIP é privado: Git transporta a ferramenta, mas não transporta banco nem fotos importadas.

## Reverter

```powershell
node wordpress/scripts/update-catalog-webp.mjs rollback catalog-webp-2026-11-06
```

A reversão verifica caminhos/metadados/MIME restaurados e hashes dos dados comerciais. Não apaga os novos arquivos nem restaura o banco inteiro. Se o cache privado também tiver sido atualizado, restaurar `wordpress/tools/.imports/catalog-webp-2026-11-06/media-before.json` sobre `wordpress/tools/.imports/sacred-incense-uk/media.json`; os arquivos antigos continuam no cache. Em uma interrupção abrupta, reexecutar `apply` com o mesmo lote para continuar, ou `rollback` para reverter. Preservar o SQL, `manifest.json`, `before.json` e os recibos até encerrar a revisão.

## Evidências desta execução

- Preflight: 1.592/1.592 anexos referenciados com correspondência, sem arquivos inválidos.
- Piloto: três anexos substituídos e verificados; reversão validou a restauração exata dos metadados e MIME, sem alteração dos dados comerciais.
- Relatórios completos e caminhos locais de backup: `wordpress/tools/.imports/catalog-webp-2026-11-06/`, ignorados pelo Git.
- Lote completo: 1.592 anexos verificados, zero erros de hash/formato/dimensões/miniaturas; arquivos antigos preservados; hashes dos produtos, seus metadados, pedidos e tabelas operacionais inalterados. Nenhum ID de anexo foi recriado.
- HTTP: 1.592 arquivos conferidos por status, MIME e SHA-256, sem erro. Store API: 370 produtos publicados e 1.535 referências de imagem conferidas. Os sete rascunhos permanecem fora da API pública.
- Pacote privado: `wordpress/backups/katukina-catalog-webp-2026-11-06.zip`, 1.713 arquivos (três manifestos e 1.710 WebP), 108.926.898 bytes, SHA-256 `d74c01c327595b747d25b87831b455e8bbe45360dce89b982a61e707fede02ae`. ZIP e hashes das entradas verificados; não houve instalação em outra máquina nesta execução. Pacotes anteriores preservados.
- Typecheck e 19 testes Python passaram. Sintaxe JavaScript dos dois novos wrappers e execução PHP do lote aprovadas; `git diff --check` sem erros.
- Navegador: produto em 1440 × 1000 e 390 × 844, WebP principal/miniaturas/relacionados carregados, troca para a segunda imagem da galeria e ausência de overflow horizontal no celular. Capturas locais em `artifacts/catalog-webp/output/playwright/`, ignoradas pelo Git. A amostra visual não representa revisão de fidelidade de todas as fotos fornecidas.
- WordPress nativo: editor do anexo 11 mostra a nova foto, URL `.webp`, tipo WEBP e dimensões de 900 × 900 px. Captura `wordpress-media.png` preservada na mesma pasta de evidências; nenhuma edição manual foi salva no painel.
- Home, noindex, REST, Store API, token de carrinho, login administrativo e lista Products aprovados com o verificador existente em uma cópia local com navegação ampliada para 90 segundos. A primeira execução com limite padrão de 30 segundos excedeu o prazo após o login. Durante o processamento pesado, uma abertura de produto também atingiu o timeout da API; a página voltou a abrir normalmente após a carga, sem alteração do código da vitrine.
