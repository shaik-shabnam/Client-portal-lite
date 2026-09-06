import api from './axios'
import type { ApiResponse, AuthUser } from '../types'

interface LoginPayload { email: string; password: string }
interface RegisterPayload { fullName: string; email: string; password: string; role?: string }

export const login = async (payload: LoginPayload): Promise<AuthUser> => {
  const { data } = await api.post<ApiResponse<AuthUser>>('/auth/login', payload)
  return data.data
}

export const register = async (payload: RegisterPayload): Promise<AuthUser> => {
  const { data } = await api.post<ApiResponse<AuthUser>>('/auth/register', payload)
  return data.data
}
