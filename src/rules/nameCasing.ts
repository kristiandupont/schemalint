import { detectCasing, recase } from "@kristiandupont/recase";
import {
  TableColumn,
  TableDetails,
  ViewColumn,
  ViewDetails,
} from "extract-pg-schema";

import Rule from "../Rule";

export const nameCasing: Rule = {
  name: "name-casing",
  docs: {
    description: "Enforce casing style of names",
    url: "https://github.com/kristiandupont/schemalint/tree/master/src/rules#name-casing",
  },
  process({ options, schemaObject, report }) {
    const expectedCasing = (options.length > 0 && options[0]) || "snake";
    const validator =
      (entityType: "table" | "view") =>
      ({ name: entityName }: TableDetails | ViewDetails) => {
        const casing = detectCasing(entityName);
        const matches = casing === null || casing === expectedCasing;
        if (!matches) {
          report({
            rule: this.name,
            identifier: `${schemaObject.name}.${entityName}`,
            message: `The ${entityType} ${entityName} seems to be ${casing}-cased rather than ${expectedCasing}-cased.`,
            suggestedMigration: `ALTER ${entityType.toUpperCase()} "${entityName}" RENAME TO "${recase(
              casing,
              expectedCasing,
              entityName,
            )}";`,
          });
        }
      };
    const columnValidator =
      (entityType: "table" | "view") =>
      ({ name: entityName }: TableDetails | ViewDetails) =>
      ({ name: columnName }: TableColumn | ViewColumn) => {
        const casing = detectCasing(columnName);
        const matches = casing === null || casing === expectedCasing;
        if (!matches) {
          report({
            rule: this.name,
            identifier: `${schemaObject.name}.${entityName}.${columnName}`,
            message: `The column ${columnName} on the ${entityType} ${entityName} seems to be ${casing}-cased rather than ${expectedCasing}-cased.`,
            suggestedMigration: `ALTER ${entityType.toUpperCase()} "${entityName}" RENAME COLUMN "${columnName}" TO "${recase(
              casing,
              expectedCasing,
              columnName,
            )}";`,
          });
        }
      };
    if (Array.isArray(schemaObject.tables)) {
        schemaObject.tables.forEach((entity) => {
      validator("table")(entity);
          entity.columns.forEach(columnValidator("table")(entity));
        });
    }
    if (Array.isArray(schemaObject.views)) {
        schemaObject.views.forEach((entity) => {
      validator("view")(entity);
          entity.columns.forEach(columnValidator("view")(entity));
        });
    }
  },
};
