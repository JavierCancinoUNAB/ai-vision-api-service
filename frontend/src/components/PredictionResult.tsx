/**
 * PredictionResult.tsx — Muestra el resultado de la clasificación de imagen.
 */

import { PredictionResponse } from '../api/apiClient'

interface Props {
  result: PredictionResponse
}

export default function PredictionResult({ result }: Props) {
  const confidencePct = (result.confidence * 100).toFixed(1)
  const confidenceNum = result.confidence * 100

  // Color del badge de confianza
  const confidenceColor =
    confidenceNum >= 70
      ? 'text-emerald-400 bg-emerald-950/50 border-emerald-800'
      : confidenceNum >= 40
      ? 'text-yellow-400 bg-yellow-950/50 border-yellow-800'
      : 'text-red-400 bg-red-950/50 border-red-800'

  const formattedDate = result.created_at
    ? new Date(result.created_at).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  return (
    <div className="card space-y-5 animate-fade-in">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-900/50 border border-emerald-700 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-100">Resultado del análisis</h2>
      </div>

      {/* Predicción principal */}
      <div className="bg-slate-800/60 rounded-xl p-5 space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">Objeto detectado</p>
        <p className="text-3xl font-bold text-white capitalize">{result.prediction}</p>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 bg-slate-700 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${Math.min(confidenceNum, 100)}%` }}
            />
          </div>
          <span className={`badge border ${confidenceColor} text-sm font-semibold px-3 py-1`}>
            {confidencePct}%
          </span>
        </div>
      </div>

      {/* Detalles */}
      <div className="grid grid-cols-2 gap-3">
        <InfoCard label="Archivo" value={result.filename} icon="📄" />
        <InfoCard label="Modelo" value={result.model} icon="🤖" />
        <InfoCard label="Fecha" value={formattedDate} icon="🕒" />
        <InfoCard
          label="Guardado en BD"
          value={result.saved ? 'Sí ✓' : 'No'}
          icon="💾"
          valueClass={result.saved ? 'text-emerald-400' : 'text-slate-400'}
        />
      </div>

      {/* Advertencia si no se guardó */}
      {result.warning && (
        <div className="flex items-start gap-3 bg-amber-950/30 border border-amber-800/50 rounded-xl p-4">
          <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <p className="text-amber-300 text-sm">{result.warning}</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------
// Sub-componente de tarjeta de detalle
// ---------------------------------------------------------------
function InfoCard({
  label,
  value,
  icon,
  valueClass = 'text-slate-200',
}: {
  label: string
  value: string
  icon: string
  valueClass?: string
}) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 space-y-1">
      <p className="text-xs text-slate-500 flex items-center gap-1.5">
        <span>{icon}</span>
        {label}
      </p>
      <p className={`text-sm font-medium truncate ${valueClass}`} title={value}>
        {value}
      </p>
    </div>
  )
}
