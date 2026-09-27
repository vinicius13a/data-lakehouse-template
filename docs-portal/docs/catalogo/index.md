# Data Catalog

The catalog documents every fact and dimension in the Gold layer.

## Dimensions

| Model | Grain | Description |
|---|---|---|
| [DimCalendar](dimensoes/dim_calendar.md) | 1 row per calendar day | Date attributes (1900-2050). |
| [DimCustomer](dimensoes/dim_customer.md) | 1 row per customer version | Customer demographics, location, segment. |
| [DimProduct](dimensoes/dim_product.md) | 1 row per product version | Product catalog: name, category, price, cost. |
| [DimStore](dimensoes/dim_store.md) | 1 row per store version | Store / location details. |
| [DimSupplier](dimensoes/dim_supplier.md) | 1 row per supplier version | Supplier / vendor details. |

## Facts

| Model | Grain | Description |
|---|---|---|
| [FactSales](fatos/fact_sales.md) | 1 row per sales order line | Quantity, price, discount, net revenue. |
| [FactPurchases](fatos/fact_purchases.md) | 1 row per purchase order line | Quantity ordered, unit cost, total cost. |
