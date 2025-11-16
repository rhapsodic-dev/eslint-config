import type { OptionsOverrides, OptionsStylistic, TypedFlatConfigItem } from '../types';
import { pluginImportX } from '../plugins';

export async function imports(options: OptionsOverrides & OptionsStylistic = {}): Promise<TypedFlatConfigItem[]> {
  const {
    overrides = {},
    stylistic = true,
  } = options;

  return [
    {
      name: 'rhapsodic/imports/rules',
      plugins: {
        import: pluginImportX,
      },
      rules: {
        'import/default': 'error',
        'import/namespace': 'error',
        'import/export': 'error',
        'import/no-named-as-default': 'warn',
        'import/no-named-as-default-member': 'warn',
        'import/no-duplicates': 'warn',

        ...stylistic
          ? {
              'import/newline-after-import': ['error', { count: 1 }],
            }
          : {},

        ...overrides,
      },
    },
  ];
}
