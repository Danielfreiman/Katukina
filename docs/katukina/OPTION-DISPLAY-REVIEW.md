# Revisão global dos rótulos das opções — 2026-11-03

**CONFIRMADO pelo responsável:** exibir nas variações somente as diferenças úteis à escolha, usando Palo Santo beads como exemplo. A revisão consultou os 370 produtos variáveis publicados e suas 908 variações na Store API local, além do manifesto de importação.

## Resultado

- Nos 222 produtos sem a seleção Type/Weight, remover sufixos de unidade redundantes, organizar as diferenças e ordenar as opções naturalmente. Em 43 deles, especificações comuns ficam em uma linha única acima das opções.
- Nos 37 produtos com um único Type, mostrar os pesos diretamente; o tipo fica como informação comum, sem exigir uma seleção redundante.
- Nos demais produtos Type/Weight, manter a escolha em duas etapas e somente combinações existentes.
- Em 18 produtos com uma única variação e rótulo técnico `Form <código>`, mostrar `Single option`. O código original continua no cadastro e o SKU permanece associado à seleção.

| Caso revisado | Opções exibidas | Informação comum preservada |
| --- | --- | --- |
| Palo Santo beads | 25 beads, 50 beads, 100 beads | Madeira, 9 mm, um pacote |
| Óleos com a mesma embalagem | 5 ml, 10 ml | Frasco com pipeta |
| Shipibo Sticker | 135 x 135 mm, 190 x 190 mm | Poliéster e acabamento fosco |
| Colares cerâmicos | Cream, Light blue, Pink | Cerâmica com tampa de cortiça |
| Bundles com mesmo material | Large, Medium, Small | Material comum |
| Sananga Drops | Intensidade 3 of 10, 6 of 10, 9 of 10 | Volume de 5 ml |
| Produtos com um único tipo e vários pesos | Pesos em ordem crescente | Tipo, mostrado uma vez |

## Regras de preservação

A transformação é de exibição: não altera atributos originais, IDs, SKUs, estoque, imagens ou preços no WooCommerce. Cor, material, tamanho, peso, volume, intensidade e quantidade por embalagem diferentes continuam explícitos. Embalagens diferentes (por exemplo, frasco com spray versus frasco comum) não são removidas. Nomes comerciais como Flowers of Life continuam completos.

Vírgulas decimais são preservadas. A extração usa campos e frases comuns a todas as opções do produto, mantendo contexto em vez de descartar especificações. Rótulos que colidiriam após simplificação voltam à redação original. Não atribuir características aos registros sem descrição: `Single option` informa somente que há uma opção cadastrada.

## Verificação e reprodução

```powershell
node scripts/audit-option-display.mjs
node --test lib/commerce/option-display.test.mjs
npm.cmd run typecheck
```

O auditor exige o site local ativo e grava `artifacts/option-display-audit.json`, ignorado pelo Git, com antes/depois por produto, contexto comum e IDs. Confere contagens, ausência de colisões e preservação de valores numéricos; `--details` imprime a comparação.

Executados: revisão global, cinco testes de transformação e TypeScript. No Chromium, conferidos beads com preço/SKU/recarga/mobile, volumes, dimensões, pesos sem passo de tipo e opção única. O relatório trata das variações publicadas; os sete rascunhos sem associação confirmada não têm opções públicas a simplificar.
