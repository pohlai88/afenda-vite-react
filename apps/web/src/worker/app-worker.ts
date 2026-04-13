/// <reference lib="webworker" />

import type { MainToWorkerMessage, WorkerToMainMessage } from "./types"

const ctx = self as unknown as DedicatedWorkerGlobalScope

function reply(message: WorkerToMainMessage): void {
  ctx.postMessage(message)
}

ctx.addEventListener("message", (event: MessageEvent<MainToWorkerMessage>) => {
  const data = event.data
  switch (data.type) {
    case "ping":
      reply({ type: "pong" })
      return
    case "echo":
      reply({
        type: "echo",
        id: data.id,
        payload: data.payload,
      })
      return
    default: {
      const _exhaustive: never = data
      return _exhaustive
    }
  }
})

reply({ type: "ready" })
