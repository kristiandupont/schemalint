"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var R = require('ramda');
var irregularPlurals = require('irregular-plurals/irregular-plurals.json');
var singulars = R.keys(irregularPlurals);
var plurals = R.values(irregularPlurals);
var trimSeparators = function (s) { return s.replace(/^(\-|_)+|(\-|_)+$/g, ''); };
var detectPlurality = function (word) {
    var words = word
        .split(/(?=[A-Z\-_])/)
        .map(trimSeparators)
        .filter(Boolean);
    var lastWord = words[words.length - 1].toLowerCase();
    if (lastWord in irregularPlurals && irregularPlurals[lastWord] === lastWord) {
        // Irregular and singular = plural.
        return 'unknown';
    }
    if (R.includes(singulars, lastWord)) {
        return 'singular';
    }
    if (R.includes(plurals, lastWord)) {
        return 'plural';
    }
    // Regular plural words end with s
    var endsWithS = lastWord[lastWord.length - 1] === 's';
    // ..but some singular ones do as well. Though they typically have two s's (like kiss, address and fortress)
    var doubleS = lastWord.length > 1 && lastWord[lastWord.length - 2] === 's';
    var isPlural = endsWithS && !doubleS;
    return isPlural ? 'plural' : 'singular';
};
exports.namePlurality = {
    name: 'name-plurality',
    docs: {
        description: 'Enforce singluar or plural naming of tables and views',
        url: 'https://github.com/kristiandupont/schemalint/tree/master/src/rules#name-plurality',
    },
    process: function (_a) {
        var _this = this;
        var options = _a.options, schemaObject = _a.schemaObject, report = _a.report;
        var expectedPlurality = (options.length && options[0]) || 'singular';
        var validator = function (entityType) { return function (_a) {
            var entityName = _a.name;
            var plurality = detectPlurality(entityName);
            var matches = plurality === expectedPlurality || plurality === 'unknown';
            if (!matches) {
                report({
                    rule: _this.name,
                    identifier: schemaObject.name + "." + entityName,
                    message: "Expected " + expectedPlurality + " names, but '" + entityName + "' seems to be " + plurality,
                });
            }
        }; };
        schemaObject.tables.forEach(validator('table'));
        schemaObject.views.forEach(validator('view'));
    },
};
