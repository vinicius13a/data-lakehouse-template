// Temporal helper functions shared across Silver views.
// They build the valid_from / valid_to / is_valid columns from one or more
// temporal source aliases.

exports.sql__valid_from = (table_names) => {
    return `
    GREATEST(
        ${table_names.map(name => `COALESCE(${name}.valid_from, DATETIME("1970-01-01 00:00:00"))`).join(", ")}
    )
    `;
};

exports.sql__valid_to = (table_names) => {
    return `
    LEAST(
        ${table_names.map(name => `COALESCE(${name}.valid_to, DATETIME("9999-12-31 00:00:00"))`).join(", ")}
    )
    `;
};

exports.sql__is_valid = (table_names) => {
    return `(
        CURRENT_DATETIME('UTC') BETWEEN
        ${exports.sql__valid_from(table_names)} AND
        ${exports.sql__valid_to(table_names)}
    )
    `;
};
