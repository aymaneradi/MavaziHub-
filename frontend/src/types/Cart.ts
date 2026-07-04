export type Cart = {
  customerId: string
  items: CartItem[]
  totalPrice: number
}

export type CartItem = {
  id: string
  productId: number
  productName: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export type AddCartItemRequest = {
  customerId: string
  productId: number
  productName: string
  unitPrice: number
  quantity: number
}
