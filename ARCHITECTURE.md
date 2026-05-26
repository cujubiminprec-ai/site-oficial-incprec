# Arquitetura INPREC

O projeto agora esta organizado como um monolito MVC: um unico processo Express entrega a API, os uploads e o build React (`out/`).

## Camadas

- `src/views`: View do MVC. Contem React, paginas, componentes, hooks, contexts, mocks e roteador.
- `src/controllers`: controllers HTTP e rotas Express.
- `src/models`: modelos de dominio e adaptadores de dados. A regra e o SQL devem ficar aqui, deixando controllers enxutos.
- `src/services`: services usados pela View para conversar com a API.
- `src/config`: ambiente, banco e configuracoes de runtime.
- `src/db`: migrations, seed, reset do admin e rotinas MySQL.
- `src/middleware`: middlewares Express.
- `src/utils`: utilitarios compartilhados.

## Runtime

A pasta antiga `backend/` e o padrao antigo `src/controllers/routes/*.routes.ts` foram removidos. Novas rotas devem ser registradas em `src/controllers/index.ts` e, quando precisarem acessar MySQL, devem usar um model em `src/models`.

Exemplo atual:

- Controller: `src/controllers/conteudo.controller.ts`
- Model: `src/models/conteudo.model.ts`

Models ja extraidos:

- `src/models/conteudo.model.ts`
- `src/models/menu.model.ts`
- `src/models/servicos.model.ts`
- `src/models/auditoria.model.ts`
- `src/models/notificacoes.model.ts`
- `src/models/contato.model.ts`
- `src/models/pesquisa.model.ts`
- `src/models/formularios.model.ts`
- `src/models/faq.model.ts`
- `src/models/usuarios.model.ts`
- `src/models/analytics.model.ts`
- `src/models/eleicao.model.ts`

Comandos principais:

```bash
npm run setup
npm run build:app
npm run start
```

Isso gera:

- Frontend: `out/`
- Servidor: `dist/server.js`
- Banco MySQL: configurado por `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`
- Uploads: `public/uploads/`

O mesmo processo Node serve:

- Site React: `/`
- API: `/api`
- Uploads: `/uploads`
- Healthcheck: `/health`

## Deploy

Use o script unico:

```bash
bash deploy.sh init
bash deploy.sh start
```

O script configura `.env`, instala/compila no root, prepara o banco e sobe `dist/server.js` no PM2 com o nome `inprec`.

## Admin padrao

```text
E-mail: admin@inprec.net
Senha: inprec@2026
```

Para restaurar o acesso:

```bash
npm run reset-admin
```
