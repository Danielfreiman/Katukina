# Open decisions and external dependencies

- GBP is the requested backend accounting baseline. The existing local fixture channel and product examples use USD. Preserve their amounts and currency; do not reinterpret USD as GBP. Explicit GBP/EUR price-list support is implemented; actual commercial amounts and settlement policy still require configured values. Automatic exchange rates are not assumed.
- A single native tax configuration cannot represent unapproved independent seller regimes. Choose isolated installations or an explicitly reviewed tax-routing design before enabling independent legal entities. Channel headers provide selection, not tenant isolation.
- Alternate fixed price lists do not reuse the native base-currency SQL price-range index; those filter/sort requests are rejected. A currency-aware index is needed if that search feature is required. Fixed-amount coupons and native flat-rate costs are not relabeled into another currency.
- Tax rates, legal entities, destination eligibility and HS classifications require validated business inputs. Tests use clearly synthetic rules only.
- Allowed operational transitions require an approval reference. Returns require physical inspection/receipt; lost, returned and reshipped labels do not silently restore stock.
- Live payment adapter: gateway protocol, signature verification, reconciliation and refund specification missing.
- Live shipping: Sendcloud expectation recorded in earlier requirements; PostNL/DHL service contracts, insurance coverage and credentials missing.
- Inbox: provider, permitted accounts and secure secret references missing. No real emails may be sent under this implementation request; exercise transports only with local fakes until explicit send authorization.
- Legacy migration: source schema, identifiers, files and relationship mappings missing. Never assume relationships from spreadsheets.
- No staging/production deployment is requested. Administrative capabilities are installation-wide, not tenant isolation.
