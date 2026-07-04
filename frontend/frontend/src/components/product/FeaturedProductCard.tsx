import type { FeaturedProduct } from '../../types/product'

type FeaturedProductCardProps = {
  product: FeaturedProduct
}

export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  return (
    <article className="product-card">
      <div className={`product-image product-image-${product.palette}`}>
        {product.isNew && <span className="badge-new">Neu</span>}
      </div>
      <h3>{product.name}</h3>
      <p>{product.material}</p>
      <strong>{product.price}</strong>
    </article>
  )
}
