// This example rule will enforce primary key columns be named like this: tablename_id

const identifierNaming = {
  name: 'identifier-naming',
  docs: {
    description: 'Identifier columns should follow "tablename_id" convention',
    url: '...',
  },
  process({ schemaObject, report }) {
    const validator = ({ tags, columns, name: tableName }) => {
      const idColumns = columns.filter((c) => c.isPrimary);

      // There might be 2 or more, or there might be 0. In both cases, skip this table.
      if (idColumns.length === 1) {
        const [idColumn] = idColumns;
        const expectedName = `${tableName}_id`;
        if (idColumn.name !== expectedName) {
          report({
            rule: this.name,
            identifier: `${schemaObject.name}.${tableName}`,
            message: `The primary column on ${tableName} is called ${idColumn.name} which doesn't follow the convention. Expected name was: ${expectedName}`,
            suggestedMigration: `ALTER TABLE "${tableName}" RENAME COLUMN "${idColumn.name}" TO "${expectedName}";`,
          });
        }
      }
    };
    schemaObject.tables.forEach(validator);
  },
};

module.exports = identifierNaming;
