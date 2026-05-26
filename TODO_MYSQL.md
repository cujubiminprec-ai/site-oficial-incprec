# TODO_MYSQL - status da migracao

## Concluido
- [x] Instalado `mysql2` e removido o driver antigo.
- [x] `.env.example` atualizado para `DB_CLIENT=mysql` e variaveis `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
- [x] `src/config/database.ts` substituido por pool `mysql2/promise`.
- [x] `query`, `queryOne`, `queryPaginado` e transacoes migrados para MySQL.
- [x] Placeholders `$1..$n` convertidos para `?` na camada de banco.
- [x] `RETURNING` tratado por execucao + `SELECT` posterior para manter compatibilidade com controllers existentes.
- [x] `ON CONFLICT` removido dos fluxos runtime e substituido por `ON DUPLICATE KEY UPDATE`.
- [x] Models que usavam acesso sincronono migrados para chamadas assincronas.
- [x] Migrations, seed e reset-admin convertidos para runner MySQL.
- [x] Scripts de smoke `check-smoke-data` e `cleanup-smoke-data` migrados para MySQL.
- [x] Build do servidor validado com `npm run build:server`.
- [x] `npm run setup` validado contra MySQL 8.4 em Docker.
- [x] Smoke HTTP validado: health, login, slides, FAQ, cursos, inscricao publica, uploads, analytics, contato e pesquisa.
- [x] `scripts/smoke-admin-flows.ps1` atualizado para as rotas reais atuais.
- [x] `docker-compose.dev.yml` adicionado para subir MySQL local de desenvolvimento.
- [x] `ARCHITECTURE.md` e `DEPLOY_AUDIT_CLOUDPANEL.md` atualizados para o estado MySQL atual.

## Pendente fora deste ambiente
- [ ] No servidor definitivo, criar o banco MySQL real e usuario/senha.
- [ ] No servidor definitivo, rodar `npm run setup` com `.env` apontando para o MySQL real.
- [ ] No servidor definitivo, rodar `powershell -ExecutionPolicy Bypass -File scripts/smoke-admin-flows.ps1`.
