import type { OptionsConfig, TypedFlatConfigItem } from '../src/types';

import fs from 'node:fs/promises';
import path from 'node:path';
import { execa } from 'execa';
import { glob } from 'tinyglobby';

import { afterAll, beforeAll, it } from 'vitest';

const isWindows = process.platform === 'win32';
const timeout = isWindows ? 300_000 : 60_000;

beforeAll(async () => {
  await fs.rm('_fixtures', { recursive: true, force: true });
});
afterAll(async () => {
  await fs.rm('_fixtures', { recursive: true, force: true });
});

runWithConfig('js', {
  typescript: false,
  vue: false,
});
runWithConfig('all', {
  typescript: true,
  vue: true,
});
runWithConfig('no-style', {
  typescript: true,
  vue: true,
  stylistic: false,
});
runWithConfig(
  'tab-double-quotes',
  {
    typescript: true,
    vue: true,
    stylistic: {
      indent: 'tab',
      quotes: 'double',
    },
  },
  {
    rules: {
      'style/no-mixed-spaces-and-tabs': 'off',
    },
  },
);

// https://github.com/antfu/eslint-config/issues/255
runWithConfig(
  'ts-override',
  {
    typescript: true,
  },
  {
    rules: {
      'ts/consistent-type-definitions': ['error', 'type'],
    },
  },
);

// https://github.com/antfu/eslint-config/issues/255
runWithConfig(
  'ts-strict',
  {
    typescript: {
      tsconfigPath: './tsconfig.json',
    },
  },
  {
    rules: {
      'ts/no-unsafe-return': ['off'],
    },
  },
);

function runWithConfig(name: string, configs: OptionsConfig, ...items: TypedFlatConfigItem[]) {
  it.concurrent(name, async ({ expect }) => {
    const from = path.resolve('fixtures/input');
    const output = path.resolve('fixtures/output', name);
    const target = path.resolve('_fixtures', name);

    await fs.cp(from, target, {
      recursive: true,
      filter: (src) => {
        return !src.includes('node_modules');
      },
    });
    await fs.writeFile(path.join(target, 'eslint.config.js'), `
// @eslint-disable
import rhapsodic from '@rhapsodic/eslint-config'

export default rhapsodic(
  ${JSON.stringify(configs)},
  ...${JSON.stringify(items) ?? []},
)
  `);

    await execa('npx', ['eslint', '.', '--fix'], {
      cwd: target,
      stdio: 'pipe',
    });

    const files = await glob('**/*', {
      ignore: [
        'node_modules',
        'eslint.config.js',
      ],
      cwd: target,
    });

    await Promise.all(files.map(async (file) => {
      const content = await fs.readFile(path.join(target, file), 'utf8');
      const source = await fs.readFile(path.join(from, file), 'utf8');
      const outputPath = path.join(output, file);
      if (content === source) {
        await fs.rm(outputPath, { force: true });
        return;
      }
      await expect.soft(content).toMatchFileSnapshot(path.join(output, file));
    }));
  }, timeout);
}
