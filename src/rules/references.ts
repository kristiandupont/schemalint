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
        if (!columnsCoveredByIndex(tableReference.columns, indices)) {
          report({
            rule: this.name,
            identifier: `${schemaObject.name}.${tableName}.${tableReference.name}`,
            message: `No index found on referencing column(s) ${tableReference.columns.join(", ")}`,
            suggestedMigration: `CREATE INDEX ON ${quote(tableName)}(${tableReference.columns.map(quote).join(", ")});`,
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
      tableReferences.forEach((tableReference) => {
        if (onUpdate !== undefined && tableReference.onUpdate !== onUpdate) {
          report({
            rule: this.name,
            identifier: `${schemaObject.name}.${tableName}.${tableReference.name}`,
            message: `Reference action ON UPDATE expected to be "${onUpdate}" but got "${tableReference.onUpdate}"`,
          });
        }
        if (onDelete !== undefined && tableReference.onDelete !== onDelete) {
          report({
            rule: this.name,
            identifier: `${schemaObject.name}.${tableName}.${tableReference.name}`,
            message: `Reference action ON DELETE expected to be "${onDelete}" but got "${tableReference.onDelete}"`,
          });
        }
      });
    };
    schemaObject.tables.forEach(validator);
  },
};

type TableReference = Omit<ColumnReference, "columnName"> & {
  columns: string[];
};

function buildTableReferences(columns: TableColumn[]): TableReference[] {
  type ColumnReferencePair = {
    column: string;
    reference: ColumnReference;
  };
  const columnReferencePairs: ColumnReferencePair[] = columns
    .map((c) => c.references.map((r) => ({ column: c.name, reference: r })))
    .flat();
  const columnReferencePairsByName = R.groupBy(
    (p) => p.reference.name,
    columnReferencePairs,
  );
  return Object.entries(columnReferencePairsByName).map(([_, pairs]) => {
    const columns = pairs!.map((p) => p.column);
    const { columnName: __, ...rest } = pairs![0].reference;
    return { columns, ...rest };
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
