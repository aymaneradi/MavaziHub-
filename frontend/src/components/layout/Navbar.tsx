import { NavLink } from 'react-router-dom'

const shopLinks = [
  { label: 'Produkte', path: '/products' },
  { label: 'Warenkorb', path: '/cart' },
  { label: 'Bestellungen', path: '/orders' },
  { label: 'Rücksendungen', path: '/returns' },
]

const adminLinks = [
  { label: 'Admin Produkte', path: '/admin/products' },
  { label: 'Admin Returns', path: '/admin/returns' },
]

function Navbar() {
  return (
    <header className="mh-navbar">
      <NavLink to="/products" className="mh-navbar-brand">
        <span className="mh-navbar-logo">MH</span>
        <span>MavaziHub</span>
      </NavLink>

      <nav className="mh-navbar-links" aria-label="Shop Navigation">
        {shopLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              isActive ? 'mh-nav-link mh-nav-link-active' : 'mh-nav-link'
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <nav className="mh-navbar-links mh-navbar-admin" aria-label="Admin Navigation">
        {adminLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              isActive ? 'mh-nav-link mh-nav-link-active' : 'mh-nav-link'
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="mh-navbar-actions">
        <NavLink to="/login" className="mh-button-secondary">
          Login
        </NavLink>
        <NavLink to="/register" className="mh-button-primary">
          Registrieren
        </NavLink>
      </div>
    </header>
  )
}

export default Navbar