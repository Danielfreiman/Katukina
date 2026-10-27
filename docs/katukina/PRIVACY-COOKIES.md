# Privacidade e consentimento — 2026-10-27

## Escopo e evidências

**CONFIRMADO:** o responsável solicitou política e consentimento de cookies e adequações às regras europeias. O escopo técnico foi aplicado à vitrine Next.js local. Na União Europeia, a referência é GDPR/RGPD e a legislação nacional que transpõe ePrivacy, não a LGPD brasileira. Não houve publicação ou alteração do site de produção.

**LEGADO OBSERVADO:** a [política atual do Katukina](https://katukina.com/privacy), datada de 18/06/2025 e consultada em 27/10/2026, identifica Sacred Incense LTD, registro 10995196, Suite LP37821, 20–22 Wenlock Road, London N1 7GU, United Kingdom; contato de privacidade info@sacred-incense.co.uk. Incorporados esses dados públicos por instrução do responsável. Isso não equivale à verificação independente do registro empresarial ou à nomeação de DPO/representante europeu.

Os [termos atuais](https://katukina.com/terms) mencionam operações nos Países Baixos e possível anonimização após dois anos de inatividade. Essa regra não foi implementada automaticamente: envolve contas, créditos e obrigações de retenção que precisam ser decididos para o novo sistema. Não foram importadas alegações de analytics, pagamentos, transportadoras ou transferências internacionais do site antigo para descrever integrações inexistentes na base nova.

**Auditoria local:** busca de cookies/storage/scripts no código; plugins ativos consultados via WP-CLI: apenas `katukina-core` 0.3.0 e WooCommerce 11.2.1. Consulta `woocommerce_*retention*` não retornou opções gravadas. A vitrine usa fontes locais, não executa HTML editorial e não possui trackers de analytics/marketing. O componente antigo `components/storefront.tsx`, com `katukina-bag`, não é importado pelas rotas atuais; seus dados não foram apagados. O histórico de produtos ativo gravava automaticamente em localStorage, sem consentimento e sem prazo, e foi corrigido.

## Implementação e decisão técnica

Foi escolhido um controle próprio no frontend, pois há um único propósito opcional ativo: produtos vistos recentemente. Um plugin de banner apenas no WordPress não cobriria a vitrine Next.js. Não foi adicionada CMP externa, identificador publicitário, biblioteca de tracking nem outro banco de dados.

- `/cookies`: inventário, finalidades, duração, titular/controlador, retirada, controles do navegador e limites. `/privacy`: aviso de dados pessoais adaptado ao teste, contato público, direitos, tratamento e pendências reais. Links no rodapé, conta e checkout; rotas no sitemap, mantendo a configuração local de não indexação.
- Banner sem barreira de navegação: rejeitar, personalizar e aceitar no primeiro nível e com estilo equivalente. Somente finalidade existente é oferecida; desmarcada inicialmente. Fechar/Escape/rolar não dá consentimento. Diálogo nativo com teclado e foco; botão permanente de configurações após o rodapé.
- Registro necessário `katukina:consent:v1`: versão, finalidade funcional booleana, instante da escolha e expiração exata em 180 dias. Mesmo prazo para aceite e rejeição, sem renovação automática por navegação. Registro inválido, vencido ou versão antiga implica negação. Nenhum IP, email, fingerprint ou identificador único de visitante nesse registro.
- Histórico `katukina:recent-products:v2`: até oito IDs públicos com instante de visita, validade individual de 30 dias. Não lê nem grava histórico antes do aceite; versão antiga é descartada. Verificação anterior ao uso e nova checagem antes de aplicar respostas de rede. Desativação aborta consulta pendente e remove o histórico, sem esvaziar carrinho ou encerrar conta. LocalStorage não expira sozinho: remoção ocorre na próxima execução pertinente, conforme explicado na política.
- Trocas de consentimento propagam entre abas. Expiração é checada na entrada, retorno/foco e durante a página aberta. Se o navegador impedir gravação do registro, os recursos opcionais continuam desligados. Sem JavaScript não há histórico opcional.
- Carrinho mantém cookie HTTP-only `katukina_cart`, SameSite Strict, escopo `/api/commerce`, 48 horas, Secure quando a origem é HTTPS. Login nativo permanece independente do consentimento opcional. Não foi usado “consentimento GDPR” obrigatório no checkout para tentar legitimar tratamento contratual.

Os 180/30 dias são decisões técnicas conservadoras e revisáveis, não um prazo universal imposto pelo GDPR. Mudanças de finalidade, fornecedor ou significado de consentimento exigem revisar a política e incrementar `CONSENT_VERSION`. Não basta adicionar tags ao WordPress ou layout: qualquer novo script, embed ou storage opcional deve depender da categoria autorizada **antes** de carregar, incluir retirada e passar por nova auditoria.

O registro de escolha é local e versionado, não uma trilha central imutável. Para futuros tratamentos no servidor, publicidade ou serviços externos, definir comprovação e retenção da evidência de consentimento antes da ativação; não presumir que o registro atual cobre esses fluxos.

## Operação e requisitos antes de produção

**A VALIDAR / não concluído por esta implementação:**

1. Confirmar controlador aplicável à nova operação, jurisdições, eventual necessidade de representante europeu/DPO e análise de interesses legítimos. O endereço público britânico não comprova toda a estrutura societária ou territorial.
2. Definir e executar retenção de contas, pedidos, créditos, mensagens, logs e backups; exceções fiscais/legais; anonimização; responsáveis e teste de restauração. Não apagar dados históricos ou saldos com base em regra inferida.
3. Identificar hospedagem, suboperadores, países de tratamento, contratos de tratamento e salvaguardas de transferência. Não foi atestada residência de dados em UE/UK nem existência de SCCs.
4. Confirmar fluxo de atendimento a titulares e segurança operacional, permissões, resposta a incidentes, revisão jurídica do aviso e evidências de consentimento pertinentes aos serviços efetivamente habilitados. Rotacionar credenciais de teste antes de publicar, conforme `LOCAL-SETUP.md`.

Essas pendências impedem afirmar conformidade integral ou prontidão para coletar dados reais em produção. O ambiente segue sendo de teste, com aviso para usar dados fictícios. Não foram criados mecanismos de envio externo nem pedidos de titulares reais.

### Solicitações de titulares

O canal público encontrado é info@sacred-incense.co.uk. O operador deve registrar recebimento, escopo, verificação de identidade proporcional, prazo e decisão em ambiente restrito, sem colocar documentos pessoais no Git. Em regra a resposta ocorre em um mês; extensões e exceções precisam de fundamento e comunicação ao titular.

Usar os mecanismos nativos de WordPress em Tools → Export Personal Data / Erase Personal Data como ponto de partida, com revisão humana. A cobertura de metadados próprios, créditos, relatórios, logs e backups precisa de ensaio específico: os exportadores/removedores nativos não são evidência de cobertura integral dos módulos Katukina. Nenhum dado foi apagado nem solicitação enviada durante esta tarefa. Retirada de cookies é imediata no navegador e não depende desse procedimento manual.

## Referências

- [EDPB: Cookie Banner Taskforce](https://www.edpb.europa.eu/system/files/2023-01/edpb_20230118_report_cookie_banner_taskforce_en.pdf): opção de recusa, ausência de caixas pré-marcadas, clareza visual, classificação e retirada. O relatório não é certificação e ressalva regras nacionais.
- [Your Europe: online privacy](https://europa.eu/youreurope/business/growing/digitalising/online-privacy/index_en.htm): informação prévia e exceções estritamente necessárias, como carrinho e autenticação.
- [DPC: cookies e tecnologias similares](https://www.dataprotection.ie/en/dpc-guidance/guidance-cookies-and-other-tracking-technologies): consentimento afirmativo e abrangência além de cookies. Referência técnica, sem presumir jurisdição irlandesa.
- [Comissão Europeia: solicitações de titulares](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/dealing-requests-individuals_en).
- [WordPress: cookies](https://developer.wordpress.org/advanced-administration/wordpress/cookies/) e [autenticação](https://developer.wordpress.org/reference/functions/wp_set_auth_cookie/).

## Validação

Oito testes Playwright passaram na execução conjunta de privacidade, catálogo e vitrine (2,1 minutos); teste adicional de expiração durante página aberta e política sem JavaScript passou separadamente (3,2 segundos de teste). Cobertura: registro inválido/versão antiga, bloqueio de leitura antes do aceite, fechamento sem salvar, recusa persistente, aceite específico, retirada entre abas, preservação do token de carrinho, histórico vencido, limpeza do histórico antigo e falha de storage. O cenário auditado não realizou requisições externas nem apresentou erros JavaScript. Regressão de catálogo inclui compra de variação após rejeitar opcionais.

Revisão visual de banner desktop/móvel e diálogo em 390 px; política sem overflow global em 1440/768/390/360 px. Capturas locais ignoradas pelo Git em `artifacts/privacy/`. Ausência de trackers observada nesta versão não é garantia para plugins, embeds ou infraestrutura futuros. Typecheck/build finais registrados no changelog; não houve certificação jurídica, pagamento real ou envio de solicitações por email.
