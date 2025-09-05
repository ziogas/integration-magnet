module.exports = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  printWidth: 120,
  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwind-css'],
  importOrder: ['^[.]'],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
};
