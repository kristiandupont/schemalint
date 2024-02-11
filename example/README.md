# Example

This folder contains an example configuration file and custom rules for Schemalint.

## Usage

If you want to try this, you can run it on the [Sample Database](https://www.postgresqltutorial.com/postgresql-sample-database/) from www.postgresqltutorial.com.

I've created a Docker image that hosts it so if you have Docker installed, you can easily set up such a database locally by running

```
npm run start-example-db
```

First, run the install command in this folder with:

```
npm install
```

Then, run the schemalint using the config file `schemalintrc.js` in this folder with:

```
npm run lint:schema  # or just `npx schemalint`
```

You should see output like this:

```
schema-lint
Connecting to dvdrental on localhost
public.address.address: error prefer-text-to-varchar : Prefer text to varchar types
public.address.address2: error prefer-text-to-varchar : Prefer text to varchar types
public.address.district: error prefer-text-to-varchar : Prefer text to varchar types
public.address.postal_code: error prefer-text-to-varchar : Prefer text to varchar types
public.address.phone: error prefer-text-to-varchar : Prefer text to varchar types
public.category.name: error prefer-text-to-varchar : Prefer text to varchar types
public.country.country: error prefer-text-to-varchar : Prefer text to varchar types
public.customer.first_name: error prefer-text-to-varchar : Prefer text to varchar types
public.customer.last_name: error prefer-text-to-varchar : Prefer text to varchar types
public.customer.email: error prefer-text-to-varchar : Prefer text to varchar types
public.film.title: error prefer-text-to-varchar : Prefer text to varchar types
public.staff.first_name: error prefer-text-to-varchar : Prefer text to varchar types
public.staff.last_name: error prefer-text-to-varchar : Prefer text to varchar types
public.staff.email: error prefer-text-to-varchar : Prefer text to varchar types
public.staff.username: error prefer-text-to-varchar : Prefer text to varchar types
public.staff.password: error prefer-text-to-varchar : Prefer text to varchar types

Suggested fix
ALTER TABLE "address" ALTER COLUMN "address" TYPE TEXT;
ALTER TABLE "address" ALTER COLUMN "address2" TYPE TEXT;
ALTER TABLE "address" ALTER COLUMN "district" TYPE TEXT;
ALTER TABLE "address" ALTER COLUMN "postal_code" TYPE TEXT;
ALTER TABLE "address" ALTER COLUMN "phone" TYPE TEXT;
ALTER TABLE "category" ALTER COLUMN "name" TYPE TEXT;
ALTER TABLE "country" ALTER COLUMN "country" TYPE TEXT;
ALTER TABLE "customer" ALTER COLUMN "first_name" TYPE TEXT;
ALTER TABLE "customer" ALTER COLUMN "last_name" TYPE TEXT;
ALTER TABLE "customer" ALTER COLUMN "email" TYPE TEXT;
ALTER TABLE "film" ALTER COLUMN "title" TYPE TEXT;
ALTER TABLE "staff" ALTER COLUMN "first_name" TYPE TEXT;
ALTER TABLE "staff" ALTER COLUMN "last_name" TYPE TEXT;
ALTER TABLE "staff" ALTER COLUMN "email" TYPE TEXT;
ALTER TABLE "staff" ALTER COLUMN "username" TYPE TEXT;
ALTER TABLE "staff" ALTER COLUMN "password" TYPE TEXT;
error Command failed with exit code 1.
```

You can play around with the configuration options in `.schemalintrc.js` file to experiment.

## Custom Rules

Example custom rules are included in the [custom-rules](./custom-rules) folder. The folder contains the following files:

- [identifierNaming.js](./custom-rules/identifierNaming.js): Defines the custom rule `identifier-naming`.
- [index.js](./custom-rules/index.js): Exports the custom rules.

You can use these as a starting point to create your own custom rules. The type definition of the [Rule](/src/Rule.ts) object and the [Schema](https://kristiandupont.github.io/extract-pg-schema/api/extract-pg-schema.schema.html) object passed to the custom rules will help you understand how to write custom rules.
