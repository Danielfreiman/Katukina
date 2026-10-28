# Native administrative UI map

| Native location | Extension / task | Capability |
|---|---|---|
| Products / product and variation editor | Packaging identity, supplier/origin, net weight, HS group, destination restrictions, channel publication, instructions | Native edit product/post |
| Products → Inventory | Physical/reserved/available stock and low-stock report | katukina_inventory |
| Products → Lots and repacking | Receive, adjust, reserve/release, immediate repack/reverse, inspected return, movements, reconciliation | katukina_inventory |
| Products → Production | Plan multiple inputs/outputs, reserve, complete or cancel | katukina_inventory |
| Products → Expected receipts | Supplier, product, warehouse, expected date/quantity, receipt progress | katukina_inventory |
| Products → Suppliers | Profiles and linked receipt/conversation evidence | katukina_crm; inventory for lots |
| Products → HS Codes | Dated, verified jurisdiction rules | katukina_settings |
| Products → Samples | Issue sample with atomic physical stock movement | katukina_inventory |
| WooCommerce → Orders | Existing HPOS order, short note, operational stage, tracking, picking and commercial invoice | Native order edit + katukina_orders; inventory to pack |
| WooCommerce → Settings → Operations | Companies, warehouses, channels, destination notices, permitted transitions | katukina_settings |
| WooCommerce → Settings → Shipping | Native zones; carrier service, insurance and estimates | Native Woo settings |
| WooCommerce → Settings → Payments | Native gateways, destination/channel restrictions, full-balance credit gateway | Native Woo settings |
| WooCommerce → Settings → Tax | Native tax tables/classes; no copied tax editor | Native Woo settings |
| WooCommerce → Accounting exports | Date-filtered native order CSV | katukina_finance |
| Users → user profile | Store credit ledger and scoped capabilities | Finance; manage_options for permission changes |
| Users → Contacts and support | Contacts, subscriptions, mailboxes, templates and campaigns | katukina_crm |
| Users → Unified inbox | Background-synced messages, account filter and associations | katukina_crm; order capability to link orders |
| WooCommerce Analytics / Marketing | Native order reporting and coupons | Native capabilities |
| Tools → Operational audit | Audit records | katukina_reports |

No independent top-level management menu is introduced. Existing lot/repacking URLs and command endpoints remain available. Compatibility IDs do not provide another product editor. Capabilities apply across the installation; they do not isolate independent legal entities.

## Operating the new extensions locally

- **Prices:** enable additional GBP/EUR currencies on the channel. In the native product or variation's Origin and packaging section, fixed prices use `channel ID/GBP=amount;channel ID/EUR=amount`. The ID appears in the channel editor URL. Enter actual approved amounts; this does not convert the native base price. Every sellable variation needs its own alternate price. The customer selector only shows enabled currencies; changing currency requires an empty bag. Foreign-currency shipping needs a matching carrier tariff and payment needs an explicitly supported gateway.
- **Production:** receive source bulk/packaging lots first, then Products → Production → Plan production. Inputs are g/ml or whole packaging units; outputs are whole sellable packs. Enter loss explicitly. Reserve, review and complete. Stock and cost movements commit together; a replay does not consume a second time. Cancel only before completion. Use the older repacking screen for the preserved immediate one-input/one-output workflow.
- **Replenishment:** Products → Expected receipts records a supplier, product, warehouse, due date and quantity. Select that expectation during physical receipt. Inventory shows outstanding incoming quantity, expected date, overdue flag and threshold deficit; expired lots are not available to sell.
- **Returns:** use Receive inspected return only after physical inspection, referencing the fulfilled reservation. It cannot restore more than the original debit. Changing an order label alone never restocks. Paid reservations are retained after the unpaid checkout timeout until packing or explicit disposition.
- **Shipping/customs:** configure native zones and Carrier service instances with verified currency, contract and insurance limits. Configure HS rules with jurisdiction, validity and verification source, and assign a group to the native product. Native order details offer picking and the saved customs document. Live carrier labels remain unavailable without a provider integration.
- **Communications:** configure mailbox identity and a server-side provider implementation; the supplied local system registers no live provider. Templates support name/order/tracking/instructions/unsubscribe placeholders. Campaigns require an unsubscribe placeholder and explicit Queue action. The order editor can explicitly queue a shipment notice only with tracking and shipped/reshipped stage. Public subscriptions require email confirmation.

Run `npm.cmd run wp:test` for local backend fixtures, `npm.cmd run typecheck`, `npm.cmd run build`, and the relevant Playwright tests. Refer to IMPLEMENTATION_STATUS for actual results rather than treating this command list as executed evidence.
