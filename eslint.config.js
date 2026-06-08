// Flat ESLint config. TypeScript-aware linting on top of the strict tsc settings, with
// Prettier turned last so formatting never fights the linter. Keep the rule set small and
// practical — the compiler already catches most correctness issues.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  // Offline dev tooling (preview renderer, sprite exports) runs in Node, not the browser.
  { files: ['tools/**'], languageOptions: { globals: globals.node } },
  {
    rules: {
      // Discourage the non-null assertions the audit flagged; warn rather than block.
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // Allow intentionally-unused args/vars when prefixed with an underscore.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
);
