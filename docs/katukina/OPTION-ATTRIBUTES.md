# Tipo e peso das variações — 2026-11-03

## Decisão confirmada

O responsável solicitou separar o tipo do peso no backend. Usar dois atributos locais nativos do WooCommerce, **Type** e **Weight**, no editor Products/Variations. Exemplo: `Cut & sifted` combinado com `25 g`, `50 g` ou `100 g`. Só existem as combinações efetivamente cadastradas; não gerar automaticamente o produto cartesiano nem pesos adicionais.

Um único campo Presentation dificultava a manutenção. Atributos separados permitem editar cada dimensão no WooCommerce, sem criar cadastros paralelos. O nome de consumo continua compacto na vitrine: `Cut & sifted · 100 g`.

## Escopo e critérios

- Migrar somente produtos do catálogo importado cujas opções têm peso explícito no fim da descrição e venda de uma unidade. Normalizar `gr` para `g`, mantendo a unidade em cada valor.
- Preservar o produto inteiro quando houver opções ambíguas, combinações duplicadas, volumes, medidas de comprimento ou embalagens múltiplas. Essas descrições exigem classificação própria; volume não é peso.
- Manter IDs, SKUs, preços, moeda, imagens, disponibilidade, saldo, peso logístico, dimensões de frete e metadados de origem. Não inferir peso de envio a partir do peso da embalagem comercial.
- Usar a seleção nativa de variações: cada par Type/Weight deve resolver para o mesmo ID anterior. Preservar a opção padrão, quando houver.

## Executar localmente

Após importar o catálogo e os preços USD, com Docker ativo:

```powershell
node wordpress/scripts/split-option-attributes.mjs inspect
node wordpress/scripts/split-option-attributes.mjs apply
node wordpress/scripts/split-option-attributes.mjs verify
```

`inspect` prepara o plano e confere o banco sem modificá-lo. `apply` salva backup SQL, estado dos atributos e opções padrão, usa trava de importação e transação, e verifica a resolução de todas as variações e os dados protegidos antes do commit. Repetir `apply` preserva os atributos já migrados. Alterações divergentes no catálogo interrompem o comando para reconciliação.

Plano, estado, recibo do backup e relatório ficam em `wordpress/tools/.imports/sacred-incense-uk/option-attribute-*.json`, ignorados pelo Git. O SQL fica em `wordpress/backups/`.

Reversão dos atributos, com guarda contra alterações posteriores:

```powershell
node wordpress/scripts/split-option-attributes.mjs rollback
```

A reversão usa os atributos e opções padrão originais, preservando IDs. Se os dados protegidos mudaram, reconciliar primeiro; não restaurar indiscriminadamente o banco sobre operações posteriores. O verificador histórico GBP do importador original é anterior a esta migração: usar o novo `verify` para os atributos e `update-usd-prices.mjs verify` para preços.

## Verificações

Testes do planejamento: `node --test wordpress/scripts/option-attribute-plan.test.mjs`. Cobrem corte fino, unidades de massa, valores decimais, exclusão de volumes e pacotes múltiplos, e combinações duplicadas. TypeScript: `npm.cmd run typecheck`. Validar também o editor nativo e a vitrine após aplicar.

Execução local confirmada em 2026-11-03: 148 produtos e 377 variações migrados; 222 produtos preservados por estarem fora dos critérios. `apply`, `verify` e repetição de `apply` passaram. A seleção nativa de todas as 377 combinações resolveu para os mesmos IDs, e o snapshot dos dados protegidos permaneceu igual. Os 908 preços USD passaram na verificação existente. Testes do plano e TypeScript passaram. Chromium confirmou os campos separados Type/Weight no editor de Emburana bark e suas 11 opções na vitrine. Reversão disponível, mas não executada nesta validação.
