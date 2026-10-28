# ADR-010 — Extend native commerce with transactional operational modules

Date: 2026-10-26. Status: implementation decision within the user's explicit native-first implementation request. Business tax, returns and settlement policies remain unapproved.

Context: products, commercial orders and identities already use WooCommerce/WordPress. Missing capabilities concern production lifecycle, multi-channel publication, customs snapshots and asynchronous communications. Existing identifiers and working commands must remain compatible.

Decision: keep WooCommerce CRUD/HPOS and native editors as authoritative. Add transactional production, returns, inbox/outbox tables; extend Products/Orders/Users/Settings rather than another dashboard. Use a single operations row lock and nested savepoints. Keep immediate repacking as a compatible path alongside planned production. Publish provider interfaces with deterministic mock tests; register no live provider without verified configuration.

Alternatives: replace WooCommerce with parallel entities (rejected: duplicate ownership); assume third-party plugins meet all rules (rejected without validation); use postmeta as stock ledger (rejected for concurrent physical accounting).

Consequences: conservative serialization favors correctness over throughput. Independent administrative tenants and legal-entity tax configurations are not implied by channel selection. Outgoing effects require durable queueing and provider deduplication; native plugin side effects need further staging verification. Revisit the mutex after measured contention, and tenant topology when approved ownership/security requirements exist.

Reversibility: additive migrations, preserved command paths and pre-change database backup. A full downgrade needs matching code/database and protection of subsequent writes. No destructive automatic rollback is provided.
