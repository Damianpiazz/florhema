export interface SuccessResponse<T> {
  success: true
  data: T
}

export interface ErrorResponse {
  success: false
  error: string
}

export function successResponse<T>(data: T): SuccessResponse<T> {
  return { success: true, data }
}

export function errorResponse(error: string): ErrorResponse {
  return { success: false, error }
}
