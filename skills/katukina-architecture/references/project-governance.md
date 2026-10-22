# Governança do projeto Katukina

## Estados
`CONFIRMADO`: solicitado explicitamente ou aprovado; `LEGADO OBSERVADO`: descrito no levantamento sem auditoria; `PROPOSTO`: recomendação sem aprovação; `A VALIDAR`: fato ou política não estabelecida; `BLOQUEADO`: dependência ausente.

## Gestão de requisitos
Cada requisito traz: ID, domínio, descrição, fonte, status, critérios de aceite, integrações/dependências, riscos, data da última revisão. Não usar prioridades automáticas como se aprovadas. Novos requisitos nunca alteram silenciosamente os anteriores: indicar adição, conflito, impacto e alternativas. Manter changelog com data e autor de cada decisão quando conhecido.

## ADR mínimo
`ADR-NNN / título / status / data` — Contexto, opções, recomendação, prós, contras, impactos em WordPress/lojas/operações, segurança/performance, pré-requisitos, plano de verificação e reversão. Decisão só vira `ACEITA` após aprovação real.

## Definition of Ready
Objetivo, usuário, papel autorizado, regras, dados, estados, dependências e critérios verificáveis definidos; casos de borda mapeados; risco/pendências visíveis. `Ready` não implica tecnologia aprovada.

## Definition of Done
Código revisado, validações server-side, autorização, tratamento de falhas e idempotência onde relevante, testes automatizados e manuais apropriados, observabilidade, acessibilidade, i18n, documentação, cenários multi-canal, migração/rollback, SEO para superfície pública e resultado efetivamente verificado. Sem alegar teste não feito.

## Testes críticos por domínio
- Estoque: concorrência, oversell, movimento duplicado, perda e devolução, unidades/precisão e lotes.
- Produção: consumo e saída atômicos, sobras, cancelamento e rastreabilidade.
- Pagamento: webhook repetido/fora de ordem, moeda, falha, reembolso e conciliação.
- Pedido: transições permitidas, reserva e baixa, envio, reenvio e devolução.
- Checkout: país, restrições de produtos, VAT, seguro, aceite registrado.
- Multi-site: isolamento por canal/empresa, estoque compartilhado opcional, tarifas/preços e permissões.
- SEO: indexabilidade, canonicals, hreflang, schema validado, redirects e métricas.

## Modo de trabalho
Entregar propostas práticas com diferenças entre comportamento atual e desejado, recomendações e pontos ainda não verificados. Evitar inflexibilidade artificial: alterar diretrizes com ADR quando surgirem evidências ou novos requisitos.
