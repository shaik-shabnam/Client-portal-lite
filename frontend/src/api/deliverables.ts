import api from './axios'
import type { ApiResponse, DeliverableDto } from '../types'

export const getDeliverables = async (projectId: number): Promise<DeliverableDto[]> => {
  const { data } = await api.get<ApiResponse<DeliverableDto[]>>(`/deliverables/project/${projectId}`)
  return data.data
}

export const getDeliverable = async (id: number): Promise<DeliverableDto> => {
  const { data } = await api.get<ApiResponse<DeliverableDto>>(`/deliverables/${id}`)
  return data.data
}

export const uploadDeliverable = async (
  projectId: number,
  formData: FormData,
): Promise<DeliverableDto> => {
  const { data } = await api.post<ApiResponse<DeliverableDto>>(
    `/deliverables/project/${projectId}/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data.data
}

export const addDeliverableLink = async (
  projectId: number,
  payload: { title: string; fileUrl: string; category: string; versionTag: string },
): Promise<DeliverableDto> => {
  const { data } = await api.post<ApiResponse<DeliverableDto>>(
    `/deliverables/project/${projectId}/link`,
    payload,
  )
  return data.data
}

export const approveDeliverable = async (id: number): Promise<DeliverableDto> => {
  const { data } = await api.patch<ApiResponse<DeliverableDto>>(`/deliverables/${id}/approve`)
  return data.data
}

export const requestRevision = async (id: number, feedback: string): Promise<DeliverableDto> => {
  const { data } = await api.patch<ApiResponse<DeliverableDto>>(`/deliverables/${id}/request-revision`, {
    feedback,
  })
  return data.data
}

export const deleteDeliverable = async (id: number): Promise<void> => {
  await api.delete(`/deliverables/${id}`)
}
