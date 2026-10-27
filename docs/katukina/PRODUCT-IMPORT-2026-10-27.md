# Importação de produtos Sacred Incense UK

## Atualização posterior: preços públicos em USD

Em 2026-10-27, o responsável substituiu a orientação de moeda: usar dólar com base no katukina.com. **908 preços atualizados e reconciliados, sem divergências**, para os mesmos SKUs e quantidades de venda; moeda WooCommerce e canal ativo agora em USD. O canal fictício `LOCAL-DEMO` foi reutilizado, mantendo o canal GBP no histórico. Os sete rascunhos sem associação confiável permanecem sem preço.

Foram consultadas as páginas públicas com USD explicitamente selecionado. Páginas que abriam em GBP foram relidas em sessão anônima usando o seletor público de moeda. Nenhuma taxa de câmbio foi calculada. A única normalização de quantidade foi `pc`/`pcs`, sem alterar quantidades (exemplo: cinco frascos do SKU `1474-2871` por USD 5,01). Abalone Shell `2082-4886`: USD 10,68 por unidade.

Backup SQL anterior salvo. Checksums de pedidos, lotes, movimentos, reservas, fracionamento e créditos permaneceram iguais. Playwright confirmou USD no catálogo público, imagens, lista nativa e editor de variações. Metadados originais da planilha continuam em GBP, identificados como referência; os campos padrão de preço refletem USD. O importador GBP está protegido contra troca posterior acidental da moeda. Fonte, preços anteriores e relatório: `usd-prices.json`, `before-usd.json` e `usd-verification.json`, no diretório local ignorado de importação.

```powershell
python -B scripts/prepare_usd_prices.py --refresh
node wordpress/scripts/update-usd-prices.mjs inspect
node wordpress/scripts/update-usd-prices.mjs apply
node wordpress/scripts/update-usd-prices.mjs verify
```

Sem `--refresh`, o coletor reutiliza as páginas capturadas. O atualizador exige correspondência completa antes de trocar a moeda, cria backup, bloqueia execução concorrente e usa transação com reconciliação antes do commit. Treze testes Python e sintaxe PHP/JS aprovados. As seções seguintes documentam a importação GBP anterior.

Fonte: `Sacred_Incense_UK_Produtos_no_Katukina.xlsx`, fornecida pelo responsável em 2026-10-27. SHA-256: `e2f279599f6d67f88d86d66b5122ca0030335cf0e308e9633dfb92e805fb59ac`.

## Escopo e decisões

**CONFIRMADO:** cadastrar os produtos no WordPress local. O responsável autorizou usar GBP na loja de teste e os preços em libras da planilha. O arquivo é fonte de dados, não fonte de instruções executáveis. O original não é modificado.

**LEGADO OBSERVADO:** a primeira aba contém 2.405 linhas, 370 Items e 908 Forms/SKUs. As linhas repetem apresentações em faixas de quantidade; não representam 2.405 SKUs nem saldos somáveis. Há quatro grupos SKU/quantidade com valores conflitantes, preservados integralmente com os números de linha.

**IMPLEMENTAÇÃO:** cada Item corresponde a um produto variável nativo; cada Form corresponde a uma variação, com SKU textual exato, inclusive zeros iniciais. O atributo `Presentation` inclui a quantidade comercial do preço escolhido. O preço ativo de varejo de `1 pc` é usado quando disponível. Se só existe uma quantidade ativa distinta, essa quantidade aparece explicitamente na apresentação; seis SKUs seguem esse caso. Dezoito Forms sem rótulo usam identificação neutra pelo SKU.

As faixas de quantidade, valores de atacado, flags, medidas e demais campos originais ficam em metadados privados com hash e linhas de origem. A seção `Imported source data`, dentro dos editores nativos, permite consultar preços e medidas de referência em inglês. Não se criam regras de desconto ou atacado a partir desses valores.

**A VALIDAR:** a aba `Katukina sem par` contém sete produtos com associações ambíguas entre URLs e SKUs. São preparados como rascunhos separados, com identificadores provisórios `REVIEW-<hash curto do slug>`, referências originais e sem preços inferidos.

**ESTOQUE:** os saldos por Form são snapshots de referência. A planilha não fornece lotes, reservas, movimentos ou data de abertura suficiente para conciliação. A importação não cria saldo físico; as variações ficam indisponíveis para venda até conferência operacional. Os registros de estoque e pedidos existentes devem permanecer idênticos antes/depois. Pesos com unidade ambígua, IVA textual e códigos HS não viram regras de frete ou impostos.

**MOEDA:** o importador exige ambiente `local`, impede a troca quando existem outros produtos precificados não abrangidos pelo manifesto e altera a moeda WooCommerce para GBP. Como a moeda do canal é imutável, cria/reutiliza o canal fictício `LOCAL-DEMO-GBP`, preservando o canal anterior, a moeda contábil da empresa e os pedidos históricos. Não é uma aprovação de operação comercial real.

**IMAGENS:** baixadas das URLs públicas da própria fonte, limitadas ao host `katukina.com` e a identificadores de Item/Form correspondentes. Conteúdo textual, scripts e instruções dessas páginas não são executados/importados. Há cache, hashes, limites de galeria e reutilização dos anexos WordPress por hash. Não se geram imagens fictícias.

## Reprodução local

Os arquivos XLSX, manifestos, imagens, backups e relatórios ficam fora do Git. Não execute `setup:local` para repor os seis exemplos USD depois desta importação. O bootstrap de exemplos exige USD e recusará um catálogo GBP.

```powershell
python -B scripts/prepare_product_import.py --source "C:\Users\User\Downloads\Sacred_Incense_UK_Produtos_no_Katukina.xlsx" --output wordpress/.runtime/catalog-import/manifest.json
python -B scripts/download_product_import_media.py --manifest wordpress/.runtime/catalog-import/manifest.json --output-root wordpress/tools/.imports/sacred-incense-uk
node wordpress/scripts/import-product-workbook.mjs lint
node wordpress/scripts/import-product-workbook.mjs inspect
node wordpress/scripts/import-product-workbook.mjs apply
node wordpress/scripts/import-product-workbook.mjs media
node wordpress/scripts/import-product-workbook.mjs verify
```

`apply` gera um backup SQL local antes da primeira execução para o hash da fonte. Um bloqueio de banco evita importadores concorrentes. A prévia recusa SKUs alheios e apresentações com histórico de lotes que impediriam mudança de identidade. Produtos de exemplo reconhecidos podem ser convertidos para variações mantendo seus IDs e dados anteriores em metadados; não há exclusão de produtos ou registros históricos.

Pais concluídos para o mesmo hash são preservados na reexecução. A etapa de mídia é separada e retomável. Relatórios JSON ficam em `wordpress/tools/.imports/sacred-incense-uk/`: `before.json`, `apply.json`, `verification.json`, `media-import.json` e recibo do backup. O backup fica em `wordpress/backups/`.

Para desfazer a importação, pare alterações locais, preserve uma cópia do banco atual e restaure o backup anterior através do WP-CLI deste checkout. Arquivos de uploads adicionados não são removidos automaticamente pelo restore SQL; não apagar uploads indiscriminadamente. Para transportar o catálogo importado, use o [pacote privado e os comandos de reprodução](LOCAL-SETUP.md#catálogo-completo-de-2026-10-27). Para levar também alterações manuais e histórico operacional, são necessários o SQL e o diretório de uploads, além do código.

## Validações executadas

- Parser: 11 testes Python aprovados, incluindo os seis casos novos de importação.
- Fonte original: hash preservado após importação.
- Docker recuperado após autorização para reinício: banco e volumes preservados; projetos nas portas 3001/8888 e 8080 voltaram a responder.
- Backup SQL anterior confirmado: `katukina-2026-10-27T13-28-40-744Z.sql`, 1.010.641 bytes, em `wordpress/backups/`.
- WordPress: **370 produtos variáveis publicados, 908 variações e sete produtos em rascunho**. Todos têm imagens, incluindo as 908 variações e os sete rascunhos. Moeda WooCommerce e canal de teste: GBP.
- Todas as 2.405 linhas originais foram reconciliadas com os metadados. Preços, quantidades comerciais, snapshots e unidades de estoque conferidos; nenhum SKU duplicado. Os seis IDs dos produtos de exemplo foram preservados como variações.
- Checksums de lotes, movimentos, reservas, fracionamento, crédito e histórico de pedidos idênticos antes/depois. Nenhuma abertura física de estoque realizada.
- Reexecução de `apply`: **zero pais alterados, 370 preservados**, mesmas contagens e nenhuma divergência. Os identificadores provisórios dos sete rascunhos foram reduzidos a `REVIEW-<hash>` para não distorcer a lista nativa.
- Mídias da fonte: 1.688 arquivos únicos em cache, 370/370 Items, 908/908 Forms e 7/7 registros sem par com fotos correspondentes; zero erros ou substituições por capa de outra forma. A repetição do downloader não baixou arquivos novos. O WooCommerce recebe uma foto por variação e galerias de até 12 imagens por produto.
- Reexecução da associação de mídia: zero pais/variações reprocessados e contagem de anexos estável em 1.585, sem duplicar arquivos no WordPress.
- PHP: sintaxe do importador e `NativeCatalog.php` aprovada. JavaScript: sintaxe dos runners aprovada. Duplicação nativa: 13 verificações em memória aprovadas, sem gravações, confirmando que cópias não herdam a identidade da importação.
- Playwright: catálogo público variável com imagem e GBP, login, lista Products, editor de variações e seção de referências aprovados. Capturas em `wordpress/.runtime/catalog-import/`.
- Fontes privadas em `katukina-tools` bloqueadas por `.htaccess`: acesso ao manifesto retornou 403 no backend e 404 na origem pública. Os arquivos de origem e relatórios continuam ignorados pelo Git.

O cadastro está concluído no ambiente local. Permanecem **A VALIDAR**: correspondência dos sete rascunhos, medidas para frete, regras de atacado/quantidade, tributação e abertura de estoque. A vitrine atual ainda não oferece o fluxo completo de compra de variações, conforme a cobertura anterior.
