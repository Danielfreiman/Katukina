# Conciliação com o GitHub — 2026-11-09

**CONFIRMADO:** o responsável pediu atualizar o projeto após a auditoria das diferenças locais/remotas. A branch `main` avançou de `7ade880` para `ea340e8`, incorporando os 16 commits disponíveis em `origin/main`. Nenhuma publicação ou push foi realizado.

## Preservação e decisões

As 25 alterações em arquivos rastreados e os 37 arquivos novos foram salvos no stash `backup-local-before-github-update-2026-11-09`, objeto `42549923e71c56ef6f91313b11a5aa4f42f2d188`. O stash continua disponível como recuperação. A atualização foi fast-forward; as alterações locais foram reaplicadas e os conflitos resolvidos sem restaurar banco, importar catálogo ou trocar mídias.

- A home usa a composição mais recente do GitHub: campanhas em carrossel, autoplay/pausa, grade de oito produtos, Sora/Source Sans 3, paleta aprovada e urucum reservado a ações prioritárias. A home editorial de 4 de novembro é histórica e recuperável no stash; `app/home.css` foi preservado, mas não está importado pela home atual.
- Kenê permanece na faixa de história com largura total; o pattern local sutil nos swatches foi mantido.
- Melhorias locais de opções por tipo/peso/volume, nomes legíveis, busca e simplificação de filtros foram preservadas.
- Recebimento por SKU, integração bidirecional do estoque e seus testes foram preservados no backend nativo.
- Fotos com marca d’água e exclusão das antigas permanecem no estado já aplicado. Os scripts locais passam a usar o planejador de fotos e o backup versionados recebidos do GitHub. A documentação distingue pacotes históricos das fotos vigentes.
- Changelog e índice mantêm os registros dos dois ambientes; diferenças históricas de contagens de mídias não foram tratadas como inventários idênticos.

## Validação executada

- `npm.cmd run typecheck` e `npm.cmd run build`: aprovados.
- `node scripts/check-palette.mjs`: tokens, cores e contraste aprovados.
- 16 testes Node de opções e planejador de fotos: aprovados.
- Backend: 125 verificações operacionais/nativas/comunicação/estoque aprovadas, usando fixtures locais.
- Playwright/Edge: vitrine e recebimento/estoque aprovados (2 testes).
- Conferência adicional no servidor reiniciado: autoplay, pausa, larguras 1440/768/390/320 sem overflow, kenê com a largura da viewport, pattern dos swatches e quatro capas com marca d’água; zero erros JavaScript.
- Sintaxe dos adaptadores Node e `git diff --check`: aprovados. Índice sem conflitos e `HEAD...origin/main` em `0/0` ao concluir a sincronização.

O servidor local foi reiniciado em `http://localhost:3001/` usando a configuração atualizada (`next dev --webpack`). Alterações locais conciliadas permanecem sem commit e sem envio ao remoto, disponíveis para revisão. Fotos, banco, credenciais, runtime e backups continuam fora do Git.
