import { apiService } from './api.service'

export const authService = {
  login: credentials => apiService.post('/api/auth/login', credentials),
  register: data => apiService.post('/api/auth/register', data),
  logout: () => apiService.post('/api/auth/logout'),
  resetPassword: email => apiService.post('/api/auth/forgot-password', { email }),
  getSession: () => apiService.get('/api/auth/session'),
  getProfile: () => apiService.get('/api/profile'),
  updateProfile: data => apiService.put('/api/profile', data)
}
