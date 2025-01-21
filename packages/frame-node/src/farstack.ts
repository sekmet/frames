import { createVerifyAppKeyWithHub } from './farcaster'
import type { VerifyAppKey, VerifyAppKeyResult } from './types'

const apiKey = process.env.FARSTACK_API_KEY || ''

export const verifyAppKeyWithFarstack: VerifyAppKey = async (
  fid: number,
  appKey: string,
): Promise<VerifyAppKeyResult> => {
  if (!apiKey) {
    throw new Error(
      'Environment variable FARSTACK_API_KEY needs to be set to use Farstack for app key verification',
    )
  }

  const verifier = createVerifyAppKeyWithHub('https://hub-api.farstack.xyz', {
    headers: {
      'x-api-key': apiKey,
    },
  })

  return verifier(fid, appKey)
}
