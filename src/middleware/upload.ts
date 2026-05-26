import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import env from "../config/env";

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
  | "home-atalhos"
  | "documentos"
  | "planilhas"
  | "slides"
  | "noticias"
  | "eventos"
  | "avatares"
  | "videos"
  | "transparencia";

export const PASTAS_INFO: Record<PastaUpload, { label: string; icone: string; descricao: string }> = {
  fotos: { label: "Fotos", icone: "ri-image-line", descricao: "Imagens JPG, PNG, WebP" },
  pdfs: { label: "PDFs", icone: "ri-file-pdf-2-line", descricao: "Documentos PDF" },
  "painel-pdfs": { label: "Painel PDFs", icone: "ri-file-pdf-2-line", descricao: "PDFs do Painel de Transparencia" },
  apresentacoes: { label: "Apresentacoes", icone: "ri-slideshow-2-line", descricao: "PowerPoint, Impress, PPTX" },
  "painel-apresentacoes": { label: "Painel Apresentacoes", icone: "ri-slideshow-2-line", descricao: "PPT/PPTX do Painel de Transparencia" },
  "slides-pdfs": { label: "PDFs dos Slides", icone: "ri-file-pdf-2-line", descricao: "PDFs anexados nos slides da home" },
  "slides-apresentacoes": { label: "Apresentacoes dos Slides", icone: "ri-slideshow-2-line", descricao: "PPT/PPTX anexados nos slides da home" },
  "transparencia-pdfs": { label: "Transparencia PDFs", icone: "ri-file-pdf-2-line", descricao: "PDFs do Portal da Transparencia" },
  "transparencia-documentos": { label: "Transparencia Documentos", icone: "ri-file-word-2-line", descricao: "DOC/DOCX do Portal da Transparencia" },
  "transparencia-planilhas": { label: "Transparencia Planilhas", icone: "ri-file-excel-2-line", descricao: "XLS/XLSX do Portal da Transparencia" },
  "transparencia-apresentacoes": { label: "Transparencia Apresentacoes", icone: "ri-slideshow-2-line", descricao: "PPT/PPTX do Portal da Transparencia" },
  "financas-pdfs": { label: "Financas PDFs", icone: "ri-file-pdf-2-line", descricao: "PDFs de Financas e Investimentos" },
  "financas-documentos": { label: "Financas Documentos", icone: "ri-file-word-2-line", descricao: "DOC/DOCX de Financas e Investimentos" },
  "financas-planilhas": { label: "Financas Planilhas", icone: "ri-file-excel-2-line", descricao: "XLS/XLSX de Financas e Investimentos" },
  "financas-apresentacoes": { label: "Financas Apresentacoes", icone: "ri-slideshow-2-line", descricao: "PPT/PPTX de Financas e Investimentos" },
  "gestores-documentos": { label: "Gestores Documentos", icone: "ri-file-list-line", descricao: "Documentos anexados aos gestores" },
  "home-atalhos": { label: "Atalhos da Home", icone: "ri-folder-shield-line", descricao: "Arquivos anexados aos atalhos da pagina inicial" },
  documentos: { label: "Documentos", icone: "ri-file-word-2-line", descricao: "Word, ODT, DOC, DOCX" },
  planilhas: { label: "Planilhas", icone: "ri-file-excel-2-line", descricao: "Excel, ODS, XLSX, CSV" },
  slides: { label: "Slides da Home", icone: "ri-gallery-line", descricao: "Imagens do carrossel" },
  noticias: { label: "Imagens Noticias", icone: "ri-newspaper-line", descricao: "Imagens para noticias" },
  eventos: { label: "Imagens Eventos", icone: "ri-calendar-event-line", descricao: "Imagens para eventos e capacitacoes" },
  avatares: { label: "Avatares", icone: "ri-user-3-line", descricao: "Fotos de perfil e gestores" },
  videos: { label: "Videos", icone: "ri-video-line", descricao: "MP4, WebM, AVI" },
  transparencia: { label: "Transparencia", icone: "ri-file-chart-line", descricao: "Arquivos do Painel de Transparencia publico" },
};

const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const imageExt = [".jpg", ".jpeg", ".png", ".webp"];
const pdfTypes = ["application/pdf"];
const pdfExt = [".pdf"];
const presentationTypes = [
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.presentation",
  "application/octet-stream",
];
const presentationExt = [".ppt", ".pptx", ".pps", ".ppsx", ".odp"];
const documentTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
  "application/zip",
  "application/x-zip-compressed",
];
const documentExt = [".pdf", ".doc", ".docx", ".odt", ".zip"];
const sheetTypes = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.oasis.opendocument.spreadsheet",
  "text/csv",
];
const sheetExt = [".xls", ".xlsx", ".ods", ".csv"];

const TIPOS_POR_PASTA: Record<PastaUpload, string[]> = {
  fotos: [...imageTypes, "image/gif"],
  avatares: imageTypes,
  slides: imageTypes,
  noticias: imageTypes,
  eventos: imageTypes,
  pdfs: pdfTypes,
  "painel-pdfs": pdfTypes,
  "slides-pdfs": pdfTypes,
  "transparencia-pdfs": pdfTypes,
  "financas-pdfs": pdfTypes,
  apresentacoes: presentationTypes,
  "painel-apresentacoes": presentationTypes,
  "slides-apresentacoes": presentationTypes,
  "transparencia-apresentacoes": presentationTypes,
  "financas-apresentacoes": presentationTypes,
  documentos: documentTypes,
  "transparencia-documentos": documentTypes,
  "financas-documentos": documentTypes,
  "gestores-documentos": [...documentTypes, ...sheetTypes, ...imageTypes],
  "home-atalhos": [...documentTypes, ...sheetTypes, ...presentationTypes],
  planilhas: sheetTypes,
  "transparencia-planilhas": sheetTypes,
  "financas-planilhas": sheetTypes,
  videos: ["video/mp4", "video/webm", "video/avi", "video/quicktime"],
  transparencia: [...pdfTypes, ...presentationTypes],
};

const EXTENSOES_POR_PASTA: Record<PastaUpload, string[]> = {
  fotos: [...imageExt, ".gif"],
  avatares: imageExt,
  slides: imageExt,
  noticias: imageExt,
  eventos: imageExt,
  pdfs: pdfExt,
  "painel-pdfs": pdfExt,
  "slides-pdfs": pdfExt,
  "transparencia-pdfs": pdfExt,
  "financas-pdfs": pdfExt,
  apresentacoes: presentationExt,
  "painel-apresentacoes": presentationExt,
  "slides-apresentacoes": presentationExt,
  "transparencia-apresentacoes": presentationExt,
  "financas-apresentacoes": presentationExt,
  documentos: documentExt,
  "transparencia-documentos": [".doc", ".docx", ".odt", ".zip"],
  "financas-documentos": [".doc", ".docx", ".odt", ".zip"],
  "gestores-documentos": [...documentExt, ...sheetExt, ...imageExt],
  "home-atalhos": [...documentExt, ...sheetExt, ...presentationExt],
  planilhas: sheetExt,
  "transparencia-planilhas": sheetExt,
  "financas-planilhas": sheetExt,
  videos: [".mp4", ".webm", ".avi", ".mov"],
  transparencia: [...pdfExt, ...presentationExt],
};

function pastaValida(pasta?: string): pasta is PastaUpload {
  return Boolean(pasta && pasta in PASTAS_INFO);
}

export function normalizarPastaUpload(pasta?: string): PastaUpload {
  return pastaValida(pasta) ? pasta : "documentos";
}

export function criarPastas(): void {
  const pastas = Object.keys(PASTAS_INFO) as PastaUpload[];
  pastas.forEach((pasta) => {
    const dir = path.join(env.upload.path, pasta);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Pasta criada: ${dir}`);
    }
  });
}

const storage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    const pasta = normalizarPastaUpload(req.query.pasta as string | undefined);
    const dir = path.resolve(env.upload.path, pasta);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const nome = `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`;
    cb(null, nome);
  },
});

function filtroArquivo(req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  const pasta = normalizarPastaUpload(req.query.pasta as string | undefined);
  const tiposPermitidos = TIPOS_POR_PASTA[pasta] ?? ["application/pdf"];
  const extensoesPermitidas = EXTENSOES_POR_PASTA[pasta] ?? [".pdf"];
  const extensao = path.extname(file.originalname).toLowerCase();

  if (tiposPermitidos.includes(file.mimetype) || extensoesPermitidas.includes(extensao)) {
    cb(null, true);
    return;
  }

  cb(new Error(`Arquivo "${file.originalname}" nao permitido na pasta "${pasta}". Aceitos: ${extensoesPermitidas.join(", ")}`));
}

export const upload = multer({
  storage,
  fileFilter: filtroArquivo,
  limits: {
    fileSize: env.upload.maxSizeMb * 1024 * 1024,
  },
});

export const uploadUnico = upload.single("arquivo");
export const uploadMultiplo = upload.array("arquivos", 20);

export function urlPublica(caminho: string, _req: Request): string {
  const relativo = path.relative(path.resolve(env.upload.path), caminho).replace(/\\/g, "/");
  return `/uploads/${relativo}`;
}

export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
