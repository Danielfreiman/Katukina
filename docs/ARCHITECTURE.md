# Architecture

See the [historical architecture and decisions](katukina/ARCHITECTURE.md), [headless routes](katukina/HEADLESS.md) and [current implementation status](IMPLEMENTATION_STATUS.md).

WordPress 7.1.3 / WooCommerce 11.2.1 own content, product/variation identities, prices, tax classes, customers, financial orders and coupons. Next.js 16.3.6 is the public frontend. Katukina Core extends native editors and owns operational lots, reservations, production and audit data. No core files are modified. The local mu-plugin disables external mail and indexing; the local gateway never charges money.

One installation can serve explicitly configured sales channels. A channel is not a WordPress site or an authorization role. Administrator capabilities currently apply installation-wide. Independent organizations requiring administrative data isolation must not share an installation until that isolation is implemented and verified.

Financial state stays in WooCommerce; operational states remain a separate extension of native orders. Native managed stock is authoritative until a SKU acquires lot history; then the transactional ledger is authoritative, and enabling native stock management is rejected. Quantities use signed integer thousandths with whole-unit validation. Physical stock changes at packing, not at reservation.

Currency context uses explicit native product/variation metadata, not exchanged copies of products. GBP/EUR price lists set display and transaction currency together. Base/accounting and eventual settlement remain separate. Existing USD fixtures are untouched. Alternative-currency orders must be analyzed using the currency/channel-separated accounting export: native WooCommerce Analytics revenue aggregation has not been validated for mixed currencies. No automatic conversion into a reporting currency is provided.

The public channel resolver rejects a different selling company until an independent native tax configuration is validated. Same-company channels may publish different products/prices and select different warehouses; stock ownership is still enforced by the ledger. Provider-specific tax engines, tenant isolation and remote topology require a separate approved design.
