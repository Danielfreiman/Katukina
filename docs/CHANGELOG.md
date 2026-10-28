# Implementation changelog

## 2026-10-28 — Integration with main

- Preserved the catalog import, product gallery, presentation swatches, quantity controls, uncertain-cart safeguards and privacy consent from remote main through `5c7c0ff`.
- Integrated wildcard variation choices and availability subscriptions into the new product purchase panel. Catalog pagination verification now compares with the native API instead of assuming a minimum of 24 imported products.
- Repeated build/typecheck and all 100 backend assertions successfully. The integration browser run passed 8 of 10 scenarios; after correcting the catalog fixture assumption and wildcard attribute normalization, both failed scenarios passed in a targeted rerun. PHP syntax for the presentation endpoint passed. No live integrations were exercised.

## 2026-10-26 — Native backend expansion

- Audited baseline `606a896`, preserved original instructions and took a private local SQL backup.
- Extended native product/variation publication, weights, customs and fixed channel/currency pricing. Added headless presentation selection and early destination selection.
- Added transactional production lifecycle, source reservations, material/packaging conservation, exact cost allocation, cancellation release, inspected returns, stock samples and partial expected receipts.
- Added customs resolution/snapshots/manifest and printable native order document; manual carrier tariffs, insurance and estimates in native shipping zones.
- Added authenticated provider callback contract, duplicate/refund checks, native store credit payment and headless selection of supported native gateways.
- Added async inbox/outbox contracts, consent confirmation/unsubscribe, campaign queue/history and shipment instructions. All delivery tests use local fake transports.
- Added native order accounting CSV and required continuity documents. Original discovery, IDs, old command paths and immediate repacking remain intact.
- Executed final `wp:test`: 37 operational, 54 expansion and 9 communications assertions passed. Build and TypeScript passed. Paid reservations remain held after the unpaid timeout; provider refunds with a second event ID do not post twice. Browser evidence is recorded in IMPLEMENTATION_STATUS.
- Browser verification now has passing evidence for all 10 distinct scenarios: 9 in the full run, followed by targeted passing reruns and the corrected variation selector test. Destination refresh remains busy until the new prices/content finish loading; checkout uses its own reviewed address form. PHP syntax passed for 32 files and the variation preview was visually inspected. No provider email, payment or shipment was sent/purchased.

External gateway, carrier and mailbox integrations, verified live tax/HS data, independent legal-entity topology and actual legacy migration remain dependent on missing specifications/data. Production has not been modified.
