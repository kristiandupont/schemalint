export const requirePrimaryKey = {
  name: 'require-primary-key',
  docs: {
    description: 'Enforce primary key definition',
    url:
      'https://github.com/kristiandupont/schemalint/tree/master/src/rules#require-primary-key',
  },
  process({ options, schemaObject, report }) {
    const ignorePatternsMatch =
      options[0] && options[0].ignorePattern
        ? new RegExp(options[0].ignorePattern)
        : null;
    const validator = ({ tags, columns, name: tableName }) => {
      const idColumns = columns.filter((c) => c.isPrimary);

      if (idColumns.length < 1) {
        report({
          rule: this.name,
          identifier: `${schemaObject.name}.${tableName}`,
          message: `The table ${schemaObject.name}.${tableName} does not have a primary key defined";`,
          suggestedMigration: `ALTER TABLE "${schemaObject.name}.${tableName}" ADD PRIMARY KEY (<primary key column or columns>)";`,
        });
      }
    };
    schemaObject.tables
      .filter((table) => {
        return (
          !ignorePatternsMatch ||
          !ignorePatternsMatch.test(`${schemaObject.name}.${table.name}`)
        );
      })
      .forEach(validator);
  },
};
