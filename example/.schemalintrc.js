module.exports = {
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'dvdrental',
    charset: 'utf8',
    port: 54321,
  },

  plugins: ['./example/custom-rules'],

  rules: {
    'identifier-naming': ['error'],
    'name-casing': ['error', 'snake'],
    'prefer-jsonb-to-json': ['error'],
    'prefer-text-to-varchar': ['error'],
    'prefer-timestamptz-to-timestamp': ['error'],
    'prefer-identity-to-serial': ['error'],
    'name-inflection': ['error', 'singular'],
  },

  schemas: [
    {
      name: 'public',
    },
    {
      name: 'information_schema',
    },
  ],

  ignores: [
    {identifier: 'public.city.city', rule: 'prefer-text-to-varchar'},
    {identifierPattern: '^public\\.actor.*', rulePattern: '.*'}
  ],
};
