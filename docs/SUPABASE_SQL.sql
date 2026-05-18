-- ============================================================
-- SUPABASE_SQL.sql
-- Esquema de base de datos para AI Vision API as a Service
--
-- INSTRUCCIONES:
-- 1. Entra a tu proyecto Supabase
-- 2. Ve a "SQL Editor" en el menú lateral
-- 3. Copia y pega todo este contenido
-- 4. Haz clic en "Run"
-- ============================================================

-- Tabla principal de predicciones
CREATE TABLE IF NOT EXISTS predictions (
    id          BIGSERIAL PRIMARY KEY,
    filename    TEXT NOT NULL,
    prediction  TEXT NOT NULL,
    confidence  NUMERIC(5, 4) NOT NULL,
    model_used  TEXT NOT NULL DEFAULT 'MobileNetV2',
    image_url   TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para acelerar las consultas ordenadas por fecha
CREATE INDEX IF NOT EXISTS idx_predictions_created_at
    ON predictions (created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Política que permite acceso completo a la service role key
-- IMPORTANTE: Esta política es para el backend. Nunca uses service_role en el frontend.
CREATE POLICY "Allow service role full access"
    ON predictions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- NOTAS DE SEGURIDAD
-- ============================================================
-- 
-- SUPABASE_SERVICE_ROLE_KEY:
--   - Tiene acceso total a la base de datos, incluyendo bypass de RLS.
--   - Solo debe usarse en el BACKEND (variables de entorno del servidor).
--   - NUNCA debe incluirse en el código frontend ni en el repositorio.
--
-- SUPABASE_ANON_KEY:
--   - Es la clave pública, de acceso limitado por RLS.
--   - Puede usarse en el frontend si fuera necesario, pero en este
--     proyecto NO se usa en el frontend.
--
-- ============================================================
-- VERIFICAR QUE FUNCIONA
-- ============================================================
--
-- Después de ejecutar, puedes insertar un registro de prueba:
--
-- INSERT INTO predictions (filename, prediction, confidence, model_used)
-- VALUES ('test.jpg', 'golden retriever', 0.9523, 'MobileNetV2');
--
-- Y verificar que se guardó:
--
-- SELECT * FROM predictions ORDER BY created_at DESC LIMIT 10;
--
-- ============================================================
