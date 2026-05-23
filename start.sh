#!/bin/bash
# start.sh — Levanta backend y frontend en un solo comando
# Uso: ./start.sh

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV="$ROOT_DIR/venv"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== AI Vision API Service ===${NC}"

# Verificar venv
if [ ! -d "$VENV" ]; then
  echo -e "${YELLOW}Creando entorno virtual con Python 3.12...${NC}"
  python3.12 -m venv "$VENV"
  source "$VENV/bin/activate"
  pip install --upgrade pip -q
  pip install -r "$ROOT_DIR/backend/requirements.txt" -q
else
  source "$VENV/bin/activate"
fi

# Verificar node_modules del frontend
if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  echo -e "${YELLOW}Instalando dependencias del frontend...${NC}"
  cd "$ROOT_DIR/frontend" && npm install -q
fi

echo -e "${GREEN}Iniciando backend en http://localhost:8000${NC}"
cd "$ROOT_DIR/backend" && uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

echo -e "${GREEN}Iniciando frontend en http://localhost:5173${NC}"
cd "$ROOT_DIR/frontend" && npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}Ambos servicios corriendo. Presiona Ctrl+C para detener.${NC}"

# Al presionar Ctrl+C, mata ambos procesos
trap "echo 'Deteniendo servicios...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
