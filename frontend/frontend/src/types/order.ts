import type { ISODateTimeString, UUID } from './common'

export type OrderRequest = {
  street: string
  zipCode: string
  city: string
}

export type OrderResponse = {
  id: UUID
  status: string
  paymentStatus: string
  totalPrice: number
  orderDate: ISODateTimeString
  items: OrderResponseItem[]
}

export type Order = OrderResponse

export type OrderResponseItem = {
  id: UUID
  productId: number
  variantId?: number
  productName: string
  unitPrice: number
  quantity: number
}

export type OrderSummaryResponse = {
  id: UUID
  status: string
  paymentStatus: string
  totalPrice: number
  orderDate: ISODateTimeString
}

export type OrderDetailResponse = OrderSummaryResponse & {
  street: string
  zipCode: string
  city: string
  items: OrderItemResponse[]
}

export type OrderItemResponse = {
  id: UUID
  productId: number
  variantId?: number
  productName: string
  unitPrice: number
  quantity: number
  returnableQuantity: number
}
