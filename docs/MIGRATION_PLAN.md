# Migration plan and rollback

Actual legacy PHP/database/media migration is **BLOCKED**: source schema, primary/foreign keys and complete data have not been provided. Existing XLSX audits establish observed columns/counts only. They do not prove product, stock, order or customer relationships. No production database is modified.

1. Obtain read-only exports and media, schema/version and authorized scope. Hash originals; keep private data outside Git. Record source authority and exceptions.
2. Approve a per-entity mapping with source namespace, legacy ID, destination type/ID, transformation and reconciliation rule. Preserve currencies and historical semantics; never relabel USD/GBP amounts or guess tax/HS codes.
3. Import product/variation identities using native WooCommerce CSV/CRUD. Load users and commercial orders with native APIs. Registry import accepts bounded validated configuration batches; `commit=false` returns row errors and writes nothing. It is not a complete legacy importer.
4. Resolve companies/warehouses/channels and ownership before inventory. Import opening balances as explicit audited receipts, then reconcile physical/reserved/available, movements, costs and totals by currency. Define a cutover boundary to avoid replaying historical stock deductions into opening balances.
5. Reconcile counts, unique identifiers, native order/refund totals, customer credit, media and redirects. Run fresh imports twice in isolated staging to prove determinism and identify duplicate-source IDs. Validate samples manually with the owner.
6. Freeze source writes for the approved cutover window, apply delta, validate, and obtain release authorization. Live deployment requires rotation of local test credentials/secrets.

Local pre-change backup exists at `wordpress/backups/katukina-2026-10-26T13-37-09-528Z.sql`, SHA-256 `6ab54d9b68ddd6baccb4ee5c16eca436fe6e6675b226b8fd294d04c78fb4ea3f`. It is ignored by Git. Backup creation was executed; restoration has not been tested. To roll back this implementation in an isolated copy, restore matching code and this database together after first exporting newer data. Do not discard newer orders or inventory silently. Additive domain tables are retained during code-only downgrade.
