"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var recase_1 = require("@kristiandupont/recase");
exports.nameCasing = {
    name: 'name-casing',
    docs: {
        description: 'Enforce casing style of names',
        url: 'https://github.com/kristiandupont/schemalint/tree/master/src/rules#name-casing',
    },
    process: function (_a) {
        var _this = this;
        var options = _a.options, schemaObject = _a.schemaObject, report = _a.report;
        var expectedCasing = (options.length && options[0]) || 'snake';
        var validator = function (entityType) { return function (_a) {
            var entityName = _a.name;
            var casing = recase_1.detectCasing(entityName);
            var matches = casing === null || casing === expectedCasing;
            if (!matches) {
                report({
                    rule: _this.name,
                    identifier: schemaObject.name + "." + entityName,
                    message: "The " + entityType + " " + entityName + " seems to be " + casing + "-cased rather than " + expectedCasing + "-cased.",
                    suggestedMigration: "ALTER " + entityType.toUpperCase() + " \"" + entityName + "\" RENAME TO \"" + recase_1.recase(casing, expectedCasing, entityName) + "\";",
                });
            }
        }; };
        var columnValidator = function (entityType) { return function (_a) {
            var entityName = _a.name;
            return function (_a) {
                var columnName = _a.name;
                var casing = recase_1.detectCasing(columnName);
                var matches = casing === null || casing === expectedCasing;
                if (!matches) {
                    report({
                        rule: _this.name,
                        identifier: schemaObject.name + "." + entityName + "." + columnName,
                        message: "The column " + columnName + " on the " + entityType + " " + entityName + " seems to be " + casing + "-cased rather than " + expectedCasing + "-cased.",
                        suggestedMigration: "ALTER " + entityType.toUpperCase() + " \"" + entityName + "\" RENAME COLUMN \"" + columnName + "\" TO \"" + recase_1.recase(casing, expectedCasing, columnName) + "\";",
                    });
                }
            };
        }; };
        schemaObject.tables.forEach(function (entity) {
            validator('table')(entity);
            entity.columns.forEach(columnValidator('table')(entity));
        });
        schemaObject.views.forEach(function (entity) {
            validator('view')(entity);
            entity.columns.forEach(columnValidator('view')(entity));
        });
    },
};
