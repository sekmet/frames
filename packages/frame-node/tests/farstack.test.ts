import { expect, test } from 'vitest'
import { verifyAppKeyWithFarstack } from '../src/farstack'

test('farstack', async ({ skip }) => {
  if (!process.env.FARSTACK_API_KEY) {
    skip()
  }

  const result = await verifyAppKeyWithFarstack(
    5448,
    '0x5d4cd906de103d6fff5a50869164344827d338b78d887cb7d5d1ca1cf62711ee',
  )

  expect(result).toMatchObject({ valid: true, appFid: 9152 })
})
