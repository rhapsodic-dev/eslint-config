/* eslint-disable ts/no-explicit-any */

import type { Linter } from 'eslint';
import type { RuleOptions } from './typegen';
import type {
  Awaitable, ConfigNames, OptionsConfig, TypedFlatConfigItem,
} from './types';

import { FlatConfigComposer } from 'eslint-flat-config-utils';
import { isPackageExists } from 'local-pkg';
import {
  disables,
  ignores,
  imports,
  javascript,
  stylistic,
  typescript,
  unicorn,
  vue,
} from './configs';

const flatConfigProps = [
  'name',
  'languageOptions',
  'linterOptions',
  'processor',
  'plugins',
  'rules',
  'settings',
] satisfies (keyof TypedFlatConfigItem)[];

const VuePackages = [
  'vue',
  'nuxt',
];

/**
 * Construct an array of ESLint flat config items.
 *
 * @param {OptionsConfig & TypedFlatConfigItem} options
 *  The options for generating the ESLint configurations.
 * @param {Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>[]} userConfigs
 *  The user configurations to be merged with the generated configurations.
 * @returns {Promise<TypedFlatConfigItem[]>}
 *  The merged ESLint configurations.
 */
export function rhapsodic(
  options: OptionsConfig & Omit<TypedFlatConfigItem, 'files'> = {},
  // eslint-disable-next-line style/max-len
  ...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]
): FlatConfigComposer<TypedFlatConfigItem, ConfigNames> {
  const {
    componentExts = [],
    ignores: userIgnores = [],
    imports: enableImports = true,
    typescript: enableTypeScript = isPackageExists('typescript'),
    unicorn: enableUnicorn = true,
    vue: enableVue = VuePackages.some((i) => isPackageExists(i)),
  } = options;

  const stylisticOptions = options.stylistic === false
    ? false
    : (typeof options.stylistic === 'object'
        ? options.stylistic
        : {});

  const configs: Awaitable<TypedFlatConfigItem[]>[] = [];

  const typescriptOptions = resolveSubOptions(options, 'typescript');

  // Base configs
  configs.push(
    ignores(userIgnores),
    javascript({
      overrides: getOverrides(options, 'javascript'),
    }),
  );

  if (enableImports) {
    configs.push(imports(enableImports === true
      ? {}
      : {
          ...enableImports,
        }));
  }

  if (enableUnicorn) {
    configs.push(unicorn(enableUnicorn === true ? {} : enableUnicorn));
  }

  if (enableVue) {
    componentExts.push('vue');
  }

  if (enableTypeScript) {
    configs.push(typescript({
      ...typescriptOptions,
      componentExts,
      overrides: getOverrides(options, 'typescript'),
    }));
  }

  if (stylisticOptions) {
    configs.push(stylistic({
      ...stylisticOptions,
      overrides: getOverrides(options, 'stylistic'),
    }));
  }

  if (enableVue) {
    configs.push(vue({
      ...resolveSubOptions(options, 'vue'),
      overrides: getOverrides(options, 'vue'),
      stylistic: stylisticOptions,
      typescript: !!enableTypeScript,
    }));
  }

  configs.push(disables());

  if ('files' in options) {
    throw new Error('[@rhapsodic/eslint-config] The first argument should not contain the "files" property as the options are supposed to be global. Place it in the second or later config instead.');
  }

  // User can optionally pass a flat config item to the first argument
  // We pick the known keys as ESLint would do schema validation
  const fusedConfig = flatConfigProps.reduce((acc, key) => {
    if (key in options) acc[key] = options[key] as any;
    return acc;
  }, {} as TypedFlatConfigItem);
  if (Object.keys(fusedConfig).length) configs.push([fusedConfig]);

  let composer = new FlatConfigComposer<TypedFlatConfigItem, ConfigNames>();

  composer = composer
    .append(
      ...configs,
      ...userConfigs as any,
    );

  return composer;
}

export type ResolvedOptions<T> = T extends boolean
  ? never
  : NonNullable<T>;

export function resolveSubOptions<K extends keyof OptionsConfig>(
  options: OptionsConfig,
  key: K,
): ResolvedOptions<OptionsConfig[K]> {
  return typeof options[key] === 'boolean'
    ? {} as any
    : options[key] || {} as any;
}

export function getOverrides<K extends keyof OptionsConfig>(
  options: OptionsConfig,
  key: K,
): Partial<Linter.RulesRecord & RuleOptions> {
  const sub = resolveSubOptions(options, key);
  return {
    ...(options.overrides as any)?.[key],
    ...'overrides' in sub
      ? sub.overrides
      : {},
  };
}
