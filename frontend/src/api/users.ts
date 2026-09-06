import api from './axios'
import type { ApiResponse, UserDto } from '../types'

export const getMe = async (): Promise<UserDto> => {
  const { data } = await api.get<ApiResponse<UserDto>>('/users/me')
  return data.data
}

export const getClients = async (): Promise<UserDto[]> => {
  const { data } = await api.get<ApiResponse<UserDto[]>>('/users/clients')
  return data.data
}

export const getAllUsers = async (): Promise<UserDto[]> => {
  const { data } = await api.get<ApiResponse<UserDto[]>>('/users')
  return data.data
}

export interface ClientOverviewDto {
  client: import('../types').UserDto
  projects: import('../types').ProjectDto[]
  totalProjects: number
  completedProjects: number
  inProgressProjects: number
  pendingDeliverables: number
}

export const getClientsOverview = async (): Promise<ClientOverviewDto[]> => {
  const { data } = await api.get<import('../types').ApiResponse<ClientOverviewDto[]>>('/admin/clients-overview')
  return data.data
}

export const getAllProjectsAdmin = async (): Promise<import('../types').ProjectDto[]> => {
  const { data } = await api.get<import('../types').ApiResponse<import('../types').ProjectDto[]>>('/admin/all-projects')
  return data.data
}
