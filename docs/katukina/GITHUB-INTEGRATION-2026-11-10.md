# Integração com GitHub — 2026-11-10

- CONFIRMADO: responsável solicitou commit e push na `main` e forneceu a autoria Daniel Freiman. Configuração aplicada somente ao repositório local.
- Alterações locais preservadas no commit `2b143b5`: navegação, busca dinâmica, opções de produtos, integração de estoque, ferramentas de fotos e documentação.
- Incorporados sete commits remotos até `666dcd2`, com merge automático em `b8c2883`. Preservados os novos assets, cards de categorias, carrossel e ajustes da home.
- Typecheck, dois testes Playwright de busca e o teste da vitrine aprovados após integração. O teste da vitrine teve a expectativa de título atualizada para acompanhar o texto remoto.
- Pendência observada no remoto: o verificador de paleta rejeita `#3b2619`, usado como overlay do hero de incenso em `app/globals.css`. Mantido o visual remoto; não foi ampliada a lista de cores aprovadas para ocultar a divergência.
- Banco, credenciais efetivas, uploads de produtos e backups continuam ignorados pelo Git. O push do código não transfere esses dados locais.
