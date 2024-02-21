import chalk from "chalk";
import { extractSchemas } from "extract-pg-schema";
import path from "path";
import { indexBy, keys, prop, values } from "ramda";

import type Config from "./Config";
import type { Issue, Reporter } from "./Rule";
import type Rule from "./Rule";
import * as builtinRules from "./rules";

type IgnoreMatcher = (rule: string, identifier: string) => boolean;

function consoleReporter({ rule, identifier, message }: Issue) {
  console.error(
    `${chalk.yellow(identifier)}: error ${chalk.red(rule)} : ${message}`,
  );
}

let anyIssues = false;
const suggestedMigrations: string[] = [];

const createReportFunction =
  (reporter: Reporter, ignoreMatchers: IgnoreMatcher[]): Reporter =>
  ({ rule, identifier, message, suggestedMigration }) => {
    if (ignoreMatchers.some((im) => im(rule, identifier))) {
      // This one is ignored.
      return;
    }

    reporter({ rule, identifier, message });

    if (suggestedMigration) {
      suggestedMigrations.push(suggestedMigration);
    }
    anyIssues = true;
  };

export async function processDatabase({
  connection,
  plugins = [],
  rules,
  schemas,
  ignores = [],
}: Config): Promise<number> {
  const pluginRules = plugins.map(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    (p) => require(path.join(process.cwd(), p)) as Record<string, Rule>,
  );
  const allRules = [builtinRules, ...pluginRules].reduce(
    (acc, elem) => ({ ...acc, ...elem }),
    {},
  );
  const registeredRules = indexBy(prop("name"), values(allRules));

  console.info(
    `Connecting to ${chalk.greenBright(connection.database)} on ${
      connection.host
    }`,
  );

  const ignoreMatchers = ignores.map(
    (i): IgnoreMatcher =>
      (rule, identifier) => {
        let ruleMatch: boolean;
        if (i.rule) {
          ruleMatch = rule === i.rule;
        } else if (i.rulePattern) {
          ruleMatch = new RegExp(i.rulePattern).test(rule);
        } else {
          throw new Error(
            `Ignore object is missing a rule or rulePattern property: ${JSON.stringify(
              i,
            )}`,
          );
        }

        let identifierMatch: boolean;
        if (i.identifier) {
          identifierMatch = identifier === i.identifier;
        } else if (i.identifierPattern) {
          identifierMatch = new RegExp(i.identifierPattern).test(identifier);
        } else {
          throw new Error(
            `Ignore object is missing an identifier or identifierPattern property: ${JSON.stringify(
              i,
            )}`,
          );
        }

        return ruleMatch && identifierMatch;
      },
  );

  const report = createReportFunction(consoleReporter, ignoreMatchers);
  const extractedSchemas = await extractSchemas(connection, {
    schemas: schemas.map((s) => s.name),
  });

  for (const schema of schemas) {
    const schemaObject = extractedSchemas[schema.name];

    if (!schemaObject) {
      console.info(
        `${chalk.yellow(
          schema.name,
        )}: warning : No tables or views were found in the schema. Skipping rules processing.`,
      );
      continue;
    }

    const mergedRules = {
      ...rules,
      ...schema.rules,
    };

    for (const ruleKey of keys(mergedRules)) {
      if (!(ruleKey in registeredRules)) {
        throw new Error(`Unknown rule: "${ruleKey}"`);
      }
      const [state, ...options] = mergedRules[ruleKey];
      if (state === "error") {
        registeredRules[ruleKey].process({ schemaObject, report, options });
      }
    }
  }

  if (anyIssues) {
    if (suggestedMigrations.length > 0) {
      console.info("");
      console.info("Suggested fix");
      for (const sf of suggestedMigrations) console.info(sf);
    }
    return 1;
  }

  console.info("No issues detected");
  return 0;
}
