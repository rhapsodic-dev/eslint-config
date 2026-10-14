import type { OptionsConfig } from '../src/types';

import fs from 'node:fs/promises';
import path from 'node:path';
import { ESLint } from 'eslint';
import { it } from 'vitest';
import { rhapsodic } from '../src';

const guards = await fs.readFile('fixtures/unicorn/guards.js', 'utf8');
const unusedReturn = 'const values = new Set([1]);\nvalues.has(1);\n';

it('combines guards with the recommended Unicorn rules', async ({ expect }) => {
  const eslint = await createESLint({}, true);
  const [result] = await eslint.lintText(guards);

  expect(result.messages).toEqual([]);
  await expect(result.output).toMatchFileSnapshot(path.resolve('fixtures/unicorn/guards.output.js'));
});

it('reports unused built-in method returns', async ({ expect }) => {
  const eslint = await createESLint();
  const [result] = await eslint.lintText(unusedReturn);

  expect(result.messages).toMatchObject([
    {
      ruleId: 'unicorn/no-unused-builtin-method-return',
      messageId: 'no-unused-builtin-method-return',
      severity: 2,
    },
  ]);
});

it('disables new rules with unicorn: false', async ({ expect }) => {
  const eslint = await createESLint({ unicorn: false }, true);
  const [result] = await eslint.lintText(`${guards}\n${unusedReturn}`);

  expect(result.messages).toEqual([]);
  expect(result.output).toBeUndefined();
});

it('disables new rules with unicorn.overrides', async ({ expect }) => {
  const eslint = await createESLint({
    unicorn: {
      overrides: {
        'unicorn/prefer-combined-guards': 'off',
        'unicorn/no-unused-builtin-method-return': 'off',
      },
    },
  }, true);
  const [result] = await eslint.lintText(`${guards}\n${unusedReturn}`);

  expect(result.messages).toEqual([]);
  expect(result.output).toBeUndefined();
});

async function createESLint(options: Pick<OptionsConfig, 'unicorn'> = {}, shouldFix = false): Promise<ESLint> {
  return new ESLint({
    overrideConfigFile: true,
    overrideConfig: await rhapsodic({
      imports: false,
      stylistic: false,
      typescript: false,
      vue: false,
      ...options,
    }),
    fix: shouldFix,
  });
}
