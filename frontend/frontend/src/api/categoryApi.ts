import { axiosClient } from './axiosClient'
import type { CategoryResponse } from '../types'

export const categoryApi = {
  async getCategories(): Promise<CategoryResponse[]> {
    const { data } = await axiosClient.get<CategoryResponse[]>('/categories')
    return data
  },
}
