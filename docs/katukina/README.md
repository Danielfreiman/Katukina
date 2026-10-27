# Discovery Katukina

Versão 0.9 · 2026-10-19 · Elaboração técnica: Codex.

O projeto local contém Next.js e WordPress + WooCommerce em Docker. Site e painel usam http://localhost:3001/ e `/wp-admin/`. Após correção explícita do responsável, a administração usa as telas nativas: Products/Variations, Orders, Users, Settings e Analytics. O painel paralelo foi removido; lotes, fracionamento e campos operacionais ampliam essas áreas. Catálogo, conteúdo, carrinho, cotação, conta e checkout fictício funcionam pela API. A [cobertura vigente e ADR-009](OPERATIONS.md) registra pendências reais: integrações comerciais, regras fiscais, outras lojas e migração do legado não estão concluídas.

## Entregas

A [auditoria de cobertura funcional de 2026-10-22](FUNCTIONAL-COVERAGE.md) é a referência para comparar o escopo original com a implementação vigente. Sendcloud, HS automático/invoice/API e publicação seletiva multi-site estão pendentes; cadastros preparatórios não equivalem a essas integrações.

| Artefato | Conteúdo |
| --- | --- |
| [Importação Sacred Incense UK](PRODUCT-IMPORT-2026-10-27.md) | Fonte XLSX, produtos/variações, preços atualizados para USD, imagens, reprodução e validação local |
| [Instalação em outro computador](LOCAL-SETUP.md) | Clone, bootstrap, credenciais públicas de teste, rotação obrigatória antes de publicação, atualização e persistência |
| [Cobertura funcional auditada](FUNCTIONAL-COVERAGE.md) | Comparação requisito a requisito com código e configuração local; lacunas de Sendcloud, HS, multi-site e demais domínios |
| [Operação local](OPERATIONS.md) | Administração nativa, cobertura, limites, ADR-009, migração e testes; referência histórica ao ADR-008 |
| [Estrutura headless](HEADLESS.md) | Rotas, integração real de leitura, módulos, execução e limites atuais |
| [Catálogo de exemplo](SAMPLE_CATALOG.md) | Seis produtos do site público cadastrados localmente, fontes, preços e reprodução |
| [Backend local](../../wordpress/README.md) | Docker, versões, acesso, comandos e persistência do WordPress/WooCommerce |
| [Início do desenvolvimento](START.md) | Instalação limpa, fluxo piloto headless, SEO/desempenho e critérios de saída |
| [Auditoria local](AUDIT.md) | Código existente, planilhas, divergências e dependências ausentes |
| [Registro de requisitos](REQUIREMENTS.md) | Origem, estado, papéis, aceite, dependências e riscos por domínio |
| [Arquitetura e ADRs](ARCHITECTURE.md) | Modelo lógico, contratos propostos e decisões ainda abertas |
| [Migração e execução](MIGRATION.md) | Mapeamento inicial, etapas, reconciliação, testes, rollback e pendências |
| [Relatório dos exports](evidence/exports-audit.json) | Contagens, hashes, cabeçalhos e diferenças entre esquemas; sem registros pessoais |
| [Manifesto das fontes](sources/manifest.json) | SHA-256, origem e destino de cada arquivo incorporado |
| [Histórico](CHANGELOG.md) | Mudanças e validações realizadas |

## Fontes incorporadas

Os dois documentos avulsos são idênticos, byte a byte, às versões correspondentes no ZIP. Os sete arquivos do pacote foram lidos e preservados em `skills/katukina-architecture/`.

- [Skill fornecida](../../skills/katukina-architecture/SKILL.md).
- [Prompt mestre](../../skills/katukina-architecture/references/MASTER_PROMPT.md).
- [Baseline de arquitetura](../../skills/katukina-architecture/references/architecture-baseline.md).
- [Inventário funcional](../../skills/katukina-architecture/references/functional-scope.md).
- [Levantamento original](../../skills/katukina-architecture/references/newSiteFunctions-original.txt).
- [Governança](../../skills/katukina-architecture/references/project-governance.md).
- [Metadados da interface da skill](../../skills/katukina-architecture/agents/openai.yaml).
- Cópias avulsas: [KATUKINA_SKILL.md](sources/KATUKINA_SKILL.md) e [KATUKINA_MASTER_PROMPT.md](sources/KATUKINA_MASTER_PROMPT.md).

A skill foi incorporada como orientação deste repositório por [AGENTS.md](../../AGENTS.md). Não houve instalação global nem alteração nas instruções de um Projeto ChatGPT. As fontes originais foram preservadas; a confirmação posterior de WordPress + WooCommerce pelo responsável está registrada no ADR-001 e prevalece sobre o estado anterior de WooCommerce como proposta. As demais recomendações continuam propostas, e referências a sistemas externos não comprovam acesso.

## Reproduzir a auditoria

Execute na raiz do repositório com Python 3, sem dependências adicionais:

```powershell
python -B scripts/audit_legacy_exports.py --output docs/katukina/evidence/exports-audit.json
python -B -m unittest discover -s scripts/tests -v
npm.cmd run typecheck
```

O auditor lê os dois arquivos `export 2026-10-05 *.xlsx`, mantém as fontes intactas e produz somente metadados estruturais e contagens agregadas. Ele exige o formato observado de duas linhas de cabeçalho e datas textuais ISO; não é um importador XLSX genérico. Não calcula tributos, saldos ou totais financeiros, não escolhe uma versão vencedora entre duplicatas e não confirma a unicidade global dos IDs entre sites. Fórmulas são contadas e seus caches lidos, sem avaliação.

## Próxima execução

Avançar da leitura headless de catálogo/conteúdo para o [fluxo piloto](START.md#3-concluir-o-primeiro-fluxo-integrado): contexto comercial de teste, sessão de carrinho e pedido. A ausência do banco legado não bloqueia esse desenvolvimento. Definir autoridade de inventário e políticas mínimas antes da integração operacional de estoque.

Quando disponíveis, incorporar uma cópia do esquema e dos relacionamentos do banco PHP, o código relevante dos fluxos de pedido/estoque e a documentação do gateway. O diretório adicional indicado pelo responsável, `C:\Users\User\Desktop\katukina`, contém outro protótipo Next.js; o material de backend não foi encontrado, e o responsável informou não ter o legado disponível por ora se não estivesse ali. A inspeção está registrada na [auditoria](AUDIT.md#diretório-adicional-indicado-pelo-responsável).

Em paralelo, resolver propriedade do estoque, empresas por canal e regras comerciais. A [matriz de dependências](MIGRATION.md#dependências-e-perguntas) identifica o que cada evidência destrava. As planilhas disponíveis permitem discovery contábil parcial; não contêm o catálogo, os lotes ou o histórico completo de estados.
