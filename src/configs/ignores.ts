import type { TypedFlatConfigItem } from '../types';

import { GLOB_EXCLUDE } from '../globs';

// eslint-disable-next-line style/max-len
export async function ignores(userIgnores: string[] | ((originals: string[]) => string[]) = []): Promise<TypedFlatConfigItem[]> {
  let ignoresArray = [
    ...GLOB_EXCLUDE,
  ];

  if (typeof userIgnores === 'function') {
    ignoresArray = userIgnores(ignoresArray);
  } else {
    ignoresArray = [
      ...ignoresArray,
      ...userIgnores,
    ];
  }

  return [
    {
      ignores: ignoresArray,
      name: 'rhapsodic/ignores',
    },
  ];
}
