/**
 * Demo users list + create form (pack layout); typed RPC + `WebUser` from `@/rpc`.
 * @module app/_features/hono/users/users.view
 * @package @afenda/web
 */
import type { WebUser } from "@/rpc"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { createUser, fetchUsers } from "./users.api"

export function UsersView() {
  const { t } = useTranslation("shell")
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
      <h2>{t("demo_users.title")}</h2>
      <p>{t("demo_users.description")}</p>

      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("demo_users.name_placeholder")}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("demo_users.email_placeholder")}
        />
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={loading}
        >
          {t("demo_users.create_user")}
        </button>
      </div>

      {loading ? <p>{t("demo_users.loading")}</p> : null}
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
