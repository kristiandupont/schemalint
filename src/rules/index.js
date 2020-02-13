import { recase, detectCasing } from '@kristiandupont/recase';

export const preferJsonbToJson = {
  name: 'prefer-jsonb-to-json',
  docs: {
    description: 'Prefer JSONB to JSON types',
    url: '...',
  },
  process({ schemaObject, report }) {
    const validator = ({ name: tableName }) => ({ name: columnName, type }) => {
      if (type === 'json') {
        report({
          rule: this.name,
          identifier: `${schemaObject.name}.${tableName}.${columnName}`,
          message: 'Prefer JSONB to JSON types',
          suggestedMigration: `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" TYPE JSONB;`,
        });
      }
    };
    schemaObject.tables.forEach(table =>
      table.columns.forEach(validator(table))
    );
  },
};

export const preferTextToVarchar = {
  name: 'prefer-text-to-varchar',
  docs: {
    description: 'Prefer the text type over varchar',
    url: '...',
  },
  process({ schemaObject, report }) {
    const validator = ({ name: tableName }) => ({ name: columnName, type }) => {
      if (type.startsWith('varchar')) {
        report({
          rule: this.name,
          identifier: `${schemaObject.name}.${tableName}.${columnName}`,
          message: `Prefer TEXT to ${type} types`,
          suggestedMigration: `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" TYPE TEXT;`,
        });
      }
    };
    schemaObject.tables.forEach(table =>
      table.columns.forEach(validator(table))
    );
  },
};

export const tableNameCasing = {
  name: 'table-name-casing',
  docs: {
    description: 'Enforce casing style of table names',
    url: '...',
  },
  process({ options, schemaObject, report }) {
    const expectedCasing = (options.length && options[0]) || 'snake';
    const validator = ({ name: tableName }) => {
      const casing = detectCasing(tableName);
      const matches = casing === null || casing === expectedCasing;
      if (!matches) {
        report({
          rule: this.name,
          identifier: `${schemaObject.name}.${tableName}`,
          message: `The name ${tableName} seems to be ${casing}-cased rather than ${expectedCasing}-cased.`,
          suggestedMigration: `ALTER TABLE "${tableName}" RENAME TO "${recase(
            casing,
            expectedCasing,
            tableName
          )}";`,
        });
      }
    };
    schemaObject.tables.forEach(validator);
  },
};

export const columnNameCasing = {
  name: 'column-name-casing',
  docs: {
    description: 'Enforce casing style of column names',
    url: '...',
  },
  process({ options, schemaObject, report }) {
    const expectedCasing = (options.length && options[0]) || 'snake';
    const validator = ({ name: tableName }) => ({ name: columnName }) => {
      const casing = detectCasing(columnName);
      const matches = casing === null || casing === expectedCasing;
      if (!matches) {
        report({
          rule: this.name,
          identifier: `${schemaObject.name}.${tableName}.${columnName}`,
          message: `The name ${columnName} on ${tableName} seems to be ${casing}-cased rather than ${expectedCasing}-cased.`,
          suggestedMigration: `ALTER TABLE "${tableName}" RENAME COLUMN "${columnName}" TO "${recase(
            casing,
            expectedCasing,
            columnName
          )}";`,
        });
      }
    };
    schemaObject.tables.forEach(table =>
      table.columns.forEach(validator(table))
    );
  },
};
