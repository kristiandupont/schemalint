import path from "path";
import { parseArgs } from "util";

import { version } from "../package.json";
import { stdout } from "./colors";
import { processDatabase } from "./engine";

const helpText = `Usage: schemalint [options]

  -h, --help             displays help
  -v, --version          displays version
  -c, --config String    Use this configuration, overriding .schemalintrc.*
                         config options if present

Version ${version}`;

async function main() {
  let options: { help?: boolean; version?: boolean; config?: string };

  try {
    ({ values: options } = parseArgs({
      options: {
        help: { type: "boolean", short: "h" },
        version: { type: "boolean", short: "v" },
        config: { type: "string", short: "c" },
      },
      allowPositionals: true,
    }));
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }

  if (options.help) {
    console.info(helpText);
    process.exit(0);
  }

  if (options.version) {
    console.info(version);
    process.exit(0);
  }

  console.info(`${stdout.greenBright("schema-lint")}`);
  const configFile = path.join(
    process.cwd(),
    options.config || ".schemalintrc.js",
  );

  try {
    const config = require(configFile);
    const exitCode = await processDatabase(config);
    process.exit(exitCode);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
