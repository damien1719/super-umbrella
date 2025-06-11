// backend/eslint.config.cjs
const tsParser = require('@typescript-eslint/parser');
const eslintPluginTs = require('@typescript-eslint/eslint-plugin');

module.exports = [

  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      'prettier.config.ts',
      'jest.config.ts'
    ]
  },

  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': eslintPluginTs,
    },
    rules: {
      ...eslintPluginTs.configs.recommended.rules,
    },
    ignores: ['jest.config.ts', 'prettier.config.js'],
  },
];
