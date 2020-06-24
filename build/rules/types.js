"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preferJsonbToJson = {
    name: 'prefer-jsonb-to-json',
    docs: {
        description: 'Prefer JSONB to JSON types',
        url: '...',
    },
    process: function (_a) {
        var _this = this;
        var schemaObject = _a.schemaObject, report = _a.report;
        var validator = function (_a) {
            var tableName = _a.name;
            return function (_a) {
                var columnName = _a.name, type = _a.type;
                if (type === 'json') {
                    report({
                        rule: _this.name,
                        identifier: schemaObject.name + "." + tableName + "." + columnName,
                        message: 'Prefer JSONB to JSON types',
                        suggestedMigration: "ALTER TABLE \"" + tableName + "\" ALTER COLUMN \"" + columnName + "\" TYPE JSONB;",
                    });
                }
            };
        };
        schemaObject.tables.forEach(function (table) {
            return table.columns.forEach(validator(table));
        });
    },
};
exports.preferTextToVarchar = {
    name: 'prefer-text-to-varchar',
    docs: {
        description: 'Prefer the text type over varchar',
        url: '...',
    },
    process: function (_a) {
        var _this = this;
        var schemaObject = _a.schemaObject, report = _a.report;
        var validator = function (_a) {
            var tableName = _a.name;
            return function (_a) {
                var columnName = _a.name, type = _a.type;
                if (type.startsWith('varchar')) {
                    report({
                        rule: _this.name,
                        identifier: schemaObject.name + "." + tableName + "." + columnName,
                        message: "Prefer text to " + type + " types",
                        suggestedMigration: "ALTER TABLE \"" + tableName + "\" ALTER COLUMN \"" + columnName + "\" TYPE TEXT;",
                    });
                }
            };
        };
        schemaObject.tables.forEach(function (table) {
            return table.columns.forEach(validator(table));
        });
    },
};
