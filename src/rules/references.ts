import {
  ColumnReference,
  TableColumn,
  TableDetails,
  TableIndex,
} from "extract-pg-schema";
import * as R from "ramda";

import Rule from "../Rule";

export const indexReferencingColumn: Rule = {
  name: "index-referencing-column",
  docs: {
    description: "Require index on referencing column of foreign keys",
  },
  process({ schemaObject, report }) {
    const validator = ({ columns, name: tableName, indices }: TableDetails) => {
      const tableReferences = buildTableReferences(columns);
      tableReferences.forEach((tableReference) => {
        if (
          !columnsCoveredByIndex(tableReference.referencingColumnNames, indices)
        ) {
          report({
            rule: this.name,
            identifier: `${schemaObject.name}.${tableName}.${tableReference.name}`,
            message: `No index found on referencing column(s) ${tableReference.referencingColumnNames.join(", ")}`,
            suggestedMigration: `CREATE INDEX ON ${quote(tableName)}(${tableReference.referencingColumnNames.map(quote).join(", ")});`,
          });
        }
      });
    };
    schemaObject.tables.forEach(validator);
  },
};

export const referenceActions: Rule = {
  name: "reference-actions",
  docs: {
    description:
      "Require references to have specific ON DELETE and ON UPDATE actions",
  },
  process({ options: [{ onUpdate, onDelete }], schemaObject, report }) {
    const validator = ({ columns, name: tableName }: TableDetails) => {
      const tableReferences = buildTableReferences(columns);
      function suggestedMigration(tableReference: TableReference): string {
        return (
          `ALTER TABLE ${quote(tableName)} DROP CONSTRAINT ${quote(tableReference.name)}, ` +
          `ADD CONSTRAINT ${quote(tableReference.name)} FOREIGN KEY (${tableReference.referencingColumnNames.map(quote).join(", ")}) ` +
          `REFERENCES ${quote(tableReference.tableName)}(${tableReference.columnNames.map(quote).join(", ")}) ` +
          `ON UPDATE ${onUpdate ?? tableReference.onUpdate} ON DELETE ${onDelete ?? tableReference.onDelete};`
        );
      }
      tableReferences.forEach((tableReference) => {
        if (onUpdate !== undefined && tableReference.onUpdate !== onUpdate) {
          report({
            rule: this.name,
            identifier: `${schemaObject.name}.${tableName}.${tableReference.name}`,
            message: `Reference action ON UPDATE expected to be "${onUpdate}" but got "${tableReference.onUpdate}"`,
            suggestedMigration: suggestedMigration(tableReference),
          });
        }
        if (onDelete !== undefined && tableReference.onDelete !== onDelete) {
          report({
            rule: this.name,
            identifier: `${schemaObject.name}.${tableName}.${tableReference.name}`,
            message: `Reference action ON DELETE expected to be "${onDelete}" but got "${tableReference.onDelete}"`,
            suggestedMigration: suggestedMigration(tableReference),
          });
        }
      });
    };
    schemaObject.tables.forEach(validator);
  },
};

type TableReference = Omit<ColumnReference, "columnName"> & {
  columnNames: string[];
  referencingColumnNames: string[];
};

function buildTableReferences(columns: TableColumn[]): TableReference[] {
  type ColumnReferencePair = {
    referncingColumnName: string;
    reference: ColumnReference;
  };
  const columnReferencePairs: ColumnReferencePair[] = columns
    .map((c) =>
      c.references.map((r) => ({ referncingColumnName: c.name, reference: r })),
    )
    .flat();
  const columnReferencePairsByName = R.groupBy(
    (p) => p.reference.name,
    columnReferencePairs,
  ) as Record<string, ColumnReferencePair[]>;
  return Object.values(columnReferencePairsByName).map((pairs) => {
    const columnNames = pairs.map((p) => p.reference.columnName);
    const referencingColumnNames = pairs.map((p) => p.referncingColumnName);
    const { columnName: _, ...rest } = pairs[0].reference;
    return { columnNames, referencingColumnNames, ...rest };
  });
}

function columnsCoveredByIndex(
  columns: string[],
  indices: TableIndex[],
): boolean {
  // At least one column must be covered by an index
  return columns.some((c) => indices.some((i) => i.columns[0].name === c));
}

function quote(s: string): string {
  return `"${s}"`;
}
