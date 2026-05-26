# Auditoria de Deploy - INPREC

Data da atualização: 2026-05-25

## Status atual

O projeto está pronto para rodar como monolito Node/Express + React/Vite com MySQL.

Validado nesta rodada:
- `mysql2/promise` como driver MySQL.
- Migrations e seed aplicados em MySQL 8.4.
- Build frontend e backend.
- Lint e type-check.
- Smoke HTTP com login, healthcheck, conteúdo, cursos, upload, analytics, contato e pesquisa.

## Comandos validados

```bash
npm run setup
npm run lint
npm run type-check
npm run build:app
```

Smoke:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\smoke-admin-flows.ps1
```

## Variáveis de produção

Use `.env.example` como base:

```env
DB_CLIENT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=inprec
DB_USER=inprec
DB_PASSWORD=troque_esta_senha
DB_SSL=false
```

Também configure:
- `JWT_SECRET`
- `FRONTEND_URL`
- `API_URL`
- `UPLOAD_PATH`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Deploy em VPS/CloudPanel

Fluxo recomendado:

1. Criar banco MySQL no CloudPanel.
2. Criar usuário com permissão no banco.
3. Configurar `.env` no servidor.
4. Rodar:

```bash
npm install
npm run setup
npm run build:app
npm start
```

Com PM2:

```bash
pm2 start dist/server.js --name inprec --update-env
pm2 save
```

O `deploy.sh` já faz esse fluxo de forma guiada.

## Nginx

O processo Node serve:
- Site React em `/`
- API em `/api`
- Uploads em `/uploads`
- Healthcheck em `/health`

Use `nginx.conf` como base para proxy reverso para `localhost:3001`.

## Persistência

Manter persistentes:
- Banco MySQL via backup do CloudPanel ou `mysqldump`.
- Pasta definida em `UPLOAD_PATH`.

Backups:

```bash
bash deploy.sh backup
```

## Pontos ainda recomendados

- Criar pipeline GitHub Actions para `npm ci`, `npm run lint`, `npm run type-check` e `npm run build:app`.
- Criar estratégia de rollback de deploy.
- Adicionar monitoramento/logs de produção.
- Avaliar code splitting no frontend, pois o bundle principal ainda passa de 500 kB.
