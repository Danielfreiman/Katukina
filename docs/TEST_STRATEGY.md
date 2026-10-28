# Test strategy

Run only against the local environment. Integration scripts enforce `WP_ENVIRONMENT_TYPE=local`, create uniquely named synthetic fixtures and clean their own records. External payments/mail/carriers require local fakes; no test sends real mail or purchases shipping.

| Check | Coverage |
|---|---|
| npm.cmd run typecheck | Next route generation and TypeScript contracts |
| npm.cmd run build | Production compilation and rendering constraints |
| npm.cmd test | Playwright native admin, catalog, cart, account and checkout workflows |
| npm.cmd run wp:test | Operational ledger, production, channel/HS/payment/credit/refund/report and communication integration assertions against actual WooCommerce/SQL |
| PHP php -l for changed plugin/tools | PHP syntax only; not functional evidence |
| python -B -m unittest discover -s scripts/tests -v | Legacy export auditor; required if auditor changes |

Inventory tests must exercise duplicate commands, insufficient stock, reservations, physical packing, cancellation, production conservation, repeated completion, return cap, and reconciliation. Financial tests use exact currency/precision, signed provider mocks, duplicate/conflicting events, partial refunds and isolated credit balances. Communications tests use fake providers to exercise cursor replay, outbox deduplication, consent suppression and confirmation tokens. Assertions about external service interoperability require the actual service contract and sandbox.

The first browser run during this change was not a clean baseline: files were still being edited. Six tests passed and three failed, including one transient incomplete PHP class load. Treat that run as diagnostic only; final results belong in IMPLEMENTATION_STATUS and CHANGELOG. Never infer concurrency, performance, staging or production readiness from syntax/type checks.

The final suite also contains a native variation purchase test, destination cookie assertion and nonempty-cart currency guard. Startup-response mocks isolate the header configuration request from checkout's deliberately delayed request. Native admin assertions follow the new Products → HS Codes editor while preserving the old settings entry. Browser expectations allow 15 seconds because observed Windows Docker requests reached 4–8 seconds; assertions still verify actual persisted behavior rather than accepting a spinner.
