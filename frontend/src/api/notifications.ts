import api from './axios'
import type { ApiResponse, NotificationDto } from '../types'

export const getNotifications = async (): Promise<NotificationDto[]> => {
  const { data } = await api.get<ApiResponse<NotificationDto[]>>('/notifications')
  return data.data
}

export const getUnreadCount = async (): Promise<number> => {
  const { data } = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count')
  return data.data.count
}

export const markAllRead = async (): Promise<void> => {
  await api.patch('/notifications/mark-all-read')
}

export const markRead = async (id: number): Promise<void> => {
  await api.patch(`/notifications/${id}/read`)
}
