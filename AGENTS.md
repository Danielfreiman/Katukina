# Diretrizes do projeto Katukina

Leia e aplique [Katukina Architecture](skills/katukina-architecture/SKILL.md) nas tarefas deste projeto. As referências completas estão em `skills/katukina-architecture/references/`. Esse material foi fornecido pelo responsável em 2026-10-19; as instruções explícitas da conversa prevalecem sobre ele.

Comece pelo [índice de discovery](docs/katukina/README.md) e pela auditoria local antes de presumir funcionalidades existentes. Em 2026-10-19, o responsável confirmou WordPress + WooCommerce limpo e, posteriormente, Next.js como frontend público exclusivo. Essas decisões prevalecem sobre referências originais que classificavam as tecnologias como propostas. Infraestrutura remota e topologia multi-site permanecem propostas.

O [plano de início](docs/katukina/START.md) permite desenvolver a base nova com dados de teste. A ausência do PHP/banco legado bloqueia a migração e a validação de regras históricas, sem bloquear toda a implementação nova. A documentação do gateway continua necessária para integrar pagamentos reais.

O site público usa Next.js em `http://localhost:3001/`; o painel WordPress fica em `/wp-admin/` no mesmo endereço. O backend Docker interno usa `127.0.0.1:8888`. Catálogo, conteúdo, carrinho, conta e checkout de teste estão integrados. O painel operacional inclui cadastros, lotes, reservas, fracionamento, estados, créditos e relatórios; cobertura e limites em [OPERATIONS.md](docs/katukina/OPERATIONS.md). Consulte também [HEADLESS.md](docs/katukina/HEADLESS.md) e [wordpress/README.md](wordpress/README.md). Credenciais e runtime ficam fora do Git. O servidor preexistente na porta 3000 e o ambiente Docker em 8080 pertencem a outros projetos.

- **Correção confirmada em 2026-10-19:** o responsável rejeitou o painel paralelo. Use Products/Variations, Orders, Users, Settings, Coupons e Analytics nativos. Não recrie catálogo, pedidos, clientes, preços ou impostos em outra aplicação/tela. Campos extras ampliam os editores nativos; código próprio cobre apenas lacunas como lotes e fracionamento. Item/Form são conceitos representados por produtos/variações WooCommerce, não cadastros separados. O parágrafo anterior sobre painel operacional retrata a versão substituída. ADR-009 e cobertura vigente: [OPERATIONS.md](docs/katukina/OPERATIONS.md).
- Separe CONFIRMADO, LEGADO OBSERVADO, PROPOSTO, A VALIDAR e BLOQUEADO, sempre com evidência e escopo. Uma proposta só vira decisão aceita com aprovação real.
- Preserve Item mestre, Item Form/SKU, lote, granel, apresentação embalada, reserva e baixa física como conceitos distintos.
- Preserve os 13 estados descritos no levantamento; não invente transições ou políticas de retorno/reenvio. A baixa em PACKED AND PENDING é comportamento relatado do legado.
- Defina fonte autoritativa, concorrência, idempotência e reconciliação antes de implementar estoque ou checkout. Nunca inferir impostos ou códigos HS dos exemplos.
- Não modifique produção nem presuma acesso ao PHP, banco ou integrações. Use cópias locais e fontes verificáveis; mantenha dados pessoais e segredos fora dos relatórios.
- Registre novos requisitos, conflitos e decisões em `docs/katukina/`; preserve os originais em `skills/katukina-architecture/` e `docs/katukina/sources/`.
- Não descarte arquivos ou alterações preexistentes. Planilhas, dashboard e artefatos locais já existiam antes deste discovery.
- **Reprodução local confirmada em 2026-10-22:** seguir [LOCAL-SETUP.md](docs/katukina/LOCAL-SETUP.md). O responsável autorizou versionar somente a credencial pública de demonstração em `wordpress/.local-access.example.json`; acessos efetivos, banco, exports e runtime continuam fora do Git. **Publicar o ambiente exige rotacionar as credenciais e segredos de teste antes da exposição pública.** O bootstrap preserva credenciais existentes e recria fixtures, sem copiar dados privados de outra máquina.

Para a vitrine: `npm.cmd run typecheck`; build e testes Playwright conforme o impacto da mudança. Para o auditor de exports: `python -B -m unittest discover -s scripts/tests -v`. Comandos e limites da auditoria estão no índice; registre somente validações executadas.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
