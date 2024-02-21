import type { TableDetails } from "extract-pg-schema";

import type Rule from "../Rule";

export const rowLevelSecurity: Rule = {
  name: "row-level-security",
  docs: {
    description:
      "Require tables to enable row-level security and optionally enforce it",
  },
  process({ options: [option], schemaObject, report }) {
    const { enforced } = option ?? { enforced: false };
    const validator = ({
      name: tableName,
      isRowLevelSecurityEnabled,
      isRowLevelSecurityEnforced,
    }: TableDetails) => {
      if (!isRowLevelSecurityEnabled) {
        report({
          rule: this.name,
          identifier: `${schemaObject.name}.${tableName}`,
          message: `Row-level security is disabled`,
          suggestedMigration: `ALTER TABLE "${schemaObject.name}"."${tableName}" ENABLE ROW LEVEL SECURITY;`,
        });
      }
      if (enforced === true && !isRowLevelSecurityEnforced) {
        report({
          rule: this.name,
          identifier: `${schemaObject.name}.${tableName}`,
          message: `Row-level security is not enforced`,
          suggestedMigration: `ALTER TABLE "${schemaObject.name}"."${tableName}" FORCE ROW LEVEL SECURITY;`,
        });
      }
    };
    schemaObject.tables.forEach(validator);
  },
};
