import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { categoryApi, productApi } from '../../api'
import { StoreProductCard } from '../../components/product/StoreProductCard'
import { mockCategories, mockProducts } from '../../data/mockStore'
import type { CategoryResponse, ProductResponse } from '../../types'

export function HomePage() {
  const [categories, setCategories] = useState<CategoryResponse[]>(mockCategories)
  const [products, setProducts] = useState<ProductResponse[]>(mockProducts)

  useEffect(() => {
    let isMounted = true

    async function loadHomeData() {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          categoryApi.getCategories(),
          productApi.getProducts(),
        ])

        if (isMounted) {
          setCategories(categoryResponse)
          setProducts(productResponse)
        }
      } catch {
        if (isMounted) {
          setCategories(mockCategories)
          setProducts(mockProducts)
        }
      }
    }

    void loadHomeData()

    return () => {
      isMounted = false
    }
  }, [])

  return (
      <>
        <section
            className="home-hero"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url('/hero-bg.jpeg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white',
              padding: '120px 20px',
              borderRadius: '16px',
              margin: '20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '500px'
            }}
        >
          <div className="home-hero-copy" style={{ maxWidth: '800px' }}>
            <p className="eyebrow" style={{ color: '#FFD700', fontWeight: 'bold', marginBottom: '10px' }}>
              MavaziHub Storefront
            </p>
            <h1 style={{ color: 'white', fontSize: '3.5rem', lineHeight: '1.2', marginBottom: '20px' }}>
              Afrikanische Prints, moderne Kleidung und kuratierte Accessoires.
            </h1>
            <p style={{ color: '#f0f0f0', fontSize: '1.25rem', marginBottom: '30px' }}>
              Entdecke Stoffe, Headwraps und Looks, die Tradition, Farbe und Alltag
              zusammenbringen.
            </p>
            <div className="home-hero-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <Link to="/products" className="btn-primary" style={{ backgroundColor: 'black', color: 'white', padding: '12px 25px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                Shop entdecken
              </Link>
              <Link to="/products?category=1" className="btn-secondary" style={{ backgroundColor: 'white', color: 'black', padding: '12px 25px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                Stoffe ansehen
              </Link>
            </div>
          </div>

          {/* Le bloc "home-hero-scene" a été supprimé pour laisser place à la photo de fond */}
        </section>

        <section className="category-preview" aria-labelledby="category-preview-title" style={{ padding: '40px 20px' }}>
          <div className="section-heading">
            <h2 id="category-preview-title">Shop nach Kategorie</h2>
            <Link to="/products">Alle Produkte</Link>
          </div>

          <div className="category-preview-grid">
            {categories.map((category) => (
                <Link key={category.id} to={`/products?category=${category.id}`}>
                  <span>{category.name}</span>
                  <small>{category.description}</small>
                </Link>
            ))}
          </div>
        </section>

        <section className="product-section" aria-labelledby="latest-products" style={{ padding: '40px 20px' }}>
          <div className="section-heading">
            <h2 id="latest-products">Ausgewählte Produkte</h2>
            <Link to="/products">Zum Shop</Link>
          </div>

          <div className="store-product-grid store-product-grid-compact">
            {products.slice(0, 4).map((product) => (
                <StoreProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </>
  )
}
