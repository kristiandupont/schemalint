// This example rule will ensure that tables with a last_update column have a trigger on the column

/** @type {import('schemalint').Rule} */
const lastUpdated = {
  name: 'last-updated',
  docs: {
    description: 'Tables with a last_updated column should have a trigger on the column',
    url: '...',
  },
  process({ schemaObject, report }) {
    const validator = ({ tags, columns, name: tableName, triggers }) => {
      const lastUpdatedColumns = columns.filter((c) => c.name === 'last_update');

      if (lastUpdatedColumns.length === 1) {
        const trigger = triggers.find((t) => t.name === 'last_updated');
        if (!trigger) {
          report({
            rule: this.name,
            identifier: `${schemaObject.name}.${tableName}`,
            message: `Table ${tableName} has a last_updated column but no trigger on the column`,
            suggestedMigration: `CREATE TRIGGER last_updated ON ${tableName} AFTER UPDATE ON ${tableName} FOR EACH ROW EXECUTE FUNCTION last_updated();`,
          });
        }
      }
    };
    schemaObject.tables.forEach(validator);
  },
};

module.exports = lastUpdated;
