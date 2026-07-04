import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import type { UserRole } from '../../types'

const dashboardLinks = [
  {
    to: '/admin/products',
    title: 'Produkte',
    text: 'Produktliste, Veröffentlichung und Bearbeitung.',
  },
  {
    to: '/admin/categories',
    title: 'Kategorien',
    text: 'Katalogstruktur für Shop und Produktformular.',
  },
  {
    to: '/admin/orders',
    title: 'Bestellungen',
    text: 'Bestellstatus prüfen und aktualisieren.',
  },
  {
    to: '/admin/returns',
    title: 'Retouren',
    text: 'Rücksendeanfragen bearbeiten.',
  },
  {
    to: '/admin/users',
    title: 'Nutzer',
    text: 'Rollen und Aktivstatus verwalten.',
    roles: ['ROLE_ADMIN'] satisfies UserRole[],
  },
]

export function AdminDashboardPage() {
  const auth = useAuth()
  const visibleLinks = dashboardLinks.filter((link) => !link.roles || auth.hasAnyRole(link.roles))

  return (
    <section className="admin-workspace">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Adminbereich</p>
          <h1>Dashboard</h1>
          <p>Getrennter Verwaltungsbereich für Katalog, Bestellungen, Retouren und Nutzer.</p>
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
