module.exports = {
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'dvdrental',
    charset: 'utf8',
    port: 54321
  },

  // plugins: ['./schemalint-rules'],

  rules: {
    'table-name-casing': ['error', 'snake'],
    'column-name-casing': ['error', 'snake'],
    'prefer-jsonb-to-json': ['error'],
    'prefer-text-to-varchar': ['error'],
  },

  schemas: [
    {
      name: 'public',
      tablesToIgnore: [],
    },
  ],
};
