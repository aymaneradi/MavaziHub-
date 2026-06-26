import { Link } from 'react-router-dom'
import type { Product } from '../../types/Product'

type ProductCardProps = {
  product: Product
}

const priceFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.imageUrl || '/placeholder-product.svg'

  return (
    <article className="mh-product-card">
      <Link to={`/products/${product.id}`} className="mh-product-card-image-link">
        <img
          className="mh-product-card-image"
          src={imageUrl}
          alt={product.name}
        />
      </Link>

      <div className="mh-product-card-body">
        {product.categoryName && (
          <span className="mh-badge">{product.categoryName}</span>
        )}

        <h2 className="mh-product-card-title">{product.name}</h2>

        {product.description && (
          <p className="mh-product-card-description">{product.description}</p>
        )}

        <div className="mh-product-card-footer">
          <strong className="mh-price">
            {priceFormatter.format(product.price)}
          </strong>

          <Link to={`/products/${product.id}`} className="mh-button-primary">
            Zum Produkt
          </Link>
        </div>
      </div>
    </article>
  )
}

export default ProductCard