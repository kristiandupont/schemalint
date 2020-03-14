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
          message: `Prefer text to ${type} types`,
          suggestedMigration: `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" TYPE TEXT;`,
        });
      }
    };
    schemaObject.tables.forEach(table =>
      table.columns.forEach(validator(table))
    );
  },
};
