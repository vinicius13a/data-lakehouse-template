const project_warehouse = require("../_project").target_project_warehouse;

// SCD Type 2 engine.
// Tables with multiple versions per business key include valid_from in the
// primary_key_columns: the surrogate key then identifies a stable VERSION.
// valid_to / is_valid stay out of the identity, so closing a version does not
// generate a new surrogate key.
const data_tables = {
  DimCustomer: {
    primary_key_columns: ["customer_id", "valid_from"],
    surrogate_key: "sk_customer"
  },
  DimProduct: {
    primary_key_columns: ["product_id", "valid_from"],
    surrogate_key: "sk_product"
  },
  DimStore: {
    primary_key_columns: ["store_id", "valid_from"],
    surrogate_key: "sk_store"
  },
  DimSupplier: {
    primary_key_columns: ["supplier_id", "valid_from"],
    surrogate_key: "sk_supplier"
  },
  FactSales: {
    primary_key_columns: ["order_item_id", "valid_from"],
    surrogate_key: "sk_sales",
    tags: ["sales"]
  },
  FactPurchases: {
    primary_key_columns: ["purchase_order_item_id", "valid_from"],
    surrogate_key: "sk_purchase",
    tags: ["purchases"]
  },
};

// Builds the fingerprinted source.
// type1 = stable identity of the version (PK [+ valid_from]) -> becomes the SK
// type2 = hash of the full row -> only used to detect a content change
const _src_helper = (ctx, name, pkCols, sk_name) => {
  const hasValidity = pkCols.includes("valid_from");
  return `
  WITH _SOURCE_WITH_FINGERPRINT AS (
    SELECT
      _SOURCE.*,
      FARM_FINGERPRINT(TO_JSON_STRING(STRUCT(
        ${pkCols.map((c) => `${c} AS ${c}`).join(", ")}
      ))) AS _meta_fingerprint_type1,
      FARM_FINGERPRINT(TO_JSON_STRING(_SOURCE)) AS _meta_fingerprint_type2
    FROM ${ctx.ref("silver_us", name)} AS _SOURCE
  )
  SELECT
    *,
    _meta_fingerprint_type1 AS ${sk_name}
  FROM _SOURCE_WITH_FINGERPRINT
  ${hasValidity ? `QUALIFY ROW_NUMBER() OVER (
    PARTITION BY _meta_fingerprint_type1
    ORDER BY COALESCE(valid_to, DATETIME('9999-12-31 00:00:00')) DESC
  ) = 1` : ""}
`;
};

const tables_silver = Object.entries(data_tables).forEach(
  ([name, _data_table]) => {
    publish(`dynamic__${name}`, {
      database: project_warehouse,
      schema: "silver_us",
      type: "table",
      tags: _data_table.tags || [],
      pre_operations: {},
    })
      .preOps(
        // 1) Ensure the target exists with the right columns (create-empty)
        (ctx) =>
          `CREATE TABLE IF NOT EXISTS ${ctx.self()} AS
      SELECT * FROM (${_src_helper(ctx, name, _data_table.primary_key_columns, _data_table.surrogate_key)}) WHERE 1=0`
      )
      .postOps(
        // 2) Close current rows when the type-2 fingerprint changes, then MERGE
        (ctx) => `
        DELETE FROM ${ctx.self()} AS table_target
        WHERE EXISTS (
          SELECT 1
          FROM (
            ${_src_helper(ctx, name, _data_table.primary_key_columns, _data_table.surrogate_key)}
          ) AS table_source
          WHERE table_target._meta_fingerprint_type1 = table_source._meta_fingerprint_type1
            AND table_target._meta_fingerprint_type2 != table_source._meta_fingerprint_type2
        );

        MERGE ${ctx.self()} table_target
          USING (
            ${_src_helper(ctx, name, _data_table.primary_key_columns, _data_table.surrogate_key)}
          ) as table_source
          ON table_target._meta_fingerprint_type1 = table_source._meta_fingerprint_type1
          WHEN NOT MATCHED THEN
            INSERT ROW
          WHEN NOT MATCHED BY SOURCE THEN
            DELETE
        ;
        `
      )
      .query(
        (ctx) =>
          `
          -- Minimal base query so Dataform is happy; never returns rows.
          SELECT * FROM (${_src_helper(ctx, name, _data_table.primary_key_columns, _data_table.surrogate_key)}) WHERE 1=0
        `
      );
  }
);

module.exports = {
  data_tables: data_tables,
  tables_silver: tables_silver,
};
