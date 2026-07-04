export type Variant = {
  id: number
  productId: number
  size?: string
  color?: string
  pattern?: string
  stockQuantity: number
  active: boolean
  variantLabel: string
}

export type ProductVariantResponse = Variant

export type CreateProductVariantRequest = {
  size?: string
  color?: string
  pattern?: string
  stockQuantity: number
}

export type UpdateProductVariantRequest = Omit<CreateProductVariantRequest, 'stockQuantity'>

export type UpdateStockRequest = {
  stockQuantity: number
}
