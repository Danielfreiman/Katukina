# Catálogo de exemplo local

Versão 0.1 · 2026-10-19 · Origem: pedido explícito para acessar katukina.com e cadastrar alguns produtos no WordPress novo.

**CONFIRMADO:** seis produtos simples publicados no WooCommerce local, cada um representando uma apresentação observada no site público. Foram copiados nomes, fotos, códigos, categorias e preços unitários exibidos; as descrições são resumos próprios. Os IDs de Item e Item Form ficam separados em metadados, sem implementar o modelo completo de domínio.

| Produto / fonte pública | SKU de origem | Apresentação selecionada | Preço observado (USD) | ID local |
| --- | --- | --- | --- | --- |
| [Palo Santo](https://katukina.com/products/sacred-incense/sacred-incense-palo-santo) | 1809-4055 | Pó de madeira, pote 60 ml, 15 g | 2.67 | 17 |
| [Myrrh](https://katukina.com/products/sacred-incense/sacred-incense-myrrh) | 1805-3840 | Resina do Quênia, pote 60 ml, 35 g | 6.00 | 19 |
| [Benzoe](https://katukina.com/products/sacred-incense/sacred-incense-benzoe) | 1871-4094 | Resina, pote 60 ml, 40 g | 9.33 | 21 |
| [Harmony](https://katukina.com/products/sacred-incense/sacred-incense-harmony) | 1816-3851 | Mistura botânica, pote 60 ml, 20 g | 8.00 | 23 |
| [Incense Burning Set](https://katukina.com/products/incense-herbs/incense-burning-set) | 1721-3586 | Kit completo | 3.20 | 25 |
| [Charcoal Discs](https://katukina.com/products/sacred-incense/charcoal-discs) | 1518-3066 | Tubo com 10 discos de 33 mm | 2.67 | 27 |

As páginas foram abertas ao vivo; valores podem mudar. O kit mostrava preço promocional: registrou-se o valor exibido sem inventar preço anterior ou vigência. USD já era a moeda padrão desta instalação e coincidiu com a apresentação das páginas consultadas; nenhuma conversão foi feita. Isso não define a moeda comercial definitiva nem altera a informação histórica de GBP no legado.

**A VALIDAR:** preços finais por canal/destino, impostos, embalagem/peso para frete e disponibilidade real. Não foram importados saldos, lotes, clientes, pedidos, pagamentos ou todas as variantes. `manage_stock=false` e disponibilidade demonstrativa servem somente à vitrine local; não representam inventário. O bootstrap atual habilita checkout fictício local, sem cobrança nem expedição; a indexação permanece desativada.

## Reprodução e preservação

- Manifesto: `wordpress/tools/fixtures/catalog-samples.json`, com URL, data, IDs de origem, apresentação, preço e imagem por registro.
- Seis JPEGs de origem preservados em `wordpress/tools/fixtures/images/`; mídia importada na biblioteca WordPress, servida pela origem local.
- Importador: `wordpress/tools/import-catalog-samples.php`. Executa somente via WP-CLI em ambiente `local`, exige moeda coincidente, detecta conflito de SKU e preserva cadastros já concluídos. Uma falha durante a importação deixa o produto incompleto como rascunho, permitindo retomada.
- Metadados privados `_katukina_sample_*` registram origem e caráter demonstrativo; `_katukina_legacy_item_id` e `_katukina_legacy_form_id` preservam identidades distintas.

Para um clone novo, seguir [LOCAL-SETUP.md](LOCAL-SETUP.md); `npm.cmd run setup:local` já importa essas amostras e as fotos versionadas. Não depende de baixar novamente as imagens do site original. Para executar somente o importador, com Docker e configuração local prontos, na raiz:

```powershell
npm.cmd run wp:env -- run cli wp eval-file /var/www/html/wp-content/katukina-tools/import-catalog-samples.php
```

Reexecutar não duplica nem sobrescreve produtos já importados. Para retirar uma amostra, movê-la para a lixeira no painel após confirmar o SKU; remover a mídia apenas quando não estiver em uso. Não existe sincronização automática com o site de origem. Esta carga é uma amostra para desenvolvimento, não uma migração completa.

Aceite: seis SKUs únicos, seis imagens locais, valores iguais ao manifesto, produtos presentes na Store API e no HTML Next.js, página de produto e busca funcionando. A edição posterior deve ser feita pelo WooCommerce e refletida na vitrine pela API.
