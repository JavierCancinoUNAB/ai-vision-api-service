/**
 * PredictionHistory.tsx — Muestra el historial de predicciones guardadas en Supabase.
 */

import { useState, useEffect, useCallback } from 'react'
import { getHistory, HistoryItem } from '../api/apiClient'

export default function PredictionHistory() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [supabaseAvailable, setSupabaseAvailable] = useState(false)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getHistory()
      setItems(data.items)
      setSupabaseAvailable(data.supabase_available)
      setMessage(data.message ?? null)
    } catch (err: unknown) {
      const axiosErr = err as { message?: string }
      if (axiosErr?.message?.includes('Network Error') || axiosErr?.message?.includes('timeout')) {
        setError('No se pudo conectar con el backend para cargar el historial.')
      } else {
        setError('Error al cargar el historial.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  function formatDate(dateStr?: string): string {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function confidenceBadgeClass(confidence: number): string {
    const pct = confidence * 100
    if (pct >= 70) return 'bg-emerald-900/50 text-emerald-400 border border-emerald-700'
    if (pct >= 40) return 'bg-yellow-900/50 text-yellow-400 border border-yellow-700'
    return 'bg-red-900/50 text-red-400 border border-red-700'
  }

  return (
    <div className="card space-y-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900/50 border border-blue-700 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-100">Historial de predicciones</h2>
        </div>
        <button
          onClick={loadHistory}
          disabled={loading}
          className="text-slate-400 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
          aria-label="Recargar historial"
          title="Recargar"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Cargando historial...</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-start gap-3 bg-red-950/40 border border-red-800 rounded-xl p-4">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Supabase no configurado */}
      {!loading && !error && !supabaseAvailable && (
        <div className="flex items-start gap-3 bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <div>
            <p className="text-slate-300 text-sm font-medium">Historial no disponible</p>
            <p className="text-slate-500 text-sm mt-1">
              {message ?? 'Configura Supabase en el backend para persistir y ver el historial.'}
            </p>
          </div>
        </div>
      )}

      {/* Sin registros */}
      {!loading && !error && supabaseAvailable && items.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909" />
          </svg>
          <p className="text-sm">Sin predicciones aún. Sube una imagen para empezar.</p>
        </div>
      )}

      {/* Tabla de historial */}
      {!loading && !error && items.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Archivo</th>
                <th className="text-left px-4 py-3">Predicción</th>
                <th className="text-right px-4 py-3">Confianza</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Modelo</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id ?? idx}
                  className="border-t border-slate-800 hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-slate-300 truncate max-w-[140px] block" title={item.filename}>
                      {item.filename}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white font-medium capitalize">{item.prediction}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`badge rounded-full px-2.5 py-1 text-xs ${confidenceBadgeClass(item.confidence)}`}>
                      {(item.confidence * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-slate-400">{item.model_used}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-slate-500">{formatDate(item.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
