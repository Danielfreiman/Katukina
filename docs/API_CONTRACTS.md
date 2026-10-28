# API contracts

Native Store API remains `/wp-json/wc/store/v1`. Native authenticated product/order APIs remain WooCommerce APIs. The same-origin Next.js BFF `/api/commerce/{action}` limits actions, body size and origins, preserves the cart token in an HttpOnly cookie, and forwards the verified native login cookie. Administrative Katukina endpoints use WordPress REST authentication/application passwords and explicit domain capabilities. Channel headers never authenticate an administrator.

| Endpoint | Contract |
|---|---|
| GET commerce/config | Public countries, destination notices/version, currency, local-test flag; no internal notes/secrets |
| GET commerce/products/{id}/presentations | Published native variations, attributes, price and stock; parent publication also enforced |
| POST commerce/subscriptions | email, purpose marketing/back_in_stock, boolean consent and product_id for restock; double opt-in; requires configured transport |
| GET schema / modules | Authenticated capabilities and implemented navigation |
| GET/POST records/{kind} | Domain capability; save uses key, code, data, and id/version for updates |
| POST command/{action} | Domain capability, key (16–100 chars), reason, action fields; payload-bound idempotency |
| GET report/{type} | Domain capability; page/order_id/lot_id filters, maximum 100 rows |
| GET picking/{order_id} | Orders + inventory permissions; native lines and lot allocations |
| GET customs/orders/{order_id} | Orders permission; saved line classifications, weights/origins, native totals; fails if evidence missing |
| POST import/{kind} | Registry permission, 1–500 normalized rows; default dry-run, explicit commit and key |
| POST communications/campaigns/{id}/queue | CRM permission; active consent, correct channel/purpose, configured transport and unsubscribe placeholder required |
| POST payments/{provider}/events | Provider verifies raw body/signature before any mutation; no configured adapter returns unavailable |

Paths in the table are relative to `/wp-json/katukina/v1`. Deprecated item/form/publication/tax/payment_method record writers return 410 and point callers to native WooCommerce editors/APIs.

Request headers `X-Katukina-Channel` (configured ID/code) and `X-Katukina-Destination` select public commercial context. Unknown/inactive channels fail closed; publication is enforced in listing queries, detail and cart/checkout. Destination is validated against the channel. Catalog tax estimation uses a temporary native customer context; checkout recalculates from the actual address. Responses vary by context and are private/no-store. Product restrictions cannot be overridden by notice acceptance.

Commands include receive, adjust, reserve, release, expire, produce, reverse-production, plan-production, reserve-production, complete-production, cancel-production, return-stock, issue-sample, assign-order, transition and money. Plans contain inputs `{lot_id,quantity,role}`, outputs `{form_id,quantity,code}`, loss and reason. Return-stock requires a fulfilled reservation_id, quantity, unique reference and inspected=true. Receive optionally links an incoming_id; product/warehouse/supplier must match and over-receipt is rejected.

Errors: 400 invalid input; 401/403 authentication/capability; 404 missing/unpublished; 409 stale version, changed replay, unavailable stock or conflicting configuration; 410 retired duplicate interface; 503 unconfigured external adapter. Internal exceptions return a generic error, not database details.

Payment adapter: `PaymentProvider::gateway_id()` and `verify_event(rawBody, headers)` → `{event_id,type,order_id,transaction_id,amount,currency,minor_unit}`. Type is paid/refunded/pending; amount is integer minor units. The adapter must authenticate timestamp/replay/signature according to its verified provider specification. Core deduplicates event identity, validates gateway/currency/amount, records native payment/refund and reconciles the ledger. No provider protocol is invented.

Mailbox adapter: `MailboxProvider::fetch(mailbox,cursor)` → at most 100 normalized messages and next cursor/has_more. Message transport: `send(message,stableKey)` → acknowledged provider ID, with provider-side deduplication after ambiguous network failures. Secrets are supplied privately by adapter implementation, never registry fields or frontend responses. Local tests register in-memory providers only.

Currency: `X-Katukina-Currency` must be enabled in the selected channel. Explicit GBP/EUR prices are attached to native products/variations; no conversion is inferred. The BFF POST `/api/commerce/currency` validates the selected currency through commerce/config and rejects changes while the bag contains items. Its HttpOnly preference cookie has path `/`. Cart validation independently rejects cross-currency reuse. Store API cart responses include `extensions.katukina.payment_options`, derived from available native gateways after channel, country and currency restrictions. Gateways with interactive payment fields require a reviewed headless integration before appearing in that list.

Custom fixed price lists do not reuse WooCommerce's base-price SQL index. Price-range/filter/sort and collection-data requests relying on that index are rejected when custom prices apply. Native fixed-amount coupon limits and flat rates are not converted implicitly; configured carrier tariffs and explicitly supported gateways determine foreign-currency checkout availability.
