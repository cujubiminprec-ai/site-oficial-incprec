import { useState, useRef, useCallback, useEffect } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { getToken } from "@/services/api";

// ============================================================
// Tipos
// ============================================================
type PastaId =
  | "fotos"
  | "pdfs"
  | "slides-pdfs"
  | "slides-apresentacoes"
  | "painel-pdfs"
  | "painel-apresentacoes"
  | "transparencia-pdfs"
  | "transparencia-documentos"
  | "transparencia-planilhas"
  | "transparencia-apresentacoes"
  | "financas-pdfs"
  | "financas-documentos"
  | "financas-planilhas"
  | "financas-apresentacoes"
  | "gestores-documentos"
  | "apresentacoes"
  | "documentos"
  | "planilhas"
  | "slides"
  | "noticias"
  | "avatares"
  | "videos";

interface PastaInfo {
  id: PastaId;
  label: string;
  icone: string;
  descricao: string;
  aceitos: string;
  mimes: string[];
  cor: string;
}

interface Arquivo {
  id: number;
  nome_original: string;
  nome_storage: string;
  pasta: PastaId;
  url_publica: string;
  tipo_mime: string;
  tamanho_bytes: number;
  criado_em: string;
}

// ============================================================
// Config das pastas
// ============================================================
const PASTAS: PastaInfo[] = [
  {
    id: "fotos",
    label: "Fotos",
    icone: "ri-image-line",
    descricao: "Imagens gerais do site",
    aceitos: ".jpg, .jpeg, .png, .webp, .gif",
    mimes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    cor: "#0891B2",
  },
  {
    id: "pdfs",
    label: "PDFs",
    icone: "ri-file-pdf-2-line",
    descricao: "Documentos em formato PDF",
    aceitos: ".pdf",
    mimes: ["application/pdf"],
    cor: "#DC2626",
  },
  {
    id: "slides-pdfs",
    label: "Slides PDFs",
    icone: "ri-file-pdf-2-line",
    descricao: "PDFs dos slides da home",
    aceitos: ".pdf",
    mimes: ["application/pdf"],
    cor: "#B91C1C",
  },
  {
    id: "slides-apresentacoes",
    label: "Slides PPTX",
    icone: "ri-slideshow-2-line",
    descricao: "PPT/PPTX dos slides da home",
    aceitos: ".ppt, .pptx, .odp",
    mimes: ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.oasis.opendocument.presentation"],
    cor: "#D97706",
  },
  {
    id: "painel-pdfs",
    label: "Painel PDFs",
    icone: "ri-file-pdf-2-line",
    descricao: "PDFs do Painel de Transparência da home",
    aceitos: ".pdf",
    mimes: ["application/pdf"],
    cor: "#DC2626",
  },
  {
    id: "painel-apresentacoes",
    label: "Painel PPTX",
    icone: "ri-slideshow-2-line",
    descricao: "PPT/PPTX do Painel de Transparência da home",
    aceitos: ".ppt, .pptx, .odp",
    mimes: ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.oasis.opendocument.presentation"],
    cor: "#D97706",
  },
  {
    id: "apresentacoes",
    label: "Apresentações",
    icone: "ri-slideshow-2-line",
    descricao: "PowerPoint, Impress, PPTX",
    aceitos: ".ppt, .pptx, .odp",
    mimes: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.oasis.opendocument.presentation",
    ],
    cor: "#D97706",
  },
  {
    id: "documentos",
    label: "Documentos",
    icone: "ri-file-word-2-line",
    descricao: "Word, DOC, DOCX, ODT",
    aceitos: ".doc, .docx, .odt, .pdf",
    mimes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.oasis.opendocument.text",
    ],
    cor: "#1D4ED8",
  },
  {
    id: "transparencia-pdfs",
    label: "Transp. PDFs",
    icone: "ri-file-pdf-2-line",
    descricao: "PDFs do Portal da Transparência",
    aceitos: ".pdf",
    mimes: ["application/pdf"],
    cor: "#059669",
  },
  {
    id: "transparencia-documentos",
    label: "Transp. Docs",
    icone: "ri-file-word-2-line",
    descricao: "Documentos do Portal da Transparência",
    aceitos: ".doc, .docx, .odt, .zip",
    mimes: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.oasis.opendocument.text", "application/zip"],
    cor: "#047857",
  },
  {
    id: "transparencia-planilhas",
    label: "Transp. Planilhas",
    icone: "ri-file-excel-2-line",
    descricao: "Planilhas do Portal da Transparência",
    aceitos: ".xls, .xlsx, .ods, .csv",
    mimes: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.oasis.opendocument.spreadsheet", "text/csv"],
    cor: "#16A34A",
  },
  {
    id: "transparencia-apresentacoes",
    label: "Transp. PPTX",
    icone: "ri-slideshow-2-line",
    descricao: "Apresentações do Portal da Transparência",
    aceitos: ".ppt, .pptx, .odp",
    mimes: ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.oasis.opendocument.presentation"],
    cor: "#CA8A04",
  },
  {
    id: "financas-pdfs",
    label: "Finanças PDFs",
    icone: "ri-file-pdf-2-line",
    descricao: "PDFs de Finanças e Investimentos",
    aceitos: ".pdf",
    mimes: ["application/pdf"],
    cor: "#BE123C",
  },
  {
    id: "financas-documentos",
    label: "Finanças Docs",
    icone: "ri-file-word-2-line",
    descricao: "Documentos de Finanças e Investimentos",
    aceitos: ".doc, .docx, .odt, .zip",
    mimes: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.oasis.opendocument.text", "application/zip"],
    cor: "#1D4ED8",
  },
  {
    id: "financas-planilhas",
    label: "Finanças Planilhas",
    icone: "ri-file-excel-2-line",
    descricao: "Planilhas de Finanças e Investimentos",
    aceitos: ".xls, .xlsx, .ods, .csv",
    mimes: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.oasis.opendocument.spreadsheet", "text/csv"],
    cor: "#15803D",
  },
  {
    id: "financas-apresentacoes",
    label: "Finanças PPTX",
    icone: "ri-slideshow-2-line",
    descricao: "Apresentações de Finanças e Investimentos",
    aceitos: ".ppt, .pptx, .odp",
    mimes: ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.oasis.opendocument.presentation"],
    cor: "#C2410C",
  },
  {
    id: "gestores-documentos",
    label: "Gestores Docs",
    icone: "ri-file-list-line",
    descricao: "Documentos anexados aos gestores",
    aceitos: ".pdf, .doc, .docx, .xls, .xlsx, .jpg, .png",
    mimes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "image/jpeg", "image/png", "image/webp"],
    cor: "#7C3AED",
  },
  {
    id: "planilhas",
    label: "Planilhas",
    icone: "ri-file-excel-2-line",
    descricao: "Excel, XLSX, ODS, CSV",
    aceitos: ".xls, .xlsx, .ods, .csv",
    mimes: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.oasis.opendocument.spreadsheet",
      "text/csv",
    ],
    cor: "#059669",
  },
  {
    id: "slides",
    label: "Slides da Home",
    icone: "ri-gallery-line",
    descricao: "Imagens do carrossel da home",
    aceitos: ".jpg, .jpeg, .png, .webp",
    mimes: ["image/jpeg", "image/png", "image/webp"],
    cor: "#7C3AED",
  },
  {
    id: "noticias",
    label: "Imagens Notícias",
    icone: "ri-newspaper-line",
    descricao: "Imagens para artigos e notícias",
    aceitos: ".jpg, .jpeg, .png, .webp",
    mimes: ["image/jpeg", "image/png", "image/webp"],
    cor: "#6D28D9",
  },
  {
    id: "avatares",
    label: "Avatares",
    icone: "ri-user-3-line",
    descricao: "Fotos de perfil e gestores",
    aceitos: ".jpg, .jpeg, .png, .webp",
    mimes: ["image/jpeg", "image/png", "image/webp"],
    cor: "#0F766E",
  },
  {
    id: "videos",
    label: "Vídeos",
    icone: "ri-video-line",
    descricao: "MP4, WebM, AVI",
    aceitos: ".mp4, .webm, .avi, .mov",
    mimes: ["video/mp4", "video/webm", "video/avi", "video/quicktime"],
    cor: "#BE185D",
  },
];

// ============================================================
// Utilitários
// ============================================================
function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function extensao(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "JPG",
    "image/png": "PNG",
    "image/webp": "WEBP",
    "image/gif": "GIF",
    "application/pdf": "PDF",
    "application/vnd.ms-powerpoint": "PPT",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
    "application/vnd.oasis.opendocument.presentation": "ODP",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/vnd.oasis.opendocument.text": "ODT",
    "application/vnd.ms-excel": "XLS",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "application/vnd.oasis.opendocument.spreadsheet": "ODS",
    "text/csv": "CSV",
    "video/mp4": "MP4",
    "video/webm": "WEBM",
    "video/avi": "AVI",
    "video/quicktime": "MOV",
  };
  return map[mime] ?? "ARQ";
}

function iconeArquivo(mime: string): string {
  if (mime.startsWith("image/")) return "ri-image-2-line";
  if (mime === "application/pdf") return "ri-file-pdf-2-line";
  if (mime.includes("powerpoint") || mime.includes("presentationml") || mime.includes("opendocument.presentation")) return "ri-slideshow-2-line";
  if (mime.includes("word") || mime.includes("wordprocessing") || mime.includes("opendocument.text")) return "ri-file-word-2-line";
  if (mime.includes("excel") || mime.includes("spreadsheet") || mime.includes("csv")) return "ri-file-excel-2-line";
  if (mime.startsWith("video/")) return "ri-video-line";
  return "ri-file-line";
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// ============================================================
// Componente principal
// ============================================================
export default function GerenciadorArquivosTab() {
  const { config } = useSiteConfig();
  const [pastaSelecionada, setPastaSelecionada] = useState<PastaId>("fotos");
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [urlCopiada, setUrlCopiada] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [busca, setBusca] = useState("");
  const [modoGrid, setModoGrid] = useState(true);
  const [arquivoPreview, setArquivoPreview] = useState<Arquivo | null>(null);
  const [backendOffline, setBackendOffline] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pastaAtual = PASTAS.find((p) => p.id === pastaSelecionada)!;

  // ── Carregar arquivos da pasta ──────────────────────────────
  const carregarArquivos = useCallback(async (pasta: PastaId) => {
    setCarregandoLista(true);
    setErro(null);
    try {
      const token = getToken();
      const resp = await fetch(`${API_URL}/upload?pasta=${pasta}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error("Erro ao listar arquivos.");
      const json = await resp.json() as { sucesso: boolean; dados: Arquivo[] };
      if (json.sucesso) {
        setArquivos(json.dados);
        setBackendOffline(false);
      }
    } catch (err) {
      setArquivos([]);
      const isOffline = err instanceof TypeError &&
        (String(err.message).includes("fetch") || String(err.message).includes("network"));
      if (isOffline) setBackendOffline(true);
    } finally {
      setCarregandoLista(false);
    }
  }, []);

  // Carrega pasta inicial ao montar o componente
  useEffect(() => {
    carregarArquivos(pastaSelecionada);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selecionarPasta = (p: PastaId) => {
    setPastaSelecionada(p);
    setBusca("");
    carregarArquivos(p);
  };

  // ── Upload de arquivos ──────────────────────────────────────
  const fazerUpload = async (files: FileList | File[]) => {
    const lista = Array.from(files);
    if (lista.length === 0) return;

    setCarregando(true);
    setErro(null);
    setSucesso(null);
    setProgresso(0);

    let enviados = 0;
    const erros: string[] = [];

    for (const file of lista) {
      // Valida tipo
      if (!pastaAtual.mimes.includes(file.type)) {
        erros.push(`"${file.name}" — tipo não permitido nesta pasta (${pastaAtual.aceitos})`);
        continue;
      }

      try {
        const token = getToken();
        const form = new FormData();
        form.append("arquivo", file);

        const resp = await fetch(`${API_URL}/upload?pasta=${pastaSelecionada}`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: form,
        });

        if (resp.ok) {
          enviados++;
          setProgresso(Math.round((enviados / lista.length) * 100));
        } else {
          const json = await resp.json() as { mensagem?: string };
          erros.push(`"${file.name}" — ${json.mensagem ?? "Erro desconhecido"}`);
        }
      } catch (uploadErr) {
        const isOffline = uploadErr instanceof TypeError &&
          (String(uploadErr.message).includes("fetch") || String(uploadErr.message).includes("network"));
        if (isOffline) {
          setBackendOffline(true);
          erros.push(`"${file.name}" — Servidor offline. Inicie o backend Node.js para habilitar o upload.`);
        } else {
          erros.push(`"${file.name}" — Falha na conexão com o servidor`);
        }
      }
    }

    setCarregando(false);
    setProgresso(0);

    if (enviados > 0) {
      setSucesso(
        `${enviados} arquivo${enviados > 1 ? "s enviados" : " enviado"} com sucesso!`
      );
      setTimeout(() => setSucesso(null), 4000);
      carregarArquivos(pastaSelecionada);
    }

    if (erros.length > 0) {
      setErro(erros.join(" | "));
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Copiar URL ──────────────────────────────────────────────
  const copiarUrl = async (arquivo: Arquivo) => {
    await navigator.clipboard.writeText(arquivo.url_publica);
    setUrlCopiada(arquivo.id);
    setTimeout(() => setUrlCopiada(null), 2000);
  };

  // ── Excluir arquivo ─────────────────────────────────────────
  const excluirArquivo = async (arquivo: Arquivo) => {
    if (!confirm(`Excluir "${arquivo.nome_original}"? Esta ação não pode ser desfeita.`)) return;
    try {
      const token = getToken();
      const resp = await fetch(`${API_URL}/upload/${arquivo.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (resp.ok) {
        setArquivos((prev) => prev.filter((a) => a.id !== arquivo.id));
        if (arquivoPreview?.id === arquivo.id) setArquivoPreview(null);
        setSucesso("Arquivo excluído.");
        setTimeout(() => setSucesso(null), 3000);
      } else {
        throw new Error("Erro ao excluir.");
      }
    } catch {
      setErro("Não foi possível excluir o arquivo.");
    }
  };

  // ── Drag and Drop ────────────────────────────────────────────
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      fazerUpload(e.dataTransfer.files);
    }
  };

  // ── Filtro por busca ─────────────────────────────────────────
  const arquivosFiltrados = arquivos.filter((a) =>
    a.nome_original.toLowerCase().includes(busca.toLowerCase())
  );

  const isImagem = (mime: string) => mime.startsWith("image/");

  return (
    <div className="flex h-full gap-6">
      {/* ── Sidebar de pastas ─────────────────────── */}
      <div className="w-56 flex-shrink-0">
        <h2
          className="text-lg font-bold text-gray-900 mb-4"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Gerenciador
        </h2>
        <p className="text-xs text-gray-400 mb-3">Selecione a pasta para visualizar e enviar arquivos.</p>
        <div className="flex flex-col gap-1">
          {PASTAS.map((pasta) => (
            <button
              key={pasta.id}
              onClick={() => selecionarPasta(pasta.id)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left cursor-pointer transition-all w-full"
              style={
                pastaSelecionada === pasta.id
                  ? { backgroundColor: `${pasta.cor}18`, color: pasta.cor }
                  : { color: "#6B7280" }
              }
            >
              <div
                className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
                style={
                  pastaSelecionada === pasta.id
                    ? { backgroundColor: `${pasta.cor}25` }
                    : { backgroundColor: "#F3F4F6" }
                }
              >
                <i className={`${pasta.icone} text-sm`} style={pastaSelecionada === pasta.id ? { color: pasta.cor } : { color: "#9CA3AF" }}></i>
              </div>
              <span className="truncate">{pasta.label}</span>
            </button>
          ))}
        </div>

        {/* Dica */}
        <div
          className="mt-5 p-3 rounded-xl text-xs leading-relaxed"
          style={{ backgroundColor: `${config.primaryColor}08`, borderLeft: `3px solid ${config.primaryColor}` }}
        >
          <p className="font-semibold mb-1" style={{ color: config.primaryColor }}>Como usar</p>
          <p className="text-gray-500">Selecione a pasta, arraste os arquivos ou clique em "Enviar". Os arquivos ficam salvos no servidor e você pode copiar o link para usar em qualquer lugar do site.</p>
        </div>
      </div>

      {/* ── Área principal ──────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Cabeçalho da pasta */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ backgroundColor: `${pastaAtual.cor}20` }}
            >
              <i className={`${pastaAtual.icone} text-lg`} style={{ color: pastaAtual.cor }}></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {pastaAtual.label}
              </h1>
              <p className="text-xs text-gray-400">{pastaAtual.descricao} · Aceita: {pastaAtual.aceitos}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Busca */}
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar arquivo..."
                className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none w-40"
              />
            </div>
            {/* Modo grid/lista */}
            <button
              onClick={() => setModoGrid(true)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${modoGrid ? "text-white" : "text-gray-400 hover:bg-gray-100"}`}
              style={modoGrid ? { backgroundColor: config.primaryColor } : {}}
            >
              <i className="ri-grid-line text-sm"></i>
            </button>
            <button
              onClick={() => setModoGrid(false)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${!modoGrid ? "text-white" : "text-gray-400 hover:bg-gray-100"}`}
              style={!modoGrid ? { backgroundColor: config.primaryColor } : {}}
            >
              <i className="ri-list-unordered text-sm"></i>
            </button>
            {/* Upload */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={pastaAtual.aceitos.split(", ").join(",")}
              className="hidden"
              onChange={(e) => e.target.files && fazerUpload(e.target.files)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={carregando}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
              style={{ backgroundColor: pastaAtual.cor }}
            >
              <i className="ri-upload-2-line text-sm"></i>
              {carregando ? "Enviando..." : "Enviar Arquivos"}
            </button>
          </div>
        </div>

        {/* Banner modo offline/demo */}
        {backendOffline && (
          <div className="mb-3 px-4 py-3 rounded-xl flex items-start gap-3" style={{ backgroundColor: "#FEF3C7", border: "1px solid #FDE68A" }}>
            <i className="ri-wifi-off-line text-amber-500 text-lg flex-shrink-0 mt-0.5"></i>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Modo demo — backend offline</p>
              <p className="text-xs text-amber-700 mt-0.5">
                O servidor de arquivos não está acessível neste momento. O upload e a listagem de arquivos requerem o backend Node.js em execução. Em produção, mantenha o backend ativo pelo PM2 e o Nginx apontando para /api e /uploads.
              </p>
            </div>
          </div>
        )}

        {/* Feedback */}
        {sucesso && (
          <div className="mb-3 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
            <i className="ri-checkbox-circle-line"></i> {sucesso}
          </div>
        )}
        {erro && (
          <div className="mb-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-2">
            <i className="ri-error-warning-line mt-0.5 flex-shrink-0"></i>
            <span>{erro}</span>
            <button onClick={() => setErro(null)} className="ml-auto flex-shrink-0 cursor-pointer">
              <i className="ri-close-line"></i>
            </button>
          </div>
        )}

        {/* Barra de progresso */}
        {carregando && progresso > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Enviando arquivos...</span>
              <span>{progresso}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progresso}%`, backgroundColor: pastaAtual.cor }}
              ></div>
            </div>
          </div>
        )}

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="mb-4 border-2 border-dashed rounded-2xl px-6 py-5 flex items-center gap-4 cursor-pointer transition-all"
          style={{
            borderColor: dragging ? pastaAtual.cor : "#E5E7EB",
            backgroundColor: dragging ? `${pastaAtual.cor}08` : "#FAFAFA",
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div
            className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ backgroundColor: `${pastaAtual.cor}15` }}
          >
            <i className={`${dragging ? "ri-drag-drop-line" : "ri-upload-cloud-2-line"} text-2xl`} style={{ color: pastaAtual.cor }}></i>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">
              {dragging ? "Solte os arquivos aqui!" : "Arraste arquivos aqui ou clique para selecionar"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Aceita: <strong>{pastaAtual.aceitos}</strong> · Máximo 50 MB por arquivo · Vários ao mesmo tempo
            </p>
          </div>
        </div>

        {/* Lista/Grid de arquivos */}
        {carregandoLista ? (
          <div className="text-center py-16 text-gray-400">
            <i className="ri-loader-4-line text-3xl animate-spin block mb-3"></i>
            <p className="text-sm">Carregando arquivos...</p>
          </div>
        ) : arquivosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div
              className="w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-4"
              style={{ backgroundColor: `${pastaAtual.cor}15` }}
            >
              <i className={`${pastaAtual.icone} text-3xl`} style={{ color: pastaAtual.cor }}></i>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              {busca ? "Nenhum arquivo encontrado" : "Pasta vazia"}
            </p>
            <p className="text-xs text-gray-400">
              {busca ? "Tente outro termo de busca." : "Envie arquivos clicando no botão ou arrastando para cá."}
            </p>
          </div>
        ) : modoGrid ? (
          /* ── Grid View ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {arquivosFiltrados.map((arquivo) => (
              <div
                key={arquivo.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden group cursor-pointer hover:border-gray-200 transition-all"
                onClick={() => setArquivoPreview(arquivo)}
              >
                {/* Thumbnail */}
                <div className="h-28 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                  {isImagem(arquivo.tipo_mime) ? (
                    <img
                      src={arquivo.url_publica}
                      alt={arquivo.nome_original}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div
                      className="w-14 h-14 flex items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${pastaAtual.cor}15` }}
                    >
                      <i className={`${iconeArquivo(arquivo.tipo_mime)} text-3xl`} style={{ color: pastaAtual.cor }}></i>
                    </div>
                  )}
                  {/* Overlay de ações */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); copiarUrl(arquivo); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/90 cursor-pointer hover:bg-white"
                      title="Copiar link"
                    >
                      <i className={`${urlCopiada === arquivo.id ? "ri-checkbox-circle-line text-green-500" : "ri-link text-gray-700"} text-sm`}></i>
                    </button>
                    <a
                      href={arquivo.url_publica}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/90 cursor-pointer hover:bg-white"
                      title="Abrir arquivo"
                    >
                      <i className="ri-external-link-line text-sm text-gray-700"></i>
                    </a>
                    <button
                      onClick={(e) => { e.stopPropagation(); excluirArquivo(arquivo); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/90 cursor-pointer hover:bg-red-50"
                      title="Excluir"
                    >
                      <i className="ri-delete-bin-line text-sm text-red-500"></i>
                    </button>
                  </div>
                  {/* Badge de tipo */}
                  <span
                    className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: pastaAtual.cor }}
                  >
                    {extensao(arquivo.tipo_mime)}
                  </span>
                </div>
                {/* Info */}
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-800 truncate" title={arquivo.nome_original}>
                    {arquivo.nome_original}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {formatarTamanho(arquivo.tamanho_bytes)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── List View ── */
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {arquivosFiltrados.map((arquivo, idx) => (
              <div
                key={arquivo.id}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${idx < arquivosFiltrados.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <div
                  className="w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${pastaAtual.cor}15` }}
                >
                  {isImagem(arquivo.tipo_mime) ? (
                    <img
                      src={arquivo.url_publica}
                      alt=""
                      className="w-full h-full rounded-lg object-cover object-top"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <i className={`${iconeArquivo(arquivo.tipo_mime)} text-sm`} style={{ color: pastaAtual.cor }}></i>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{arquivo.nome_original}</p>
                  <p className="text-xs text-gray-400">
                    {extensao(arquivo.tipo_mime)} · {formatarTamanho(arquivo.tamanho_bytes)} ·{" "}
                    {new Date(arquivo.criado_em).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => copiarUrl(arquivo)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors hover:bg-gray-100 whitespace-nowrap"
                    style={{ color: urlCopiada === arquivo.id ? "#059669" : config.primaryColor }}
                  >
                    <i className={`${urlCopiada === arquivo.id ? "ri-checkbox-circle-line" : "ri-link"} text-xs`}></i>
                    {urlCopiada === arquivo.id ? "Copiado!" : "Copiar link"}
                  </button>
                  <a
                    href={arquivo.url_publica}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
                    title="Abrir arquivo"
                  >
                    <i className="ri-external-link-line text-sm"></i>
                  </a>
                  <button
                    onClick={() => excluirArquivo(arquivo)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
                    title="Excluir arquivo"
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contador */}
        {arquivosFiltrados.length > 0 && (
          <p className="text-xs text-gray-400 mt-3 text-right">
            {arquivosFiltrados.length} arquivo{arquivosFiltrados.length !== 1 ? "s" : ""} em <strong>{pastaAtual.label}</strong>
          </p>
        )}
      </div>

      {/* ── Modal de Preview ──────────────────────── */}
      {arquivoPreview && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setArquivoPreview(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div
                className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                style={{ backgroundColor: `${pastaAtual.cor}15` }}
              >
                <i className={`${iconeArquivo(arquivoPreview.tipo_mime)} text-sm`} style={{ color: pastaAtual.cor }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{arquivoPreview.nome_original}</p>
                <p className="text-xs text-gray-400">
                  {extensao(arquivoPreview.tipo_mime)} · {formatarTamanho(arquivoPreview.tamanho_bytes)} ·{" "}
                  {new Date(arquivoPreview.criado_em).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <button
                onClick={() => setArquivoPreview(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer flex-shrink-0"
              >
                <i className="ri-close-line text-gray-400"></i>
              </button>
            </div>

            {/* Preview content */}
            <div className="flex-1 overflow-auto p-5">
              {isImagem(arquivoPreview.tipo_mime) ? (
                <img
                  src={arquivoPreview.url_publica}
                  alt={arquivoPreview.nome_original}
                  className="w-full rounded-xl object-contain max-h-96"
                />
              ) : arquivoPreview.tipo_mime === "application/pdf" ? (
                <iframe
                  src={arquivoPreview.url_publica}
                  className="w-full h-96 rounded-xl border border-gray-100"
                  title={arquivoPreview.nome_original}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div
                    className="w-20 h-20 flex items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${pastaAtual.cor}15` }}
                  >
                    <i className={`${iconeArquivo(arquivoPreview.tipo_mime)} text-4xl`} style={{ color: pastaAtual.cor }}></i>
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Pré-visualização não disponível para este tipo de arquivo.
                  </p>
                  <a
                    href={arquivoPreview.url_publica}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90"
                    style={{ backgroundColor: pastaAtual.cor }}
                  >
                    <i className="ri-download-2-line"></i> Baixar arquivo
                  </a>
                </div>
              )}
            </div>

            {/* Footer com link */}
            <div className="px-5 pb-5 pt-3 border-t border-gray-50">
              <p className="text-xs font-semibold text-gray-500 mb-2">Link público do arquivo:</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-xs font-mono text-gray-600 overflow-hidden truncate border border-gray-100">
                  {arquivoPreview.url_publica}
                </div>
                <button
                  onClick={() => copiarUrl(arquivoPreview)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors"
                  style={
                    urlCopiada === arquivoPreview.id
                      ? { backgroundColor: "#DCFCE7", color: "#059669" }
                      : { backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }
                  }
                >
                  <i className={`${urlCopiada === arquivoPreview.id ? "ri-checkbox-circle-line" : "ri-file-copy-line"} text-xs`}></i>
                  {urlCopiada === arquivoPreview.id ? "Copiado!" : "Copiar link"}
                </button>
                <a
                  href={arquivoPreview.url_publica}
                  download
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap text-white hover:opacity-90"
                  style={{ backgroundColor: pastaAtual.cor }}
                >
                  <i className="ri-download-2-line text-xs"></i> Baixar
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
