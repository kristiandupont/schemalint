"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var recase_1 = require("@kristiandupont/recase");
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
                        message: "Prefer TEXT to " + type + " types",
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
exports.tableNameCasing = {
    name: 'table-name-casing',
    docs: {
        description: 'Enforce casing style of table names',
        url: '...',
    },
    process: function (_a) {
        var _this = this;
        var options = _a.options, schemaObject = _a.schemaObject, report = _a.report;
        var expectedCasing = (options.length && options[0]) || 'snake';
        var validator = function (_a) {
            var tableName = _a.name;
            var casing = recase_1.detectCasing(tableName);
            var matches = casing === null || casing === expectedCasing;
            if (!matches) {
                report({
                    rule: _this.name,
                    identifier: schemaObject.name + "." + tableName,
                    message: "The name " + tableName + " seems to be " + casing + "-cased rather than " + expectedCasing + "-cased.",
                    suggestedMigration: "ALTER TABLE \"" + tableName + "\" RENAME TO \"" + recase_1.recase(casing, expectedCasing, tableName) + "\";",
                });
            }
        };
        schemaObject.tables.forEach(validator);
    },
};
exports.columnNameCasing = {
    name: 'column-name-casing',
    docs: {
        description: 'Enforce casing style of column names',
        url: '...',
    },
    process: function (_a) {
        var _this = this;
        var options = _a.options, schemaObject = _a.schemaObject, report = _a.report;
        var expectedCasing = (options.length && options[0]) || 'snake';
        var validator = function (_a) {
            var tableName = _a.name;
            return function (_a) {
                var columnName = _a.name;
                var casing = recase_1.detectCasing(columnName);
                var matches = casing === null || casing === expectedCasing;
                if (!matches) {
                    report({
                        rule: _this.name,
                        identifier: schemaObject.name + "." + tableName + "." + columnName,
                        message: "The name " + columnName + " on " + tableName + " seems to be " + casing + "-cased rather than " + expectedCasing + "-cased.",
                        suggestedMigration: "ALTER TABLE \"" + tableName + "\" RENAME COLUMN \"" + columnName + "\" TO \"" + recase_1.recase(casing, expectedCasing, columnName) + "\";",
                    });
                }
            };
        };
        schemaObject.tables.forEach(function (table) {
            return table.columns.forEach(validator(table));
        });
    },
};
