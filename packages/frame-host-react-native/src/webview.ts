import type { HostEndpoint } from '@farstack/frame-host'

import type { RefObject } from 'react'
import type WebView from 'react-native-webview'
import type { WebViewMessageEvent } from 'react-native-webview'

export const SYMBOL_IGNORING_RPC_RESPONSE_ERROR: symbol = Symbol()

export type WebViewEndpoint = HostEndpoint & {
  /**
   * Manually distribute events to listeners as an alternative to `document.addEventHandler` which is unavailable in React Native.
   */
  onMessage: (e: WebViewMessageEvent) => void
}

/**
 * An endpoint of communicating with WebView
 */
export function createWebViewRpcEndpoint(
  ref: RefObject<WebView>,
): WebViewEndpoint {
  const listeners: EventListenerOrEventListenerObject[] = []
  return {
    addEventListener: (type, listener) => {
      if (type !== 'message') {
        throw Error(
          `Got an unexpected event type "${type}". Expected "message".`,
        )
      }
      listeners.push(listener)
    },
    removeEventListener: (type, listener) => {
      if (type !== 'message') {
        throw Error(
          `Got an unexpected event type "${type}". Expected "message".`,
        )
      }
      listeners.splice(listeners.findIndex((l) => l === listener))
    },
    postMessage: (data) => {
      if (!ref.current) {
        if (
          'value' in data &&
          data.value === SYMBOL_IGNORING_RPC_RESPONSE_ERROR
        ) {
          return
        }
        throw Error('Failed to return RPC response to WebView via postMessage')
      }
      console.debug('[webview:res]', data)
      const dataStr = JSON.stringify(data)
      return ref.current.injectJavaScript(`
        console.debug('[webview:res]', ${dataStr});
        document.dispatchEvent(new MessageEvent('FarcasterFrameCallback', { data: ${dataStr} }));
      `)
    },
    onMessage: (e) => {
      const data = JSON.parse(e.nativeEvent.data)
      console.debug('[webview:req]', data)
      const messageEvent = new MessageEvent(data)
      for (const l of listeners) {
        if (typeof l === 'function') {
          // Actually, messageEvent doesn't satisfy Event interface,
          // but it satisfies the minimum properties that Comlink's listener requires.
          l(messageEvent as unknown as Event)
        } else {
          l.handleEvent(messageEvent as unknown as Event)
        }
      }
    },
    emit: (data) => {
      if (!ref.current) {
        throw Error('Failed to send Event to WebView via postMessage')
      }
      console.debug('[webview:emit]', data)
      const dataStr = JSON.stringify(data)
      return ref.current.injectJavaScript(`
        console.debug('[webview:emit]', ${dataStr});
        document.dispatchEvent(new MessageEvent('FarcasterFrameEvent', { data: ${dataStr} }));
      `)
    },
    emitEthProvider: (event, params) => {
      if (!ref.current) {
        throw Error(
          'Failed to send EthProvider Event to WebView via postMessage',
        )
      }
      console.debug('[emit:ethProvider]', event, params)
      const wireEvent = { event, params }
      const dataStr = JSON.stringify(wireEvent)
      return ref.current.injectJavaScript(`
        console.debug('[webview:emit:ethProvider]', ${dataStr});
        document.dispatchEvent(new MessageEvent('FarcasterFrameEthProviderEvent', { data: ${dataStr} }));
      `)
    },
  }
}

/**
 * Standard MessageEvent is unavailable in React Native since it's part of HTML Standard.
 * Instead, implement our own MessageEvent with the minimum properties required by Comlink implementation.
 */
class MessageEvent {
  public origin = 'ReactNativeWebView'
  constructor(public data: unknown) {}
}
