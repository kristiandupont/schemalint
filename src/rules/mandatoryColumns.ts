import { isDeepStrictEqual } from "node:util";

import type { TableColumn, TableDetails } from "extract-pg-schema";

import type Rule from "../Rule";

export const mandatoryColumns: Rule = {
  name: "mandatory-columns",
  docs: {
    description:
      "Require tables to have certain columns with certain properties",
  },
  process({ options: [option], schemaObject, report }) {
    const expectedColumns: Record<string, Partial<TableColumn>> = option ?? {};
    const validator = ({ name: tableName, columns }: TableDetails) => {
      const columnsByName = Object.fromEntries(
        columns.map((column) => [column.name, column]),
      );
      Object.entries(expectedColumns).forEach(([name, expectedProps]) => {
        const column = columnsByName[name];
        if (!column) {
          report({
            rule: this.name,
            identifier: `${schemaObject.name}.${tableName}`,
            message: `Mandatory column "${name}" is missing`,
          });
        } else {
          const partialColumnProps = Object.fromEntries(
            Object.keys(expectedProps)
              .filter((key) => key in column)
              .map((key) => [key, column[key as keyof TableColumn]]),
          );
          if (!isDeepStrictEqual(partialColumnProps, expectedProps)) {
            report({
              rule: this.name,
              identifier: `${schemaObject.name}.${tableName}.${column.name}`,
              message: `Column "${column.name}" has properties ${JSON.stringify(partialColumnProps)} but expected ${JSON.stringify(expectedProps)}`,
            });
          }
        }
      });
    };
    schemaObject.tables.forEach(validator);
  },
};
