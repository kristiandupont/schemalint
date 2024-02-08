# Built-in Rules

This folder contains the built-in rules for Schemalint.
While there is value in these, the true benefit is achieved by writing custom rules that enforce the specific architecture that you are aiming for.

## name-casing

Check that your names are cased correctly. The default setting is `"snake"` (i.e. tables should be named with underscores as word boundaries: `member_profile`).
The reasoning for this is outlined in the Postgres wiki: [Don't use upper case table or column names ](https://wiki.postgresql.org/wiki/Don't_Do_This#Don.27t_use_upper_case_table_or_column_names).

If, for some reason or other, you want to use a different naming scheme, you can configure the rule to use one of `snake`, `dash` (`member-profile`), `camel` (`memberProfile`) or `pascal` (`MemberProfile`).

At the moment, this rule checks tables, views and columns.

```js
  rules: {
    'name-casing': ['error', 'snake'],
  },
```

## prefer-text-to-varchar

In Postgres there is no performance penalty on using the `text` type which has no maximum length, so you will generally want to choose that over `varchar`.
The reasoning for this is outlined in the Postgres wiki: [Don't use varchar(n) by default](https://wiki.postgresql.org/wiki/Don't_Do_This#Don.27t_use_varchar.28n.29_by_default)

```js
  rules: {
    'prefer-text-to-varchar': ['error'],
  },
```

## name-inflection

If you want to enforce singular or plural naming for your tables, this rule can enforce it.
Which one to choose is a matter of great debate but in the end it comes down to personal preference. You can choose `'singular'` (default) or `'plural'`.

```js
  rules: {
    'name-inflection': ['error', 'singular'],
  },
```

## prefer-timestamptz-to-timestamp

In Postgres when you insert a value into a `timestamptz` column, PostgreSQL converts the `timestamptz` value into a UTC value and stores the UTC value in the table, and when you query `timestamptz`
from the database, PostgreSQL converts the UTC value back to the time value of the timezone set by the database server, the user, or the current database connection, whereas `timestamp` does not save any
timezone data. You can learn more here: [Understanding PostgreSQL Timestamp Data Types](https://www.postgresqltutorial.com/postgresql-timestamp/)

```js
  rules: {
    'prefer-timestamptz-to-timestamp': ['error'],
  },
```

## prefer-jsonb-to-json

`json` data is stored as a copy of the input text which processing functions need to reparse on each execution. `jsonb` data is stored in a binary format which is faster to process, and also supports indexing.

While there are some caveats, the official PostgreSQL documentation states:

> In general, most applications should prefer to store JSON data as jsonb, unless there are quite specialized needs, such as legacy assumptions about ordering of object keys.

You can learn more here: [JSON types](https://www.postgresql.org/docs/current/datatype-json.html)

```js
  rules: {
    'prefer-jsonb-to-json': ['error'],
  },
```

## prefer-identity-to-serial

Identity columns are a SQL standard-conforming variant of PostgreSQL's serial columns. They fix a few usability
issues that serial columns have:

- CREATE TABLE / LIKE copies default but refers to same sequence
- cannot add/drop serialness with ALTER TABLE
- dropping default does not drop sequence
- need to grant separate privileges to sequence
- other slight weirdnesses because serial is some kind of special macro

You can learn more here: [Identity Columns Explained](https://www.2ndquadrant.com/en/blog/postgresql-10-identity-columns/)

```js
  rules: {
    'prefer-identity-to-serial': ['error'],
  },
```

## require-primary-key

Identity tables that do not have a primary key defined. Tables can be ignored by passing the `ignorePattern` rule argument.

```js
 rules: {
    'require-primary-key': ['error', {
      ignorePattern: 'information_schema.*'
    }],
  },
```
