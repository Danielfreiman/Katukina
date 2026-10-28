# Database ownership and migrations

Katukina schema version 4 is declared in `wordpress/plugins/katukina-core/src/Database.php`. `dbDelta` adds tables and indexes without dropping existing records. Every domain table uses InnoDB and the site's actual prefix (`{prefix}kat_`). Native products, users, coupons, taxes, shipping settings and HPOS orders remain owned by WordPress/WooCommerce and accessed through their APIs.

| Table | Purpose / relationships | Integrity |
|---|---|---|
| records | Typed configuration, supplier/contact, incoming receipt, consent/template/campaign records; `item`/`form` are compatibility projections of native products | Unique kind/code, optimistic version |
| lots | Form, owning company, warehouse, physical balance and reserved quantity; JSON provenance, expiry, receipt cost | Unique lot code, allocation index |
| movements | Append-only physical and reservation deltas, actor, reason, UTC timestamp | Indexed lot; protected by command transaction |
| reservations | Native order/item → lot allocation, expiry and active/fulfilled/released/expired state | Order/state and expiry indexes |
| production | Existing immediate repacking runs retained for compatibility | Source/output lots; reversal is a compensating movement |
| production_jobs | Frozen multi-input/output plan, lifecycle, actor, result | Version and state index |
| production_allocations | Job → source lot, quantity, active/consumed/released state | Unique job/lot |
| returns | Inspected physical receipt against a fulfilled reservation | Unique receipt reference; cumulative quantity cannot exceed debit |
| orders | Operational extension of native order: channel, stage, short note, packed timestamp | Native order ID primary key; optimistic version |
| money | Signed integer minor-unit credit/payment entries, customer/order, currency and precision | Unique kind/reference; no cross-currency balance pooling |
| commands | Request fingerprint and original result | Idempotency key primary key; conflicting replay rejected |
| locks | Operations mutex | Row lock serializes domain mutations |
| audit | Action, entity reference, actor, changed fields/reason | Append-only application behavior |
| inbox | Normalized plaintext messages and optional native order/contact/supplier links | Unique mailbox/external identity hash; association indexes |
| outbox | Private delivery payload, subscription, lease, attempts, provider receipt and timestamps | Unique stable delivery key; queue index |
| subscription_tokens | Double opt-in challenge digest and expiry | Subscription primary key; no plaintext token stored |

Quantities are integer thousandths of g, ml or unit; packaged units must be multiples of 1000. No conversion between mass and volume is inferred. Money is integer minor units with explicit currency/precision. Production cost allocation uses integer quotient/remainder arithmetic; missing source costs remain unknown.

`Database::command` owns the outer transaction and mutex. Nested commands use savepoints, never an inner commit. Successful replay returns the original result; payload changes under the same key return conflict. Domain references are validated in application code rather than SQL foreign keys to WooCommerce internals. Native object caches and external side effects are outside SQL rollback; delivery is queued and provider adapters must deduplicate stable keys.

Inbox/outbox payloads, addresses, customer links, database exports and token-bearing URLs are private. Retention periods and operational erasure policy need the owner's decision. Audit reports must not copy message bodies, passwords or credentials. Restoration requires a matching code/database backup; downgrade is not a destructive schema migration.
