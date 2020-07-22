import path from 'path';
import chalk from 'chalk';
// @ts-ignore
import optionator from 'optionator';
import { processDatabase } from './engine';
// @ts-ignore
const { version } = require('../package.json');

async function main() {
  const o = optionator({
    prepend: 'Usage: schemalint [options]',
    append: `Version ${version}`,
    options: [
      {
        option: 'help',
        alias: 'h',
        type: 'Boolean',
        description: 'displays help',
      },
      {
        option: 'config',
        alias: 'c',
        type: 'path::String',
        description:
          'Use this configuration, overriding .schemalintrc.* config options if present',
      },
    ],
  });

  let options;

  try {
    options = o.parseArgv(process.argv);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  if (options.help) {
    console.log(o.generateHelp());
    process.exit(0);
  }

  console.log(`${chalk.greenBright('schema-lint')}`);
  const configFile = path.join(
    process.cwd(),
    options.config || '.schemalintrc.js'
  );
  const config = require(configFile);

  try {
    const exitCode = await processDatabase(config);
    process.exit(exitCode);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
