/**
 * apiClient.ts — Cliente HTTP centralizado con Axios.
 *
 * La URL base se obtiene desde la variable de entorno VITE_API_BASE_URL.
 * En desarrollo apunta a http://localhost:8000.
 * En producción apunta a la URL del backend en Render.
 */

import axios from 'axios'

// ---------------------------------------------------------------
// Tipos de respuesta
// ---------------------------------------------------------------

export interface PredictionResponse {
  filename: string
  prediction: string
  confidence: number
  model: string
  created_at: string
  saved: boolean
  warning?: string
}

export interface HistoryItem {
  id?: number
  filename: string
  prediction: string
  confidence: number
  model_used: string
  image_url?: string
  created_at?: string
}

export interface HistoryResponse {
  items: HistoryItem[]
  total: number
  supabase_available: boolean
  message?: string
}

export interface HealthResponse {
  status: string
  service: string
  environment: string
}

// ---------------------------------------------------------------
// Instancia de Axios
// ---------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 segundos (TF puede tardar en el primer request)
  headers: {
    Accept: 'application/json',
  },
})

// ---------------------------------------------------------------
// Funciones de la API
// ---------------------------------------------------------------

/**
 * Envía una imagen al backend para clasificación.
 */
export async function predictImage(file: File): Promise<PredictionResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<PredictionResponse>('/api/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

/**
 * Obtiene el historial de predicciones guardadas.
 */
export async function getHistory(): Promise<HistoryResponse> {
  const response = await apiClient.get<HistoryResponse>('/api/history')
  return response.data
}

/**
 * Verifica que el backend esté activo.
 */
export async function healthCheck(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>('/api/health')
  return response.data
}
