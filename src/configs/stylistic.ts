import type { OptionsOverrides, StylisticConfig, TypedFlatConfigItem } from '../types';
import { interopDefault } from '../utils';

export const StylisticConfigDefaults: StylisticConfig = {
  arrowParens: true,
  blockSpacing: true,
  braceStyle: '1tbs',
  commaDangle: 'always-multiline',
  indent: 2,
  quoteProps: 'as-needed',
  quotes: 'single',
  semi: true,
};

export type StylisticOptions = StylisticConfig & OptionsOverrides;

export async function stylistic(options: StylisticOptions = {}): Promise<TypedFlatConfigItem[]> {
  const {
    arrowParens,
    blockSpacing,
    braceStyle,
    commaDangle,
    indent,
    quoteProps,
    quotes,
    overrides,
    semi,
  } = {
    ...StylisticConfigDefaults,
    ...options,
  };

  const pluginStylistic = await interopDefault(import('@stylistic/eslint-plugin'));

  const config = pluginStylistic.configs.customize({
    arrowParens,
    blockSpacing,
    braceStyle,
    commaDangle,
    indent,
    jsx: false,
    quoteProps,
    pluginName: 'style',
    quotes,
    semi,
  }) as TypedFlatConfigItem;

  return [
    {
      name: 'rhapsodic/stylistic/rules',
      plugins: {
        style: pluginStylistic,
      },
      rules: {
        ...config.rules,

        'style/array-bracket-newline': ['error', 'consistent'],
        'style/array-element-newline': ['error', 'consistent'],
        'style/function-call-argument-newline': ['error', 'consistent'],
        'style/function-call-spacing': ['error', 'never'],
        'style/function-paren-newline': ['error', 'multiline'],
        'style/lines-between-class-members': ['error', 'always', {
          exceptAfterSingleLine: true,
          exceptAfterOverload: true,
        }],
        'style/multiline-comment-style': ['error', 'separate-lines'],
        'style/max-len': ['error', {
          code: 120,
          ignoreStrings: true,
          ignoreComments: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        }],
        'style/newline-per-chained-call': ['error', {
          ignoreChainWithDepth: 2,
        }],
        'style/no-confusing-arrow': ['error', {
          allowParens: true,
          onlyOneSimpleParam: false,
        }],
        'style/no-extra-semi': 'error',
        'style/nonblock-statement-body-position': ['error', 'beside'],
        'style/object-curly-newline': ['error', {
          ObjectExpression: {
            multiline: true,
            minProperties: 4,
            consistent: true,
          },
          ObjectPattern: {
            multiline: true,
            consistent: true,
          },
          ImportDeclaration: {
            multiline: true,
            minProperties: 4,
            consistent: true,
          },
          ExportDeclaration: {
            multiline: true,
            consistent: true,
          },
        }],
        'style/object-property-newline': ['error', {
          allowAllPropertiesOnSameLine: true,
        }],
        'style/one-var-declaration-per-line': ['error', 'always'],
        'style/semi-style': ['error', 'last'],
        'style/switch-colon-spacing': ['error', {
          after: true,
          before: false,
        }],

        ...overrides,
      },
    },
  ];
}
