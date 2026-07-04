import ProductCard, { type ProductCardProduct } from './ProductCard'

const featuredProducts: ProductCardProduct[] = [
  {
    id: 1,
    name: 'Ankara Wax Print - Orange Rosette',
    priceLabel: 'ab 6,15 EUR',
    palette: 'sunset',
    isNew: true,
  },
  {
    id: 2,
    name: 'Kente Print - Gold Disc',
    priceLabel: 'ab 6,15 EUR',
    palette: 'gold',
    isNew: true,
  },
  {
    id: 3,
    name: 'Bogolan Shield - Blue Orange',
    priceLabel: 'ab 6,15 EUR',
    palette: 'indigo',
    isNew: false,
  },
  {
    id: 4,
    name: 'Fan Leaf Print - Burnt Orange',
    priceLabel: 'ab 6,15 EUR',
    palette: 'leaf',
    isNew: true,
  },
]

type ProductSectionProps = {
  title?: string
  products?: ProductCardProduct[]
}

function ProductSection({ title = 'Neueste afrikanische Stoffe', products = featuredProducts }: ProductSectionProps) {
  return (
    <section className="product-section" aria-labelledby="latest-products">
      <div className="section-heading">
        <h2 id="latest-products">{title}</h2>
        <a href="#">Alle Produkte anzeigen</a>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default ProductSection
