#!/usr/bin/env bash

set -euo pipefail

APP_NAME="inprec"
BACKEND_NAME="inprec-backend"
BACKUP_DIR="./backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m"

log() { printf "%b[%s]%b %s\n" "$GREEN" "$(date +%H:%M:%S)" "$NC" "$1"; }
warn() { printf "%b[AVISO]%b %s\n" "$YELLOW" "$NC" "$1"; }
fail() { printf "%b[ERRO]%b %s\n" "$RED" "$NC" "$1"; exit 1; }
header() { printf "\n%b== %s ==%b\n\n" "$BLUE" "$1" "$NC"; }

prompt_default() {
  local label="$1"
  local default_value="$2"
  local value

  read -r -p "$label [$default_value]: " value
  printf "%s" "${value:-$default_value}"
}

prompt_required() {
  local label="$1"
  local value=""

  while [ -z "$value" ]; do
    read -r -p "$label: " value
  done

  printf "%s" "$value"
}

prompt_secret() {
  local label="$1"
  local value=""

  while [ -z "$value" ]; do
    read -r -s -p "$label: " value
    printf "\n"
  done

  printf "%s" "$value"
}

generate_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 48
  else
    local secret
    set +o pipefail
    secret="$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 96)"
    set -o pipefail
    printf "%s\n" "$secret"
  fi
}

check_node() {
  command -v node >/dev/null 2>&1 || fail "Node.js nao encontrado. Instale Node.js 20+ antes do deploy."
  command -v npm >/dev/null 2>&1 || fail "npm nao encontrado."
  local node_major
  node_major="$(node -p "process.versions.node.split('.')[0]")"
  if [ "$node_major" -lt 20 ] || [ "$node_major" -gt 22 ]; then
    fail "Use Node.js 20 ou 22. Versao atual: $(node -v). O backend usa better-sqlite3 e pode falhar no Node 24+."
  fi
}

check_pm2() {
  command -v pm2 >/dev/null 2>&1 || fail "PM2 nao encontrado. Instale com: npm install -g pm2"
}

write_env_files() {
  local http_port="$1"
  local public_url="$2"
  local vite_api_url="$3"
  local db_type="$4"
  local db_host="$5"
  local db_port="$6"
  local db_name="$7"
  local db_user="$8"
  local db_password="$9"
  local db_path="${10}"
  local upload_path="${11}"
  local admin_email="${12}"
  local admin_password="${13}"
  local jwt_secret="${14}"

  cat > .env <<EOF
# Gerado por deploy.sh em $(date -Iseconds)
APP_NAME=$APP_NAME
HTTP_PORT=$http_port
FRONTEND_URL=$public_url
VITE_API_URL=$vite_api_url
EOF

  mkdir -p backend
  cat > backend/.env <<EOF
# Gerado por deploy.sh em $(date -Iseconds)
NODE_ENV=production
PORT=3001
API_URL=$public_url
FRONTEND_URL=$public_url

# Banco de dados
# O backend atual usa SQLite em runtime. Os demais campos ficam preparados
# para futura troca de driver.
DB_TYPE=$db_type
DB_PATH=$db_path
DB_HOST=$db_host
DB_PORT=$db_port
DB_NAME=$db_name
DB_USER=$db_user
DB_PASSWORD=$db_password

# JWT
JWT_SECRET=$jwt_secret
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# Uploads
UPLOAD_PATH=$upload_path
UPLOAD_MAX_SIZE_MB=50
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
ALLOWED_DOC_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Rate limit e logs
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
LOG_LEVEL=combined

# Usuario inicial do seed
ADMIN_EMAIL=$admin_email
ADMIN_PASSWORD=$admin_password
EOF

  chmod 600 .env backend/.env 2>/dev/null || true
}

configure_env() {
  header "Configuracao do deploy em VPS"

  local http_port public_url vite_api_url db_type db_host db_port db_name db_user db_password db_path upload_path
  local admin_email admin_password jwt_secret

  http_port="$(prompt_default "Porta publica do site/Nginx" "80")"
  public_url="$(prompt_default "URL publica (dominio ou IP, com http/https)" "http://localhost:${http_port}")"
  vite_api_url="$(prompt_default "URL da API para o frontend" "/api")"

  printf "\nTipo de banco:\n"
  printf "  1) sqlite (recomendado para este projeto hoje)\n"
  printf "  2) postgresql (credenciais salvas no .env; backend ainda precisa de driver)\n"
  printf "  3) mysql (credenciais salvas no .env; backend ainda precisa de driver)\n"
  local db_choice
  db_choice="$(prompt_default "Escolha" "1")"

  db_host=""
  db_port=""
  db_name=""
  db_user=""
  db_password=""
  db_path="$(pwd)/backend/data/inprec.db"

  case "$db_choice" in
    1|sqlite)
      db_type="sqlite"
      db_path="$(prompt_default "Caminho do SQLite" "$db_path")"
      ;;
    2|postgres|postgresql)
      db_type="postgresql"
      db_host="$(prompt_required "Host do PostgreSQL")"
      db_port="$(prompt_default "Porta do PostgreSQL" "5432")"
      db_name="$(prompt_required "Nome do banco")"
      db_user="$(prompt_required "Usuario do banco")"
      db_password="$(prompt_secret "Senha do banco")"
      warn "As credenciais foram salvas, mas o backend atual esta implementado com SQLite."
      ;;
    3|mysql|mariadb)
      db_type="mysql"
      db_host="$(prompt_required "Host do MySQL/MariaDB")"
      db_port="$(prompt_default "Porta do MySQL/MariaDB" "3306")"
      db_name="$(prompt_required "Nome do banco")"
      db_user="$(prompt_required "Usuario do banco")"
      db_password="$(prompt_secret "Senha do banco")"
      warn "As credenciais foram salvas, mas o backend atual esta implementado com SQLite."
      ;;
    *)
      fail "Tipo de banco invalido."
      ;;
  esac

  upload_path="$(prompt_default "Pasta de uploads" "$(pwd)/public/uploads")"
  admin_email="$(prompt_default "E-mail do admin inicial" "admin@inprec.net")"
  admin_password="$(prompt_secret "Senha do admin inicial")"
  jwt_secret="$(generate_secret)"

  write_env_files \
    "$http_port" "$public_url" "$vite_api_url" "$db_type" "$db_host" "$db_port" \
    "$db_name" "$db_user" "$db_password" "$db_path" "$upload_path" \
    "$admin_email" "$admin_password" "$jwt_secret"

  mkdir -p "$(dirname "$db_path")" "$upload_path" "$BACKUP_DIR"
  touch "$upload_path/.gitkeep" 2>/dev/null || true

  log "Arquivos .env e backend/.env configurados."
}

ensure_env() {
  if [ ! -f ".env" ] || [ ! -f "backend/.env" ]; then
    warn "Arquivos de ambiente ausentes. Iniciando configuracao interativa."
    configure_env
  fi
}

install_deps() {
  header "Instalando dependencias"
  check_node
  npm install
  (cd backend && npm install)
}

build_app() {
  header "Build da aplicacao"
  check_node
  ensure_env
  npm run build
  (cd backend && npm run build)
}

setup_db() {
  header "Preparando banco e usuario admin"
  check_node
  ensure_env
  (cd backend && npm run setup)
}

backup() {
  header "Backup do SQLite"
  ensure_env
  mkdir -p "$BACKUP_DIR"

  local db_path
  db_path="$(grep '^DB_PATH=' backend/.env | cut -d '=' -f2-)"
  case "$db_path" in
    /*) ;;
    *) db_path="backend/$db_path" ;;
  esac

  if [ ! -f "$db_path" ]; then
    warn "Banco ainda nao existe em: $db_path"
    return 0
  fi

  cp "$db_path" "$BACKUP_DIR/inprec_db_${TIMESTAMP}.db"
  log "Backup salvo em ${BACKUP_DIR}/inprec_db_${TIMESTAMP}.db"
}

start() {
  header "Iniciando backend com PM2"
  check_pm2
  ensure_env
  build_app
  setup_db
  (cd backend && pm2 start dist/server.js --name "$BACKEND_NAME" --update-env)
  pm2 save
  status
}

stop() {
  header "Parando backend"
  check_pm2
  pm2 stop "$BACKEND_NAME" || true
}

restart() {
  header "Reiniciando backend"
  check_pm2
  ensure_env
  build_app
  setup_db
  if pm2 describe "$BACKEND_NAME" >/dev/null 2>&1; then
    pm2 restart "$BACKEND_NAME" --update-env
  else
    (cd backend && pm2 start dist/server.js --name "$BACKEND_NAME" --update-env)
  fi
  pm2 save
  status
}

update() {
  header "Atualizando aplicacao"
  backup
  install_deps
  restart
}

logs() {
  check_pm2
  pm2 logs "$BACKEND_NAME"
}

reset_admin() {
  header "Resetando usuario admin"
  check_node
  ensure_env
  (cd backend && npm run reset-admin)
}

status() {
  header "Status"
  check_pm2
  pm2 status "$BACKEND_NAME"
  printf "\nFrontend build: %s\n" "$(pwd)/out"
  printf "Backend API: http://localhost:3001/api\n"
}

nginx_config() {
  header "Configuracao Nginx"
  ensure_env
  local root_dir
  root_dir="$(pwd)/out"
  sed "s#__APP_ROOT__#${root_dir}#g" nginx.conf
}

help() {
  cat <<EOF
Uso: bash deploy.sh [comando]

Comandos:
  init      Configura .env e backend/.env perguntando porta, banco e credenciais
  install   Instala dependencias do frontend e backend
  build     Compila frontend em out/ e backend em backend/dist/
  start     Compila e inicia o backend com PM2
  stop      Para o backend no PM2
  restart   Recompila e reinicia o backend no PM2
  update    Backup + install + restart
  logs      Mostra logs do backend no PM2
  status    Mostra status do backend e caminho do frontend
  backup    Faz backup do SQLite
  reset-admin  Cria/atualiza o admin usando ADMIN_EMAIL e ADMIN_PASSWORD
  nginx     Imprime uma configuracao Nginx pronta para esta pasta
EOF
}

command="${1:-help}"

case "$command" in
  init) configure_env ;;
  install) install_deps ;;
  build) build_app ;;
  start) start ;;
  stop) stop ;;
  restart) restart ;;
  update) update ;;
  logs) logs ;;
  status) status ;;
  backup) backup ;;
  reset-admin) reset_admin ;;
  nginx) nginx_config ;;
  help|*) help ;;
esac
