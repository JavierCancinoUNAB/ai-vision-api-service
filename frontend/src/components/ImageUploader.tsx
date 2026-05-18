/**
 * ImageUploader.tsx — Componente para seleccionar imagen, previsualizarla y enviarla al backend.
 */

import { useState, useRef, ChangeEvent, DragEvent } from 'react'
import { predictImage, PredictionResponse } from '../api/apiClient'

interface Props {
  onResult: (result: PredictionResponse) => void
}

export default function ImageUploader({ onResult }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const MAX_SIZE_MB = 5

  function handleFileSelect(file: File) {
    setError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato no soportado. Use JPG, PNG o WebP.')
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`El archivo supera ${MAX_SIZE_MB} MB.`)
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  async function handleAnalyze() {
    if (!selectedFile) {
      setError('Selecciona una imagen primero.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await predictImage(selectedFile)
      onResult(result)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string }; status?: number }; message?: string }
      if (axiosErr?.response?.data?.detail) {
        setError(axiosErr.response.data.detail)
      } else if (axiosErr?.response?.status === 503) {
        setError('El servicio de IA no está disponible. Intenta de nuevo en unos momentos.')
      } else if (axiosErr?.message?.includes('Network Error') || axiosErr?.message?.includes('timeout')) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté activo.')
      } else {
        setError('Error inesperado al analizar la imagen.')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="card space-y-5">
      <h2 className="text-xl font-semibold text-slate-100">Subir imagen</h2>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl cursor-pointer
          flex flex-col items-center justify-center gap-3 p-8
          transition-all duration-200
          ${isDragging
            ? 'border-blue-400 bg-blue-950/30'
            : 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/50'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleInputChange}
          aria-label="Seleccionar imagen"
        />

        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Vista previa"
            className="max-h-64 max-w-full rounded-lg object-contain shadow-lg"
          />
        ) : (
          <>
            {/* Upload icon */}
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-slate-300 font-medium">Arrastra tu imagen aquí</p>
              <p className="text-slate-500 text-sm mt-1">o haz clic para seleccionar</p>
              <p className="text-slate-600 text-xs mt-2">JPG, PNG, WebP · Máximo 5 MB</p>
            </div>
          </>
        )}
      </div>

      {/* Nombre del archivo seleccionado */}
      {selectedFile && (
        <div className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909" />
            </svg>
            <span className="text-sm text-slate-300 truncate">{selectedFile.name}</span>
            <span className="text-xs text-slate-500 flex-shrink-0">
              ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleClear() }}
            className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 ml-3"
            aria-label="Quitar imagen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-950/40 border border-red-800 rounded-xl p-4">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Botón analizar */}
      <button
        onClick={handleAnalyze}
        disabled={!selectedFile || loading}
        className="btn-primary w-full flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analizando imagen...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            Analizar imagen
          </>
        )}
      </button>
    </div>
  )
}
