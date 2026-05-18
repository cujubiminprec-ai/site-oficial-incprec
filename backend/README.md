# INPREC Backend

API REST em Node.js + Express + TypeScript + SQLite para o sistema INPREC.

## Stack

| Componente | Tecnologia |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Linguagem | TypeScript 5 |
| Banco de dados | SQLite (better-sqlite3) |
| Autenticacao | JWT (jsonwebtoken) |
| Upload | Multer + Sharp |
| Processo em VPS | PM2 |

## Desenvolvimento local

```bash
cd backend
npm install
cp .env.example .env
npm run setup
npm run dev
```

API: `http://localhost:3001/api`
Healthcheck: `http://localhost:3001/health`

## Scripts

```bash
npm run dev        # Servidor com hot reload
npm run build      # Compila TypeScript para dist/
npm run start      # Inicia a versao compilada
npm run migrate    # Executa migrations pendentes
npm run seed       # Popula dados iniciais
npm run setup      # migrate + seed
```

## Deploy em VPS

Na raiz do projeto:

```bash
bash deploy.sh init
bash deploy.sh install
bash deploy.sh start
```

O script compila o frontend em `out/`, compila o backend em `backend/dist/` e inicia o backend com PM2.

Comandos uteis:

```bash
bash deploy.sh status
bash deploy.sh logs
bash deploy.sh backup
bash deploy.sh update
bash deploy.sh nginx
```

Para servir o frontend, configure o Nginx com a saida de:

```bash
bash deploy.sh nginx
```

O Nginx deve servir `out/` como site estatico e encaminhar `/api/` e `/uploads/` para `http://127.0.0.1:3001`.

## Banco SQLite

O banco padrao fica em:

```text
backend/data/inprec.db
```

Em VPS, `bash deploy.sh init` permite escolher um caminho absoluto, por exemplo:

```text
/var/www/inprec/backend/data/inprec.db
```

Backup manual:

```bash
bash deploy.sh backup
```

## Seguranca

- JWT com expiracao configuravel
- bcryptjs para senhas
- Helmet.js para headers HTTP seguros
- Rate limiting configuravel
- CORS restrito ao dominio do frontend
- SQLite com WAL mode e foreign keys
