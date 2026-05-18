# INPREC — Sistema Web Institucional

## 1. Descrição do Projeto

**Posicionamento:** Sistema web institucional moderno para o INPREC, substituindo o site atual (inprec.net) por uma plataforma clean, responsiva e interativa, inspirada no design Nubank — minimalista, tipografia moderna, foco em usabilidade mobile-first.

**Público-alvo:** Cidadãos, servidores, gestores e parceiros do INPREC.

**Valor central:** Comunicação institucional clara, transparência pública, acessibilidade e gestão de conteúdo simplificada via painel administrativo.

---

## 2. Estrutura de Páginas

### Site Público
- `/` — Home (Hero Slider, Serviços, Sobre, Notícias, Transparência, Contato)
- `/servicos` — Serviços (lista completa)
- `/noticias` — Notícias (lista + filtros)
- `/noticias/:id` — Detalhe de Notícia
- `/transparencia` — Transparência (PDFs, relatórios)
- `/quem-somos` — Quem Somos (Missão, Visão, Valores)
- `/contato` — Contato / Ouvidoria
- `/404` — Página não encontrada

### Painel Administrativo (futuro)
- `/admin/login` — Login admin
- `/admin/dashboard` — Dashboard
- `/admin/slides` — Gerenciar Slides
- `/admin/servicos` — Gerenciar Serviços
- `/admin/noticias` — Gerenciar Notícias
- `/admin/transparencia` — Gerenciar Arquivos
- `/admin/configuracoes` — Configurações gerais

---

## 3. Funcionalidades Principais

### Site Público
- [x] Navbar fixa com logo, links e botão Admin
- [x] Hero com slider automático de 6 slides (5s)
- [x] Seção de Serviços (grid de cards modernos)
- [x] Seção Quem Somos (missão, visão, valores)
- [x] Seção de Notícias (grid editorial)
- [x] Seção de Transparência (documentos, PDFs)
- [x] Formulário de Contato / Ouvidoria
- [x] Footer completo com 4 colunas + tipografia gigante
- [x] Botão flutuante WhatsApp
- [x] Botão flutuante Chat (Tawk.to)
- [x] Botões flutuantes configuráveis pelo painel

### Painel Admin (Fase 3 - SQLite local, preparado para MySQL)
- [ ] Login seguro via JWT no backend
- [ ] CRUD de Slides
- [ ] CRUD de Serviços
- [ ] CRUD de Notícias
- [ ] Upload de imagens e PDFs no servidor local
- [ ] Configurações gerais (logo, cores, contatos)

---

## 4. Modelo de Dados (SQLite - Fase 3, preparado para MySQL)

### Tabela: usuarios
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Chave primária |
| email | text | E-mail de acesso |
| role | text | admin / user |

### Tabela: slides
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Chave primária |
| titulo | text | Título do slide |
| subtitulo | text | Descrição |
| image_url | text | URL da imagem |
| cta_label | text | Texto do botão |
| cta_url | text | Link do botão |
| ordem | int | Posição no slider |
| ativo | bool | Visível ou não |

### Tabela: servicos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Chave primária |
| titulo | text | Nome do serviço |
| descricao | text | Descrição curta |
| icone | text | Nome do ícone (Remix Icons) |
| ativo | bool | Visível ou não |

### Tabela: noticias
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Chave primária |
| titulo | text | Título da notícia |
| conteudo | text | Conteúdo completo |
| resumo | text | Prévia do texto |
| image_url | text | URL da imagem |
| categoria | text | Categoria |
| criado_em | timestamp | Data de criação |
| publicado | bool | Visível ou não |

### Tabela: transparencia
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Chave primária |
| titulo | text | Título do documento |
| descricao | text | Descrição |
| arquivo_url | text | URL do arquivo (PDF) |
| categoria | text | Categoria |
| ano | int | Ano de referência |
| criado_em | timestamp | Data |

### Tabela: configuracoes
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Chave primária |
| chave | text | Identificador único |
| valor | text | Valor da configuração |

### Tabela: contatos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Chave primária |
| whatsapp | text | Número WhatsApp |
| email | text | E-mail institucional |
| telefone | text | Telefone fixo |
| endereco | text | Endereço |

---

## 5. Integrações e Backend

- **SQLite:** banco local atual para login admin, tabelas e arquivos do painel. Estrutura preparada para migração futura para MySQL.
- **Tawk.to:** Chat online integrado — Fase 1 (snippet)
- **Acessibilidade:** recursos de contraste e tamanho de fonte no próprio portal
- **WhatsApp:** Link direto via wa.me — Fase 1
- **Hostinger + GitHub Actions:** Deploy automático — Fase 4

---

## 6. Plano de Desenvolvimento

### Fase 1: Site Público (ATUAL)
- **Objetivo:** Criar o site institucional completo com todas as páginas públicas, design Nubank, dados mock realistas
- **Entregável:** Site navegável completo com Home, Serviços, Notícias, Transparência, Quem Somos, Contato, Footer e botões flutuantes

### Fase 2: Páginas Internas
- **Objetivo:** Implementar as páginas detalhadas de Notícias, Serviços, Transparência, Quem Somos e Contato
- **Entregável:** Todas as rotas funcionando com conteúdo completo e responsivo

### Fase 3: Painel Admin + SQLite
- **Objetivo:** CMS completo com autenticação, CRUD de todos os conteúdos e uploads
- **Entregável:** Painel /admin funcional e seguro, integrado ao backend SQLite e preparado para MySQL

### Fase 4: Deploy e CI/CD
- **Objetivo:** Configurar pipeline GitHub Actions para deploy automático na Hostinger com HTTPS e variáveis de ambiente seguras
- **Entregável:** Site em produção com deploy automático
