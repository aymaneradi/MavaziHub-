export type OrderSummary = {
  id: string
  orderNumber?: string | null
  status?: string | null
  paymentStatus?: string | null
  orderDate?: string | null
  createdAt?: string | null
  orderedAt?: string | null
  totalAmount?: number | null
  totalPrice?: number | null
  itemCount?: number | null
}

export type OrderDetail = OrderSummary & {
  items?: OrderItem[]
}

export type OrderItem = {
  id: string
  productId?: string | null
  productName?: string | null
  quantity: number
  unitPrice?: number | null
  totalPrice?: number | null
  returnableQuantity?: number | null
}
