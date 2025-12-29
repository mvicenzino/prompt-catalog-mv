module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true, // Enables chrome global
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
  },
};
