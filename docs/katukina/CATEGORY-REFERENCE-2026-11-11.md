# Estrutura das páginas de categoria — 2026-11-11

## CONFIRMADO

O responsável pediu estender às páginas de categoria a reprodução estrutural do iHerb feita na home, preservando os filtros. Referência observada na sessão de navegador liberada pelo responsável: https://br.iherb.com/c/supplements (a sessão originalmente aberta em ml.iherb.com foi redirecionada para Brasil).

Aplicação limitada a `/collections/[slug]`: título compacto, campanha horizontal, atalhos circulares de subcategorias ou categorias irmãs, quatro produtos por linha no desktop, cards abertos com fotos sobre fundo suave, faixa de assinatura entre produtos e conteúdo editorial antes da paginação. As cores, imagens, preços, disponibilidade e conteúdo são da Katukina. Não é uma cópia literal dos anúncios ou dados comerciais do iHerb.

`CategoryDiscovery` consulta categorias e produtos pela integração existente, somente para leitura. Os atalhos preservam os parâmetros de consulta e reiniciam a paginação, como os links existentes da lateral. O CSS novo é restrito a `.category-reference`; `/shop` mantém a composição anterior.

Filtros, busca lateral, ordenação, quantidade por página e paginação continuam usando os componentes e regras existentes. Hashes de `catalog-controls.tsx`, `catalog-query.ts`, header e footer foram comparados antes/depois e permaneceram iguais. As formas arredondadas solicitadas pela referência ficam restritas à nova composição, ampliando a exceção visual anteriormente limitada à home.

## Validação executada

- `npm.cmd run typecheck`, `npm.cmd run build` e `git diff --check`: aprovados.
- Playwright/Edge: categoria Giftshop com 12 e 24 produtos, ordenação por preço, próxima página, busca lateral com resultado e sem resultados, abertura/fechamento dos filtros móveis e ausência dos novos módulos em `/shop`.
- Imagens carregadas e ausência de overflow horizontal em 1440, 1024, 768, 390 e 320 px; quatro colunas confirmadas em 1440 px.
- Evidências locais ignoradas pelo Git: `artifacts/iherb-category-desktop.png`, `artifacts/reference-category-*.png` e `artifacts/category-preserved-files.json`.
- Servidor de desenvolvimento reiniciado após o build na porta 3001.

## Limites

Sem alterações de banco, estoque ou checkout. Campanhas e textos foram adaptados aos conteúdos disponíveis, sem inventar descontos, avaliações ou volume de vendas. Sem commit/push nesta tarefa.
