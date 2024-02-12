import { TableColumn, TableDetails, TableIndex } from "extract-pg-schema";
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

type TableReference = {
  name: string;
  columns: string[];
};

function buildTableReferences(columns: TableColumn[]): TableReference[] {
  type ColumnReferencePair = {
    column: string;
    reference: string;
  };
  const columnReferencePairs: ColumnReferencePair[] = columns
    .map((c) =>
      c.references.map((r) => ({ column: c.name, reference: r.name })),
    )
    .flat();
  const columnReferencePairsByName = R.groupBy(
    (p) => p.reference,
    columnReferencePairs,
  );
  return Object.entries(columnReferencePairsByName).map(([name, pairs]) => {
    const columns = pairs!.map((p) => p.column);
    return { name, columns };
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
