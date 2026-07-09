import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-highlights">
        <span>Versandkostenfrei ab 75 €</span>
        <span>30 Tage Rückgabe</span>
        <span>Sichere Zahlung</span>
        <span>Support per E-Mail</span>
      </div>

      <div className="footer-columns">
        <div>
          <strong>MavaziHub</strong>
          <p>Afrikanische Stoffe, Kleidung und Accessoires für Alltag, Anlass und individuelle Designs.</p>
        </div>

        <nav aria-label="Footer Shop">
          <strong>Shop</strong>
          <Link to="/products?search=Stoffe">Stoffe</Link>
          <Link to="/products?search=Kleidung">Kleidung</Link>
          <Link to="/products?search=Accessoires">Accessoires</Link>
          <Link to="/products">Alle Produkte</Link>
        </nav>

        <nav aria-label="Footer Service">
          <strong>Service</strong>
          <Link to="/orders">Bestellungen</Link>
          <Link to="/returns">Rücksendungen</Link>
          <Link to="/cart">Warenkorb</Link>
          <Link to="/profile">Mein Account</Link>
        </nav>

        <div className="footer-newsletter">
          <strong>Newsletter</strong>
          <p>Neue Stoffe, Angebote und Kollektionen direkt in dein Postfach.</p>
          <form>
            <input aria-label="E-Mail für Newsletter" placeholder="E-Mail-Adresse" type="email" />
            <button type="button">Abonnieren</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 MavaziHub</span>
        <span>Deutschland</span>
      </div>
    </footer>
  )
}
