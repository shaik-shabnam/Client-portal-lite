import api from './axios'
import type { ApiResponse, ProjectDto, ProjectRequest, MilestoneDto, ActivityLogDto } from '../types'

export const getProjects = async (): Promise<ProjectDto[]> => {
  const { data } = await api.get<ApiResponse<ProjectDto[]>>('/projects')
  return data.data
}

export const getProject = async (id: number): Promise<ProjectDto> => {
  const { data } = await api.get<ApiResponse<ProjectDto>>(`/projects/${id}`)
  return data.data
}

export const createProject = async (payload: ProjectRequest): Promise<ProjectDto> => {
  const { data } = await api.post<ApiResponse<ProjectDto>>('/projects', payload)
  return data.data
}

export const updateProject = async (id: number, payload: ProjectRequest): Promise<ProjectDto> => {
  const { data } = await api.put<ApiResponse<ProjectDto>>(`/projects/${id}`, payload)
  return data.data
}

export const deleteProject = async (id: number): Promise<void> => {
  await api.delete(`/projects/${id}`)
}

export const getMilestones = async (projectId: number): Promise<MilestoneDto[]> => {
  const { data } = await api.get<ApiResponse<MilestoneDto[]>>(`/projects/${projectId}/milestones`)
  return data.data
}

export const createMilestone = async (
  projectId: number,
  payload: { title: string; targetDate?: string },
): Promise<MilestoneDto> => {
  const { data } = await api.post<ApiResponse<MilestoneDto>>(`/projects/${projectId}/milestones`, payload)
  return data.data
}

export const toggleMilestone = async (milestoneId: number): Promise<MilestoneDto> => {
  const { data } = await api.patch<ApiResponse<MilestoneDto>>(`/projects/milestones/${milestoneId}/toggle`)
  return data.data
}

export const deleteMilestone = async (milestoneId: number): Promise<void> => {
  await api.delete(`/projects/milestones/${milestoneId}`)
}

export const getActivityLogs = async (projectId: number, limit = 50): Promise<ActivityLogDto[]> => {
  const { data } = await api.get<ApiResponse<ActivityLogDto[]>>(
    `/projects/${projectId}/activity?limit=${limit}`,
  )
  return data.data
}
