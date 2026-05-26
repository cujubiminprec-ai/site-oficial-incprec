#!/usr/bin/env bash

set -euo pipefail

APP_NAME="inprec"
PROCESS_NAME="inprec"
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
    set +o pipefail
    tr -dc 'A-Za-z0-9' </dev/urandom | head -c 96
    set -o pipefail
  fi
}

set_env_value() {
  local file="$1"
  local key="$2"
  local value="$3"
  if grep -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    printf "%s=%s\n" "$key" "$value" >> "$file"
  fi
}

check_node() {
  command -v node >/dev/null 2>&1 || fail "Node.js nao encontrado. Instale Node.js 20 ou 22."
  command -v npm >/dev/null 2>&1 || fail "npm nao encontrado."
  local node_major
  node_major="$(node -p "process.versions.node.split('.')[0]")"
  if [ "$node_major" -lt 20 ] || [ "$node_major" -gt 22 ]; then
    fail "Use Node.js 20 ou 22. Versao atual: $(node -v)."
  fi
}

check_pm2() {
  if ! command -v pm2 >/dev/null 2>&1; then
    warn "PM2 nao encontrado. Instalando globalmente..."
    npm install -g pm2
  fi
  command -v pm2 >/dev/null 2>&1 || fail "PM2 nao encontrado."
}

configure_env() {
  header "Configuracao do monolito"

  local http_port public_url port db_host db_port db_name db_user db_password upload_path admin_email admin_password jwt_secret
  http_port="$(prompt_default "Porta publica do site/Nginx" "80")"
  public_url="$(prompt_default "URL publica (dominio ou IP, com http/https)" "http://localhost:${http_port}")"
  port="$(prompt_default "Porta interna do Node" "3001")"
  db_host="$(prompt_default "Host do MySQL" "127.0.0.1")"
  db_port="$(prompt_default "Porta do MySQL" "3306")"
  db_name="$(prompt_default "Nome do banco MySQL" "inprec")"
  db_user="$(prompt_default "Usuario do MySQL" "inprec")"
  db_password="$(prompt_secret "Senha do MySQL")"
  upload_path="$(prompt_default "Pasta de uploads" "$(pwd)/public/uploads")"
  admin_email="$(prompt_default "E-mail do admin inicial" "admin@inprec.com")"
  admin_password="$(prompt_secret "Senha do admin inicial")"
  jwt_secret="$(generate_secret)"

  cp .env.example .env
  set_env_value .env "APP_NAME" "$APP_NAME"
  set_env_value .env "APP_NODE_ENV" "production"
  set_env_value .env "PORT" "$port"
  set_env_value .env "HTTP_PORT" "$http_port"
  set_env_value .env "API_URL" "$public_url"
  set_env_value .env "FRONTEND_URL" "$public_url"
  set_env_value .env "VITE_API_URL" "/api"
  set_env_value .env "DB_CLIENT" "mysql"
  set_env_value .env "DB_HOST" "$db_host"
  set_env_value .env "DB_PORT" "$db_port"
  set_env_value .env "DB_NAME" "$db_name"
  set_env_value .env "DB_USER" "$db_user"
  set_env_value .env "DB_PASSWORD" "$db_password"
  set_env_value .env "UPLOAD_PATH" "$upload_path"
  set_env_value .env "JWT_SECRET" "$jwt_secret"
  set_env_value .env "ADMIN_EMAIL" "$admin_email"
  set_env_value .env "ADMIN_PASSWORD" "$admin_password"

  mkdir -p "$upload_path" "$BACKUP_DIR"
  touch "$upload_path/.gitkeep" 2>/dev/null || true
  chmod 600 .env 2>/dev/null || true
  log ".env configurado para o monolito."
}

ensure_env() {
  if [ ! -f ".env" ]; then
    warn ".env ausente. Iniciando configuracao interativa."
    configure_env
  fi
}

install_deps() {
  header "Instalando dependencias"
  check_node
  npm install
}

build_app() {
  header "Build da aplicacao monolitica"
  check_node
  ensure_env
  npm run build:app
}

setup_db() {
  header "Preparando banco e usuario admin"
  check_node
  ensure_env
  npm run setup
}

backup() {
  header "Backup do MySQL"
  ensure_env
  mkdir -p "$BACKUP_DIR"

  local db_host db_port db_name db_user db_password
  db_host="$(grep '^DB_HOST=' .env | cut -d '=' -f2-)"
  db_port="$(grep '^DB_PORT=' .env | cut -d '=' -f2-)"
  db_name="$(grep '^DB_NAME=' .env | cut -d '=' -f2-)"
  db_user="$(grep '^DB_USER=' .env | cut -d '=' -f2-)"
  db_password="$(grep '^DB_PASSWORD=' .env | cut -d '=' -f2-)"

  if ! command -v mysqldump >/dev/null 2>&1; then
    warn "mysqldump nao encontrado. Pulei backup do banco."
    return 0
  fi

  MYSQL_PWD="$db_password" mysqldump -h "$db_host" -P "${db_port:-3306}" -u "$db_user" "$db_name" > "$BACKUP_DIR/inprec_db_${TIMESTAMP}.sql"
  log "Backup salvo em ${BACKUP_DIR}/inprec_db_${TIMESTAMP}.sql"
}

start() {
  header "Iniciando monolito com PM2"
  check_pm2
  build_app
  setup_db
  if pm2 describe "$PROCESS_NAME" >/dev/null 2>&1; then
    pm2 restart "$PROCESS_NAME" --update-env
  else
    pm2 start dist/server.js --name "$PROCESS_NAME" --update-env
  fi
  pm2 save
  status
}

stop() {
  header "Parando monolito"
  check_pm2
  pm2 stop "$PROCESS_NAME" || true
}

restart() {
  header "Reiniciando monolito"
  check_pm2
  build_app
  setup_db
  if pm2 describe "$PROCESS_NAME" >/dev/null 2>&1; then
    pm2 restart "$PROCESS_NAME" --update-env
  else
    pm2 start dist/server.js --name "$PROCESS_NAME" --update-env
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
  pm2 logs "$PROCESS_NAME"
}

reset_admin() {
  header "Resetando usuario admin"
  check_node
  ensure_env
  npm run reset-admin
}

status() {
  header "Status"
  check_pm2
  pm2 status "$PROCESS_NAME"
  printf "\nApp/API: http://localhost:3001\n"
  printf "Frontend build: %s\n" "$(pwd)/out"
  printf "Servidor: %s\n" "$(pwd)/dist/server.js"
  printf "Banco: %s@%s:%s/%s\n" "$(grep '^DB_USER=' .env 2>/dev/null | cut -d '=' -f2-)" "$(grep '^DB_HOST=' .env 2>/dev/null | cut -d '=' -f2-)" "$(grep '^DB_PORT=' .env 2>/dev/null | cut -d '=' -f2-)" "$(grep '^DB_NAME=' .env 2>/dev/null | cut -d '=' -f2-)"
}

nginx_config() {
  header "Configuracao Nginx"
  cat nginx.conf
}

help() {
  cat <<EOF
Uso: bash deploy.sh [comando]

Comandos:
  init         Configura .env do monolito
  install      Instala dependencias
  build        Compila frontend em out/ e servidor em dist/
  start        Compila, prepara banco e inicia com PM2
  stop         Para o processo PM2
  restart      Recompila e reinicia com PM2
  update       Backup + install + restart
  logs         Mostra logs do PM2
  status       Mostra status do processo
  backup       Faz backup do MySQL com mysqldump
  reset-admin  Cria/atualiza o admin usando ADMIN_EMAIL e ADMIN_PASSWORD
  nginx        Imprime a configuracao Nginx
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
