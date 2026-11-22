import axios, { type AxiosError } from 'axios';
import { ApiError, type ApiErrorResponse } from '../types/api';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Convert every HTTP error into our typed ApiError */
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;

    if (body && !body.success && body.error) {
      return Promise.reject(
        new ApiError(body.error.code, body.error.message, status),
      );
    }

    // Network or non-JSON error
    return Promise.reject(
      new ApiError('NETWORK_ERROR', error.message ?? 'Network error', status),
    );
  },
);

export default client;
