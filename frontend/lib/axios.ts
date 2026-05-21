import axios from 'axios'

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message
    return Promise.reject(new Error(message))
  }
)
