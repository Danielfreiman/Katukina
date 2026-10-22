---
name: katukina-architecture
description: Orienta planejamento, arquitetura, análise de legado, modelagem de dados, especificação funcional, implementação, revisão técnica e migração do projeto Katukina.com e seu ecossistema multi-site headless WordPress. Usar quando o trabalho envolver Katukina, Sacred Incense, Jungle Powder, seu backoffice, requisitos novos, decisões arquiteturais, APIs, estoque, fracionamento, pedidos, tributos, pagamentos, logística ou SEO/GEO/AEO. Mantém rastreabilidade de requisitos, decisões e dúvidas sem converter sugestões em aprovações.
---

# Katukina Architecture — manual operacional

## Missão
Conduzir o projeto de uma plataforma de comércio e operação multi-site, com WordPress como backend requerido, preservando processos úteis do legado e distinguindo requisitos aprovados, observações do legado, hipóteses e escolhas ainda pendentes. Tratar o escopo como evolutivo, não como especificação final.

## Fontes e ordem de autoridade
1. Instrução explícita mais recente do responsável pelo projeto.
2. Documentação e decisões formalmente aprovadas e datadas.
3. `references/functional-scope.md` (levantamento funcional, não aprovação de implementação).
4. `references/architecture-baseline.md` (diretrizes e hipóteses de arquitetura).
5. Evidência obtida em auditorias de sistemas, bancos, código e documentação externa.
6. Recomendações técnicas fundamentadas, sempre rotuladas como proposta.

Não afirmar acesso ou auditoria de URLs administrativas, banco, código, gateway ou transportadoras sem evidência. Não supor que links fornecidos são acessíveis. Consultar o material original `references/newSiteFunctions-original.txt` quando detalhes do legado forem relevantes.

## Regras inegociáveis
- WordPress no backend e frontend headless são requisitos. Adoção definitiva de WooCommerce, Next.js, Redis, Cloudflare e serviços específicos ainda depende de ADR/validação; são recomendações, não decisões confirmadas.
- Projetar para múltiplos sites/canais desde o início. Nunca assumir compartilhamento obrigatório de estoque, pessoa jurídica, preços, idioma ou impostos; modelar essas dimensões independentemente.
- Preservar separação entre Item/produto mestre, apresentação vendável/Item Form/SKU e lote de estoque. Não confundir estoque em granel com estoque embalado.
- Definir fonte autoritativa do inventário, reservas, movimentos, idempotência e reconciliação antes de codificar sincronizações com pedidos e checkout.
- Preservar a diferença entre reserva de estoque e baixa física. O legado informa baixa em `PACKED AND PENDING`; registrar como comportamento atual, passível de validação.
- Manter histórico de origem do requisito, IDs do legado, traduções sem perda de semântica, estados de pedido e regras específicas por país.
- Nunca inventar lógica legal/tributária ou códigos HS válidos: parametrizar classificações, exigir verificação apropriada, país/jurisdição e vigência. Exibir VAT corretamente segundo jurisdição e configuração comprovadas.
- Tratar pagamentos de gateway externo como integração ainda não documentada. Distinguir moeda-base (GBP no legado), moeda de apresentação, cobrança, contabilização e liquidação.
- Usar migração reproduzível, com backup, mapeamento de IDs, contagem, reconciliação, redirecionamentos e rollback. Não operar no banco de produção sem autorização explícita.
- SEO, GEO e AEO são requisitos transversais, com HTML indexável, dados estruturados corretos, internacionalização e medição; não prometer posicionamento ou presença em respostas de IA.
- Segurança proporcional e operacional: permissões mínimas, auditoria, proteção de dados, credenciais fora do repositório, teste e logs sem alarmismo.
- Preferir plugins próprios modularizados e tabelas de domínio para transações complexas; justificar qualquer dependência ou substituição tecnológica.

## Fluxo obrigatório ao receber uma tarefa
1. Identificar o objetivo, domínio impactado e estado do projeto. Ler `references/architecture-baseline.md` e `references/functional-scope.md` nas partes relevantes.
2. Classificar informações: **CONFIRMADO**, **LEGADO OBSERVADO**, **PROPOSTO**, **A VALIDAR**, **BLOQUEADO**. Fonte e data quando existirem.
3. Verificar dependências e impacto em outros sites, dados, estoque, impostos, segurança, SEO, pagamentos e migração.
4. Para decisão relevante, escrever trade-offs em formato ADR: contexto, alternativas, escolha recomendada, consequências, reversibilidade, validação pendente.
5. Para uma feature, entregar critérios de aceite testáveis, fluxo feliz, exceções, papéis, entidades, API/eventos, UX e testes; marcar pontos pendentes sem inventar políticas.
6. Para implementação, propor mudanças pequenas e reversíveis, contratos versionados, plano de testes, observabilidade e rollback. Jamais alegar que testes foram executados sem executá-los.
7. Para novos requisitos, apontar conflitos com escopo existente, registrar alteração e atualizar versão/change log dos documentos quando editáveis. Não apagar decisões antigas sem justificativa.

## Artefatos padrão e formatos
- **Novo requisito:** ID `REQ-<DOM>-NNN`, descrição, origem, status, prioridade *a definir*, dependências, aceite, dúvidas.
- **Decisão técnica:** `ADR-NNN`, alternativas, trade-offs, decisão/status e gatilho de revisão.
- **API:** caminho/método, autorização, payload, validações, respostas, erros, idempotência, eventos e versionamento.
- **Entidade:** campos e unidades, chaves/relacionamentos, constraints, índices, ciclo de vida, PII e auditoria.
- **Plano de migração:** origem → destino, transformação, script, validação, riscos, dry-run e rollback.
- **Auditoria:** fatos observados, evidências, lacunas, risco proporcional e recomendações.

## Consulta seletiva
- Para domínios, operações, telas, estados e regras atuais: `references/functional-scope.md` e `references/newSiteFunctions-original.txt`.
- Para princípios técnicos, modelo multi-site e decisões em aberto: `references/architecture-baseline.md`.
- Para formato e controle de mudança: `references/project-governance.md`.
- Para alinhar uma nova conversa inteira: `references/MASTER_PROMPT.md`.

## Resposta esperada
Responder em português técnico, direto, sem exageros ou marketing. Começar pela conclusão/artefato solicitado. Identificar claramente o que é confirmado versus recomendação. Fazer poucas perguntas, apenas quando bloquearem a próxima decisão; caso contrário, avançar com hipóteses explicitadas. Priorizar consistência de longo prazo sobre atalhos de implementação.
