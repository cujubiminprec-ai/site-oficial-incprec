import { useState } from "react";
import { BlocoConteudo, BlocoTipo, PaginaConteudo, paginasConteudoDefault } from "@/mocks/paginas-conteudo";
import BlocoEditor from "./BlocoEditor";
import PreviewBlocos from "./PreviewBlocos";
import { PageItem } from "@/pages/admin/tabs/PaginasTab";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

const STORAGE_KEY = "inprec_paginas_conteudo";

function loadConteudo(): PaginaConteudo[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : paginasConteudoDefault;
  } catch {
    return paginasConteudoDefault;
  }
}

function saveConteudo(list: PaginaConteudo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const BLOCOS_DISPONIVEIS: { tipo: BlocoTipo; label: string; icone: string; desc: string }[] = [
  { tipo: "hero", label: "Hero / Banner", icone: "ri-layout-top-2-line", desc: "Cabeçalho com título e imagem de fundo" },
  { tipo: "texto", label: "Bloco de Texto", icone: "ri-text", desc: "Parágrafo de texto com título opcional" },
  { tipo: "lista", label: "Lista de Itens", icone: "ri-list-check", desc: "Tópicos em formato de lista" },
  { tipo: "colunas", label: "3 Colunas", icone: "ri-layout-column-line", desc: "Seção com três colunas lado a lado" },
  { tipo: "aviso", label: "Caixa de Aviso", icone: "ri-alert-line", desc: "Destaque colorido para informações" },
  { tipo: "cta", label: "Botão / CTA", icone: "ri-cursor-line", desc: "Chamada para ação com botão" },
  { tipo: "imagem", label: "Imagem", icone: "ri-image-line", desc: "Imagem com legenda" },
  { tipo: "divisor", label: "Divisor", icone: "ri-separator", desc: "Linha separadora entre seções" },
];

interface EditorConteudoPaginaProps {
  page: PageItem;
  onBack: () => void;
}

export default function EditorConteudoPagina({ page, onBack }: EditorConteudoPaginaProps) {
  const { config } = useSiteConfig();
  const primaryColor = config.primaryColor;
  const [allConteudo, setAllConteudo] = useState<PaginaConteudo[]>(loadConteudo);
  const [showAddBloco, setShowAddBloco] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewAtivo, setPreviewAtivo] = useState(true);
  const [modoView, setModoView] = useState<"split" | "editor" | "preview">("split");

  const paginaConteudo = allConteudo.find(p => p.pageId === page.id) || { pageId: page.id, blocos: [] };
  const blocos = paginaConteudo.blocos;

  const persist = (novosBlocos: BlocoConteudo[]) => {
    const updated = allConteudo.filter(p => p.pageId !== page.id);
    const nova: PaginaConteudo = {
      pageId: page.id,
      blocos: novosBlocos,
      ultimaEdicao: new Date().toISOString().split("T")[0],
    };
    const final = [...updated, nova];
    setAllConteudo(final);
    saveConteudo(final);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleChangeBloco = (index: number, bloco: BlocoConteudo) => {
    const novo = [...blocos];
    novo[index] = bloco;
    persist(novo);
  };

  const handleDeleteBloco = (index: number) => {
    persist(blocos.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const novo = [...blocos];
    [novo[index - 1], novo[index]] = [novo[index], novo[index - 1]];
    persist(novo);
  };

  const handleMoveDown = (index: number) => {
    if (index === blocos.length - 1) return;
    const novo = [...blocos];
    [novo[index], novo[index + 1]] = [novo[index + 1], novo[index]];
    persist(novo);
  };

  const handleAddBloco = (tipo: BlocoTipo) => {
    const id = `bloco-${Date.now()}`;
    const novoBloco: BlocoConteudo = {
      id,
      tipo,
      titulo: "",
      texto: "",
      itens: tipo === "lista" ? [""] : undefined,
      colunas: tipo === "colunas" ? [
        { titulo: "", texto: "", icone: "" },
        { titulo: "", texto: "", icone: "" },
        { titulo: "", texto: "", icone: "" },
      ] : undefined,
      alinhamento: tipo === "hero" ? "center" : undefined,
    };
    persist([...blocos, novoBloco]);
    setShowAddBloco(false);
  };

  const showEditor = modoView === "split" || modoView === "editor";
  const showPreview = (modoView === "split" || modoView === "preview") && previewAtivo;

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors flex-shrink-0">
          <i className="ri-arrow-left-line text-gray-500 text-sm"></i>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900 truncate" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Editar Conteúdo
            </h1>
            <span className="text-sm text-gray-400">—</span>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0"
                style={{ backgroundColor: `${primaryColor}15` }}>
                <i className={`${page.icone} text-xs`} style={{ color: primaryColor }}></i>
              </div>
              <span className="text-sm font-semibold text-gray-700">{page.nome}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400 font-mono">{page.rota}</span>
            {paginaConteudo.ultimaEdicao && (
              <span className="text-xs text-gray-300">
                · Última edição: {new Date(paginaConteudo.ultimaEdicao + "T12:00:00").toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        </div>

        {/* Controles de view */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl flex-shrink-0">
          {([
            { key: "editor", icon: "ri-edit-2-line", label: "Editor" },
            { key: "split", icon: "ri-layout-column-line", label: "Split" },
            { key: "preview", icon: "ri-eye-line", label: "Prévia" },
          ] as const).map(v => (
            <button key={v.key} onClick={() => { setModoView(v.key); setPreviewAtivo(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
              style={modoView === v.key
                ? { backgroundColor: "white", color: primaryColor }
                : { color: "#9CA3AF" }}>
              <i className={`${v.icon} text-xs`}></i>
              {v.label}
            </button>
          ))}
        </div>

        <a href={page.rota} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors flex-shrink-0">
          <i className="ri-external-link-line text-sm"></i> Ver página
        </a>
      </div>

      {/* Feedback salvo */}
      {saved && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Salvo automaticamente!
        </div>
      )}

      {/* Info */}
      <div className="mb-4 px-4 py-3 rounded-xl flex items-start gap-3"
        style={{ backgroundColor: `${primaryColor}08`, border: `1px solid ${primaryColor}20` }}>
        <i className="ri-information-line text-sm mt-0.5 flex-shrink-0" style={{ color: primaryColor }}></i>
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong className="text-gray-800">Edite o conteúdo desta página</strong> adicionando, reordenando e removendo blocos.
          Use <strong>Split</strong> para ver o editor e a prévia ao mesmo tempo. As alterações são salvas automaticamente.
        </p>
      </div>

      {/* ── Área principal split ─────────────────────── */}
      <div className={`flex gap-4 flex-1 min-h-0 ${modoView === "split" ? "items-start" : ""}`}>

        {/* Coluna Editor */}
        {showEditor && (
          <div className={`flex flex-col gap-3 ${modoView === "split" ? "w-1/2" : "w-full"} min-w-0`}>

            {blocos.length === 0 && (
              <div className="text-center py-14 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                <i className="ri-layout-2-line text-4xl block mb-3 text-gray-300"></i>
                <p className="text-sm font-semibold text-gray-500">Esta página ainda não tem conteúdo</p>
                <p className="text-xs mt-1">Adicione blocos abaixo para começar a editar</p>
              </div>
            )}

            {blocos.map((bloco, index) => (
              <BlocoEditor
                key={bloco.id}
                bloco={bloco}
                index={index}
                total={blocos.length}
                primaryColor={primaryColor}
                onChange={(b) => handleChangeBloco(index, b)}
                onDelete={() => handleDeleteBloco(index)}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
              />
            ))}

            {/* Botão adicionar bloco */}
            <button
              onClick={() => setShowAddBloco(true)}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold border-2 border-dashed cursor-pointer hover:opacity-80 transition-all flex items-center justify-center gap-2"
              style={{ borderColor: primaryColor, color: primaryColor, backgroundColor: `${primaryColor}05` }}>
              <i className="ri-add-line text-base"></i> Adicionar Bloco de Conteúdo
            </button>
          </div>
        )}

        {/* Coluna Preview ao vivo */}
        {showPreview && (
          <div className={`${modoView === "split" ? "w-1/2" : "w-full"} flex-shrink-0`}>
            <div className="sticky top-4">
              {/* Header do preview */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-xs font-semibold text-gray-500">Prévia ao Vivo</span>
                </div>
                <span className="text-[10px] text-gray-300">Atualiza a cada alteração</span>
              </div>

              {/* Frame do preview */}
              <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white"
                style={{ maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}>
                <PreviewBlocos
                  blocos={blocos}
                  primaryColor={primaryColor}
                  secondaryColor={config.secondaryColor}
                  pageName={page.nome}
                />
              </div>

              {/* Stats */}
              <div className="mt-2 flex items-center gap-4 px-1">
                <span className="text-[10px] text-gray-400">
                  <i className="ri-stack-line mr-1"></i>{blocos.length} bloco{blocos.length !== 1 ? "s" : ""}
                </span>
                <span className="text-[10px] text-gray-400">
                  <i className="ri-save-line mr-1"></i>Auto-salvo
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: escolher tipo de bloco */}
      {showAddBloco && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && setShowAddBloco(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Adicionar Bloco
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Escolha o tipo de conteúdo</p>
              </div>
              <button onClick={() => setShowAddBloco(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-400"></i>
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {BLOCOS_DISPONIVEIS.map(b => (
                <button key={b.tipo} onClick={() => handleAddBloco(b.tipo)}
                  className="flex items-start gap-3 p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-300 cursor-pointer transition-all text-left group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 transition-colors"
                    style={{ backgroundColor: `${primaryColor}10` }}>
                    <i className={`${b.icone} text-base`} style={{ color: primaryColor }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800">{b.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{b.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
