// Multi-environment GCP project mapping.
// Replace the placeholder project IDs below with your own.

const allowedEnvs = ["dev", "test", "uat", "prod"];

const vars = dataform.projectConfig && dataform.projectConfig.vars;
const env = (vars && vars.env) || process.env.DATAFORM_ENV || "dev";

if (!allowedEnvs.includes(env)) {
  throw new Error(
    `Invalid env '${env}'. Allowed values: ${allowedEnvs.join(", ")}`
  );
}

const envMap = {
  dev: {
    projects: {
      data_lake: "my-company-dev-data-lake",
      data_ops: "my-company-dev-data-ops",
      data_warehouse: "my-company-dev-data-warehouse",
    },
  },
  test: {
    projects: {
      data_lake: "my-company-test-data-lake",
      data_ops: "my-company-test-data-ops",
      data_warehouse: "my-company-test-data-warehouse",
    },
  },
  uat: {
    projects: {
      data_lake: "my-company-uat-data-lake",
      data_ops: "my-company-uat-data-ops",
      data_warehouse: "my-company-uat-data-warehouse",
    },
  },
  prod: {
    projects: {
      data_lake: "my-company-prod-data-lake",
      data_ops: "my-company-prod-data-ops",
      data_warehouse: "my-company-prod-data-warehouse",
    },
  },
};

module.exports = {
  target_project_lake: envMap[env].projects.data_lake,
  target_project_ops: envMap[env].projects.data_ops,
  target_project_warehouse: envMap[env].projects.data_warehouse,
  target_dataset: "raw",
  target_env: env,
};
