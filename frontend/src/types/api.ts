/** Shape of every error the backend sends */
export interface ApiErrorBody {
  code: string;
  message: string;
}

/** Wrapper returned by the backend on failure */
export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

/** Generic success wrapper */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/** Thrown by the axios response interceptor on HTTP errors */
export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}
