import { Link } from 'react-router-dom'

import { StoreProductCard } from '../../components/product/StoreProductCard'
import { mockCategories, mockProducts } from '../../data/mockStore'

export function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">MavaziHub Storefront</p>
          <h1>Afrikanische Prints, moderne Kleidung und kuratierte Accessoires.</h1>
          <p>
            Entdecke Stoffe, Headwraps und Looks, die Tradition, Farbe und Alltag
            zusammenbringen.
          </p>
          <div className="home-hero-actions">
            <Link to="/products">Shop entdecken</Link>
            <Link to="/products?category=1">Stoffe ansehen</Link>
          </div>
        </div>

        <div className="home-hero-scene" aria-hidden="true">
          <div className="hero-textile hero-textile-large" />
          <div className="hero-look" />
          <div className="hero-textile hero-textile-small" />
        </div>
      </section>

      <section className="category-preview" aria-labelledby="category-preview-title">
        <div className="section-heading">
          <h2 id="category-preview-title">Shop nach Kategorie</h2>
          <Link to="/products">Alle Produkte</Link>
        </div>

        <div className="category-preview-grid">
          {mockCategories.map((category) => (
            <Link key={category.id} to={`/products?category=${category.id}`}>
              <span>{category.name}</span>
              <small>{category.description}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="product-section" aria-labelledby="latest-products">
        <div className="section-heading">
          <h2 id="latest-products">Ausgewählte Produkte</h2>
          <Link to="/products">Zum Shop</Link>
        </div>

        <div className="store-product-grid store-product-grid-compact">
          {mockProducts.slice(0, 4).map((product) => (
            <StoreProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  )
}
