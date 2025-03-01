# Schemalint

Run linting rules on your database schema. Read the intro to this idea in [this blog post](https://medium.com/@kristiandupont/database-schema-linting-5e83b18dc99a).

_Works with Postgres databases._

This will give you errors and suggestions like these:

```
public.actor.first_name: error prefer-text-to-varchar : Prefer text to varchar types

Suggested fix
ALTER TABLE "public"."actor" ALTER COLUMN "first_name" TYPE TEXT;
```

## Usage

Install with:

```
$ npm i -D schemalint
```

To run, make sure you are in a folder that has a `.schemalintrc.js` configuration file, and type:

```
$ npx schemalint
```

Here is an example configuration file:

```javascript
/** @type {import("schemalint").Config } */
module.exports = {
  // Connection configuration. See: https://node-postgres.com/apis/client
  connection: {
    host: "localhost",
    user: "postgres",
    password: "postgres",
    database: "acme",
    charset: "utf8",
  },

  // Schemas to be linted.
  schemas: [{ name: "public" }],

  // Rules to be checked. The key is the rule name and the value is an array
  // whose first value is the severity ("error" to enable the rule, "off" to
  // disable it) and the rest are rule-specific parameters.
  rules: {
    "name-casing": ["error", "snake"],
    "name-inflection": ["error", "singular"],
    "prefer-jsonb-to-json": ["error"],
    "prefer-text-to-varchar": ["error"],
  },

  // (Optional) Use the `ignores` array to exclude specific targets and
  // rules. The targets are identified by the `identifier` (exact) or the
  // `identifierPattern` (regex). For the rules, use the `rule` (exact) or
  // the `rulePattern` (regex).
  ignores: [
    { identifier: "public.sessions", rule: "name-inflection" },
    { identifierPattern: "public\\.knex_migrations.*", rulePattern: ".*" },
  ],

  // (Optional)　Use the `plugins` array to load custom rules. The paths are
  // `require`d as Node.js modules from the current working directory.
  plugins: ["./custom-rules"],
};
```

## Rules

Schemalint includes a number of built-in rules, which you can read about [here](/src/rules). However, writing custom rules is easy and you will probably see the real value by doing so. The [example](/example) folder shows how to write these.

---

## Learning Material

Here is a brief introduction video:

[![Schemalint introduction](http://img.youtube.com/vi/tIuhwZ8M27E/0.jpg)](http://www.youtube.com/watch?v=tIuhwZ8M27E "Schemalint Introduction")

---

## Sponsors

Thank you so much to the sponsors of Schemalint:

[![Seam](https://avatars.githubusercontent.com/u/63884939?s=200&v=4)](https://github.com/seamapi)
