import path from 'path';
import { keys, indexBy, prop, values } from 'ramda';
import knex from 'knex';
import chalk from 'chalk';
import { extractSchema } from 'extract-pg-schema';

import * as builtinRules from './rules';

let anyIssues = false;
const suggestedMigrations = [];

function report({ rule, identifier, message, suggestedMigration = null }) {
  console.log(
    `${chalk.yellow(identifier)}: error ${chalk.red(rule)} : ${message}`
  );
  if (suggestedMigration) {
    suggestedMigrations.push(suggestedMigration);
  }
  anyIssues = true;
}

export async function processDatabase({ connection, plugins, rules, schemas }) {
  const pluginRules = plugins.map(p => require(path.join(process.cwd(), p)));
  const allRules = [builtinRules, ...pluginRules].reduce((acc, elem) => {
    return { ...acc, ...elem };
  }, {});
  const registeredRules = indexBy(prop('name'), values(allRules));

  console.log(
    `Connecting to ${chalk.greenBright(connection.database)} on ${
      connection.host
    }`
  );
  const knexConfig = {
    client: 'pg',
    connection,
  };
  const db = knex(knexConfig);

  for (const schema of schemas) {
    const extractedSchemaObject = await extractSchema(
      schema.name,
      schema.tablesToIgnore,
      db
    );

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
      suggestedMigrations.forEach(sf => console.log(sf));
    }
    return 1;
  }

  console.log('No issues detected');
  return 0;
}
