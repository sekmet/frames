import type { EmitEthProvider, FrameClientEvent } from '@farstack/frame-core'
import type { Endpoint } from './comlink'

export type HostEndpoint = Endpoint & {
  emit: (event: FrameClientEvent) => void
  emitEthProvider: EmitEthProvider
}
