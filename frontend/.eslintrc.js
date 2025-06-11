module.exports = {
    env: {
      browser: true,
      node: true,
      es2021: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',      // pour React
      'plugin:prettier/recommended',   // doit être en dernier
    ],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // tes règles persos ici
      'prettier/prettier': 'error',
    },
  };
  