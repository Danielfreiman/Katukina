# Alternar o visual da Katukina

Na raiz do projeto:

```powershell
npm.cmd run visual:antigo
npm.cmd run visual:novo
npm.cmd run visual:status
```

Recarregue `http://localhost:3001/` após trocar. O servidor de desenvolvimento atualiza os arquivos automaticamente. Em produção, a troca exige novo build e reinício.

O visual **antigo** parte exatamente do commit `b20fada`, anterior ao redesign. O **novo** contém a direção Zilly de 16/11/2026. Os snapshots `.txt` preservam home, layout, header, footer e widgets; a extensão evita que o Next.js os trate como rotas ou código ativo.

Antes de mudar, o comando salva os arquivos ativos no snapshot correspondente. Assim, ajustes feitos enquanto testa cada versão permanecem disponíveis na próxima troca. Execute um comando de cada vez e aguarde sua conclusão.

Folhas CSS antigas e novas continuam no projeto. O layout antigo não importa `modern-storefront.css`, e sua home importa `reference-home.css`; o novo usa as folhas `modern-*`. Os demais arquivos e o catálogo WooCommerce são compartilhados. Alterações futuras nesses arquivos compartilhados afetarão ambas as versões; esta ferramenta alterna a apresentação, não é backup do banco nem isolamento completo de branches.

O arquivo `active.json` registra a versão ativa. Mantenha esta pasta e `scripts/switch-visual.mjs` junto ao projeto. O comando lê todos os snapshots antes de escrever, salva a versão de origem e restaura os arquivos ativos se uma troca falhar. Não executa reset, clean, checkout nem exclusões do Git.
