---
hide:
  - toc
tags:
  - catalog
  - dimension
  - store
---

# DimStore

<span class="badge badge-gold">Gold Layer</span>
<span class="badge badge-dimension">Dimension</span>
<span class="badge badge-scd2">SCD2</span>

> Dimension of stores / locations where orders are placed.

## Overview

=== "Business"

    **What it is**: Registry of stores with region and store type.

    **Purpose**: Segment sales and purchase analyses by geography and channel.

    **Used by**: Both the Sales and Purchases explores.

=== "Technical"

    | Property | Value |
    |---|---|
    | **Table** | `gold_us.DimStore` |
    | **Type** | `table` |
    | **Pattern** | SCD Type 2 |
    | **Granularity** | 1 row per store version |
    | **Source** | `silver_us.dynamic__DimStore` |
    | **LookML View** | `dim_store` |

## Column Schema

| Column | Type | Description | PK/FK | Source Table | Source Field |
|---|---|---|---|---|---|
| `sk_store` | INT64 | SCD2 surrogate key (version). | **PK** | *(generated)* | — |
| `store_id` | INT | Natural key of the store. | NK | `sales_app.stores` | `id` |
| `store_name` | STRING | Official store name. |  | `sales_app.stores` | `name` |
| `region` | STRING | Sales region. |  | `sales_app.stores` | `region` |
| `city` | STRING | City. |  | `sales_app.stores` | `city` |
| `state` | STRING | State / province. |  | `sales_app.stores` | `state` |
| `country` | STRING | Country. |  | `sales_app.stores` | `country` |
| `store_type` | STRING | Store type (Flagship / Outlet / Online / Pop-up). |  | `sales_app.stores` | `store_type` |
| `valid_from` | TIMESTAMP | Version validity start (SCD2). |  | *(CDC)* | — |
| `valid_to` | TIMESTAMP | Version validity end (SCD2). |  | *(CDC)* | — |
| `is_valid` | BOOL | TRUE for the current version. |  | *(CDC)* | — |

## Explore Joins

| Explore | Condition |
|---|---|
| `fact_sales` | `fk_store = sk_store` |
| `fact_purchases` | `fk_store = sk_store` |

## Data Lineage

```mermaid
graph LR
    A[historical__sales_app.stores] --> B[brz_store] --> C[DimStore<br/>gold_us]
    style C fill:#1976d2,color:#fff
```
