# Schemalint

Run linting rules on your database schema.

_Works with Postgres databases._

This will give you errors like these:
```
public.actor.first_name: error prefer-text-to-varchar : Prefer TEXT to varchar types
```

## Usage
Install with:
```
$ npm i -g schemalint
```

To run, make sure you are in a folder that has a `.schemalintrc.js` configuration file, and type:
```
$ schemalint
```

Here is an example configuration file:
```javascript
module.exports = {
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'acme',
    charset: 'utf8',
  },

  plugins: ['./custom-rules'],

  rules: {
    'table-name-casing': ['error', 'snake'],
    'column-name-casing': ['error', 'snake'],
    'prefer-jsonb-to-json': ['error'],
    'prefer-text-to-varchar': ['error'],
  },

  schemas: [
    {
      name: 'public',
      tablesToIgnore: ['knex_migrations', 'knex_migrations_lock'],
    },
  ],
};

```

## Rules

Schemalint includes a number of built-in rules, which you can read about [here](/src/rules). However, writing rules is easy and you will probably see the real value by doing so. The [example](/example) folder shows how to write these.
