import type { FrameHost, WireFrameHost } from '@farstack/frame-core'
import { AddFrame, SignIn } from '@farstack/frame-core'

export function wrapHandlers(host: FrameHost): WireFrameHost {
  return {
    ...host,
    addFrame: async () => {
      try {
        const result = await host.addFrame()
        return { result }
      } catch (e) {
        if (e instanceof AddFrame.RejectedByUser) {
          return {
            error: {
              type: 'rejected_by_user',
            },
          }
        }

        if (e instanceof AddFrame.InvalidDomainManifest) {
          return {
            error: {
              type: 'invalid_domain_manifest',
            },
          }
        }

        throw e
      }
    },
    signIn: async (options) => {
      try {
        const result = await host.signIn(options)
        return { result }
      } catch (e) {
        if (e instanceof SignIn.RejectedByUser) {
          return {
            error: {
              type: 'rejected_by_user',
            },
          }
        }

        throw e
      }
    },
  }
}
