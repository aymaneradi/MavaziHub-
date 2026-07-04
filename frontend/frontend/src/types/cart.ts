import type { UUID } from './common'

export type CartItemRequest = {
  productId: number
  variantId?: number
  quantity: number
}

export type CartResponse = {
  items: CartItemDto[]
  totalPrice: number
}

export type Cart = CartResponse

export type CartItemDto = {
  id: UUID
  productId: number
  variantId?: number
  productName: string
  unitPrice: number
  quantity: number
  subtotal: number
}
