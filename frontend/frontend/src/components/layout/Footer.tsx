import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>MavaziHub</strong>
        <p>Moderne Storefront für afrikanische Stoffe, Kleidung und Accessoires.</p>
      </div>
      <nav aria-label="Footer Navigation">
        <Link to="/products">Produkte</Link>
        <Link to="/cart">Warenkorb</Link>
        <Link to="/orders">Bestellungen</Link>
        <Link to="/returns">Rücksendungen</Link>
      </nav>
    </footer>
  )
}
