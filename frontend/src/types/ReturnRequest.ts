export type ReturnRequestSummary = {
  id: string
  returnNumber?: string | null
  orderId?: string | null
  orderNumber?: string | null
  status?: string | null
  reason?: string | null
  createdAt?: string | null
  processedAt?: string | null
  itemCount?: number | null
}

export type ReturnRequestDetail = ReturnRequestSummary & {
  items?: ReturnRequestItem[]
  staffComment?: string | null
}

export type ReturnRequestItem = {
  id?: string
  orderItemId: string
  quantity: number
}

export type ReturnableOrderItem = {
  orderItemId: string
  productId?: string | null
  productName?: string | null
  orderedQuantity?: number | null
  alreadyReturnedQuantity?: number | null
  returnableQuantity: number
  unitPrice?: number | null
}

export type CreateReturnRequest = {
  reason: string
  items: CreateReturnRequestItem[]
}

export type CreateReturnRequestItem = {
  orderItemId: string
  quantity: number
}
