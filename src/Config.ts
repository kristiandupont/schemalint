import type { ClientConfig } from "pg";

/**
 * The configuration for schemalint.
 */
type Config = {
  /**
   * The connection configuration for the database.
   * @see https://node-postgres.com/apis/client
   */
  connection: ClientConfig;
  /**
   * The plugins to be used.
   */
  plugins?: string[];
  /**
   * The rules to be used.
   */
  rules: Record<string, RuleConfig>;
  /**
   * The schemas to be linted.
   */
  schemas: SchemaConfig[];
  /**
   * The configuration for ignoring problems.
   */
  ignores?: IgnoreConfig[];
};

/**
 * A schema to be linted.
 */
export type SchemaConfig = {
  /**
   * The name of the schema to be linted.
   */
  name: string;
  /**
   * The rules to be used spefically for this schema. These rules will be merged with the global rules.
   */
  rules?: Record<string, RuleConfig>;
};

/**
 * A rule configuration. The first element is the severity of the rule, and the rest of the elements are the options for the rule.
 */
export type RuleConfig = [Severity, ...unknown[]];

/**
 * The severity of a rule. `off` means the rule is disabled, `error` means the rule is enabled.
 */
export type Severity = "off" | "error";

/**
 * A configuration for ignoring problems.
 */
export type IgnoreConfig = {
  /**
   * The rule name to ignore. `rule` or `rulePattern` must be provided.
   */
  rule?: string;
  /**
   * A pattern to match against the rule name. `rule` or `rulePattern` must be provided.
   */
  rulePattern?: string;
  /**
   * The identifier to ignore. `identifier` or `identifierPattern` must be provided.
   */
  identifier?: string;
  /**
   * A pattern to match against the identifier. `identifier` or `identifierPattern` must be provided.
   */
  identifierPattern?: string;
};

export default Config;
