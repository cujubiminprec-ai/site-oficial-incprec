import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import env from "../config/env";

// ============================================================
// Pastas disponíveis
// ============================================================
export type PastaUpload =
  | "fotos"
  | "pdfs"
  | "painel-pdfs"
  | "apresentacoes"
  | "painel-apresentacoes"
  | "slides-pdfs"
  | "slides-apresentacoes"
  | "transparencia-pdfs"
  | "transparencia-documentos"
  | "transparencia-planilhas"
  | "transparencia-apresentacoes"
  | "financas-pdfs"
  | "financas-documentos"
  | "financas-planilhas"
  | "financas-apresentacoes"
  | "gestores-documentos"
  | "documentos"
  | "planilhas"
  | "slides"
  | "noticias"
  | "avatares"
  | "videos"
  | "transparencia";

// Descrição amigável de cada pasta
export const PASTAS_INFO: Record<PastaUpload, { label: string; icone: string; descricao: string }> = {
  fotos:         { label: "Fotos",           icone: "ri-image-line",           descricao: "Imagens JPG, PNG, WebP" },
  pdfs:          { label: "PDFs",            icone: "ri-file-pdf-2-line",      descricao: "Documentos PDF" },
  "painel-pdfs": { label: "Painel PDFs",      icone: "ri-file-pdf-2-line",      descricao: "PDFs do Painel de Transparência" },
  apresentacoes: { label: "Apresentações",   icone: "ri-slideshow-2-line",     descricao: "PowerPoint, Impress, PPTX" },
  "painel-apresentacoes": { label: "Painel Apresentações", icone: "ri-slideshow-2-line", descricao: "PPT/PPTX do Painel de Transparência" },
  "slides-pdfs": { label: "PDFs dos Slides",  icone: "ri-file-pdf-2-line",      descricao: "PDFs anexados nos slides da home" },
  "slides-apresentacoes": { label: "Apresentações dos Slides", icone: "ri-slideshow-2-line", descricao: "PPT/PPTX anexados nos slides da home" },
  "transparencia-pdfs": { label: "Transparência PDFs", icone: "ri-file-pdf-2-line", descricao: "PDFs do Portal da Transparência" },
  "transparencia-documentos": { label: "Transparência Documentos", icone: "ri-file-word-2-line", descricao: "DOC/DOCX do Portal da Transparência" },
  "transparencia-planilhas": { label: "Transparência Planilhas", icone: "ri-file-excel-2-line", descricao: "XLS/XLSX do Portal da Transparência" },
  "transparencia-apresentacoes": { label: "Transparência Apresentações", icone: "ri-slideshow-2-line", descricao: "PPT/PPTX do Portal da Transparência" },
  "financas-pdfs": { label: "Finanças PDFs", icone: "ri-file-pdf-2-line", descricao: "PDFs de Finanças e Investimentos" },
  "financas-documentos": { label: "Finanças Documentos", icone: "ri-file-word-2-line", descricao: "DOC/DOCX de Finanças e Investimentos" },
  "financas-planilhas": { label: "Finanças Planilhas", icone: "ri-file-excel-2-line", descricao: "XLS/XLSX de Finanças e Investimentos" },
  "financas-apresentacoes": { label: "Finanças Apresentações", icone: "ri-slideshow-2-line", descricao: "PPT/PPTX de Finanças e Investimentos" },
  "gestores-documentos": { label: "Gestores Documentos", icone: "ri-file-list-line", descricao: "Documentos anexados aos gestores" },
  documentos:    { label: "Documentos",      icone: "ri-file-word-2-line",     descricao: "Word, ODT, DOC, DOCX" },
  planilhas:     { label: "Planilhas",       icone: "ri-file-excel-2-line",    descricao: "Excel, ODS, XLSX, CSV" },
  slides:        { label: "Slides da Home",  icone: "ri-gallery-line",         descricao: "Imagens do carrossel" },
  noticias:      { label: "Imagens Notícias",icone: "ri-newspaper-line",       descricao: "Imagens para notícias" },
  avatares:      { label: "Avatares",        icone: "ri-user-3-line",           descricao: "Fotos de perfil / gestores" },
  videos:        { label: "Vídeos",          icone: "ri-video-line",           descricao: "MP4, WebM, AVI" },
  transparencia: { label: "Transparência",   icone: "ri-file-chart-line",      descricao: "Arquivos do Painel de Transparência público" },
};

// Tipos MIME aceitos por pasta
const TIPOS_POR_PASTA: Record<PastaUpload, string[]> = {
  fotos:         ["image/jpeg", "image/png", "image/webp", "image/gif"],
  avatares:      ["image/jpeg", "image/png", "image/webp"],
  slides:        ["image/jpeg", "image/png", "image/webp"],
  noticias:      ["image/jpeg", "image/png", "image/webp"],
  pdfs:          ["application/pdf"],
  "painel-pdfs": ["application/pdf"],
  "slides-pdfs": ["application/pdf"],
  "transparencia-pdfs": ["application/pdf"],
  "financas-pdfs": ["application/pdf"],
  apresentacoes: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.oasis.opendocument.presentation",
  ],
  "painel-apresentacoes": [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.oasis.opendocument.presentation",
    "application/octet-stream",
  ],
  "slides-apresentacoes": [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.oasis.opendocument.presentation",
    "application/octet-stream",
  ],
  "transparencia-apresentacoes": [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.oasis.opendocument.presentation",
    "application/octet-stream",
  ],
  "financas-apresentacoes": [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.oasis.opendocument.presentation",
    "application/octet-stream",
  ],
  documentos:    [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.oasis.opendocument.text",
    "application/zip",
    "application/x-zip-compressed",
  ],
  "transparencia-documentos": [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.oasis.opendocument.text",
    "application/zip",
    "application/x-zip-compressed",
  ],
  "financas-documentos": [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.oasis.opendocument.text",
    "application/zip",
    "application/x-zip-compressed",
  ],
  "gestores-documentos": [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
  planilhas:     [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.oasis.opendocument.spreadsheet",
    "text/csv",
  ],
  "transparencia-planilhas": [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.oasis.opendocument.spreadsheet",
    "text/csv",
  ],
  "financas-planilhas": [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.oasis.opendocument.spreadsheet",
    "text/csv",
  ],
  videos:        ["video/mp4", "video/webm", "video/avi", "video/quicktime"],
  transparencia: [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.oasis.opendocument.presentation",
    "application/octet-stream",
  ],
};

const EXTENSOES_POR_PASTA: Record<PastaUpload, string[]> = {
  fotos:         [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  avatares:      [".jpg", ".jpeg", ".png", ".webp"],
  slides:        [".jpg", ".jpeg", ".png", ".webp"],
  noticias:      [".jpg", ".jpeg", ".png", ".webp"],
  pdfs:          [".pdf"],
  "painel-pdfs": [".pdf"],
  "slides-pdfs": [".pdf"],
  "transparencia-pdfs": [".pdf"],
  "financas-pdfs": [".pdf"],
  apresentacoes: [".ppt", ".pptx", ".pps", ".ppsx", ".odp"],
  "painel-apresentacoes": [".ppt", ".pptx", ".pps", ".ppsx", ".odp"],
  "slides-apresentacoes": [".ppt", ".pptx", ".pps", ".ppsx", ".odp"],
  "transparencia-apresentacoes": [".ppt", ".pptx", ".pps", ".ppsx", ".odp"],
  "financas-apresentacoes": [".ppt", ".pptx", ".pps", ".ppsx", ".odp"],
  documentos:    [".pdf", ".doc", ".docx", ".odt", ".zip"],
  "transparencia-documentos": [".doc", ".docx", ".odt", ".zip"],
  "financas-documentos": [".doc", ".docx", ".odt", ".zip"],
  "gestores-documentos": [".pdf", ".doc", ".docx", ".odt", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".webp"],
  planilhas:     [".xls", ".xlsx", ".ods", ".csv"],
  "transparencia-planilhas": [".xls", ".xlsx", ".ods", ".csv"],
  "financas-planilhas": [".xls", ".xlsx", ".ods", ".csv"],
  videos:        [".mp4", ".webm", ".avi", ".mov"],
  transparencia: [".pdf", ".ppt", ".pptx", ".pps", ".ppsx", ".odp"],
};

function pastaValida(pasta?: string): pasta is PastaUpload {
  return Boolean(pasta && pasta in PASTAS_INFO);
}

// ============================================================
// Garante que todas as pastas existem ao iniciar
// ============================================================
export function criarPastas(): void {
  const pastas = Object.keys(PASTAS_INFO) as PastaUpload[];
  pastas.forEach((pasta) => {
    const dir = path.join(env.upload.path, pasta);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Pasta criada: ${dir}`);
    }
  });
}

// ============================================================
// Storage dinâmico — destino baseado no campo 'pasta'
// ============================================================
const storage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    const pasta = pastaValida(req.query.pasta as string) ? (req.query.pasta as PastaUpload) : "documentos";
    const dir = path.resolve(env.upload.path, pasta);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const nome = `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`;
    cb(null, nome);
  },
});

// ============================================================
// Filtro de tipos por pasta
// ============================================================
function filtroArquivo(req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  const pasta = pastaValida(req.query.pasta as string) ? (req.query.pasta as PastaUpload) : "documentos";
  const tiposPermitidos = TIPOS_POR_PASTA[pasta] ?? ["application/pdf"];
  const extensoesPermitidas = EXTENSOES_POR_PASTA[pasta] ?? [".pdf"];
  const extensao = path.extname(file.originalname).toLowerCase();

  if (tiposPermitidos.includes(file.mimetype) || extensoesPermitidas.includes(extensao)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Arquivo "${file.originalname}" não permitido na pasta "${pasta}". ` +
        `Aceitos: ${extensoesPermitidas.join(", ")}`
      )
    );
  }
}

// ============================================================
// Instância do multer
// ============================================================
export const upload = multer({
  storage,
  fileFilter: filtroArquivo,
  limits: {
    fileSize: env.upload.maxSizeMb * 1024 * 1024,
  },
});

// Upload único
export const uploadUnico = upload.single("arquivo");

// Upload múltiplo (máx 20)
export const uploadMultiplo = upload.array("arquivos", 20);

// ============================================================
// URL pública do arquivo
// ============================================================
export function urlPublica(caminho: string, req: Request): string {
  const relativo = path.relative(path.resolve(env.upload.path), caminho).replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/uploads/${relativo}`;
}

// ============================================================
// Formata tamanho de arquivo legível
// ============================================================
export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
