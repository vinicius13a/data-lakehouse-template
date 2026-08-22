// definitions/sources.js
// Auto-generates raw__<schema>.<table> (deduplicated) and
// historical__<schema>.<table> (temporal, with valid_from/valid_to) views
// from the registry in sources.json.

const {
    target_project_lake: PROJECT_LAKE,
    target_project_warehouse: PROJECT_WAREHOUSE
} = require("./_project");

const sourcesRaw = require("./sources.json");
const dataColumns = require("./data_columns.json");

// Schemas that carry CDC history (Datastream). Others get raw views only.
const HISTORICAL_SCHEMAS = ["sales_app", "procurement"];

// Normalize registry entries.
const sources = sourcesRaw.map((s) => {
    const schema = s.table_schema;
    const name = s.table_name;
    const pk = Array.isArray(s.cols) ? s.cols.filter(Boolean) : [];

    return {
        input: {
            database: PROJECT_WAREHOUSE,
            schema,
            name
        },
        pk,
        no_history: !!s.no_history,
        skip_raw: !!s.skip_raw,
        excluded_columns: Array.isArray(s.excluded_columns) ? s.excluded_columns.filter(Boolean) : []
    };
});

const rawSources = sources
    .filter(({ skip_raw }) => !skip_raw)
    .map(({ input, excluded_columns }) => {
        const selectExpr = excluded_columns.length
            ? `t.* EXCEPT(${excluded_columns.join(", ")})`
            : `t.*`;

        return publish(input.name, {
            type: "view",
            database: PROJECT_WAREHOUSE,
            schema: `raw__${input.schema}`,
            columns: dataColumns,
            tags: ["generated", "history"],
        }).query(`
        SELECT
          ${selectExpr}
        FROM \`${PROJECT_LAKE}.${input.schema}.${input.name}\` AS t
      `);
    });

const historicalViews = sources
    .filter(({ input, no_history }) => HISTORICAL_SCHEMAS.includes(input.schema) && !no_history)
    .map(({ input, pk }) => {
        const pkList = pk.length ? pk.join(", ") : null;

        return publish(input.name, {
            type: "view",
            database: PROJECT_WAREHOUSE,
            schema: `historical__${input.schema}`,
            columns: dataColumns,
            tags: ["generated", "history"],
        }).query(`
        SELECT
          t.*
          , ROW_NUMBER() OVER (
              ${pkList ? `PARTITION BY ${pkList}` : ""}
              ORDER BY t.datastream_metadata.source_timestamp DESC
                     , CAST(t.datastream_metadata.sort_keys[SAFE_OFFSET(3)] AS INT64) DESC
            ) AS _meta_timestamp_index
          , DATETIME(TIMESTAMP_MILLIS(t.datastream_metadata.source_timestamp), 'UTC') AS valid_from
          , LEAD(DATETIME(TIMESTAMP_MILLIS(t.datastream_metadata.source_timestamp), 'UTC')) OVER (
              ${pkList ? `PARTITION BY ${pkList}` : ""}
              ORDER BY t.datastream_metadata.source_timestamp
                     , CAST(t.datastream_metadata.sort_keys[SAFE_OFFSET(3)] AS INT64)
            ) AS valid_to
        FROM \`${PROJECT_LAKE}.historical_${input.schema}.${input.name}\` AS t
      `);
    });

module.exports = {
    rawSources,
    historicalViews,
};
