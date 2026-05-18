#!/bin/bash
# ============================================================
# Script para rodar todas as migrations do INPREC
# Uso: ./db/run_migrations.sh
# ============================================================

# Configurações — altere conforme seu ambiente
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="inprec_db"
DB_USER="postgres"

echo "=========================================="
echo "  INPREC — Executando Migrations"
echo "=========================================="

# Rodar migrations em ordem
MIGRATIONS=(
    "db/migrations/001_usuarios_configuracoes.sql"
    "db/migrations/002_paginas_conteudo.sql"
    "db/migrations/003_noticias_eventos_slides.sql"
    "db/migrations/004_servicos_gestores_estrutura.sql"
    "db/migrations/005_transparencia_financas_legislacao.sql"
    "db/migrations/006_cursos_votacao_faq.sql"
    "db/migrations/007_atendimento_beneficios.sql"
    "db/migrations/008_storage_arquivos.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    echo ""
    echo "▶ Rodando: $migration"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration"
    if [ $? -ne 0 ]; then
        echo "❌ ERRO em $migration — abortando."
        exit 1
    fi
    echo "✅ $migration concluído"
done

echo ""
echo "=========================================="
echo "  Deseja rodar o seed inicial? (s/n)"
echo "=========================================="
read -r resposta
if [[ "$resposta" == "s" || "$resposta" == "S" ]]; then
    echo "▶ Rodando seed..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "db/seeds/001_seed_inicial.sql"
    echo "✅ Seed concluído!"
fi

echo ""
echo "✅ Todas as migrations foram executadas com sucesso!"
echo "   Banco: $DB_NAME"
echo "   Host: $DB_HOST:$DB_PORT"
