import axios, { AxiosRequestConfig } from 'axios'

/**
 * Use fallback baseURL for local development
 */
const config: AxiosRequestConfig = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',
}

export const http = axios.create(config)
