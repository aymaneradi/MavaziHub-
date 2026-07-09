import type {
  CategoryResponse,
  ProductDetailResponse,
  ProductResponse,
  ProductVariantResponse,
} from '../types'

export type StoreProduct = ProductResponse & {
  description: string
  material: string
  palette: 'sunset' | 'gold' | 'indigo' | 'leaf' | 'rose' | 'night'
  tag: string
}

export const mockCategories: CategoryResponse[] = [
  { id: 1, name: 'Stoffe', description: 'Wax Prints, Kente und Baumwollstoffe' },
  { id: 2, name: 'Kleidung', description: 'Kleider, Hemden und moderne Alltagslooks' },
  { id: 3, name: 'Accessoires', description: 'Taschen, Schmuck und kleine Akzente' },
  { id: 4, name: 'Kopftücher', description: 'Headwraps und Tücher in kräftigen Prints' },
  { id: 5, name: 'Specials', description: 'Limitierte Editionen und Geschenkideen' },
]

export const mockProducts: StoreProduct[] = [
  {
    id: 1,
    name: 'Ankara Wax Print - Orange Rosette',
    description:
      'Leuchtender Baumwollstoff mit floraler Ankara-Struktur fuer Kleider, Roecke und kreative Naehprojekte.',
    price: 6.15,
    imageUrl: '',
    stockQuantity: 42,
    categoryId: 1,
    categoryName: 'Stoffe',
    active: true,
    material: '100% Baumwolle',
    palette: 'sunset',
    tag: 'Neu',
  },
  {
    id: 2,
    name: 'Kente Print - Gold Disc',
    description:
      'Goldene Kente-inspirierte Musterung fuer festliche Outfits und starke Akzentteile.',
    price: 6.15,
    imageUrl: '',
    stockQuantity: 35,
    categoryId: 1,
    categoryName: 'Stoffe',
    active: true,
    material: 'Baumwolle, weich fallend',
    palette: 'gold',
    tag: 'Bestseller',
  },
  {
    id: 3,
    name: 'Bogolan Shield Shirt',
    description:
      'Modernes Hemd mit grafischem Bogolan-Motiv, klarer Silhouette und angenehmem Tragegefuehl.',
    price: 49.9,
    imageUrl: '',
    stockQuantity: 18,
    categoryId: 2,
    categoryName: 'Kleidung',
    active: true,
    material: 'Baumwollmix',
    palette: 'indigo',
    tag: 'Limited',
  },
  {
    id: 4,
    name: 'Fan Leaf Headwrap',
    description:
      'Grosses Kopftuch mit warmem Leaf-Print, vielseitig bindbar und passend zu Alltag und Event.',
    price: 24.9,
    imageUrl: '',
    stockQuantity: 27,
    categoryId: 4,
    categoryName: 'Kopftücher',
    active: true,
    material: 'Baumwolle',
    palette: 'leaf',
    tag: 'Handpicked',
  },
  {
    id: 5,
    name: 'Mavazi Bead Clutch',
    description:
      'Kompakte Clutch mit Perlenstruktur fuer Abendlooks, Hochzeiten und besondere Anlaesse.',
    price: 39.9,
    imageUrl: '',
    stockQuantity: 13,
    categoryId: 3,
    categoryName: 'Accessoires',
    active: true,
    material: 'Textil und Perlen',
    palette: 'rose',
    tag: 'Event',
  },
  {
    id: 6,
    name: 'Heritage Gift Set',
    description:
      'Kombination aus kleinem Stoffzuschnitt, Headwrap und Accessoire als kuratiertes Geschenkset.',
    price: 59.9,
    imageUrl: '',
    stockQuantity: 9,
    categoryId: 5,
    categoryName: 'Specials',
    active: true,
    material: 'Kuratiertes Set',
    palette: 'night',
    tag: 'Special',
  },
]

export const mockVariants: ProductVariantResponse[] = [
  { id: 1, productId: 1, pattern: 'Orange Rosette', stockQuantity: 18, active: true, variantLabel: '6 Yard' },
  { id: 2, productId: 1, pattern: 'Orange Rosette', stockQuantity: 24, active: true, variantLabel: '12 Yard' },
  { id: 3, productId: 3, size: 'M', color: 'Indigo', stockQuantity: 7, active: true, variantLabel: 'M / Indigo' },
  { id: 4, productId: 3, size: 'L', color: 'Indigo', stockQuantity: 11, active: true, variantLabel: 'L / Indigo' },
  { id: 5, productId: 4, color: 'Burnt Orange', stockQuantity: 27, active: true, variantLabel: 'One Size' },
]

export const toProductDetail = (product: StoreProduct): ProductDetailResponse => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  imageUrl: product.imageUrl,
  imageUrls: product.imageUrl ? [product.imageUrl] : [],
  stockQuantity: product.stockQuantity,
  categoryId: product.categoryId,
  categoryName: product.categoryName,
  active: product.active,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})
