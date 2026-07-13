import fs from 'node:fs/promises';

import { flatConfigsToRulesDTS } from 'eslint-typegen/core';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import { rhapsodic } from '../src/factory';

const configs = await rhapsodic({
  imports: true,
  stylistic: true,
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
  unicorn: true,
  vue: {
    a11y: true,
  },
})
  .prepend({
    plugins: {
      '': {
        rules: Object.fromEntries(builtinRules),
      },
    },
  });

const configNames = configs.map((index) => index.name).filter(Boolean) as string[];

let dts = await flatConfigsToRulesDTS(configs, {
  includeAugmentation: false,
});

dts += `
// Names of all the configs
export type ConfigNames = ${configNames.map((index) => `'${index}'`).join(' | ')}
`;

await fs.writeFile('src/typegen.d.ts', dts);
