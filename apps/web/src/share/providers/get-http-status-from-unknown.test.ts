import { expect, test } from 'vitest'

import { getHttpStatusFromUnknown } from './get-http-status-from-unknown'

test('returns undefined for non-objects', () => {
  expect(getHttpStatusFromUnknown('err')).toBeUndefined()
  expect(getHttpStatusFromUnknown(404)).toBeUndefined()
})

test('returns undefined for null', () => {
  expect(getHttpStatusFromUnknown(null)).toBeUndefined()
})

test('returns undefined when status missing or not a number', () => {
  expect(getHttpStatusFromUnknown({})).toBeUndefined()
  expect(getHttpStatusFromUnknown({ status: '404' })).toBeUndefined()
})

test('returns numeric status', () => {
  expect(getHttpStatusFromUnknown({ status: 404 })).toBe(404)
})
