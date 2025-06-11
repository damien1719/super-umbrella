// frontend/.eslintrc.js
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',      
    parserOptions: {
      project: ['./tsconfig.json'],         
      tsconfigRootDir: __dirname,
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: { jsx: true }
    },
    settings: {
      react: { version: 'detect' }            
    },
    env: {
      browser: true,
      node: true,
      es6: true,
      jest: true                              
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',             
      'plugin:react-hooks/recommended',       
      'plugin:@typescript-eslint/recommended',
      'plugin:jsx-a11y/recommended',          
      'prettier'                              
    ],
    plugins: [
      'react',
      'react-hooks',
      '@typescript-eslint',
      'jsx-a11y'
    ],
    rules: {
    }
  };
  