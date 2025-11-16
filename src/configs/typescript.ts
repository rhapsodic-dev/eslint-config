import type {
  OptionsComponentExts,

  OptionsFiles,
  OptionsOverrides,
  OptionsTypeScriptParserOptions,
  OptionsTypeScriptWithTypes,
  TypedFlatConfigItem,
} from '../types';
import process from 'node:process';
import { GLOB_TS, GLOB_TSX } from '../globs';
import { interopDefault, renameRules } from '../utils';

// eslint-disable-next-line style/max-len
export async function typescript(options: OptionsFiles & OptionsComponentExts & OptionsOverrides & OptionsTypeScriptWithTypes & OptionsTypeScriptParserOptions = {}): Promise<TypedFlatConfigItem[]> {
  const {
    componentExts = [],
    overrides = {},
    parserOptions = {},
  } = options;

  const files = options.files ?? [
    GLOB_TS,
    GLOB_TSX,
    ...componentExts.map((ext) => `**/*.${ext}`),
  ];

  const tsconfigPath = options?.tsconfigPath ?? undefined;

  const [
    pluginTs,
    parserTs,
  ] = await Promise.all([
    interopDefault(import('@typescript-eslint/eslint-plugin')),
    interopDefault(import('@typescript-eslint/parser')),
  ] as const);

  function makeParser(filesArray: string[], ignores?: string[]): TypedFlatConfigItem {
    return {
      files: filesArray,
      ...ignores ? { ignores } : {},
      languageOptions: {
        parser: parserTs,
        parserOptions: {
          extraFileExtensions: componentExts.map((ext) => `.${ext}`),
          sourceType: 'module',
          projectService: {
            allowDefaultProject: ['./*.js'],
            defaultProject: tsconfigPath,
          },
          tsconfigRootDir: process.cwd(),
          ...parserOptions,
        },
      },
      name: 'rhapsodic/typescript/parser',
    };
  }

  return [
    {
      // Install the plugins without globs, so they can be configured separately.
      name: 'rhapsodic/typescript/setup',
      plugins: {
        ts: pluginTs,
      },
    },
    makeParser(files),
    {
      files,
      name: 'rhapsodic/typescript/rules',
      rules: {
        ...renameRules(
          pluginTs.configs.recommended.rules!,
          { '@typescript-eslint': 'ts' },
        ),
        ...renameRules(
          pluginTs.configs['eslint-recommended'].overrides![0].rules!,
          { '@typescript-eslint': 'ts' },
        ),
        ...renameRules(
          pluginTs.configs['stylistic-type-checked'].rules!,
          { '@typescript-eslint': 'ts' },
        ),

        'ts/ban-ts-comment': ['error', {
          'ts-expect-error': 'allow-with-description',
        }],
        'ts/no-inferrable-types': 'off',
        'ts/no-shadow': ['error'],
        'ts/no-unused-vars': ['error', {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        }],
        'ts/prefer-function-type': 'off',
        'ts/consistent-type-imports': ['error', {
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports',
          prefer: 'type-imports',
        }],
        'ts/naming-convention': [
          'error',
          {
            selector: 'typeLike',
            format: ['PascalCase'],
          },
        ],

        ...overrides,
      },
    },
  ];
}
