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

O Git inclui código próprio, os dois lockfiles npm, configuração Docker, documentação e fixtures públicas dos seis produtos. WordPress 7.1.3, WooCommerce 11.2.1 e wp-env 11.17.0 estão fixados; PHP 8.3 e MariaDB 11.4 acompanham correções dessas séries. Portanto o ambiente é reproduzível funcionalmente, sem garantia de imagens binárias idênticas para sempre.

O Git não contém o banco atual, clientes/pedidos, uploads adicionais, exports privados, dashboards com dados pessoais, caches, backups ou credenciais efetivas desta máquina. Clonar recria a base de teste; não sincroniza alterações feitas no painel de outro computador.

Para levar exatamente os dados atuais, é necessário transportar **banco e uploads** separadamente, por meio privado. `npm.cmd run wp:backup` gera um dump SQL em `wordpress/backups/`; esse comando não inclui uploads e não é uma restauração completa. A cópia integral e sua restauração não fazem parte do bootstrap. As fotos das seis amostras são recriadas a partir das fixtures versionadas.

## Problemas comuns

- **Docker indisponível:** abrir Docker Desktop, aguardar `docker info` funcionar e repetir `setup:local`.
- **Porta ocupada:** identificar o processo; não encerrar serviços de outros projetos. O guia usa as portas padrão. Alterá-las exige alinhar o frontend, `.env.local` e `.wp-env.json`.
- **Painel ou variações não carregam:** iniciar `wp:start` e depois `dev`; o wrapper corrige `WP_SITEURL` para a origem pública após iniciar os containers.
- **Login falha:** consultar `wordpress/.local-access.json`. Uma instalação antiga pode ter uma senha diferente da demonstração.
- **Falha no download inicial:** verificar internet/proxy e repetir. As dependências e os volumes existentes são preservados.
- **Produtos sem estoque físico:** os exemplos não contêm saldos migrados. Isso é esperado; não é uma autorização para operar comercialmente.
