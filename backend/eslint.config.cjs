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
      'jest.config.ts',
      'prisma/seeds/**',
      'prisma/*.js',
      '__mocks__/**',
      'tests/**/*.js',
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
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
    ignores: ['jest.config.ts', 'prettier.config.js'],
  },
];
