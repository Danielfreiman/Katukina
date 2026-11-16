> **Paleta oficial reafirmada por Danilo em 16/11/2026:** aplicar urucum `#782E26`, verde folha `#526B35`, branco quente `#F7F7F2`, cinza claro `#D3D4CF`, cinza médio `#595957` e carvão `#292C27` em toda a vitrine, mantendo a identidade xamânica e a estrutura moderna. Esta instrução substitui as cores esmeralda/amarelo/pastéis do primeiro teste Zilly. Branco quente volta a ser o fundo predominante; branco puro permanece disponível nas fotos e superfícies preexistentes. Urucum identifica ações principais; verde folha sustenta navegação e apoio. Fundos lisos, sem pattern, conforme pedido posterior de Danilo. O visual antigo continua preservado.

---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/modern-home.css","app/modern-storefront.css","components/site/header.tsx","components/site/footer.tsx"]
---

# Vitrine moderna — 2026-11-16

Modo: Persuade na home; Operate no catálogo, produto e compra. Escopo: frontend público Next.js.

## Evidências e status

- **CONFIRMADO:** Danilo solicitou substituir toda a estética usando Zilly Home 05, autorizando inclusive novas cores. As sete capturas fornecidas em 16/11/2026 são a referência visual verificável; a leitura automatizada do endereço falhou na tentativa anterior.
- **CONFIRMADO:** usar os produtos existentes nas seções da referência. Preservar fotos, nomes, preços, apresentações e contratos do WooCommerce.
- **IMPLEMENTADO LOCALMENTE:** hero, três campanhas, faixa de descoberta, destaques, categorias com foto, banners horizontais, vitrine com campanhas laterais, novos produtos com card maior, seleção lateral, ofertas disponíveis, abas, jornal e orientação de compra. Header e footer compartilhados; novo tema em todas as rotas públicas.
- **A VALIDAR:** aprovação visual final pelo responsável. Implementação e tokens são escolhas de frontend reversíveis autorizadas pelo pedido; não representam novas políticas comerciais.
- **BLOQUEADO (fora deste escopo):** gateway real e migração legada mantêm as dependências documentadas. A reformulação visual não exige alterações nesses sistemas.

## Direction contract

THESIS: traduzir a composição comercial do Zilly Home 05 para os botânicos e objetos Katukina; usar as fotos e os produtos reais como foco das vitrines.

OWN-WORLD: esmeralda e amarelo com fundo branco, imagens sobre verde muito claro, campanhas lavanda/manteiga/menta/pêssego/azul. Busca ampla, controles arredondados, títulos com regra horizontal e cards leves.

STORY: descobrir uma categoria ou produto, entender preço e disponibilidade e chegar às opções reais de compra; explorar histórias e informações de entrega.

FIRST VIEWPORT: faixa verde de destino, header branco com logo, busca e conta/carrinho, navegação branca; hero claro com título à esquerda e foto real de Palo Santo à direita, com produto complementar. Ação principal verde; três campanhas abaixo. No celular a leitura e o produto empilham.

FORM: seed: none (pinned). Referência fixada pelas capturas e pelas palavras de Danilo: “Quero que faça as seções desse jeito usando os produtos que temos”. Implementação direta em código a partir da referência fornecida, sem gerar uma imagem alternativa do layout. Navegação dos trilhos e abas por teclado preservada; zoom de imagem somente com ponteiro preciso e sem movimento reduzido.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Limites

Nenhuma alteração no WordPress, estoque, autenticação ou contratos comerciais. Não adicionar avaliações, descontos, frete grátis, garantia ou atendimento 24h sem dados existentes. Fotos reutilizadas da mídia WooCommerce e de `public/images/`, sem criar representações fictícias de produtos. Histórico anterior de paleta fica preservado em PALETTE.md; a solicitação desta data passa a governar o tema público.

## Validação

Validações técnicas abaixo; aprovação visual pelo responsável permanece pendente.

### Resultados executados

- `npm.cmd run typecheck`: aprovado.
- Playwright: 10 testes aprovados cobrindo checkout (inicialização combinada e separada), busca real e estados vazio/erro, filtros/ordenação/paginação, home, produto/variações/galeria, carrinho lateral e navegação. Home conferida em 1780, 1440, 1024, 768, 390 e 320 px.
- Após correções finais: teste da home novamente aprovado, incluindo ausência de erros no console e imagens carregadas. Produtos presentes em várias categorias são deduplicados nos destaques.
- `npx.cmd next build --webpack`: aprovado após ajustes finais. O comando padrão com Turbopack falhou ao carregar seu banco de persistência local (`invalid digit found in string`); não foi alterado nem apagado o cache preexistente. Primeira tentativa Webpack no sandbox não conseguiu acessar fontes; execução com acesso à rede autorizada pelo revisor automático concluiu.
- Inspeção local das rotas `/shop`, `/account`, `/cart`, `/checkout`, `/journal`, `/about`: HTTP 200 e ausência de overflow em 1440/390 px. Conta e carrinho/checkout vazios recapturados após concluírem o carregamento.
- Revisão visual independente: disposição **SHIP** restrita aos três achados corrigidos — legibilidade do preço da campanha lateral, foco amarelo nas superfícies verdes e CTAs das coleções. Capturas atuais em `.impeccable/review/desktop.png` e `mobile.png`; capturas internas em `artifacts/modern-*.png`.
- Sistema visual extraído em `DESIGN.md` e `.impeccable/design.json`. Raster reutilizado: mídia do catálogo WooCommerce e imagens locais preexistentes; nenhum raster criado ou alterado.

Limite: a vitrine reflete o estoque disponível no backend local (produtos indisponíveis permanecem identificados). Aprovação visual do responsável e publicação não fazem parte das validações técnicas.

- Teste geral `tests/storefront.spec.ts`: aprovado com `--timeout=180000` (execução de 1,1 min), incluindo rotas públicas, canonical/JSON-LD/idioma, respostas 404, robots, sitemap e navegação móvel. Tentativas anteriores tiveram um HTTP 500 transitório em `/shop` e limite agregado de 60 s durante o sitemap; a repetição completa confirmou as verificações sem modificar código do backend ou do sitemap.
