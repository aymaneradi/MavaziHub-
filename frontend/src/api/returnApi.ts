import { axiosClient } from './axiosClient'
import type {
  CreateReturnRequest,
  ReturnableOrderItem,
  ReturnRequestDetail,
  ReturnRequestSummary,
} from '../types/ReturnRequest'

export async function getMyReturns(): Promise<ReturnRequestSummary[]> {
  const response = await axiosClient.get<ReturnRequestSummary[]>('/me/returns')
  return response.data
}

export async function getReturnById(returnId: string): Promise<ReturnRequestDetail> {
  const response = await axiosClient.get<ReturnRequestDetail>(`/me/returns/${returnId}`)
  return response.data
}

export async function getReturnableItems(orderId: string): Promise<ReturnableOrderItem[]> {
  const response = await axiosClient.get<
    Array<{
      id: string
      productId?: number | null
      productName?: string | null
      quantity: number
      returnableQuantity: number
      unitPrice?: number | null
    }>
  >(
    `/me/orders/${orderId}/returnable-items`,
  )

  return response.data.map((item) => ({
    orderItemId: item.id,
    productId: item.productId,
    productName: item.productName,
    orderedQuantity: item.quantity,
    returnableQuantity: item.returnableQuantity,
    unitPrice: item.unitPrice,
  }))
}

export async function createReturnRequest(
  orderId: string,
  request: CreateReturnRequest,
): Promise<ReturnRequestDetail> {
  const response = await axiosClient.post<ReturnRequestDetail>(`/me/orders/${orderId}/returns`, request)
  return response.data
}
