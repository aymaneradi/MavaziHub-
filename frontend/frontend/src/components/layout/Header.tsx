import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'

const shopLinks = [
  { to: '/', label: 'Start' },
  { to: '/products', label: 'Produkte' },
]

const customerLinks = [
  { to: '/orders', label: 'Bestellungen' },
  { to: '/returns', label: 'Rücksendungen' },
]

export function Header() {
  const auth = useAuth()
  const navigate = useNavigate()
  const adminAreaLabel = auth.hasAnyRole(['ROLE_ADMIN']) ? 'Adminbereich' : 'Mitarbeiterbereich'

  async function handleLogout() {
    await auth.logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Zum Inhalt springen
      </a>

      <div className="topbar">
        <p>Willkommen bei MavaziHub - afrikanische Mode, Stoffe und Accessoires</p>
        <div className="topbar-actions" aria-label="Schnellzugriff">
          {auth.isAuthenticated ? (
            <>
              <Link to="/products">Suchen</Link>
              <Link to="/profile">Mein Account</Link>
              <button type="button" onClick={handleLogout}>
                Ausloggen
              </button>
            </>
          ) : (
            <Link to="/login">Anmelden</Link>
          )}
          <Link to="/cart">Warenkorb</Link>
        </div>
      </div>

      <div className="main-header">
        <Link className="brand" to="/" aria-label="MavaziHub Startseite">
          <span className="brand-mark">MH</span>
          <span>
            <strong>MavaziHub</strong>
            <small>African Fashion Store</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Hauptnavigation">
          {shopLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
          {auth.isAuthenticated &&
            customerLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {link.label}
              </NavLink>
            ))}
          {auth.hasAnyRole(['ROLE_ADMIN', 'ROLE_EMPLOYEE']) && <NavLink to="/admin">{adminAreaLabel}</NavLink>}
        </nav>
      </div>
    </header>
  )
}
