import type {
  ESLintUtils,
  TSESLint,
} from '@typescript-eslint/experimental-utils'
import { stripIndent } from 'common-tags'
import path from 'path'
import { test } from 'uvu'
import rule, {
  onFunctionExplicitReturnType,
  onFunctionExplicitReturnTypeSuggest,
} from '../../src/rules/store/on-function-explicit-return-type'
import { ruleTester } from '../utils'

type MessageIds = ESLintUtils.InferMessageIdsTypeFromRule<typeof rule>
type Options = ESLintUtils.InferOptionsTypeFromRule<typeof rule>
type RunTests = TSESLint.RunTests<MessageIds, Options>

const valid: () => RunTests['valid'] = () => [
  `
  const reducer = createReducer(
    initialState,
    on(
      increment,
      (s): State => ({
        ...s,
        counter: s.counter + 1,
      }),
    ),
  )`,
  `
const reducer = createReducer(
  initialState,
  on(increment, incrementFunc),
  on(increment, s => incrementFunc(s)),
  on(increment, (s): State => incrementFunc(s)),
)`,
  `
const reducer = createReducer(
  initialState,
  on(
    increment,
    produce((draft: State, action) => {
        draft.counter++;
    }),
  ),
)`,
  // https://github.com/timdeschryver/ngrx-tslint-rules/pull/37
  `
const reducer = createReducer(
  on(increment, (s): State => ({
    ...s,
    counter: (s => s.counter + 1)(s),
  })),
)`,
]

const invalid: () => TSESLint.InvalidTestCase<MessageIds, []>[] = () => [
  {
    code: stripIndent`
        const reducer = createReducer(
          initialState,
          on(increment, s => s),
        )`,
    errors: [
      {
        column: 17,
        endColumn: 23,
        line: 3,
        messageId: onFunctionExplicitReturnType,
        suggestions: [
          {
            messageId: onFunctionExplicitReturnTypeSuggest,
            output: stripIndent`
                const reducer = createReducer(
                  initialState,
                  on(increment, (s): State => s),
                )`,
          },
        ],
      },
    ],
  },
  {
    code: stripIndent`
        const reducer = createReducer(
          initialState,
          on(increment, s => ({ ...s, counter: s.counter + 1 })),
        )`,
    errors: [
      {
        column: 17,
        endColumn: 56,
        line: 3,
        messageId: onFunctionExplicitReturnType,
        suggestions: [
          {
            messageId: onFunctionExplicitReturnTypeSuggest,
            output: stripIndent`
                const reducer = createReducer(
                  initialState,
                  on(increment, (s): State => ({ ...s, counter: s.counter + 1 })),
                )`,
          },
        ],
      },
    ],
  },
  {
    code: stripIndent`
        const reducer = createReducer(
          initialState,
          on(increase, (s, action) => ({ ...s, counter: s.counter + action.value })),
        )`,
    errors: [
      {
        column: 16,
        endColumn: 76,
        line: 3,
        messageId: onFunctionExplicitReturnType,
        suggestions: [
          {
            messageId: onFunctionExplicitReturnTypeSuggest,
            output: stripIndent`
                const reducer = createReducer(
                  initialState,
                  on(increase, (s, action): State => ({ ...s, counter: s.counter + action.value })),
                )`,
          },
        ],
      },
    ],
  },
  {
    code: stripIndent`
        const reducer = createReducer(
          initialState,
          on(increase, (s, { value }) =>   (   { ...s, counter: s.counter + value   }  )   ),
        )`,
    errors: [
      {
        column: 16,
        endColumn: 81,
        line: 3,
        messageId: onFunctionExplicitReturnType,
        suggestions: [
          {
            messageId: onFunctionExplicitReturnTypeSuggest,
            output: stripIndent`
                const reducer = createReducer(
                  initialState,
                  on(increase, (s, { value }): State =>   (   { ...s, counter: s.counter + value   }  )   ),
                )`,
          },
        ],
      },
    ],
  },
]

test(__filename, () => {
  ruleTester().run(path.parse(__filename).name, rule, {
    valid: valid(),
    invalid: invalid(),
  })
})
test.run()
