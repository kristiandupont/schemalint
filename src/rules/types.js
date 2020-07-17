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

export const preferTimestamptz = {
  name: 'prefer-timestamptz-to-timestamp',
  docs: {
    description: 'Prefer TIMESTAMPTZ to type TIMESTAMP because when you insert a value into a timestamptz column, PostgreSQL converts the timestamptz value into a UTC value and stores the UTC value in the table,\n' +
        'and when you query timestamptz from the database, PostgreSQL converts the UTC value back to the time value of the timezone set by the database server, the user, or the current database connection',
    url: 'https://www.postgresqltutorial.com/postgresql-timestamp/',
  },
  process({ schemaObject, report }) {
    const validator = ({ name: tableName }) => ({ name: columnName, type }) => {
      if (type === 'timestamp') {
        report({
          rule: this.name,
          identifier: `${schemaObject.name}.${tableName}.${columnName}`,
          message: 'Prefer TIMESTAMPTZ to type TIMESTAMP',
          suggestedMigration: `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" TYPE TIMESTAMPTZ;`,
        });
      }
    };
    schemaObject.tables.forEach(table =>
        table.columns.forEach(validator(table))
    );
  },
};
