import { NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

function SiteHeader() {
  const { currentUser, isAuthenticated, logout } = useAuth()

  return (
    <header className="site-header">
      <div className="topbar">
        <p>Willkommen bei MavaziHub - afrikanische Mode, Stoffe und Accessoires</p>
        <div className="topbar-actions">
          <span>Suchen</span>
          {isAuthenticated ? (
            <>
              <span>{currentUser?.firstname}</span>
              <button type="button" onClick={logout}>
                Abmelden
              </button>
            </>
          ) : (
            <NavLink to="/login">Anmelden</NavLink>
          )}
          <NavLink to="/cart">Warenkorb</NavLink>
        </div>
      </div>

      <div className="main-header">
        <NavLink className="brand" to="/" aria-label="MavaziHub Startseite">
          <span className="brand-mark">MH</span>
          <span>
            <strong>MavaziHub</strong>
            <small>African Fashion Store</small>
          </span>
        </NavLink>

        <nav className="nav-links" aria-label="Hauptnavigation">
          <NavLink to="/">Start</NavLink>
          <NavLink to="/products">Stoffe</NavLink>
          <NavLink to="/products">Kleidung</NavLink>
          <NavLink to="/products">Accessoires</NavLink>
          <NavLink to="/products">Specials</NavLink>
          <NavLink to="/orders">Bestellungen</NavLink>
          <NavLink to="/returns">Ruecksendungen</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default SiteHeader
