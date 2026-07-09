import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import type { UserRole } from '../../types'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Produkte' },
  { to: '/admin/categories', label: 'Kategorien' },
  { to: '/admin/orders', label: 'Bestellungen' },
  { to: '/admin/returns', label: 'Retouren' },
  { to: '/admin/users', label: 'Nutzer', roles: ['ROLE_ADMIN'] satisfies UserRole[] },
]

export function AdminLayout() {
  const auth = useAuth()
  const visibleLinks = adminLinks.filter((link) => !link.roles || auth.hasAnyRole(link.roles))

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink className="admin-brand" to="/">
          MavaziHub
        </NavLink>
        <p>Arbeitsbereich</p>
        <nav aria-label="Admin Navigation">
          {visibleLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="admin-main" id="main-content">
        <Outlet />
      </main>
    </div>
  )
}
