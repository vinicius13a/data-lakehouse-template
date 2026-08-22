# Data Warehouse Template — CLAUDE.md

Context for a generic dimensional data warehouse template. This repository is
domain-agnostic and ships with **fictional** business data only.

## Stack

BigQuery + Dataform (Medallion: `bronze_us` → `silver_us` → `gold_us`) + Looker (LookML).
Source data via Google Cloud Datastream (CDC) from a relational database.

- Looker model: `lookML/gold-model/gold-model.txt`
- LookML views: `lookML/gold-model/views/*.txt` — extension `.txt`, NOT `.lkml`
- Dashboards: `lookML/gold-model/dashboard/*.txt`
- Dataform definitions: `definitions/med_bronze/`, `definitions/med_silver/`, `definitions/med_gold/`

## Source schemas

| Schema | Content |
|---|---|
| `raw__sales_app` | Current snapshot of `sales_app` tables (customers, products, stores, orders, order_items) |
| `historical__sales_app` | CDC with `valid_from`, `valid_to` of `sales_app` tables |
| `raw__procurement` | Current snapshot of `procurement` tables (suppliers, purchase_orders, purchase_order_items) |
| `historical__procurement` | CDC with `valid_from`, `valid_to` of `procurement` tables |

Sources are declared in `definitions/sources.json`. In SQLX use
`${ref("raw__sales_app", "customers")}` — never a hardcoded backtick reference.

## Critical patterns

### is_valid is BOOLEAN
Always `is_valid = true`, never `is_valid = 'Yes'`.

### SCD Type 2
Dimensions and versioned facts include `valid_from` in the identity fingerprint so the
surrogate key identifies a stable **version** of the entity. See `med_silver/dynamic.js`.

### Gold FK resolution
Facts resolve dimension keys via CTE + `QUALIFY ROW_NUMBER()` on `valid_from >= dim.valid_from`.

### Calendar FKs
Date foreign keys are `INT64` in `YYYYMMDD` format matching `DimCalendar.sk_date`.

## Main explores

| Explore | Joins |
|---|---|
| `fact_sales` | dim_customer, dim_product, dim_store, dim_calendar |
| `fact_purchases` | dim_supplier, dim_product, dim_store, dim_calendar |
