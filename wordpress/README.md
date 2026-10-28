# WordPress local Katukina

A importação do catálogo Sacred Incense UK usa GBP e produtos/variações nativos. Veja [fonte, comandos e limites da importação](../docs/katukina/PRODUCT-IMPORT-2026-10-27.md). Depois da importação, use `wp:start` para iniciar o ambiente; o bootstrap dos exemplos USD não deve ser usado para repor este catálogo.

Backend de desenvolvimento em Docker, separado do frontend Next.js. Configuração: WordPress 7.1.3, WooCommerce 11.2.1, PHP 8.3, MariaDB 11.4 e wp-env 11.17.0. WordPress/WooCommerce/wp-env têm versões exatas; imagens PHP/MariaDB acompanham as respectivas séries de manutenção.

Expansão local de 2026-10-26: plugin 0.4.0, migração aditiva de esquema 4 e testes `npm.cmd run wp:test` na raiz. Cobertura e dependências atuais: [IMPLEMENTATION_STATUS](../docs/IMPLEMENTATION_STATUS.md). As fixtures USD existentes são preservadas; preços GBP/EUR são explícitos, sem conversão automática.

O plugin `katukina-core` 0.3.0 amplia os editores nativos de Products/Variations e Orders, as configurações WooCommerce e os perfis WordPress. Não há painel ou catálogo paralelo. Estoque simples, preços, impostos, frete, pagamentos e cupons usam os recursos nativos; lotes/fracionamento são extensões em Products. Carrinho, conta e checkout de teste estão integrados à vitrine. Veja [operação local e limites](../docs/katukina/OPERATIONS.md). A empresa/canal `LOCAL-DEMO` é fictícia, a matriz de transições está vazia e nenhum estoque foi inventado.

## Acesso

Para um clone novo, siga o [guia completo de instalação](../docs/katukina/LOCAL-SETUP.md) e execute `npm.cmd run setup:local` na raiz após instalar as duas árvores de dependências com `npm ci`.

- Site público Next.js: http://localhost:3001/
- Painel no mesmo endereço: http://localhost:3001/wp-admin/
- Usuário: `admin`.
- Acesso efetivo: arquivo local `.local-access.json`, ignorado pelo Git. Em instalações novas, o setup usa a senha pública de teste `Katukina-Local-Test-Only-2026!` do arquivo `.local-access.example.json`; preserva o acesso de instalações existentes.

**ESTE AMBIENTE SÓ PODE SER PUBLICADO APÓS A ROTAÇÃO DAS CREDENCIAIS.** Trocar acesso administrativo, credenciais de banco, chaves e salts antes de exposição pública. A credencial versionada foi autorizada exclusivamente para teste local.

Use o painel na porta **3001**, com `localhost` no endereço. A porta 8888 pertence ao backend interno; abrir login/painel diretamente nela encaminha para a origem pública antes de pedir credenciais. A senha não é a senha padrão do wp-env: use o valor do arquivo local acima.

As portas do site e do banco são publicadas somente em `127.0.0.1`. O banco usa uma porta local dinâmica; `npm.cmd run wp:status` mostra os serviços. O projeto existente na porta 8080 tem containers e banco próprios e não faz parte deste ambiente.

## Comandos na raiz do projeto

O Docker Desktop precisa estar em execução. Para instalar as ferramentas em outra cópia do projeto, execute primeiro `npm.cmd --prefix wordpress ci`.

```powershell
npm.cmd run wp:start
npm.cmd run wp:status
npm.cmd run wp:setup
npm.cmd run wp:stop
```

`wp:start` inicia/recria os containers necessários. `wp:stop` para os serviços preservando o banco e os arquivos. `wp:setup` e `setup:local` executam o bootstrap completo de demonstração. Ele configura o acesso via stdin, sem senha na linha de comando, importa as fixtures e prepara o canal fictício. Repetições preservam cadastros e configurações já concluídos.

Após iniciar, o wrapper restaura `WP_SITEURL` para a origem pública configurada em `.wp-env.json`. O wp-env 11.17.0 substitui essa porta pela porta Docker durante a geração do runtime; sem a restauração, o editor tenta carregar variações por AJAX em 8888. A verificação `tools/verify-headless.php` também exige que `admin_url()` corresponda à origem pública.

Consultar versão e plugins:

```powershell
npm.cmd run wp:env -- run cli wp core version
npm.cmd run wp:env -- run cli wp plugin list
npm.cmd run wp:env -- run cli wp eval-file /var/www/html/wp-content/katukina-tools/verify-local.php
npm.cmd run wp:logs
npm.cmd run wp:verify
```

Iniciar também `npm.cmd run dev` em outro terminal: frontend e proxy usam a porta 3001, e o painel depende desse processo. O backend interno continua em `127.0.0.1:8888`, com raiz encaminhada ao Next.js. Catálogo, conteúdo, carrinho e checkout fictício estão integrados. Rotas e módulos em [HEADLESS.md](../docs/katukina/HEADLESS.md).

`wp:verify` usa o Playwright/Chromium do projeto raiz e o arquivo local de acesso; em outra máquina, instalar as dependências da raiz e executar `npx playwright install chromium` antes da verificação. Em 19/10/2026 passaram: home, noindex, APIs WordPress/WooCommerce, Cart Token, login e painel de Produtos, inclusive após parada/retomada. WP-CLI confirmou versões, HPOS e controles locais; backup/restore ainda não foi ensaiado.

## Configuração e persistência

- `.wp-env.json`: versões, porta interna, memória, plugins e diretórios montados; `WP_HOME`, `WP_SITEURL` e `KATUKINA_FRONTEND_URL` usam a origem pública `http://localhost:3001`.
- `scripts/wp-env.mjs`: executa o wp-env local e aplica as portas de loopback via arquivo de ambiente do Compose, sem alterar configurações globais.
- `scripts/setup-local.mjs`: bootstrap completo do ambiente de teste, acesso, catálogo, canal fictício e verificações.
- `scripts/local-runtime.mjs`: localiza o projeto Compose pelo diretório, sem nomes de containers específicos de uma máquina.
- `.runtime/`: core, WooCommerce e arquivos gerados, ignorados pelo Git. Banco persistido no volume Docker do projeto.
- `mu-plugins/katukina-local.php`: somente em `WP_ENVIRONMENT_TYPE=local`, impede indexação, desativa rastreamento WooCommerce e interrompe envio externo de e-mails. Não armazena nem envia conteúdo de mensagens.
- `tools/setup-local.php`: título local, links permanentes, páginas básicas do WooCommerce, HPOS e questionário inicial dispensado; marcador impede reaplicar configurações a cada execução.
- `tools/verify-local.php`: checagem de versões, HPOS e controles locais, sem alterar dados.
- `plugins/katukina-core/`: roteamento headless e menu de módulos Katukina.
- `tools/verify-headless.php`: origem pública e chamadas internas do WordPress dentro do Docker. O MU-plugin resolve essas chamadas na rede Docker local.

País de operação, moeda comercial, tributos, frete, pagamentos, canais e política de estoque aguardam definição. Os valores padrão da instalação não são regras comerciais aprovadas. Foram cadastrados [seis produtos de exemplo](../docs/katukina/SAMPLE_CATALOG.md) com fotos e preços observados no site público, sem clientes, pedidos ou saldos reais. As imagens e o manifesto estão em `tools/fixtures/`; o importador preserva cadastros concluídos quando reexecutado.

Parar os containers preserva os dados. Operações de limpeza/destruição do wp-env ou remoção dos volumes podem apagar o banco; não fazem parte do fluxo diário. Para transferir o ambiente, preservar dump do banco e mídias junto do código/configuração; o Git sozinho não contém os dados.

## Referências

[wp-env](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/), [variáveis do Docker Compose](https://docs.docker.com/compose/how-tos/environment-variables/envvars/), [WordPress](https://wordpress.org/download/) e [WooCommerce](https://wordpress.org/plugins/woocommerce/).
