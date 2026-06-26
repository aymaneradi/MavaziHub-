import { useEffect, useState } from 'react'
import { getCategories, getProducts } from '../../api/productApi'
import CategoryFilter from '../../components/product/CategoryFilter'
import ProductCard from '../../components/product/ProductCard'
import EmptyState from '../../components/common/EmptyState'
import ErrorMessage from '../../components/common/ErrorMessage'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import type { Category, Product } from '../../types/Product'

function ProductListPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      try {
        const loadedCategories = await getCategories()
        setCategories(loadedCategories)
      } catch {
        setErrorMessage('Die Kategorien konnten nicht geladen werden.')
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const loadedProducts = await getProducts(selectedCategoryId)
        setProducts(loadedProducts)
      } catch {
        setErrorMessage('Die Produkte konnten nicht geladen werden.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [selectedCategoryId])

  return (
    <section className="mh-page">
      <div className="mh-product-header">
        <div>
          <span className="mh-badge">Shop</span>
          <h1 className="mh-section-title">Afrikanische Mode entdecken</h1>
          <p className="mh-text-muted">
            Entdecke Kleidung, Accessoires und Stoffe mit modernen afrikanischen Designs.
          </p>
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
          disabled={isLoading}
        />
      </div>

      {isLoading && <LoadingSpinner text="Produkte werden geladen ..." />}

      {errorMessage && (
        <ErrorMessage
          title="Produkte konnten nicht geladen werden"
          message={errorMessage}
        />
      )}

      {!isLoading && !errorMessage && products.length === 0 && (
        <EmptyState
          title="Keine Produkte gefunden"
          message="Für die gewählte Kategorie wurden keine Produkte gefunden."
        />
      )}

      {!isLoading && !errorMessage && products.length > 0 && (
        <div className="mh-product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}

export default ProductListPage