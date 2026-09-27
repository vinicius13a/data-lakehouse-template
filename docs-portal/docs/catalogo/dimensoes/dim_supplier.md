---
hide:
  - toc
tags:
  - catalog
  - dimension
  - supplier
---

# DimSupplier

<span class="badge badge-gold">Gold Layer</span>
<span class="badge badge-dimension">Dimension</span>
<span class="badge badge-scd2">SCD2</span>

> Dimension of suppliers / vendors that fulfill purchase orders.

## Overview

=== "Business"

    **What it is**: Registry of suppliers with country and category.

    **Purpose**: Segment procurement analyses by supplier.

    **Used by**: The Purchases explore.

=== "Technical"

    | Property | Value |
    |---|---|
    | **Table** | `gold_us.DimSupplier` |
    | **Type** | `table` |
    | **Pattern** | SCD Type 2 |
    | **Granularity** | 1 row per supplier version |
    | **Source** | `silver_us.dynamic__DimSupplier` |
    | **LookML View** | `dim_supplier` |

## Column Schema

| Column | Type | Description | PK/FK | Source Table | Source Field |
|---|---|---|---|---|---|
| `sk_supplier` | INT64 | SCD2 surrogate key (version). | **PK** | *(generated)* | — |
| `supplier_id` | INT | Natural key of the supplier. | NK | `procurement.suppliers` | `id` |
| `supplier_name` | STRING | Official supplier name. |  | `procurement.suppliers` | `name` |
| `country` | STRING | Country where the supplier is based. |  | `procurement.suppliers` | `country` |
| `supplier_category` | STRING | Category of goods provided. |  | `procurement.suppliers` | `category` |
| `valid_from` | TIMESTAMP | Version validity start (SCD2). |  | *(CDC)* | — |
| `valid_to` | TIMESTAMP | Version validity end (SCD2). |  | *(CDC)* | — |
| `is_valid` | BOOL | TRUE for the current version. |  | *(CDC)* | — |

## Explore Joins

| Explore | Condition |
|---|---|
| `fact_purchases` | `fk_supplier = sk_supplier` |

## Data Lineage

```mermaid
graph LR
    A[historical__procurement.suppliers] --> B[brz_supplier] --> C[DimSupplier<br/>gold_us]
    style C fill:#1976d2,color:#fff
```
