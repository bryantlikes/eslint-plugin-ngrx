import type { TSESTree } from '@typescript-eslint/experimental-utils'
import { ESLintUtils } from '@typescript-eslint/experimental-utils'
import path from 'path'
import { docsUrl, injectedStore } from '../../utils'

export const useConsistentGlobalStoreName = 'useConsistentGlobalStoreName'
export const useConsistentGlobalStoreNameSuggest =
  'useConsistentGlobalStoreNameSuggest'
export type MessageIds =
  | typeof useConsistentGlobalStoreName
  | typeof useConsistentGlobalStoreNameSuggest

type Options = [string]

export default ESLintUtils.RuleCreator(docsUrl)<Options, MessageIds>({
  name: path.parse(__filename).name,
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Best Practices',
      description: 'Use a consistent name for the global store.',
      recommended: 'warn',
    },
    schema: [
      {
        type: 'string',
        additionalProperties: false,
      },
    ],
    messages: {
      [useConsistentGlobalStoreName]:
        'Global store should have the name `{{ storeName }}`.',
      [useConsistentGlobalStoreNameSuggest]: 'Use `{{ storeName }}`.',
    },
  },
  defaultOptions: ['store'],
  create: (context, [storeName]) => {
    return {
      [`${injectedStore}[name!=${storeName}]`]({
        loc,
        name,
        range,
        typeAnnotation,
      }: TSESTree.Identifier & {
        typeAnnotation: TSESTree.TSTypeAnnotation
      }) {
        const data = { storeName }
        context.report({
          loc: {
            ...loc,
            end: {
              ...loc.start,
              column: loc.start.column + name.length,
            },
          },
          messageId: useConsistentGlobalStoreName,
          data,
          suggest: [
            {
              messageId: useConsistentGlobalStoreNameSuggest,
              fix: (fixer) =>
                fixer.replaceTextRange(
                  [range[0], typeAnnotation.range[0]],
                  storeName,
                ),
              data,
            },
          ],
        })
      },
    }
  },
})
