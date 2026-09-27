---
hide:
  - toc
tags:
  - catalog
  - dimension
  - product
---

# DimProduct

<span class="badge badge-gold">Gold Layer</span>
<span class="badge badge-dimension">Dimension</span>
<span class="badge badge-scd2">SCD2</span>

> Dimension of products in the catalog.

## Overview

=== "Business"

    **What it is**: Product catalog with category, list price and unit cost.

    **Purpose**: Segment sales and purchase analyses by product.

    **Used by**: Both the Sales and Purchases explores.

=== "Technical"

    | Property | Value |
    |---|---|
    | **Table** | `gold_us.DimProduct` |
    | **Type** | `table` |
    | **Pattern** | SCD Type 2 |
    | **Granularity** | 1 row per product version |
    | **Source** | `silver_us.dynamic__DimProduct` |
    | **LookML View** | `dim_product` |

## Column Schema

| Column | Type | Description | PK/FK | Source Table | Source Field |
|---|---|---|---|---|---|
| `sk_product` | INT64 | SCD2 surrogate key (version). | **PK** | *(generated)* | — |
| `product_id` | INT | Natural key of the product. | NK | `sales_app.products` | `id` |
| `product_name` | STRING | Official product name. |  | `sales_app.products` | `name` |
| `category` | STRING | Product category. |  | `sales_app.products` | `category` |
| `subcategory` | STRING | Product subcategory. |  | `sales_app.products` | `subcategory` |
| `unit_price` | NUMERIC | List selling price per unit. |  | `sales_app.products` | `unit_price` |
| `unit_cost` | NUMERIC | Unit cost of goods. |  | `sales_app.products` | `unit_cost` |
| `valid_from` | TIMESTAMP | Version validity start (SCD2). |  | *(CDC)* | — |
| `valid_to` | TIMESTAMP | Version validity end (SCD2). |  | *(CDC)* | — |
| `is_valid` | BOOL | TRUE for the current version. |  | *(CDC)* | — |

## Explore Joins

| Explore | Condition |
|---|---|
| `fact_sales` | `fk_product = sk_product` |
| `fact_purchases` | `fk_product = sk_product` |

## Data Lineage

```mermaid
graph LR
    A[historical__sales_app.products] --> B[brz_product] --> C[DimProduct<br/>gold_us]
    style C fill:#1976d2,color:#fff
```
