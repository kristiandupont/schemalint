# Built-in Rules

This folder contains the built-in rules for Schemalint.
While there is value in these, the true benefit is achieved by writing custom rules that enforce the specific architecture that you are aiming for.


## name-casing

Check that your names are cased correctly. The default setting is `"snake"` (i.e. tables should be named with underscores as word boundaries: `member_profile`).
The reasoning for this is outlined in the Postgres wiki: [Don't use upper case table or column names ](https://wiki.postgresql.org/wiki/Don't_Do_This#Don.27t_use_upper_case_table_or_column_names).

If, for some reason or other, you want to use a different naming scheme, you can configure the rule to use one of `snake`, `dash` (`member-profile`), `camel` (`memberProfile`) or `pascal` (`MemberProfile`).

At the moment, this rule checks tables, views and columns. 


## prefer-text-to-varchar

In Postgres there is no performance penalty on using the `text` type which has no maximum length, so you will generally want to choose that over `varchar`.
The reasoning for this is outlined in the Postgres wiki: [Don't use varchar(n) by default](https://wiki.postgresql.org/wiki/Don't_Do_This#Don.27t_use_varchar.28n.29_by_default)


## name-inflection

If you want to enforce singular or plural naming for your tables, this rule can enforce it.
Which one to choose is a matter of great debate but in the end it comes down to personal preference. You can choose `'singular'`  or `'plural'`.


## prefer-timestamp-to-timestamptz

In Postgres when you insert a value into a `timestamptz` column, PostgreSQL converts the `timestamptz` value into a UTC value and stores the UTC value in the table, and when you query `timestamptz`
from the database, PostgreSQL converts the UTC value back to the time value of the timezone set by the database server, the user, or the current database connection, whereas `timestamp` does not save any 
timezone data. You can learn more here: [Understanding PostgreSQL Timestamp Data Types](https://www.postgresqltutorial.com/postgresql-timestamp/)

    
