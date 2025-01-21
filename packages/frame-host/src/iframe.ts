import type { FrameHost } from '@farstack/frame-core'
import type { Provider } from 'ox'
import * as Comlink from './comlink'
import { exposeToEndpoint } from './helpers/endpoint'
import type { HostEndpoint } from './types'

/**
 * An endpoint of communicating with an iFrame
 */
export function createIframeEndpoint({
  iframe,
  targetOrigin,
  debug = true,
}: {
  iframe: HTMLIFrameElement
  targetOrigin: string
  debug?: boolean
}): HostEndpoint {
  return {
    // when is contentWindow null
    ...Comlink.windowEndpoint(iframe.contentWindow!),
    emit: (event) => {
      if (debug) {
        console.debug('frameEvent', event)
      }

      const wireEvent = {
        type: 'frameEvent',
        event,
      }

      iframe.contentWindow?.postMessage(wireEvent, targetOrigin)
    },
    emitEthProvider: (event, params) => {
      if (debug) {
        console.debug('fc:emitEthProvider', event, params)
      }

      const wireEvent = {
        type: 'frameEthProviderEvent',
        event,
        params,
      }

      iframe.contentWindow?.postMessage(wireEvent, targetOrigin)
    },
  }
}

export function exposeToIframe({
  iframe,
  sdk,
  ethProvider,
  frameOrigin,
  debug = false,
}: {
  iframe: HTMLIFrameElement
  sdk: Omit<FrameHost, 'ethProviderRequestV2'>
  frameOrigin: string
  ethProvider?: Provider.Provider
  debug?: boolean
}) {
  const endpoint = createIframeEndpoint({
    iframe,
    targetOrigin: frameOrigin,
    debug,
  })
  const cleanup = exposeToEndpoint({
    endpoint,
    sdk,
    ethProvider,
    frameOrigin,
    debug,
  })

  return {
    endpoint,
    cleanup,
  }
}
