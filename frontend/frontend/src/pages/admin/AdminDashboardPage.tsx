import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import type { UserRole } from '../../types'

const dashboardLinks = [
  {
    to: '/admin/products',
    title: 'Produkte',
    text: 'Produkte anlegen, bearbeiten und veröffentlichen.',
  },
  {
    to: '/admin/categories',
    title: 'Kategorien',
    text: 'Kategorien für den Shop strukturieren.',
  },
  {
    to: '/admin/orders',
    title: 'Bestellungen',
    text: 'Bestellungen prüfen und Status anpassen.',
  },
  {
    to: '/admin/returns',
    title: 'Retouren',
    text: 'Rücksendungen einsehen und bearbeiten.',
  },
  {
    to: '/admin/users',
    title: 'Nutzer',
    text: 'Zugänge und Rollen verwalten.',
    roles: ['ROLE_ADMIN'] satisfies UserRole[],
  },
]

export function AdminDashboardPage() {
  const auth = useAuth()
  const visibleLinks = dashboardLinks.filter((link) => !link.roles || auth.hasAnyRole(link.roles))
  const areaLabel = auth.hasAnyRole(['ROLE_ADMIN']) ? 'Adminbereich' : 'Mitarbeiterbereich'

  return (
    <section className="admin-workspace">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">{areaLabel}</p>
          <h1>Dashboard</h1>
          <p>Alles Wichtige für Shop-Betrieb und Kundenservice an einem Ort.</p>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        {visibleLinks.map((link) => (
          <Link className="admin-dashboard-card" key={link.to} to={link.to}>
            <span>{link.title}</span>
            <p>{link.text}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
