/* eslint-disable ts/no-explicit-any */

import type {
  OptionsFiles,
  OptionsHasTypeScript,
  OptionsOverrides,
  OptionsStylistic,
  OptionsVue,
  TypedFlatConfigItem,
} from '../types';

import globals from 'globals';

import { mergeProcessors } from 'eslint-merge-processors';
import { GLOB_VUE } from '../globs';
import { ensurePackages, interopDefault } from '../utils';

// eslint-disable-next-line style/max-len
export async function vue(options: OptionsVue & OptionsHasTypeScript & OptionsOverrides & OptionsStylistic & OptionsFiles = {}): Promise<TypedFlatConfigItem[]> {
  const {
    a11y = false,
    files = [GLOB_VUE],
    overrides = {},
    stylistic = true,
  } = options;

  const sfcBlocks = options.sfcBlocks === true
    ? {}
    : options.sfcBlocks ?? {};

  const {
    indent = 2,
  } = typeof stylistic === 'boolean' ? {} : stylistic;

  if (a11y) {
    await ensurePackages([
      'eslint-plugin-vuejs-accessibility',
    ]);
  }

  const [
    pluginVue,
    parserVue,
    processorVueBlocks,
    pluginVueA11y,
  ] = await Promise.all([
    interopDefault(import('eslint-plugin-vue')),
    interopDefault(import('vue-eslint-parser')),
    interopDefault(import('eslint-processor-vue-blocks')),
    ...a11y ? [interopDefault(import('eslint-plugin-vuejs-accessibility'))] : [],
  ] as const);

  return [
    {
      // This allows Vue plugin to work with auto imports
      // https://github.com/vuejs/eslint-plugin-vue/pull/2422
      languageOptions: {
        globals: {
          ...globals['shared-node-browser'],
          computed: 'readonly',
          defineEmits: 'readonly',
          defineExpose: 'readonly',
          defineProps: 'readonly',
          onMounted: 'readonly',
          onUnmounted: 'readonly',
          reactive: 'readonly',
          ref: 'readonly',
          shallowReactive: 'readonly',
          shallowRef: 'readonly',
          toRef: 'readonly',
          toRefs: 'readonly',
          watch: 'readonly',
          watchEffect: 'readonly',
        },
      },
      name: 'rhapsodic/vue/setup',
      plugins: {
        vue: pluginVue,
        ...a11y ? { 'vue-a11y': pluginVueA11y } : {},
      },
    },
    {
      files,
      languageOptions: {
        parser: parserVue,
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          extraFileExtensions: ['.vue'],
          parser: options.typescript
            ? await interopDefault(import('@typescript-eslint/parser')) as any
            : null,
          sourceType: 'module',
        },
      },
      name: 'rhapsodic/vue/rules',
      processor: sfcBlocks === false
        ? pluginVue.processors['.vue']
        : mergeProcessors([
            pluginVue.processors['.vue'],
            processorVueBlocks({
              ...sfcBlocks,
              blocks: {
                styles: true,
                ...sfcBlocks.blocks,
              },
            }),
          ]),
      rules: {
        ...pluginVue.configs['flat/essential'].map((c) => c.rules).reduce((acc, c) => ({ ...acc, ...c }), {}) as any,

        'vue/block-lang': ['error', {
          script: {
            lang: options.typescript ? 'ts' : 'js',
            allowNoLang: false,
          },
        }],
        'vue/camelcase': ['error', {
          properties: 'never',
          ignoreDestructuring: false,
        }],
        'vue/component-definition-name-casing': ['error', 'PascalCase'],
        'vue/eqeqeq': ['error', 'always', {
          null: 'ignore',
        }],
        'vue/html-button-has-type': ['error', {
          button: true,
          submit: true,
          reset: false,
        }],

        'vue/html-self-closing': ['error', {
          html: {
            void: 'any',
          },
        }],
        'vue/max-len': ['error', {
          code: 120,
          template: 120,
          comments: 120,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreHTMLAttributeValues: true,
          ignoreHTMLTextContents: true,
        }],
        'vue/multi-word-component-names': 'off',
        'vue/no-child-content': 'error',
        'vue/no-constant-condition': 'warn',
        'vue/no-duplicate-attributes': ['error', {
          allowCoexistClass: true,
          allowCoexistStyle: true,
        }],
        'vue/no-empty-pattern': 'error',
        'vue/no-implicit-coercion': ['error', {
          allow: ['!!', '+'],
        }],
        'vue/no-irregular-whitespace': 'error',
        'vue/no-loss-of-precision': 'error',
        'vue/no-potential-component-option-typo': 'error',
        'vue/no-sparse-arrays': 'error',
        'vue/no-template-target-blank': ['error', {
          allowReferrer: true,
          enforceDynamicLinks: 'always',
        }],
        'vue/no-useless-concat': 'error',
        'vue/no-v-html': 'off',
        'vue/object-shorthand': ['error', 'always', {
          ignoreConstructors: false,
          avoidQuotes: true,
        }],
        'vue/prefer-template': 'error',
        'vue/require-default-prop': 'off',

        ...stylistic
          ? {
              'style/max-len': 'off',

              'vue/array-bracket-newline': ['error', 'consistent'],
              'vue/array-bracket-spacing': ['error', 'never'],
              'vue/arrow-spacing': ['error', {
                after: true,
                before: true,
              }],
              'vue/block-order': ['error', {
                order: ['template', 'script', 'style'],
              }],
              'vue/block-spacing': ['error', 'always'],
              'vue/brace-style': ['error', '1tbs', {
                allowSingleLine: true,
              }],
              'vue/comma-dangle': ['error', {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'always-multiline',
              }],
              'vue/comma-spacing': ['error', {
                before: false,
                after: true,
              }],
              'vue/comma-style': ['error', 'last', {
                exceptions: {
                  ArrayExpression: false,
                  ArrayPattern: false,
                  ArrowFunctionExpression: false,
                  CallExpression: false,
                  FunctionDeclaration: false,
                  FunctionExpression: false,
                  ImportDeclaration: false,
                  ObjectExpression: false,
                  ObjectPattern: false,
                  VariableDeclaration: false,
                  NewExpression: false,
                },
              }],
              'vue/dot-location': ['error', 'property'],
              'vue/dot-notation': ['error', {
                allowKeywords: true,
              }],
              'vue/first-attribute-linebreak': 'off',
              'vue/func-call-spacing': ['error', 'never'],
              'vue/html-closing-bracket-spacing': ['error', {
                startTag: 'never',
                endTag: 'never',
                selfClosingTag: 'always',
              }],
              'vue/html-closing-bracket-newline': [
                'error',
                {
                  singleline: 'never',
                  multiline: 'always',
                  selfClosingTag: {
                    singleline: 'never',
                    multiline: 'always',
                  },
                },
              ],
              'vue/html-indent': ['error', indent],
              'vue/key-spacing': ['error', {
                beforeColon: false,
                afterColon: true,
              }],
              'vue/keyword-spacing': ['error', {
                before: true,
                after: true,
                overrides: {
                  return: {
                    after: true,
                  },
                  throw: {
                    after: true,
                  },
                  case: {
                    after: true,
                  },
                },
              }],
              'vue/max-attributes-per-line': ['error', {
                singleline: {
                  max: 3,
                },
                multiline: {
                  max: 1,
                },
              }],
              'vue/multiline-html-element-content-newline': ['error', {
                ignoreWhenEmpty: true,
                ignores: [
                  'nuxt-link',
                  'nuxt-link-locale',
                  'pre',
                  'textarea',
                  'a',
                  'abbr',
                  'audio',
                  'b',
                  'bdi',
                  'bdo',
                  'canvas',
                  'cite',
                  'code',
                  'data',
                  'del',
                  'dfn',
                  'em',
                  'i',
                  'iframe',
                  'ins',
                  'kbd',
                  'label',
                  'map',
                  'mark',
                  'noscript',
                  'object',
                  'output',
                  'picture',
                  'q',
                  'ruby',
                  's',
                  'samp',
                  'small',
                  'span',
                  'strong',
                  'sub',
                  'sup',
                  'svg',
                  'time',
                  'u',
                  'var',
                  'video',
                ],
                allowEmptyLines: false,
              }],
              'vue/no-extra-parens': ['off', 'all', {
                conditionalAssign: true,
                nestedBinaryExpressions: false,
                returnAssign: false,
                ignoreJSX: 'all',
                enforceForArrowConditionals: false,
              }],
              'vue/no-multi-spaces': 'error',
              'vue/no-spaces-around-equal-signs-in-attribute': 'error',
              'vue/object-curly-newline': ['error', {
                ObjectExpression: {
                  multiline: true,
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
              'vue/object-curly-spacing': ['error', 'always'],
              'vue/object-property-newline': ['error', {
                allowAllPropertiesOnSameLine: true,
              }],
              'vue/operator-linebreak': ['error', 'before', {
                overrides: {
                  '=': 'none',
                },
              }],
              'vue/quote-props': ['error', 'as-needed', {
                keywords: false,
                unnecessary: true,
                numbers: false,
              }],
              'vue/singleline-html-element-content-newline': 'off',
              'vue/space-in-parens': ['error', 'never'],
              'vue/space-infix-ops': 'error',
              'vue/space-unary-ops': ['error', {
                words: true,
                nonwords: false,
                overrides: {},
              }],
              'vue/template-curly-spacing': 'error',
            }
          : {},

        ...a11y
          ? {
              'vue-a11y/alt-text': ['error', {
                elements: [
                  'img',
                  'object',
                  'area',
                  'input[type="image"]',
                ],
                img: [],
                object: [],
                area: [],
                'input[type="image"]': [],
              }],
              'vue-a11y/anchor-has-content': ['error', {
                components: [],
                accessibleChildren: [],
                accessibleDirectives: [],
              }],
              'vue-a11y/aria-props': 'error',
              'vue-a11y/aria-role': ['error', {
                ignoreNonDOM: false,
              }],
              'vue-a11y/aria-unsupported-elements': 'error',
              'vue-a11y/click-events-have-key-events': 'error',
              'vue-a11y/form-control-has-label': 'off',
              'vue-a11y/heading-has-content': 'error',
              'vue-a11y/iframe-has-title': 'error',
              'vue-a11y/interactive-supports-focus': 'error',
              'vue-a11y/label-has-for': 'off',
              'vue-a11y/media-has-caption': 'error',
              'vue-a11y/mouse-events-have-key-events': 'error',
              'vue-a11y/no-access-key': 'error',
              'vue-a11y/no-autofocus': ['error', {
                ignoreNonDOM: true,
              }],
              'vue-a11y/no-distracting-elements': ['error', {
                elements: [
                  'marquee',
                  'blink',
                ],
              }],
              'vue-a11y/no-redundant-roles': 'error',
              'vue-a11y/no-static-element-interactions': 'error',
              'vue-a11y/role-has-required-aria-props': 'error',
              'vue-a11y/tabindex-no-positive': 'error',
            }
          : {},

        ...overrides,
      },
    },
  ];
}
