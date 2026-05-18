# public/ - Arquivos do INPREC

Esta pasta fica na raiz do projeto, fora de `backend/` e `src/`.
Ela guarda os arquivos enviados pelo painel administrativo.

## Estrutura

```text
public/
└── uploads/
    ├── fotos/
    ├── pdfs/
    ├── apresentacoes/
    ├── documentos/
    ├── planilhas/
    ├── slides/
    ├── noticias/
    ├── avatares/
    └── videos/
```

## Como os arquivos chegam aqui

Os arquivos sao enviados pelo Painel Admin > Gerenciador de Arquivos.
O backend Node.js recebe o upload e salva na subpasta configurada em `UPLOAD_PATH`.

## Caminhos por ambiente

| Ambiente | Caminho recomendado |
|---|---|
| Desenvolvimento | `../public/uploads` relativo ao `backend/` |
| VPS | `/var/www/inprec/public/uploads` ou caminho absoluto equivalente |

## Configuracao no backend/.env

```env
UPLOAD_PATH=../public/uploads
```

Em producao, prefira um caminho absoluto:

```env
UPLOAD_PATH=/var/www/inprec/public/uploads
```

O Nginx deve encaminhar `/uploads/` para o backend Node.js em `http://127.0.0.1:3001`.
