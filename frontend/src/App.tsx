const featuredProducts = [
  {
    id: 1,
    name: 'Ankara Wax Print - Orange Rosette',
    price: 'ab 6,15 EUR',
    palette: 'sunset',
    isNew: true,
  },
  {
    id: 2,
    name: 'Kente Print - Gold Disc',
    price: 'ab 6,15 EUR',
    palette: 'gold',
    isNew: true,
  },
  {
    id: 3,
    name: 'Bogolan Shield - Blue Orange',
    price: 'ab 6,15 EUR',
    palette: 'indigo',
    isNew: false,
  },
  {
    id: 4,
    name: 'Fan Leaf Print - Burnt Orange',
    price: 'ab 6,15 EUR',
    palette: 'leaf',
    isNew: true,
  },
]

function App() {
  return (
    <div className="shop-shell">
      <header className="site-header">
        <div className="topbar">
          <p>Willkommen bei MavaziHub - afrikanische Mode, Stoffe und Accessoires</p>
          <div className="topbar-actions">
            <span>Suchen</span>
            <span>Anmelden</span>
            <span>Warenkorb</span>
          </div>
        </div>

        <div className="main-header">
          <a className="brand" href="#" aria-label="MavaziHub Startseite">
            <span className="brand-mark">MH</span>
            <span>
              <strong>MavaziHub</strong>
              <small>African Fashion Store</small>
            </span>
          </a>

          <nav className="nav-links" aria-label="Hauptnavigation">
            <a href="#">Start</a>
            <a href="#">Stoffe</a>
            <a href="#">Kleidung</a>
            <a href="#">Accessoires</a>
            <a href="#">Specials</a>
            <a href="#">Info</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-visual" aria-hidden="true">
            <div className="fabric-panel fabric-panel-left" />
            <div className="model-card">
              <div className="dress-shape" />
            </div>
            <div className="fabric-panel fabric-panel-right" />
          </div>

          <div className="shipping-strip">
            <span>Kostenloser Versand ab 75 EUR</span>
            <span>Kunden bewerten uns mit 5 Sternen</span>
          </div>
        </section>

        <section className="intro-section">
          <h1>Willkommen bei MavaziHub - afrikanische Stoffe, Kleidung und Accessoires</h1>
          <p>
            Entdecke farbenfrohe Prints, moderne Styles und ausgewaehlte Accessoires fuer
            Alltag, Events und besondere Momente.
          </p>
        </section>

        <section className="product-section" aria-labelledby="latest-products">
          <div className="section-heading">
            <h2 id="latest-products">Neueste afrikanische Stoffe</h2>
            <a href="#">Alle Produkte anzeigen</a>
          </div>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className={`product-image product-image-${product.palette}`}>
                  {product.isNew && <span className="badge-new">Neu</span>}
                </div>
                <h3>{product.name}</h3>
                <p>100% Baumwolle</p>
                <strong>{product.price}</strong>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
