# PDP — composição da referência integrada à Katukina

## CONFIRMADO

Em 2026-11-11, o responsável solicitou engenharia reversa da PDP do iHerb, mesclando com o que já existe na Katukina. Escopo: composição da página de produto, sem mudança de regras de compra ou estoque.

Referência inspecionada na sessão de navegador liberada pelo responsável: [PDP Doctor's Best, magnésio, iHerb Brasil](https://br.iherb.com/pr/doctor-s-best-high-absorption-magnesium-lysinate-glycinate-chelated-albion-traacs-240-tablets-100-mg-per-tablet/16567). Evidências locais: `artifacts/iherb-pdp-text.txt`, `artifacts/iherb-pdp-desktop.png` e `artifacts/iherb-pdp-top-wide.png`.

## Implementação

- Desktop amplo: galeria à esquerda, título/opções/dados principais ao centro e resumo de compra à direita. Tablet com duas colunas; celular com sequência vertical.
- Galeria original com zoom, miniaturas, teclado e troca de imagem por variação preservados. Cantos e controles alinhados à home e categorias.
- Mantidos os swatches com pattern, escolhas por tipo/peso/volume, limpeza de seleção e persistência de variação na URL. Preço, disponibilidade, SKU, limites de quantidade, botão de compra e aviso de reposição usam as regras existentes.
- Resumo de compra com preço e quantidade destacados, orientação de entrega e link para destinos. Sem inventar assinatura comercial, garantia, desconto, certificação ou volume de vendas. Avaliação agregada aparece somente quando o catálogo fornece nota e contagem reais; não foram criadas avaliações de clientes.
- Navegação por âncoras para informações, especificações e relacionados. Descrição usa o texto completo quando disponível e o resumo como alternativa. Especificações continuam derivadas do produto e de seus atributos.
- CSS restrito a `.pdp-reference`. Header, footer, backend, fotos e integração de carrinho permanecem os existentes. Alterações anteriores do banner de categoria foram preservadas.

## Validação

- Typecheck, build de produção e diff-check aprovados. Servidor de desenvolvimento reiniciado na porta 3001 após o build.
- Playwright/Edge com Palo Santo beads: escolha de variação, preço, URL, histórico, reload, zoom com Escape/retorno de foco, limpeza de seleção, botão indisponível e âncoras. Sem erros de JavaScript.
- Cinco larguras verificadas: 1440, 1024, 768, 390 e 320 px, sem overflow horizontal; três colunas confirmadas em desktop amplo. Evidências em `artifacts/reference-product-*.png`.
- Teste de integração existente ajustado para localizar o novo painel `Purchase summary`. O cenário legado completo com criação de fixtures e mutações no carrinho não foi executado nesta tarefa; a lógica de adição não foi modificada.

## Limites

Composição adaptada, não cópia literal do conteúdo comercial do iHerb. Assinaturas recorrentes, Q&A e publicação de avaliações não foram implementadas. Sem commit/push nesta tarefa.
