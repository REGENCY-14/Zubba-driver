const tsParser = require('@typescript-eslint/parser');

module.exports = [
	{
		ignores: ['node_modules/**', '.expo/**', 'dist/**', 'coverage/**']
	},
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					jsx: true
				}
			}
		}
	}
];
