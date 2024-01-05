# Schemalint

Run linting rules on your database schema. Read the intro to this idea in [this blog post](https://medium.com/@kristiandupont/database-schema-linting-5e83b18dc99a).

_Works with Postgres databases._

This will give you errors like these:

```
public.actor.first_name: error prefer-text-to-varchar : Prefer text to varchar types
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
module.exports = {
  connection: {
    host: "localhost",
    user: "postgres",
    password: "postgres",
    database: "acme",
    charset: "utf8",
  },

  plugins: ["./custom-rules"],

  rules: {
    "name-casing": ["error", "snake"],
    "name-inflection": ["error", "singular"],
    "prefer-jsonb-to-json": ["error"],
    "prefer-text-to-varchar": ["error"],
  },

  schemas: [{ name: "public" }],

  ignores: [
    { identifierPattern: "public\\.knex_migrations.*", rulePattern: ".*" },
  ],
};
```

## Rules

Schemalint includes a number of built-in rules, which you can read about [here](/src/rules). However, writing rules is easy and you will probably see the real value by doing so. The [example](/example) folder shows how to write these.

## Sponsors

Thank you so much to the sponsors of Schemalint:

[![Seam](https://avatars.githubusercontent.com/u/63884939?s=200&v=4)](https://github.com/seamapi)
