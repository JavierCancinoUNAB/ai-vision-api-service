/**
 * App.tsx — Layout principal de la aplicación.
 *
 * Estructura:
 *  - Header con nombre del proyecto y descripción
 *  - Panel de subida + resultado (columnas en desktop)
 *  - Historial de predicciones
 *  - Footer técnico con IaaS / PaaS / SaaS
 */

import { useState } from 'react'
import ImageUploader from './components/ImageUploader'
import PredictionResult from './components/PredictionResult'
import PredictionHistory from './components/PredictionHistory'
import { PredictionResponse } from './api/apiClient'

export default function App() {
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [historyKey, setHistoryKey] = useState(0)

  function handleResult(prediction: PredictionResponse) {
    setResult(prediction)
    // Refrescar historial automáticamente después de una predicción guardada
    if (prediction.saved) {
      setTimeout(() => setHistoryKey((k) => k + 1), 800)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ============================================================
          HEADER
      ============================================================ */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo / ícono */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">AI Vision API</h1>
              <p className="text-xs text-slate-500 leading-none">as a Service</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="badge bg-blue-950/70 text-blue-400 border border-blue-800/50 px-2.5 py-1 text-xs">
              MobileNetV2
            </span>
            <span className="badge bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-1 text-xs">
              ImageNet
            </span>
          </div>
        </div>
      </header>

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Hero / descripción */}
        <section className="text-center space-y-3 pt-2">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Clasificación de imágenes con{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Inteligencia Artificial
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base">
            Sube una imagen y nuestro modelo MobileNetV2 (entrenado con 1.4 millones de imágenes)
            identificará el objeto con un porcentaje de confianza. El resultado se guarda
            automáticamente en la base de datos.
          </p>

          {/* Badges de arquitectura cloud */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <TechBadge color="orange" label="IaaS" desc="AWS EC2" />
            <TechBadge color="purple" label="PaaS" desc="Render + Supabase" />
            <TechBadge color="blue" label="SaaS" desc="Vercel" />
          </div>
        </section>

        {/* Uploader + resultado */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <ImageUploader onResult={handleResult} />

          {result ? (
            <PredictionResult result={result} />
          ) : (
            <div className="card flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Esperando análisis</p>
                <p className="text-slate-600 text-sm mt-1">
                  El resultado de la predicción aparecerá aquí
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Historial */}
        <section>
          <PredictionHistory key={historyKey} />
        </section>
      </main>

      {/* ============================================================
          FOOTER
      ============================================================ */}
      <footer className="border-t border-slate-800 bg-slate-950 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Tabla de modelos cloud */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <CloudModelCard
              icon="🖥️"
              type="IaaS"
              name="AWS EC2"
              detail="Ubuntu Server 22.04 LTS"
              description="Infraestructura virtual administrada. Nginx reverse proxy y ambiente de pruebas."
              color="orange"
            />
            <CloudModelCard
              icon="⚙️"
              type="PaaS"
              name="Render + Supabase"
              detail="Backend FastAPI + PostgreSQL"
              description="Plataforma administrada para lógica de negocio, modelo IA y persistencia de datos."
              color="purple"
            />
            <CloudModelCard
              icon="🌐"
              type="SaaS"
              name="Vercel"
              detail="Frontend React"
              description="Aplicación web accesible desde el navegador. Sin instalación requerida."
              color="blue"
            />
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-600 text-sm">
              AI Vision API as a Service — Proyecto académico 2026
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span>MobileNetV2 · ImageNet · 1000 clases</span>
              <span>·</span>
              <span>FastAPI · React · TypeScript</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------

function TechBadge({ color, label, desc }: { color: string; label: string; desc: string }) {
  const colorMap: Record<string, string> = {
    orange: 'bg-orange-950/50 text-orange-400 border-orange-800/50',
    purple: 'bg-purple-950/50 text-purple-400 border-purple-800/50',
    blue:   'bg-blue-950/50 text-blue-400 border-blue-800/50',
  }
  return (
    <span className={`badge border ${colorMap[color]} px-3 py-1.5 text-xs`}>
      <span className="font-bold mr-1">{label}</span>
      <span className="opacity-70">{desc}</span>
    </span>
  )
}

function CloudModelCard({
  icon,
  type,
  name,
  detail,
  description,
  color,
}: {
  icon: string
  type: string
  name: string
  detail: string
  description: string
  color: string
}) {
  const colorMap: Record<string, { border: string; badge: string }> = {
    orange: { border: 'border-orange-900/50', badge: 'bg-orange-950/50 text-orange-400 border-orange-800' },
    purple: { border: 'border-purple-900/50', badge: 'bg-purple-950/50 text-purple-400 border-purple-800' },
    blue:   { border: 'border-blue-900/50',   badge: 'bg-blue-950/50 text-blue-400 border-blue-800' },
  }
  const c = colorMap[color]

  return (
    <div className={`bg-slate-900 border ${c.border} rounded-xl p-5 space-y-3`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className={`badge border ${c.badge} text-xs font-bold px-2 py-0.5`}>{type}</span>
      </div>
      <div>
        <p className="font-semibold text-slate-200">{name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
  )
}
