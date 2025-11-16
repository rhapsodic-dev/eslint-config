import type { TypedFlatConfigItem } from '../types';

export async function disables(): Promise<TypedFlatConfigItem[]> {
  return [
    {
      files: ['**/*.js', '**/*.cjs'],
      name: 'rhapsodic/disables/cjs',
      rules: {
        'ts/explicit-function-return-type': 'off',
        'ts/explicit-module-boundary-types': 'off',
        'ts/no-var-requires': 'off',

        'unicorn/prefer-module': 'off',
      },
    },
  ];
}
