import api from './axios'
import type { ApiResponse, CommentDto } from '../types'

export const getTaskComments = async (taskId: number): Promise<CommentDto[]> => {
  const { data } = await api.get<ApiResponse<CommentDto[]>>(`/comments/task/${taskId}`)
  return data.data
}

export const getDeliverableComments = async (deliverableId: number): Promise<CommentDto[]> => {
  const { data } = await api.get<ApiResponse<CommentDto[]>>(`/comments/deliverable/${deliverableId}`)
  return data.data
}

export const addTaskComment = async (taskId: number, message: string): Promise<CommentDto> => {
  const { data } = await api.post<ApiResponse<CommentDto>>(`/comments/task/${taskId}`, { message })
  return data.data
}

export const addDeliverableComment = async (
  deliverableId: number,
  message: string,
): Promise<CommentDto> => {
  const { data } = await api.post<ApiResponse<CommentDto>>(`/comments/deliverable/${deliverableId}`, {
    message,
  })
  return data.data
}

export const deleteComment = async (id: number): Promise<void> => {
  await api.delete(`/comments/${id}`)
}
