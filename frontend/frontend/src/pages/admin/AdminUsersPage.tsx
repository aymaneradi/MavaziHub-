import { useEffect, useState } from 'react'

import { adminApi } from '../../api'
import type { AdminUserResponse, UserRole } from '../../types'

const roles: UserRole[] = ['ROLE_USER', 'ROLE_EMPLOYEE', 'ROLE_ADMIN']

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([])
  const [roleDrafts, setRoleDrafts] = useState<Record<string, UserRole[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function loadUsers() {
    try {
      const response = await adminApi.getUsers()
      setUsers(response)
      setRoleDrafts(Object.fromEntries(response.map((user) => [user.id, user.roles])))
    } catch {
      setMessage('Nutzer konnten nicht geladen werden.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  function toggleRole(userId: string, role: UserRole) {
    setRoleDrafts((current) => {
      const userRoles = current[userId] ?? []
      const nextRoles = userRoles.includes(role)
        ? userRoles.filter((userRole) => userRole !== role)
        : [...userRoles, role]

      return { ...current, [userId]: nextRoles }
    })
  }

  async function saveRoles(userId: string) {
    setMessage('')

    try {
      const updated = await adminApi.updateUserRoles(userId, { roles: roleDrafts[userId] ?? [] })
      setUsers((current) => current.map((user) => (user.id === userId ? updated : user)))
    } catch {
      setMessage('Rollen konnten nicht gespeichert werden.')
    }
  }

  async function toggleEnabled(user: AdminUserResponse) {
    setMessage('')

    try {
      if (user.enabled) {
        await adminApi.disableUser(user.id)
      } else {
        await adminApi.enableUser(user.id)
      }

      setUsers((current) =>
        current.map((item) => (item.id === user.id ? { ...item, enabled: !item.enabled } : item)),
      )
    } catch {
      setMessage('Nutzerstatus konnte nicht geändert werden.')
    }
  }

  return (
    <section className="admin-workspace">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Adminbereich</p>
          <h1>Nutzerverwaltung</h1>
          <p>Konten aktivieren/deaktivieren und Rollen für Admin oder Mitarbeitende setzen.</p>
        </div>
      </div>

      {message && <p className="admin-message" role="status">{message}</p>}

      <div className="admin-panel">
        {isLoading ? (
          <p className="admin-muted">Nutzer werden geladen.</p>
        ) : users.length === 0 ? (
          <p className="admin-muted">Keine Nutzer vorhanden.</p>
        ) : (
          <div className="admin-list">
            {users.map((user) => (
              <article className="admin-user-row" key={user.id}>
                <div>
                  <strong>
                    {user.firstname} {user.lastname}
                  </strong>
                  <small>{user.email}</small>
                  <span className={user.enabled ? 'admin-badge success' : 'admin-badge'}>
                    {user.enabled ? 'Aktiv' : 'Deaktiviert'}
                  </span>
                </div>

                <div className="admin-role-list">
                  {roles.map((role) => (
                    <label key={role}>
                      <input
                        checked={(roleDrafts[user.id] ?? []).includes(role)}
                        type="checkbox"
                        onChange={() => toggleRole(user.id, role)}
                      />
                      {role.replace('ROLE_', '')}
                    </label>
                  ))}
                </div>

                <div className="admin-actions">
                  <button type="button" onClick={() => saveRoles(user.id)}>
                    Rollen speichern
                  </button>
                  <button type="button" onClick={() => toggleEnabled(user)}>
                    {user.enabled ? 'Deaktivieren' : 'Aktivieren'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
