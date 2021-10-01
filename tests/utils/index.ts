import { TSESLint } from '@typescript-eslint/experimental-utils'
import { resolve } from 'path'
import { clearCache, setNgrxVersion } from '../../src/utils'

export function ruleTester(environment?: { package: string; version: string }) {
  clearCache()

  if (environment) {
    setNgrxVersion(environment.package, environment.version)
  }

  return new TSESLint.RuleTester({
    parser: resolve('./node_modules/@typescript-eslint/parser'),
    parserOptions: {
      project: resolve('./tests/tsconfig.json'),
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  })
}
