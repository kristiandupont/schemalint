import path from 'path';
import { indexBy, keys, prop, values } from 'ramda';
import chalk from 'chalk';
import { extractSchema } from 'extract-pg-schema';

import * as builtinRules from './rules';

function consoleReporter({ rule, identifier, message }) {
  console.log(
    `${chalk.yellow(identifier)}: error ${chalk.red(rule)} : ${message}`
  );
}

let anyIssues = false;
const suggestedMigrations = [];

const createReportFunction =
  (reporter, ignoreMatchers) =>
  ({ rule, identifier, message, suggestedMigration }) => {
    if (ignoreMatchers.find((im) => im(rule, identifier))) {
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
}) {
  const pluginRules = plugins.map((p) => require(path.join(process.cwd(), p)));
  const allRules = [builtinRules, ...pluginRules].reduce((acc, elem) => {
    return { ...acc, ...elem };
  }, {});
  const registeredRules = indexBy(prop('name'), values(allRules));

  console.log(
    `Connecting to ${chalk.greenBright(connection.database)} on ${
      connection.host
    }`
  );

  const ignoreMatchers = ignores.map((i) => (rule, identifier) => {
    let ruleMatch;
    if (i.rule) {
      ruleMatch = rule === i.rule;
    } else if (i.rulePattern) {
      ruleMatch = new RegExp(i.rulePattern).test(rule);
    } else {
      throw new Error(
        `Ignore object is missing a rule or rulePattern property: ${JSON.stringify(
          i
        )}`
      );
    }

    let identifierMatch;
    if (i.identifier) {
      identifierMatch = identifier === i.identifier;
    } else if (i.identifierPattern) {
      identifierMatch = new RegExp(i.identifierPattern).test(identifier);
    } else {
      throw new Error(
        `Ignore object is missing an identifier or identifierPattern property: ${JSON.stringify(
          i
        )}`
      );
    }

    return ruleMatch && identifierMatch;
  });

  for (const schema of schemas) {
    const report = createReportFunction(consoleReporter, ignoreMatchers);

    const extractedSchemaObject = await extractSchema(schema.name, connection);

    const schemaObject = {
      name: schema.name,
      ...extractedSchemaObject,
    };

    const mergedRules = {
      ...rules,
      ...(schema.rules || {}),
    };

    for (const ruleKey of keys(mergedRules)) {
      if (!(ruleKey in registeredRules)) {
        throw new Error(`Unknown rule: "${ruleKey}"`);
      }
      const [state, ...options] = mergedRules[ruleKey];
      if (state === 'error') {
        registeredRules[ruleKey].process({ schemaObject, report, options });
      }
    }
  }

  if (anyIssues) {
    if (suggestedMigrations.length) {
      console.log('');
      console.log('Suggested fix');
      suggestedMigrations.forEach((sf) => console.log(sf));
    }
    return 1;
  }

  console.log('No issues detected');
  return 0;
}
