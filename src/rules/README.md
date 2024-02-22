# Built-in Rules

This folder contains the built-in rules for Schemalint.
While there is value in these, the true benefit is achieved by writing custom rules that enforce the specific architecture that you are aiming for.

## Naming Conventions

### name-casing

Check that your names are cased correctly. The default setting is `"snake"` (i.e. tables should be named with underscores as word boundaries: `member_profile`).
The reasoning for this is outlined in the Postgres wiki: [Don't use upper case table or column names ](https://wiki.postgresql.org/wiki/Don't_Do_This#Don.27t_use_upper_case_table_or_column_names).

If, for some reason or other, you want to use a different naming scheme, you can configure the rule to use one of `snake`, `dash` (`member-profile`), `camel` (`memberProfile`) or `pascal` (`MemberProfile`).

At the moment, this rule checks tables, views and columns.

```js
  rules: {
    'name-casing': ['error', 'snake'],
  },
```

### name-inflection

If you want to enforce singular or plural naming for your tables, this rule can enforce it.
Which one to choose is a matter of great debate but in the end it comes down to personal preference. You can choose `'singular'` (default) or `'plural'`.

```js
  rules: {
    'name-inflection': ['error', 'singular'],
  },
```

## Data Types

### prefer-text-to-varchar

In Postgres there is no performance penalty on using the `text` type which has no maximum length, so you will generally want to choose that over `varchar`.
The reasoning for this is outlined in the Postgres wiki: [Don't use varchar(n) by default](https://wiki.postgresql.org/wiki/Don't_Do_This#Don.27t_use_varchar.28n.29_by_default)

```js
  rules: {
    'prefer-text-to-varchar': ['error'],
  },
```

### prefer-timestamptz-to-timestamp

In Postgres when you insert a value into a `timestamptz` column, PostgreSQL converts the `timestamptz` value into a UTC value and stores the UTC value in the table, and when you query `timestamptz`
from the database, PostgreSQL converts the UTC value back to the time value of the timezone set by the database server, the user, or the current database connection, whereas `timestamp` does not save any
timezone data. You can learn more here: [Understanding PostgreSQL Timestamp Data Types](https://www.postgresqltutorial.com/postgresql-timestamp/)

```js
  rules: {
    'prefer-timestamptz-to-timestamp': ['error'],
  },
```

### prefer-jsonb-to-json

`json` data is stored as a copy of the input text which processing functions need to reparse on each execution. `jsonb` data is stored in a binary format which is faster to process, and also supports indexing.

While there are some caveats, the official PostgreSQL documentation states:

> In general, most applications should prefer to store JSON data as jsonb, unless there are quite specialized needs, such as legacy assumptions about ordering of object keys.

You can learn more here: [JSON types](https://www.postgresql.org/docs/current/datatype-json.html)

```js
  rules: {
    'prefer-jsonb-to-json': ['error'],
  },
```

### prefer-identity-to-serial

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

## Table Structures

### require-primary-key

Identity tables that do not have a primary key defined. Tables can be ignored by passing the `ignorePattern` rule argument.

```js
 rules: {
    'require-primary-key': ['error', {
      ignorePattern: 'information_schema.*'
    }],
  },
```

### index-referencing-column

PostgreSQL does not automatically create an index on the referencing column (not the referenced column) of a foreign key constraint. This rule can enforce that you create an index on the referencing column.

As the official PostgreSQL documentation states, it is not always needed to index the referencing columns, but it is often a good idea to do so.

> Since a DELETE of a row from the referenced table or an UPDATE of a referenced column will require a scan of the referencing table for rows matching the old value, it is often a good idea to index the referencing columns too. Because this is not always needed, and there are many choices available on how to index, the declaration of a foreign key constraint does not automatically create an index on the referencing columns.

You can learn more here: [Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)

```js
rules: {
  'index-referencing-column': ['error'],
}
```

### reference-actions

This rule enforces that foreign key constraints have specific `ON UPDATE` and `ON DELETE` actions. Available actions are: `NO ACTION`, `RESTRICT`, `CASCADE`, `SET NULL`, `SET DEFAULT`. When `onUpdate` or `onDelete` is not specified, the rule allows any action for the unspecified action.

```js
rules: {
  'reference-actions': ['error', {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
  }],
}
```

### mandatory-columns

This rule enforces that a table has certain columns. The option is an object, where the key is the column name and the value is the object representing the required properties. Any property of the [TableColumn](https://kristiandupont.github.io/extract-pg-schema/api/extract-pg-schema.tablecolumn.html) object can be used as a required property. For example, you can specify `ordinalPosition` to ensure that the column is in the expected position, but note that PostgreSQL always adds a new column to the very back.

```js
rules: {
  'mandatory-columns': ['error', {
    created_at: {
      expandedType: 'pg_catalog.timestamptz',
      isNullable: false,
    }
  }],
}
```

## Security

### row-level-security

[Row-level security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) (RLS) is a feature that enables you to control which rows in a table are visible to different users. This rule checks that tables have row-level security enabled. You can also check that it is enforced by setting the `enforced` option to `true`.

```js
rules: {
    'row-level-security': ['error', {enforced: true}],
}
```
