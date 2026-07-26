import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { categoryApi, productApi } from '../../api'
import { StoreProductCard } from '../../components/product/StoreProductCard'
import { mockCategories, mockProducts, type StoreProduct } from '../../data/mockStore'
import type { CategoryResponse, ProductResponse } from '../../types'

const allCategory = { id: 0, name: 'Alle', description: 'Alle Produkte' }

function isStoreProduct(product: ProductResponse | StoreProduct): product is StoreProduct {
  return 'material' in product
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Array<ProductResponse | StoreProduct>>(mockProducts)
  const [categories, setCategories] = useState<CategoryResponse[]>(mockCategories)
  const [isFallback, setIsFallback] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const search = searchParams.get('search') ?? ''
  const categoryParam = Number(searchParams.get('category') ?? 0)
  const selectedCategoryId = Number.isFinite(categoryParam) ? categoryParam : 0

  function updateFilters(categoryId: number, searchValue: string) {
    const nextParams = new URLSearchParams()

    if (categoryId > 0) {
      nextParams.set('category', String(categoryId))
    }

    if (searchValue.trim()) {
      nextParams.set('search', searchValue.trim())
    }

    setSearchParams(nextParams, { replace: true })
  }

  useEffect(() => {
    let isMounted = true

    async function loadProducts() {
      setIsLoading(true)

      try {
        const [categoryResponse, productResponse] = await Promise.all([
          categoryApi.getCategories(),
          productApi.getProducts(),
        ])

        if (!isMounted) {
          return
        }

        setCategories(categoryResponse)
        setProducts(productResponse)
        setIsFallback(false)
      } catch {
        if (!isMounted) {
          return
        }

        setCategories(mockCategories)
        setProducts(mockProducts)
        setIsFallback(true)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesCategory = selectedCategoryId === 0 || product.categoryId === selectedCategoryId
      const material = isStoreProduct(product) ? product.material : ''
      const description = isStoreProduct(product) ? product.description : ''
      const matchesSearch =
          normalizedSearch.length === 0 ||
          [product.name, product.categoryName, material, description]
              .join(' ')
              .toLowerCase()
              .includes(normalizedSearch)

      return matchesCategory && matchesSearch
    })
  }, [products, search, selectedCategoryId])

  return (
      <>
        <section
            className="storefront-hero"
            style={{

              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/hero-bg.jpeg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white',
              padding: '80px 20px',
              borderRadius: '12px',
              margin: '20px'
            }}
        >
          <div>
            <p className="eyebrow" style={{ color: '#FFD700' }}>Kollektion</p>
            <h1 style={{ color: 'white' }}>Afrikanische Stoffe, Mode und Accessoires für moderne Looks.</h1>
            <p style={{ color: '#f0f0f0' }}>
              Kuratierte Prints, klare Kategorien und Produkte, die sich schnell finden lassen.
            </p>
          </div>

        </section>

        <section className="category-band" aria-label="Kategorien">
          {[allCategory, ...categories].map((category) => (
              <button
                  key={category.id}
                  className={selectedCategoryId === category.id ? 'active' : undefined}
                  type="button"
                  onClick={() => updateFilters(category.id, search)}
              >
                {category.name}
              </button>
          ))}
        </section>

        <section className="store-toolbar" aria-label="Produkte filtern">
          <label>
            <span>Suche</span>
            <input
                type="search"
                placeholder="Ankara, Kente, Tasche..."
                value={search}
                onChange={(event) => updateFilters(selectedCategoryId, event.target.value)}
            />
          </label>
          <p>
            {isLoading
                ? 'Produkte werden geladen'
                : `${visibleProducts.length} Produkte gefunden`}
          </p>
        </section>

        {isLoading ? (
          <section className="store-product-grid" aria-label="Produkte werden geladen">
            {Array.from({ length: 8 }, (_, index) => (
              <article className="store-product-card product-card-skeleton" key={index} aria-hidden="true">
                <span className="skeleton-box product-card-skeleton-image" />
                <span className="skeleton-line wide" />
                <span className="skeleton-line" />
                <span className="skeleton-line short" />
              </article>
            ))}
          </section>
        ) : (
          <section className="store-product-grid" aria-label="Produktübersicht">
            {visibleProducts.map((product) => (
                <StoreProductCard key={product.id} product={product} />
            ))}
          </section>
        )}

        {!isLoading && visibleProducts.length === 0 && (
            <section className="empty-store-state">
              <h2>Keine Produkte gefunden</h2>
              <p>Bitte ändere Suche oder Kategorie.</p>
            </section>
        )}
      </>
  )
}
