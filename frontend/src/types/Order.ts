export interface OrderItem {
  id: string
  productId: string
  productName: string
  unitPrice: number
  quantity: number
}

export interface Order {
  id: string
  status: string
  paymentStatus: string
  totalPrice: number
  orderDate: string
  street?: string
  zipCode?: string
  city?: string
  items: OrderItem[]
}
