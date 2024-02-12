import { TableDetails } from "extract-pg-schema";

import Rule from "../Rule";

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
        });
      }
      if (enforced === true && !isRowLevelSecurityEnforced) {
        report({
          rule: this.name,
          identifier: `${schemaObject.name}.${tableName}`,
          message: `Row-level security is not enforced`,
        });
      }
    };
    schemaObject.tables.forEach(validator);
  },
};
