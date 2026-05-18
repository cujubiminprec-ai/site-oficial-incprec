# 📦 Banco de Dados — INPREC

Migrations SQL puras para PostgreSQL. Rode na ordem numérica.

## 📁 Estrutura

```
db/
├── migrations/          # Scripts DDL — criar/alterar tabelas
│   ├── 001_usuarios_configuracoes.sql
│   ├── 002_paginas_conteudo.sql
│   ├── 003_noticias_eventos_slides.sql
│   ├── 004_servicos_gestores_estrutura.sql
│   ├── 005_transparencia_financas_legislacao.sql
│   ├── 006_cursos_votacao_faq.sql
│   ├── 007_atendimento_beneficios.sql
│   └── 008_storage_arquivos.sql
├── seeds/               # Dados iniciais
│   └── 001_seed_inicial.sql
└── README.md
```

## 🚀 Como rodar

### PostgreSQL (linha de comando)
```bash
# Rodar todas as migrations em ordem
psql -U seu_usuario -d nome_do_banco -f db/migrations/001_usuarios_configuracoes.sql
psql -U seu_usuario -d nome_do_banco -f db/migrations/002_paginas_conteudo.sql
psql -U seu_usuario -d nome_do_banco -f db/migrations/003_noticias_eventos_slides.sql
psql -U seu_usuario -d nome_do_banco -f db/migrations/004_servicos_gestores_estrutura.sql
psql -U seu_usuario -d nome_do_banco -f db/migrations/005_transparencia_financas_legislacao.sql
psql -U seu_usuario -d nome_do_banco -f db/migrations/006_cursos_votacao_faq.sql
psql -U seu_usuario -d nome_do_banco -f db/migrations/007_atendimento_beneficios.sql
psql -U seu_usuario -d nome_do_banco -f db/migrations/008_storage_arquivos.sql

# Seed com dados iniciais
psql -U seu_usuario -d nome_do_banco -f db/seeds/001_seed_inicial.sql
```

### Script único (roda tudo de uma vez)
```bash
for f in db/migrations/*.sql; do psql -U seu_usuario -d nome_do_banco -f "$f"; done
psql -U seu_usuario -d nome_do_banco -f db/seeds/001_seed_inicial.sql
```

### MySQL / MariaDB
Substitua os tipos PostgreSQL:
- `SERIAL` → `INT AUTO_INCREMENT`
- `BOOLEAN` → `TINYINT(1)`
- `JSONB` → `JSON`
- `TIMESTAMPTZ` → `DATETIME`
- `TEXT[]` → `JSON`
- `gen_random_uuid()` → `UUID()`

## 📂 Pasta public/

Crie esta estrutura no servidor para salvar arquivos:

```
public/
├── uploads/
│   ├── fotos/          # Fotos de gestores, eventos
│   ├── pdfs/           # Documentos, relatórios
│   ├── slides/         # Imagens do slider da home
│   ├── noticias/       # Imagens de notícias
│   └── documentos/     # Docs de transparência, legislação
└── assets/             # Arquivos estáticos
```

## 🔒 Observações
- Todas as senhas devem ser armazenadas com hash bcrypt (nunca em texto puro)
- Os campos `arquivo_url` e `foto_url` devem conter o caminho relativo: `/uploads/fotos/gestor-1.jpg`
- Faça backup antes de rodar qualquer migration em produção
