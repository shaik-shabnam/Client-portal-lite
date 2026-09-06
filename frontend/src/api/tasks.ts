import api from './axios'
import type { ApiResponse, TaskDto, TaskRequest, TaskStatus } from '../types'

export const getTasksByProject = async (projectId: number): Promise<TaskDto[]> => {
  const { data } = await api.get<ApiResponse<TaskDto[]>>(`/tasks/project/${projectId}`)
  return data.data
}

export const getTask = async (id: number): Promise<TaskDto> => {
  const { data } = await api.get<ApiResponse<TaskDto>>(`/tasks/${id}`)
  return data.data
}

export const createTask = async (payload: TaskRequest): Promise<TaskDto> => {
  const { data } = await api.post<ApiResponse<TaskDto>>('/tasks', payload)
  return data.data
}

export const updateTask = async (id: number, payload: TaskRequest): Promise<TaskDto> => {
  const { data } = await api.put<ApiResponse<TaskDto>>(`/tasks/${id}`, payload)
  return data.data
}

export const updateTaskStatus = async (id: number, status: TaskStatus): Promise<TaskDto> => {
  const { data } = await api.patch<ApiResponse<TaskDto>>(`/tasks/${id}/status`, { status })
  return data.data
}

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`)
}
