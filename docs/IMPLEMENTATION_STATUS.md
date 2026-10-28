# Implementation status — 2026-10-26

Authority: [requested implementation specification](katukina/sources/MASTER-IMPLEMENTATION-2026-10-26.txt). This extends the existing [discovery](katukina/README.md); it does not erase earlier decisions. WordPress/WooCommerce and Next.js are confirmed choices. Production readiness and deployment are not claimed.

## Initial Native-First audit

Inspected `wordpress/plugins/katukina-core/src`, Store API consumers, existing browser tests and local setup. Source baseline: `606a896`. Local database backup: `wordpress/backups/katukina-2026-10-26T13-37-09-528Z.sql` (private, not versioned).

| Module | Existing implementation | Native alternative | Compliance | Required action | Risk |
|---|---|---|---|---|---|
| 01 Catalog | Native products/variations, operational metadata, immutable lot identity | Woo product editor, taxonomies, importer | PARTIALLY COMPLIANT | Channel publication, explicit net weight, purchasable variations | Public catalog must agree with checkout |
| 02 Inventory | Transactional lots, movement ledger, reservations, global SQL mutex | Native stock for products without lot history | PARTIALLY COMPLIANT | Cancellation release, commercial availability, replenishment | Overselling and stranded reservations |
| 03 Production | Immediate single-input/single-output repacking and compensating reversal | No native production facility | PARTIALLY COMPLIANT | Planned/reserved lifecycle, multiple outputs, cost/packaging traceability | Material conservation and repeated posting |
| 04 CRM | Native customers; supplier/contact records without logins | Users and Woo customers | PARTIALLY COMPLIANT | Linked history and purchasing evidence | Personal information access |
| 05 Orders | HPOS CRUD, native metabox, operational state side table | Native financial statuses/order notes | PARTIALLY COMPLIANT | Cancellation hooks, explicit return receipt/reship actions | Never infer restock from a label |
| 06 Channels | Registry only, one global channel | Single WP with channel configuration | NOT IMPLEMENTED | Request context, publication and checkout enforcement | Cross-channel access and currency mismatch |
| 07 International | Native taxes/shipping; local USD examples | Native tax tables, customer destination | PARTIALLY COMPLIANT | Early destination context, validated price lists and currencies | GBP requirement must not relabel existing USD amounts |
| 08 Customs | Free-text group and dated country classification records | Extend product editor | PARTIALLY COMPLIANT | Resolver, validation, order snapshot and documents | No unverified codes or ambiguous rule selection |
| 09 Shipping | Native zones and fictional local shipping | Native shipping methods/settings | PARTIALLY COMPLIANT | Destination service rules, insurance, adapters | Live carriers require contracts/credentials |
| 10 Payments | Fictional gateway and manual currency ledger | Native payment gateways and refunds | PARTIALLY COMPLIANT | Adapter contracts, event deduplication, credit redemption | No invented provider endpoints |
| 11 Communications | Manual message records/templates only | Native Woo emails plus additional inbox | NOT IMPLEMENTED | Async provider sync, associations and template rendering | Credentials and outgoing messages |
| 12 Marketing/reports | Native coupons/Analytics; draft registries and JSON reports | Native Marketing and Analytics | PARTIALLY COMPLIANT | Consent lifecycle, samples, CSV accounting | Consent and accurate exports |

The existing `kat_orders` table holds operational state only, not duplicated commercial orders. `item`/`form` records are compatibility identifiers projected from native products; their write endpoints correctly return 410. Keep these identifiers and API contracts. Existing top-level parallel dashboard is already removed. Menus still combine inventory/production and place HS under general operations settings; add relevant Products entries while preserving old URLs.

## Implementation and verification

| Module | Local status | Implemented evidence | Remaining scope |
|---|---|---|---|
| 01 Catalog | TESTED | NativeCatalog, Channels, Presentations; native products/variations remain authoritative; browser variation purchase passed | Commercial data still requires owner configuration |
| 02 Inventory | TESTED | Inventory; receipt/adjustment/reserve/cancel/inspected return/sample; expected partial receipts; reconciliation; concurrent last-unit test passed | External restock delivery BLOCKED on transport |
| 03 Production | TESTED | Production/ProductionAdmin, real SQL lifecycle, material/packaging/output conservation and exact costs | Production-scale load and staging verification not performed |
| 04 Relationships | IMPLEMENTED | Native users; supplier/contact profiles and related inbox/order/receipt evidence | Historical purchase/contact migration BLOCKED on source |
| 05 Orders | TESTED | Native HPOS editor, workflow, packing, cancellation, capped inspected return; paid reservations survive unpaid checkout timeout | Automatic commercial return/reship/lost compensation BLOCKED on approved policies |
| 06 Channels | TESTED | Active publication, direct lookup/cart enforcement, fixed native-product prices and native gateway restrictions | Independent seller tax configuration blocked at request time; remote frontend/tenant topology A VALIDAR |
| 07 International | TESTED | Explicit GBP/EUR Store API prices; base price unchanged; early destination and native VAT; currency selection | Actual prices/taxes/settlement BLOCKED on validated input; alternate price-index filtering not supported |
| 08 Customs | TESTED | Resolver/API: exact-country/EU rules, validity and overlap rejection, native line snapshot and manifest; printable document implemented | Live codes/legal invoice format/carrier interoperability BLOCKED on validation |
| 09 Shipping | TESTED | Manual tariff: native zone CarrierShipping, PostNL/DHL/other labels, currency-specific insurance and estimates; existing public calculator | Live carrier quotation/labels BLOCKED on provider contract/credentials |
| 10 Payments | TESTED | Local contracts: authenticated mock callbacks, currency/amount checks, duplicate events, partial native refund, credit redemption and accounting; native gateway selection in browser | Live provider BLOCKED; credit mixed tender/refund policy A VALIDAR |
| 11 Communications | TESTED | Fake providers: async inbox/outbox, dedupe, template rendering, consent, campaign history; shipment notification implemented | Live inbox/send providers BLOCKED; no real mail sent |
| 12 Marketing/reports | TESTED | Local core: native coupons/Analytics; subscriptions/double opt-in/unsubscribe, campaign queue, physical samples, formula-safe accounting CSV | Production scale/retention and live campaign delivery BLOCKED pending configuration |

Executed final backend suite: **37 operational + 54 expansion + 9 communication assertions = 100 passed**, including GBP/EUR API prices, payment/refund replay and retained paid reservations. PHP syntax passed for **32 files**. `npm.cmd run typecheck` and `npm.cmd run build` passed after the final code changes. `git diff --check` passed.

Browser evidence: the ten-scenario run passed nine and exposed a selector mismatch in the new variation test. Checkout-loading and the integrated checkout were rerun successfully after the last destination change (2 passed); the corrected variation test then passed separately (1 passed). **All 10 distinct scenarios have passing evidence; this is not a claim that the final ten ran together without an intermediate correction.** Covered native editors, catalog/content, concurrency/permissions, account/privacy, checkout replay, responsive pages, and variation purchase/destination/currency guard. The variation screenshot `artifacts/variation-purchase-preview.png` was visually inspected; synthetic fixtures were cleaned, including the product left by the timed-out attempt.

Local implementation and local/mocked integration tests are delivered. Live provider interoperability, staging verification, production readiness and production deployment remain unverified/not performed. Native multi-currency Analytics revenue aggregation is not validated; use the separated accounting export until an approved reporting-currency integration exists.

All requested documentation files now exist, including schema, API, UI map, test strategy, migration/rollback and ADR-010. Actual migration and external provider connection are not claimed. A module with blocked acceptance criteria is not fully complete merely because its local core passed.

Statuses: NOT STARTED, IN PROGRESS, IMPLEMENTED, TESTED, BLOCKED, DEFERRED. A module remains partial until every acceptance criterion is tested or explicitly blocked/deferred. Local implementation, local tests, provider integration tests, staging verification, production readiness and deployment are distinct milestones.

## External dependencies

Integration validation on 2026-10-28: rebased onto remote main `5c7c0ff`, preserving its imported-catalog tooling, gallery, swatches, quantity controls, cart response safeguards and privacy consent. Build/typecheck and 100 backend assertions passed. The selected 10 browser scenarios (catalog, variation/destination/currency, checkout loading and privacy) passed 8 initially; the two failures were corrected and passed in a targeted rerun. Wildcard options now normalize native attribute names and use the native cart attribute key. This is evidence across runs, not a single uninterrupted full-suite pass.

BLOCKED: live payment gateway contract/credentials; carrier credentials/contracts; authorized mailbox provider/credentials; validated tax and HS data; legacy PHP/database/media and approved mappings. Return/reshipment commercial policy and independent legal-entity tax configuration remain OPEN DECISIONS. These do not block implementation and local contract tests.
