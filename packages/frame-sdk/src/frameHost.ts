import type { WireFrameHost } from '@farstack/frame-core'
import { wrap } from 'comlink'
import { endpoint } from './endpoint'

export const frameHost = wrap<WireFrameHost>(endpoint)
