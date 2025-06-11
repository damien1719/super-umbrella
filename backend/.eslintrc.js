module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',       
    parserOptions: {
      project: './tsconfig.json',               
      tsconfigRootDir: __dirname,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    env: {
      node: true,                               
      es2021: true,
    },
    extends: [
      'eslint:recommended',                     
      'plugin:@typescript-eslint/recommended',  
      'plugin:prettier/recommended',           
    ],
    plugins: [
      '@typescript-eslint',
    ],
    rules: {
    
    },
  };
  