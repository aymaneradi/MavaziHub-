export interface CheckoutRequest {
  customerId: string
  street: string
  zipCode: string
  city: string
}

export interface CheckoutResponse {
  id: string
  status: string
  paymentStatus: string
  totalPrice: number
  orderDate: string
  items: {
    id: string
    productId: string
    productName: string
    unitPrice: number
    quantity: number
  }[]
}
