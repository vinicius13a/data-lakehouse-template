---
hide:
  - toc
tags:
  - catalog
  - dimension
  - calendar
---

# DimCalendar

<span class="badge badge-gold">Gold Layer</span>
<span class="badge badge-dimension">Dimension</span>

> Date dimension covering 1900-2050.

## Overview

=== "Business"

    **What it is**: A row per calendar day with rich date attributes (month, quarter, ISO week, weekend flag).

    **Purpose**: Time-series analysis and date filtering across all facts.

    **Used by**: Every explore.

=== "Technical"

    | Property | Value |
    |---|---|
    | **Table** | `gold_us.DimCalendar` |
    | **Type** | `table` |
    | **Granularity** | 1 row per calendar day |
    | **Source** | `bronze_us.brz_calendar` (generated) |
    | **LookML View** | `dim_calendar` |

## Column Schema

| Column | Type | Description |
|---|---|---|
| `sk_date` | INT64 | Surrogate key in `YYYYMMDD` format (e.g. `20251001`). Facts join here via their `fk_date_*` columns. |
| `date_day` | TIMESTAMP | Full date. |
| `year_` | INT | Year. |
| `quarter_` | INT | Quarter (1-4). |
| `month_number` | INT | Month (1-12). |
| `month_name` | STRING | Full month name. |
| `iso_week_of_year_number` | INT | ISO 8601 week number. |
| `day_of_week_name` | STRING | Full weekday name. |
| `year_month` | STRING | `YYYY-MM`. |
| `is_weekend` | BOOL | TRUE for Saturday / Sunday. |

## Explore Joins

| Explore | Condition |
|---|---|
| `fact_sales` | `sk_date = fk_date_order` |
| `fact_purchases` | `sk_date = fk_date_order` |

## Data Lineage

```mermaid
graph LR
    A[GENERATE_DATE_ARRAY<br/>1900-2050] --> B[brz_calendar] --> C[DimCalendar<br/>gold_us]
    style C fill:#1976d2,color:#fff
```
