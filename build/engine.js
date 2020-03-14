"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var ramda_1 = require("ramda");
var knex_1 = __importDefault(require("knex"));
var chalk_1 = __importDefault(require("chalk"));
var extract_pg_schema_1 = require("extract-pg-schema");
var builtinRules = __importStar(require("./rules"));
function consoleReporter(_a) {
    var rule = _a.rule, identifier = _a.identifier, message = _a.message;
    console.log(chalk_1.default.yellow(identifier) + ": error " + chalk_1.default.red(rule) + " : " + message);
}
var anyIssues = false;
var suggestedMigrations = [];
var createReportFunction = function (reporter, ignoreMatchers) { return function (_a) {
    var rule = _a.rule, identifier = _a.identifier, message = _a.message, suggestedMigration = _a.suggestedMigration;
    if (ignoreMatchers.find(function (im) { return im(rule, identifier); })) {
        // This one is ignored.
        return;
    }
    reporter({ rule: rule, identifier: identifier, message: message });
    if (suggestedMigration) {
        suggestedMigrations.push(suggestedMigration);
    }
    anyIssues = true;
}; };
function processDatabase(_a) {
    var connection = _a.connection, _b = _a.plugins, plugins = _b === void 0 ? [] : _b, rules = _a.rules, schemas = _a.schemas, _c = _a.ignores, ignores = _c === void 0 ? [] : _c;
    return __awaiter(this, void 0, void 0, function () {
        var pluginRules, allRules, registeredRules, knexConfig, db, ignoreMatchers, _i, schemas_1, schema, report, extractedSchemaObject, schemaObject, mergedRules, _d, _e, ruleKey, _f, state, options;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    pluginRules = plugins.map(function (p) { return require(path_1.default.join(process.cwd(), p)); });
                    allRules = __spreadArrays([builtinRules], pluginRules).reduce(function (acc, elem) {
                        return __assign(__assign({}, acc), elem);
                    }, {});
                    registeredRules = ramda_1.indexBy(ramda_1.prop('name'), ramda_1.values(allRules));
                    console.log("Connecting to " + chalk_1.default.greenBright(connection.database) + " on " + connection.host);
                    knexConfig = {
                        client: 'pg',
                        connection: connection,
                    };
                    db = knex_1.default(knexConfig);
                    ignoreMatchers = ignores.map(function (i) { return function (rule, identifier) {
                        var ruleMatch;
                        if (i.rule) {
                            ruleMatch = rule === i.rule;
                        }
                        else if (i.rulePattern) {
                            ruleMatch = new RegExp(i.rulePattern).test(rule);
                        }
                        else {
                            throw new Error("Ignore object is missing a rule or rulePattern property: " + JSON.stringify(i));
                        }
                        var identifierMatch;
                        if (i.identifier) {
                            identifierMatch = identifier === i.identifier;
                        }
                        else if (i.identifierPattern) {
                            identifierMatch = new RegExp(i.identifierPattern).test(identifier);
                        }
                        else {
                            throw new Error("Ignore object is missing an identifier or identifierPattern property: " + JSON.stringify(i));
                        }
                        return ruleMatch && identifierMatch;
                    }; });
                    _i = 0, schemas_1 = schemas;
                    _g.label = 1;
                case 1:
                    if (!(_i < schemas_1.length)) return [3 /*break*/, 4];
                    schema = schemas_1[_i];
                    report = createReportFunction(consoleReporter, ignoreMatchers);
                    return [4 /*yield*/, extract_pg_schema_1.extractSchema(schema.name, db)];
                case 2:
                    extractedSchemaObject = _g.sent();
                    schemaObject = __assign({ name: schema.name }, extractedSchemaObject);
                    mergedRules = __assign(__assign({}, rules), (schema.rules || {}));
                    for (_d = 0, _e = ramda_1.keys(mergedRules); _d < _e.length; _d++) {
                        ruleKey = _e[_d];
                        if (!(ruleKey in registeredRules)) {
                            throw new Error("Unknown rule: \"" + ruleKey + "\"");
                        }
                        _f = mergedRules[ruleKey], state = _f[0], options = _f.slice(1);
                        if (state === 'error') {
                            registeredRules[ruleKey].process({ schemaObject: schemaObject, report: report, options: options });
                        }
                    }
                    _g.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    if (anyIssues) {
                        if (suggestedMigrations.length) {
                            console.log('');
                            console.log('Suggested fix');
                            suggestedMigrations.forEach(function (sf) { return console.log(sf); });
                        }
                        return [2 /*return*/, 1];
                    }
                    console.log('No issues detected');
                    return [2 /*return*/, 0];
            }
        });
    });
}
exports.processDatabase = processDatabase;
