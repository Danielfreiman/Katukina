KATUKINA - ATUALIZACAO SOMENTE DAS FOTOS - 06/11/2026

Este pacote atualiza as fotos de um Katukina LOCAL ja instalado com WordPress,
WooCommerce e catalogo. Inclui 1.710 fotos WebP de 900 x 900 px. As copias
repetidas entre categorias foram consolidadas. Versoes diferentes seguem a
categoria principal aprovada por Danilo.

Nao instala o site do zero, nao cria produtos e nao importa precos, estoque,
clientes ou pedidos. O site Next.js e o painel WordPress usam as mesmas midias.
O instalador identifica as fotos na SUA instalacao; nao reutiliza IDs de outra
maquina. Funciona somente no ambiente Docker local do projeto Katukina.

COMO USAR NO WINDOWS / POWERSHELL

1. Abra a pasta do projeto Katukina no VS Code e abra um terminal nessa raiz
   (a pasta que contem package.json, app e wordpress).
2. Abra Docker Desktop e aguarde ficar pronto.
3. Extraia este ZIP para wordpress/backups/ do seu projeto. Ao final, deve
   existir esta pasta, sem uma pasta duplicada dentro dela:

   wordpress/backups/katukina-atualizacao-fotos-webp-2026-11-06/

4. Inicie o backend existente:

   npm.cmd run wp:start

5. Confira a correspondencia. Este comando NAO troca fotos no WordPress:

   node "wordpress/backups/katukina-atualizacao-fotos-webp-2026-11-06/instalar-fotos.mjs" --project . --inspect

   Veja products, variations, mapped e to_update no resumo. Se aparecer algum
   erro de correspondencia, PARE e envie o erro para Danilo. Nao remova as
   protecoes. Se houver apenas as seis amostras de demonstracao, este pacote
   atualizara somente essas amostras: o catalogo completo precisa ja existir.

6. Se a conferencia terminar com sucesso, aplique:

   node "wordpress/backups/katukina-atualizacao-fotos-webp-2026-11-06/instalar-fotos.mjs" --project . --apply

   O instalador cria um backup SQL da SUA base e testa a restauracao em banco
   temporario isolado antes de trocar fotos. Ele mantem os IDs das midias,
   preserva os arquivos antigos e gera as novas miniaturas. A operacao pode
   levar aproximadamente 15 a 30 minutos no Docker/Windows; aguarde a mensagem
   final de sucesso. Nao edite produtos/midias e nao rode outras importacoes
   durante a atualizacao. Se houver falha, nao avance nem force comandos.

   Ao final, checked informa a quantidade conferida, errors deve ser [],
   non_image_data_unchanged e old_files_retained devem ser true.
   Se todas as fotos ja estiverem atualizadas, o programa informa isso e sai
   sem criar outra troca.

7. Com o frontend aberto, confira o site e o painel. Se estiver parado:

   npm.cmd run dev

   Site: http://localhost:3001/
   Painel: http://localhost:3001/wp-admin/

   Recarregue as paginas. Capas, galerias e imagens das variacoes devem usar
   WebP. Os arquivos principais sao de 900 x 900 px; miniaturas geradas pelo
   WordPress sao menores, o que e normal.

CONFERIR NOVAMENTE

   node "wordpress/backups/katukina-atualizacao-fotos-webp-2026-11-06/instalar-fotos.mjs" --project . --verify

REVERTER SOMENTE ESTA ATUALIZACAO DE FOTOS

   node "wordpress/backups/katukina-atualizacao-fotos-webp-2026-11-06/instalar-fotos.mjs" --project . --rollback

   Esse comando restaura caminhos, MIME e metadados das midias anteriores.
   Nao apaga os arquivos novos nem restaura o banco inteiro. Guarde a pasta
   do pacote, o backup SQL e os relatorios ate encerrar a revisao.

BACKUPS E RELATORIOS DA SUA MAQUINA

   SQL e recibo: wordpress/backups/katukina-*.sql e *.sql.json
   Plano, snapshot e verificacao:
   wordpress/tools/.imports/catalog-webp-transfer-2026-11-06/

IMPORTANTE

- Nao execute setup:local nem reimporte o catalogo/precos para atualizar fotos.
- Nao apague o banco, uploads, volumes Docker ou os arquivos antigos.
- Nao reexecute importacoes de midia a partir de um pacote JPEG antigo: esse
  pacote altera as midias no WordPress, sem substituir seu cache de importacao.
- O pacote nao contem banco, usuarios, senhas, pedidos ou acessos de Danilo.
- Os hashes internos sao conferidos automaticamente. O recibo .zip.json que
  acompanha o ZIP permite conferir tambem o SHA-256 do ZIP recebido.
- O teste na maquina de origem valida a correspondencia e o pacote; nao
  representa execucao na sua maquina. Inspecione antes de aplicar.
