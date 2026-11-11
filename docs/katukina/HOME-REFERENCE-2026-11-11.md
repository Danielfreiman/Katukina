# Home: reprodução da estrutura visual de referência

## Pedido confirmado e precedência

O responsável rejeitou a adaptação aproximada e pediu reproduzir o layout da home do iHerb, mantendo o header e o footer atuais. Confirmou explicitamente que o escopo é somente a página inicial. Esta instrução substitui a composição anterior da home e a exigência anterior de hero ocupando toda a primeira tela. As formas arredondadas da referência são aplicadas somente dentro de `.reference-home`; as demais páginas e a navegação permanecem intactas.

## Referência inspecionada

- URL pedida: https://ml.iherb.com/.
- Acesso automatizado inicial bloqueado. O responsável concluiu manualmente a verificação na janela do Edge e autorizou continuar na mesma sessão.
- A sessão liberada estava em https://br.iherb.com/, em português, com região Brasil. Esta é a versão efetivamente capturada, não uma alegação de inspeção de outra variante regional.
- Capturas locais ignoradas pelo Git: `artifacts/iherb-authorized-desktop.png`, `artifacts/iherb-authorized-mobile.png`; texto e estrutura pública na mesma pasta. Inspeção visual de 2026-11-11, sem acesso ao backend privado.

## Correspondência de composição

| Posição da referência                                     | Home Katukina                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Dois banners 4:3, gap de 16 px, setas laterais e contador | Carrossel de campanhas com imagens Katukina; dois cartões no desktop e um em telas menores |
| Faixa de personalização com acesso à conta                | Faixa com acesso real à conta                                                              |
| Bloco de confiança em fundo suave com quatro cartões      | Orientação de compra com links reais; sem certificações ou promessas de terceiros          |
| Vitrine de ofertas em seis colunas                        | Categoria Exclusive Sale; preços e descontos provenientes do WooCommerce                   |
| Oito categorias circulares e chips horizontais            | Categorias reais da Katukina, ícones e links funcionais                                    |
| Segunda vitrine horizontal                                | Discover Katukina                                                                          |
| Vitrine por abas, seis colunas e múltiplas linhas         | Shop by collection, com até 18 produtos por categoria e teclado nas abas                   |
| Banner institucional, quatro cartões e círculos abaixo    | Nature. Culture. Connection., com links de descoberta                                      |
| Novidades                                                 | Produtos ordenados por data no catálogo                                                    |
| Faixa de cartões de produto em fundo ilustrado            | From the collection com kenê; sem inventar vendas em tempo real ou países de compradores   |
| Faixa editorial com cartão central                        | Links reais de conteúdo e coleções; cartão The journal                                     |
| Faixa de relacionamento                                   | Acesso à inscrição existente                                                               |
| Repetição do bloco de confiança                           | Repetição da orientação de compra                                                          |

A reprodução é da composição e dos componentes; conteúdos, imagens e cores de marca pertencem à Katukina. Avaliações só aparecem quando o catálogo informa avaliações reais. Não foram copiados descontos, selos, testemunhos ou afirmações médicas do iHerb. Não se declara identidade pixel a pixel entre imagens e textos diferentes.

## Implementação

- `app/page.tsx`: consultas limitadas e montagem dos módulos.
- `app/reference-home.css`: estilos integralmente limitados à home, margem desktop de 32 px, seções, seis colunas e responsividade.
- `components/home/reference-widgets.tsx`: carrossel com pausa e movimento reduzido, vitrines com controles e limites, cards e abas acessíveis.
- Falhas de consulta têm estados vazios com caminho para a loja. Nenhuma alteração em estoque, preço ou checkout.
- Header/footer registrados por hash antes da implementação para conferir preservação. O histórico anterior da árvore e logo do rodapé permanece válido.

Validações e eventuais limitações de execução são registradas no CHANGELOG. Sem push ou publicação nesta tarefa.
