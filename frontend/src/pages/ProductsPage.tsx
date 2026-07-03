import { useEffect, useMemo, useState } from 'react'
import { getCategories, getProducts } from '../api/productApi'
import ProductSection from '../components/product/ProductSection'
import type { ProductCardProduct, ProductPalette } from '../components/product/ProductCard'
import type { Category, Product } from '../types/Product'

const productPalettes: ProductPalette[] = ['sunset', 'gold', 'indigo', 'leaf']

function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>()
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrentRequest = true

    async function loadProducts() {
      setIsLoading(true)
      setError(null)

      try {
        const [categoryData, productData] = await Promise.all([
          getCategories(),
          getProducts({ categoryId: selectedCategoryId, search }),
        ])

        if (isCurrentRequest) {
          setCategories(categoryData)
          setProducts(productData)
        }
      } catch {
        if (isCurrentRequest) {
          setError('Produkte konnten nicht geladen werden.')
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isCurrentRequest = false
    }
  }, [selectedCategoryId, search])

  const productCards = useMemo(() => products.map(toProductCard), [products])

  return (
    <section className="page-section">
      <div className="page-heading">
        <p>Shop</p>
        <h1>Produkte entdecken</h1>
        <span>Diese Seite ist jetzt fuer echte Backend-Produktdaten vorbereitet.</span>
      </div>

      <div className="catalog-toolbar" aria-label="Produktfilter">
        <label>
          Suche
          <input
            type="search"
            value={search}
            placeholder="Produkt suchen"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label>
          Kategorie
          <select
            value={selectedCategoryId ?? ''}
            onChange={(event) =>
              setSelectedCategoryId(event.target.value ? Number(event.target.value) : undefined)
            }
          >
            <option value="">Alle Kategorien</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading && <p className="status-message">Produkte werden geladen...</p>}
      {error && <p className="status-message status-message-error">{error}</p>}
      {!isLoading && !error && productCards.length === 0 && (
        <p className="status-message">Keine Produkte gefunden.</p>
      )}
      {!isLoading && !error && productCards.length > 0 && (
        <ProductSection title="Alle Produkte" products={productCards} />
      )}
    </section>
  )
}

function toProductCard(product: Product): ProductCardProduct {
  return {
    id: product.id,
    name: product.name,
    priceLabel: formatPrice(product.price),
    categoryName: product.categoryName,
    imageUrl: product.imageUrl,
    palette: productPalettes[product.id % productPalettes.length],
    isNew: product.stockQuantity > 0,
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

export default ProductsPage
