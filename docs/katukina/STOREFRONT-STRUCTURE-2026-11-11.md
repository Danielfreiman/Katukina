# Estrutura da vitrine — referência iHerb

## Pedido confirmado

Em 2026-11-11, o responsável pediu adaptar o frontend da Katukina a partir de engenharia reversa da estrutura pública de https://ml.iherb.com/. Escopo aplicado: navegação compartilhada, descoberta de categorias e organização comercial da home. Mantidos Next.js, WooCommerce como fonte autoritativa, fotos, paleta, kenê e a primeira dobra com altura de tela.

## Evidência observada

Leitura do HTML público da referência em 2026-11-11: busca com sugestões; departamentos e subdivisões; conta e carrinho; vitrines de produtos; acessos a frete e atendimento. Não houve acesso ao código-fonte privado, dados de clientes ou backend da referência. A adaptação é uma implementação própria dos padrões observados.

| Padrão observado | Adaptação Katukina |
| --- | --- |
| Busca como elemento central | Campo permanente no desktop e segunda linha no celular, reutilizando sugestões reais e cancelamento de requisições |
| Navegação de departamentos | All categories abre painel com categorias publicadas e contagens do WooCommerce; menu mobile inclui o mesmo catálogo |
| Home com caminhos comerciais | Categorias antes da vitrine geral, seguidas por vitrines de Sacred Incense e Shamanic Tools |
| Listas horizontais | Cards existentes com preço e disponibilidade, rolagem por toque/teclado e controles no desktop |
| Orientação ao comprador | Links reais para coleções, frete e conta |

Catálogo e detalhes de produto continuam usando os filtros, seleção de variações e ações de compra existentes. Não foram inventados descontos, avaliações, rankings de vendas, recompensas ou promessas comerciais da referência. Rodapé e páginas transacionais mantêm seus fluxos.

## Implementação e limites

- Estilos da adaptação isolados em `app/storefront.css`, carregados após os estilos existentes. Quinas retas e tokens da marca preservados.
- Categorias carregadas no layout servidor com fallback, reutilizando a consulta cacheada por renderização; listas de produtos permanecem limitadas a oito por vitrine.
- Falhas de categorias preservam link para coleções; vitrines específicas sem dados não exibem produtos fictícios. Busca mantém mensagem de indisponibilidade e envio normal para `/shop`.
- Escape fecha sugestões mantendo foco; menu de categorias devolve foco ao acionador. Preferência por movimento reduzido respeitada.
- Sem mudanças em banco, estoque, preços, impostos ou contratos comerciais. Sem publicação ou push nesta tarefa.

## Aceite

Verificar busca real, respostas atrasadas, navegação por teclado, menu completo, abertura de categoria, vitrines horizontais, ausência de overflow da página em 1440/1024/801/390/320 px e rotas públicas. Registrar somente verificações executadas no histórico.
