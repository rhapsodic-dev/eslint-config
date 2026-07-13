import type { OptionsUnicorn, TypedFlatConfigItem } from '../types';

import { pluginUnicorn } from '../plugins';

export async function unicorn(options: OptionsUnicorn = {}): Promise<TypedFlatConfigItem[]> {
  const {
    overrides = {},
  } = options;
  return [
    {
      name: 'rhapsodic/unicorn/rules',
      plugins: {
        unicorn: pluginUnicorn,
      },
      rules: {
        ...pluginUnicorn.configs.recommended.rules,

        'unicorn/consistent-function-scoping': 'off',
        'unicorn/explicit-length-check': 'off',
        'unicorn/filename-case': 'off',
        'unicorn/no-array-reduce': 'off',
        'unicorn/no-for-each': 'off',
        'unicorn/no-for-loop': 'off',
        'unicorn/no-null': 'off',
        'unicorn/no-static-only-class': 'off',
        'unicorn/no-top-level-side-effects': 'off',
        'unicorn/name-replacements': 'off',
        'unicorn/prefer-switch': 'off',
        'unicorn/prefer-ternary': 'off',

        ...overrides,
      },
    },
  ];
}
