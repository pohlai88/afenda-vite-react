/**
 * Demo users list + create form (pack layout); typed RPC + `WebUser` from `@/api-client`.
 * @module features/users/users.view
 * @package @afenda/web
 */
import type { WebUser } from "@/api-client"
import { useEffect, useState } from "react"

import { createUser, fetchUsers } from "./users.api"

export function UsersView() {
  const [users, setUsers] = useState<WebUser[]>([])
  const [email, setEmail] = useState("jane@example.com")
  const [name, setName] = useState("Jane Doe")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchUsers()
      setUsers(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    setLoading(true)
    setError(null)
    try {
      await createUser({ email, name })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.")
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <section style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h2>Users</h2>
      <p>Typed Vite frontend consuming shared contract packages.</p>

      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={loading}
        >
          Create user
        </button>
      </div>

      {loading ? <p>Loading…</p> : null}
      {error ? <p>{error}</p> : null}

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong> — {user.email}
          </li>
        ))}
      </ul>
    </section>
  )
}
