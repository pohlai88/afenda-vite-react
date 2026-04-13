/**
 * SHELL COMMAND ACTIVITY STORE
 *
 * Central runtime store tracking active shell command executions.
 * This is the single source of truth for command running state.
 */

export interface ShellCommandActivityState {
  running: Set<string>
}

type Listener = () => void

export interface ShellCommandActivityStore {
  getState(): ShellCommandActivityState
  subscribe(listener: Listener): () => void

  start(commandId: string): boolean
  finish(commandId: string): void

  isRunning(commandId: string): boolean
}

export function createShellCommandActivityStore(): ShellCommandActivityStore {
  let state: ShellCommandActivityState = {
    running: new Set(),
  }

  const listeners = new Set<Listener>()

  function emit(): void {
    for (const l of listeners) {
      l()
    }
  }

  return {
    getState() {
      return state
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },

    start(commandId) {
      const id = commandId.trim()

      if (id.length === 0) {
        return false
      }

      if (state.running.has(id)) {
        return false
      }

      state = {
        running: new Set(state.running).add(id),
      }

      emit()
      return true
    },

    finish(commandId) {
      const id = commandId.trim()

      if (id.length === 0) {
        return
      }

      if (!state.running.has(id)) {
        return
      }

      const next = new Set(state.running)
      next.delete(id)

      state = { running: next }

      emit()
    },

    isRunning(commandId) {
      const id = commandId.trim()
      if (id.length === 0) {
        return false
      }
      return state.running.has(id)
    },
  }
}
