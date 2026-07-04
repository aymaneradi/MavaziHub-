import { axiosClient } from './axiosClient'
import type { ReturnRequestCreateDTO, ReturnRequestResponseDTO, UUID } from '../types'

export const returnApi = {
  async createReturn(request: ReturnRequestCreateDTO): Promise<ReturnRequestResponseDTO> {
    const { data } = await axiosClient.post<ReturnRequestResponseDTO>('/returns', request)
    return data
  },

  async createReturnForOrder(
    orderId: UUID,
    request: Omit<ReturnRequestCreateDTO, 'orderId'>,
  ): Promise<ReturnRequestResponseDTO> {
    const { data } = await axiosClient.post<ReturnRequestResponseDTO>(
      `/me/orders/${orderId}/returns`,
      request,
    )
    return data
  },

  async getMyReturns(): Promise<ReturnRequestResponseDTO[]> {
    const { data } = await axiosClient.get<ReturnRequestResponseDTO[]>('/returns/my')
    return data
  },

  async getReturn(id: UUID): Promise<ReturnRequestResponseDTO> {
    const { data } = await axiosClient.get<ReturnRequestResponseDTO>(`/returns/${id}`)
    return data
  },
}
