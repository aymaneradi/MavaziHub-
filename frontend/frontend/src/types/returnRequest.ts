import type { ISODateTimeString, UUID } from './common'

export type ReturnItemRequest = {
  orderItemId: UUID
  quantity: number
}

export type ReturnRequestCreateDTO = {
  orderId: UUID
  reason?: string
  items: ReturnItemRequest[]
}

export type ReturnItemResponse = {
  orderItemId: UUID
  quantity: number
}

export type ReturnRequest = {
  id: UUID
  orderId: UUID
  reason: string
  status: string
  createdAt: ISODateTimeString
  items: ReturnItemResponse[]
}

export type ReturnRequestResponseDTO = ReturnRequest
