# Reproduzir o ambiente em outro computador

Este procedimento recria o ambiente de **desenvolvimento e teste** a partir do Git: Next.js, WordPress, WooCommerce, plugin Katukina, seis produtos com fotos e configuração fictícia de checkout. Os limites funcionais permanecem na [auditoria de cobertura](FUNCTIONAL-COVERAGE.md).

## Credenciais públicas de demonstração

Por autorização explícita do responsável em 2026-10-22, o arquivo [`.local-access.example.json`](../../wordpress/.local-access.example.json) contém um acesso conhecido, usado pelo instalador em ambientes novos:

- Usuário: `admin`
- Senha: `Katukina-Local-Test-Only-2026!`
- Painel: http://localhost:3001/wp-admin/

**ESTE AMBIENTE SÓ PODE SER PUBLICADO APÓS A ROTAÇÃO DAS CREDENCIAIS.** Antes de expor a instalação na internet, substituir a senha de demonstração e quaisquer outras senhas, chaves de API, credenciais de banco e segredos do runtime; renovar as salts de autenticação WordPress e invalidar sessões. Não reutilizar os valores de desenvolvimento em homologação pública ou produção. A rotação é obrigatória, mas não substitui a homologação comercial e de infraestrutura: este repositório ainda não representa uma loja pronta para produção.

O acesso efetivo de cada instalação fica em `wordpress/.local-access.json`, ignorado pelo Git. Se esse arquivo já existir, o instalador preserva e valida suas credenciais; ele não troca automaticamente a senha atual desta máquina pela senha do exemplo. Se a senha tiver sido alterada no painel, atualizar o arquivo local antes de repetir o setup ou os testes. Não colocar credenciais futuras de produção no exemplo versionado.

## Pré-requisitos

- Git e acesso ao repositório `https://github.com/Danielfreiman/Katukina`.
- Node.js **24.18 ou superior** e **npm 11.16 ou superior**. Esses mínimos atendem também às dependências WordPress Playground presentes no lockfile do wp-env; o frontend isolado aceita Node 20.9, mas esse mínimo não cobre o ambiente completo. Conferir `node --version` e `npm --version` antes de instalar.
- Docker Desktop em execução, usando containers Linux; no Linux também é possível usar Docker Engine com Compose v2. `docker info` e `docker compose version` precisam funcionar no terminal.
- Portas locais **3001** e **8888** disponíveis. O banco usa uma porta dinâmica em loopback. As portas 3000 e 8080 não fazem parte deste projeto.
- Internet na primeira instalação para baixar dependências npm, WordPress/WooCommerce e imagens Docker.

Não é necessário instalar PHP ou MariaDB diretamente no computador. Eles rodam nos containers.

## Primeira instalação

No PowerShell do Windows:

```powershell
git clone https://github.com/Danielfreiman/Katukina.git
cd Katukina
npm.cmd ci
npm.cmd --prefix wordpress ci
npm.cmd run setup:local
npm.cmd run dev
```

No macOS/Linux, os mesmos comandos funcionam substituindo `npm.cmd` por `npm`. O frontend permanece nesse terminal. Abra http://localhost:3001/ e http://localhost:3001/wp-admin/.

`setup:local` copia `.env.example` para `.env.local` somente se o arquivo estiver ausente, inicia o Docker do projeto e configura o WordPress. Também prepara o acesso local, importa os seis produtos e fotos versionados, cadastra empresa/depósito/canal fictícios e habilita checkout e frete de teste para GB, sem cobrança ou expedição. Executa verificações do backend e da origem pública ao terminar. Não é necessário baixar novamente as fotos do site original.

A repetição preserva cadastros já importados e configurações locais posteriores. Ela não esvazia o banco, não executa a migração do painel antigo e não cria saldos físicos de estoque. Se houver conflito de SKU ou moeda diferente de USD, a carga de exemplos falha em vez de converter ou sobrescrever o cadastro.

## Uso diário e atualização

Em dois terminais, ou iniciando primeiro o backend:

```powershell
npm.cmd run wp:start
npm.cmd run dev
```

Para parar, Ctrl+C no frontend e `npm.cmd run wp:stop`. Os dados permanecem no volume Docker. Evitar os comandos de limpeza/destruição do wp-env quando precisar preservar o banco.

Depois de receber alterações:

```powershell
git pull --ff-only
npm.cmd ci
npm.cmd --prefix wordpress ci
npm.cmd run setup:local
```

Interromper o frontend antes de reinstalar dependências e iniciá-lo novamente ao terminar. O painel passa pelo Next.js: se o frontend estiver parado, `/wp-admin/` também não abre. Use `localhost:3001`, sem trocar por `127.0.0.1` no navegador.

## Verificações

Para verificar a instalação com o frontend aberto:

```powershell
npx.cmd playwright install chromium
npm.cmd run wp:verify
npm.cmd run typecheck
npm.cmd test
```

Os testes criam dados sintéticos no WordPress local. Nunca apontá-los para produção. `typecheck` gera `next-env.d.ts` e os tipos de rotas antes da análise, permitindo rodar em um clone sem `.next`; esses arquivos gerados não são versionados. Para validar o build, parar o frontend de desenvolvimento e executar `npm.cmd run build`; `npm.cmd start` inicia esse build na porta 3001. No Linux, o Chromium também pode precisar das bibliotecas do sistema indicadas pelo instalador Playwright.

Opcional, com Python 3: `python -B -m unittest discover -s scripts/tests -v`. Esses testes geram planilhas sintéticas e não dependem dos exports privados.

## O que acompanha o clone

### Catálogo completo de 2026-10-27

**Fotos atualizadas:** o pacote mais recente é `katukina-catalog-edited-2026-10-27.zip`, em `wordpress/backups/`, acompanhado do recibo `.zip.json`. Ele inclui as fotos fornecidas em `Editadas.rar`. Use esse nome no comando de extração abaixo para reproduzir também essa atualização. [Detalhes das imagens](PRODUCT-IMPORT-2026-10-27.md#fotos-editadas-fornecidas-em-2026-10-27).

O código de importação acompanha o Git. O catálogo com **370 produtos, 908 variações, sete rascunhos, imagens e preços USD** exige também o pacote privado `katukina-catalog.zip`. Ele contém os três manifestos de importação e as imagens, incluindo referências comerciais da planilha; não contém contas, senhas, clientes ou pedidos. Não publicar esse pacote no repositório. Para gerar novamente na máquina de origem:

```powershell
python -B scripts/package_product_catalog.py
```

O arquivo e seu recibo SHA-256 ficam em `wordpress/backups/`. Copie ambos para a outra máquina por meio privado. Depois de concluir a **primeira instalação** acima, confira `Get-FileHash` contra o recibo e execute na raiz do clone:

```powershell
Expand-Archive -LiteralPath "C:\caminho\katukina-catalog.zip" -DestinationPath "wordpress\tools\.imports\sacred-incense-uk"
node wordpress/scripts/import-product-workbook.mjs inspect
node wordpress/scripts/import-product-workbook.mjs apply
node wordpress/scripts/import-product-workbook.mjs media
node wordpress/scripts/import-product-workbook.mjs verify
node wordpress/scripts/update-usd-prices.mjs apply
node wordpress/scripts/update-usd-prices.mjs verify
node wordpress/scripts/verify-product-workbook.mjs
```

Use um diretório de importação novo ao extrair. No Linux/macOS, extraia o ZIP para `wordpress/tools/.imports/sacred-incense-uk/` com o descompactador do sistema. A etapa inicial usa o manifesto GBP e a etapa seguinte aplica o snapshot USD do site público; a gravação guarda backups e preserva os seis IDs iniciais. A verificação de navegador exige o Next.js aberto e Chromium instalado. Python 3.10+ é necessário para gerar o pacote ou coletar novos dados; importar o pacote usa Node e PHP do Docker.

A importação e a geração das imagens podem levar vários minutos. Aguarde cada comando terminar com sucesso antes de executar o seguinte; se houver erro, consulte o relatório indicado e não avance para a troca de moeda.

O pacote reproduz o catálogo importado e seu snapshot de preços, sem transferir alterações manuais posteriores ou o histórico operacional da instalação original. Para esse histórico, use banco e uploads conforme a seção abaixo. Para uma nova consulta dos preços públicos, veja [os comandos USD](PRODUCT-IMPORT-2026-10-27.md). As variações permanecem sem disponibilidade física até conciliação do estoque.

Os testes comerciais antigos usam os seis produtos simples de demonstração: execute `npm test` na base de demonstração, antes da importação completa, ou em uma instalação isolada. No catálogo completo, use `verify-product-workbook.mjs` e `update-usd-prices.mjs verify`; eles verificam as variações e os preços USD sem criar compras.

O Git inclui código próprio, os dois lockfiles npm, configuração Docker, documentação e fixtures públicas dos seis produtos. WordPress 7.1.3, WooCommerce 11.2.1 e wp-env 11.17.0 estão fixados; PHP 8.3 e MariaDB 11.4 acompanham correções dessas séries. Portanto o ambiente é reproduzível funcionalmente, sem garantia de imagens binárias idênticas para sempre.

O Git não contém o banco atual, clientes/pedidos, uploads adicionais, exports privados, dashboards com dados pessoais, caches, backups ou credenciais efetivas desta máquina. Clonar recria a base de teste; não sincroniza alterações feitas no painel de outro computador.

Para levar exatamente os dados atuais, é necessário transportar **banco e uploads** separadamente, por meio privado. `npm.cmd run wp:backup` gera um dump SQL em `wordpress/backups/`; esse comando não inclui uploads e não é uma restauração completa. A cópia integral e sua restauração não fazem parte do bootstrap. As fotos das seis amostras são recriadas a partir das fixtures versionadas.

## Verificação em 2026-10-27

Uma cópia dos arquivos preparados para Git foi instalada em diretório separado, sem banco, uploads ou `node_modules` copiados. Node 25.2.1 e npm 11.16.0 instalaram ambos os lockfiles. O bootstrap criou outro banco nas portas 3002/8889 e confirmou WordPress 7.1.3, WooCommerce 11.2.1, PHP 8.3.36, MariaDB 11.4.13, HPOS, bloqueio de e-mail, noindex e API loopback HTTP 200. Falhas temporárias de DNS nos downloads foram resolvidas repetindo o comando. Ensaio realizado no Windows; macOS/Linux não foram executados.

Typecheck, build com Next.js 16.4.3, 13 testes Python e sintaxe dos 32 arquivos PHP próprios passaram. Os lockfiles receberam correções compatíveis. `npm audit` do frontend retornou zero alertas; o de `wordpress/` ainda apontou seis nas ferramentas locais de desenvolvimento (três moderados, um alto e dois críticos, nas cadeias de `simple-git`/`@simple-git/argv-parser` e `qs`). A correção automática sugerida envolve wp-env 12, uma atualização principal ainda não validada neste projeto. Não executar `npm audit fix --force` como parte da instalação documentada.

Na base nova com seis amostras, os nove testes Playwright passaram juntos (6,2 minutos): login e origem única, telas complementares em inglês, produtos/variações, pedidos/configurações, permissões e reserva concorrente, checkout com repetição, preservação de endereço durante carregamento, conta/privacidade e páginas responsivas/SEO. O catálogo principal em USD também passou pela verificação de navegador após a atualização do frontend.

O ZIP privado foi extraído nessa mesma instalação e importado sem copiar o banco original: 370 produtos, 908 variações e sete rascunhos, todos com imagens; 2.405 linhas da fonte reconciliadas, seis IDs iniciais preservados e nenhum SKU duplicado. A aplicação dos 908 preços USD passou sem divergências nem alteração do histórico operacional. Um teste com preço propositalmente divergente confirmou saída de erro do verificador, sem alteração do banco e com o arquivo de entrada restaurado em seguida.

Após a recuperação, a verificação de navegador também passou: API pública em USD com imagem, login, lista Products, editor nativo de variações e referências da planilha. Os serviços temporários de verificação foram parados após o ensaio, preservando os volumes.

## Problemas comuns

- **Docker indisponível:** abrir Docker Desktop, aguardar `docker info` funcionar e repetir `setup:local`.
- **Porta ocupada:** identificar o processo; não encerrar serviços de outros projetos. O guia usa as portas padrão. Alterá-las exige alinhar o frontend, `.env.local` e `.wp-env.json`.
- **Painel ou variações não carregam:** iniciar `wp:start` e depois `dev`; o wrapper corrige `WP_SITEURL` para a origem pública após iniciar os containers.
- **Login falha:** consultar `wordpress/.local-access.json`. Uma instalação antiga pode ter uma senha diferente da demonstração.
- **Falha no download inicial:** verificar internet/proxy e repetir. As dependências e os volumes existentes são preservados.
- **Produtos sem estoque físico:** os exemplos não contêm saldos migrados. Isso é esperado; não é uma autorização para operar comercialmente.
