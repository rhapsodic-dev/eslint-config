import { rhapsodic } from './src';

export default rhapsodic(
  {
    vue: {
      a11y: true,
    },
    typescript: true,
  },
  {
    ignores: [
      'fixtures',
      '_fixtures',
    ],
  },
  {
    files: ['src/typegen.d.ts'],
    rules: {
      'unicorn/no-abusive-eslint-disable': 'off',
    },
  },
);
