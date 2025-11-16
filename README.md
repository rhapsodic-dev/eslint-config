# @rhapsodic/eslint-config

- Auto fix for formatting
- Reasonable defaults, best practices, only one line of config
- Designed to work with TypeScript, Vue. Out-of-box.
- Opinionated, but [very customizable](#customization)
- [ESLint Flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new), compose easily!
- **Style principle**: Minimal for reading, stable for diff, consistent
  - Sorted imports, dangling commas
  - Single quotes, no semi
  - Using [ESLint Stylistic](https://github.com/eslint-stylistic/eslint-stylistic)
- Requires ESLint v9.5.0+

## Usage

### Starter Wizard

We provided a CLI tool to help you set up your project, or migrate from the legacy config to the new flat config with one command.

```bash
pnpm dlx @rhapsodic/eslint-config@latest
```

### Manual Install

If you prefer to set up manually:

```bash
pnpm i -D eslint @rhapsodic/eslint-config
```

And create `eslint.config.mjs` in your project root:

```js
// eslint.config.mjs
import rhapsodic from '@rhapsodic/eslint-config'

export default rhapsodic()
```

<details>
<summary>
Combined with legacy config:
</summary>

If you still use some configs from the legacy eslintrc format, you can use the [`@eslint/eslintrc`](https://www.npmjs.com/package/@eslint/eslintrc) package to convert them to the flat config.

```js
// eslint.config.mjs
import rhapsodic from '@rhapsodic/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

export default rhapsodic(
  {
    ignores: [],
  },

  // Legacy config
  ...compat.config({
    extends: [
      'eslint:recommended',
      // Other extends...
    ],
  })

  // Other flat configs...
)
```

> Note that `.eslintignore` no longer works in Flat config, see [customization](#customization) for more details.

</details>

### Add script for package.json

For example:

```json
{
  "scripts": {
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
```

## IDE Support (auto fix on save)

<details>
<summary>🟦 VS Code support</summary>

<br>

Install [VS Code ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

Add the following settings to your `.vscode/settings.json`:

```jsonc
{
  // Disable the default formatter, use eslint instead
  "prettier.enable": false,
  "editor.formatOnSave": false,

  // Auto fix
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },

  // Enable eslint for all supported languages
  "eslint.validate": [
    "javascript",
    "typescript",
    "vue"
  ]
}
```

</details>

## Customization
Normally you only need to import the `rhapsodic` preset:

```js
// eslint.config.js
import rhapsodic from '@rhapsodic/eslint-config'

export default rhapsodic()
```

And that's it! Or you can configure each integration individually, for example:

```js
// eslint.config.js
import rhapsodic from '@rhapsodic/eslint-config'

export default rhapsodic({
  // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
  // The `ignores` option in the option (first argument) is specifically treated to always be global ignores
  // And will **extend** the config's default ignores, not override them
  // You can also pass a function to modify the default ignores
  ignores: [
    '**/fixtures',
    // ...globs
  ],

  // Enable stylistic formatting rules
  stylistic: true,

  // Or customize the stylistic rules
  stylistic: {
    indent: 2, // 4, or 'tab'
    quotes: 'single', // or 'double'
  },

  // TypeScript and Vue are autodetected, you can also explicitly enable them:
  typescript: true,
  vue: true,
})
```

The `rhapsodic` factory function also accepts any number of arbitrary custom config overrides:

```js
// eslint.config.js
import rhapsodic from '@rhapsodic/eslint-config'

export default rhapsodic(
  {
    // Configures for rhapsodic's config
  },

  // From the second arguments they are ESLint Flat Configs
  // you can have multiple configs
  {
    files: ['**/*.ts'],
    rules: {},
  },
  {
    rules: {},
  },
)
```

Going more advanced, you can also import fine-grained configs and compose them as you wish:

<details>
<summary>Advanced Example</summary>

We wouldn't recommend using this style in general unless you know exactly what they are doing, as there are shared options between configs and might need extra care to make them consistent.

```js
// eslint.config.js
import {
  combine,
  ignores,
  imports,
  javascript,
  stylistic,
  typescript,
  unicorn,
  vue,
} from '@rhapsodic/eslint-config'

export default combine(
  ignores(),
  javascript(/* Options */),
  imports(),
  unicorn(),
  typescript(/* Options */),
  stylistic(),
  vue(),
)
```

</details>

Check out the [configs](https://github.com/rhapsodic/eslint-config/blob/main/src/configs) and [factory](https://github.com/rhapsodic/eslint-config/blob/main/src/factory.ts) for more details.

> Thanks to [sxzz/eslint-config](https://github.com/sxzz/eslint-config) for the inspiration and reference.

### Rules Overrides

Certain rules would only be enabled in specific files, for example, `ts/*` rules would only be enabled in `.ts` files and `vue/*` rules would only be enabled in `.vue` files. If you want to override the rules, you need to specify the file extension:

```js
// eslint.config.js
import rhapsodic from '@rhapsodic/eslint-config'

export default rhapsodic(
  {
    vue: true,
    typescript: true
  },
  {
    // Remember to specify the file glob here, otherwise it might cause the vue plugin to handle non-vue files
    files: ['**/*.vue'],
    rules: {
      'vue/operator-linebreak': ['error', 'before'],
    },
  },
  {
    // Without `files`, they are general rules for all files
    rules: {
      'style/semi': ['error', 'never'],
    },
  }
)
```

We also provided the `overrides` options in each integration to make it easier:

```js
// eslint.config.js
import rhapsodic from '@rhapsodic/eslint-config'

export default rhapsodic({
  vue: {
    overrides: {
      'vue/operator-linebreak': ['error', 'before'],
    },
  },
  typescript: {
    overrides: {
      'ts/consistent-type-definitions': ['error', 'interface'],
    },
  },
  yaml: {
    overrides: {
      // ...
    },
  },
})
```

### Config Composer

Since v2.10.0, the factory function `rhapsodic()` returns a [`FlatConfigComposer` object from `eslint-flat-config-utils`](https://github.com/rhapsodic/eslint-flat-config-utils#composer) where you can chain the methods to compose the config even more flexibly.

```js
// eslint.config.js
import rhapsodic from '@rhapsodic/eslint-config'

export default rhapsodic()
  .prepend(
    // some configs before the main config
  )
  // overrides any named configs
  .override(
    'rhapsodic/stylistic/rules',
    {
      rules: {
        'style/generator-star-spacing': ['error', { after: true, before: false }],
      }
    }
  )
  // rename plugin prefixes
  .renamePlugins({
    'old-prefix': 'new-prefix',
    // ...
  })
// ...
```

### Vue

Vue support is detected automatically by checking if `vue` is installed in your project. You can also explicitly enable/disable it:

```js
// eslint.config.js
import rhapsodic from '@rhapsodic/eslint-config'

export default rhapsodic({
  vue: true
})
```

#### Vue Accessibility

To enable Vue accessibility support, you need to explicitly turn it on:

```js
// eslint.config.js
import rhapsodic from '@rhapsodic/eslint-config'

export default rhapsodic({
  vue: {
    a11y: true
  },
})
```

Running `npx eslint` should prompt you to install the required dependencies, otherwise, you can install them manually:

```bash
pnpm i -D eslint-plugin-vuejs-accessibility
```

### Lint Staged

If you want to apply lint and auto-fix before every commit, you can add the following to your `package.json`:

```json
{
  "simple-git-hooks": {
    "pre-commit": "pnpm lint-staged"
  },
  "lint-staged": {
    "*": "eslint --fix"
  }
}
```

and then

```bash
pnpm i -D lint-staged simple-git-hooks

// to active the hooks
npx simple-git-hooks
```

## View what rules are enabled

I built a visual tool to help you view what rules are enabled in your project and apply them to what files, [@eslint/config-inspector](https://github.com/eslint/config-inspector)

Go to your project root that contains `eslint.config.js` and run:

```bash
npx @eslint/config-inspector
```

## Versioning Policy

This project follows [Semantic Versioning](https://semver.org/) for releases. However, since this is just a config and involves opinions and many moving parts, we don't treat rules changes as breaking changes.

### Changes Considered as Breaking Changes

- Node.js version requirement changes
- Huge refactors that might break the config
- Plugins made major changes that might break the config
- Changes that might affect most of the codebases

### Changes Considered as Non-breaking Changes

- Enable/disable rules and plugins (that might become stricter)
- Rules options changes
- Version bumps of dependencies

## License

[MIT](./LICENSE) License &copy; 2025-PRESENT [Svyatoslav Fyodorov](https://github.com/intelrug)
