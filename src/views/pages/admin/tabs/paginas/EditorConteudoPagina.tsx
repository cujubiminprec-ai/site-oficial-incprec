import { useEffect, useRef, useState } from "react";
import { BlocoConteudo, BlocoTipo, PaginaConteudo, paginasConteudoDefault } from "@/mocks/paginas-conteudo";
import BlocoEditor from "./BlocoEditor";
import PreviewBlocos from "./PreviewBlocos";
import { PageItem } from "@/pages/admin/tabs/PaginasTab";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { paginasService } from "@/services/paginas.service";
import { notifyPageContentUpdated } from "@/hooks/usePageContent";

function defaultPaginaConteudo(pageId: string): PaginaConteudo {
  return paginasConteudoDefault.find((item) => item.pageId === pageId) || { pageId, blocos: [] };
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
  onPageUpdated?: (page: PageItem) => void;
}

export default function EditorConteudoPagina({ page, onBack, onPageUpdated }: EditorConteudoPaginaProps) {
  const { config } = useSiteConfig();
  const primaryColor = config.primaryColor;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pageDraft, setPageDraft] = useState<PageItem>({ ...page });
  const [allConteudo, setAllConteudo] = useState<PaginaConteudo[]>(() => [defaultPaginaConteudo(page.id)]);
  const [showAddBloco, setShowAddBloco] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pageSaved, setPageSaved] = useState(false);
  const [erro, setErro] = useState("");
  const [previewAtivo, setPreviewAtivo] = useState(true);
  const [modoView, setModoView] = useState<"split" | "editor" | "preview">("split");
  const [showPageSettings, setShowPageSettings] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "dirty" | "saving" | "saved" | "error">("idle");

  const paginaConteudo = allConteudo.find(p => p.pageId === page.id) || defaultPaginaConteudo(page.id);
  const blocos = paginaConteudo.blocos;

  useEffect(() => {
    setPageDraft({ ...page });
  }, [page]);

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      try {
        const rows = await paginasService.listarBlocos(page.id);
        if (!ativo) return;
        if (rows.length === 0) {
          setAllConteudo([defaultPaginaConteudo(page.id)]);
          setSaveStatus("idle");
          return;
        }
        const carregada: PaginaConteudo = {
          pageId: page.id,
          ultimaEdicao: new Date().toISOString().split("T")[0],
          blocos: rows.map((row) => ({
            id: String(row.bloco_id || row.id || `bloco-${Date.now()}`),
            tipo: String(row.tipo || "texto") as BlocoTipo,
            titulo: row.titulo ? String(row.titulo) : undefined,
            subtitulo: row.subtitulo ? String(row.subtitulo) : undefined,
            texto: row.texto ? String(row.texto) : undefined,
            imageUrl: row.image_url ? String(row.image_url) : undefined,
            imageAlt: row.image_alt ? String(row.image_alt) : undefined,
            ctaLabel: row.cta_label ? String(row.cta_label) : undefined,
            ctaUrl: row.cta_url ? String(row.cta_url) : undefined,
            itens: Array.isArray(row.itens) ? row.itens.map(String) : undefined,
            colunas: Array.isArray(row.colunas) ? row.colunas as BlocoConteudo["colunas"] : undefined,
            cor: row.cor ? String(row.cor) : undefined,
            alinhamento: row.alinhamento ? String(row.alinhamento) as BlocoConteudo["alinhamento"] : undefined,
          })),
        };
        setAllConteudo([carregada]);
        setSaveStatus("idle");
      } catch {
        if (ativo) {
          setAllConteudo([defaultPaginaConteudo(page.id)]);
          setSaveStatus("idle");
        }
      }
    };

    carregar();
    return () => {
      ativo = false;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [page.id]);

  const updatePageDraft = (key: keyof PageItem, value: string | boolean | number) => {
    setPageDraft((prev) => ({ ...prev, [key]: value }));
  };

  const salvarDadosPagina = async () => {
    setErro("");
    try {
      const atualizado = await paginasService.atualizar(page.id, {
        nome: pageDraft.nome,
        rota: pageDraft.rota,
        descricao: pageDraft.descricao,
        status: pageDraft.status,
        menuLocal: pageDraft.menuLocal,
        subMenu: pageDraft.subMenu,
        icone: pageDraft.icone,
        modelo: pageDraft.modelo,
        ordem: pageDraft.ordem,
        tituloSeo: pageDraft.tituloSeo,
        descricaoSeo: pageDraft.descricaoSeo,
        keywordsSeo: pageDraft.keywordsSeo,
      });
      setPageDraft(atualizado);
      onPageUpdated?.(atualizado);
      setPageSaved(true);
      setTimeout(() => setPageSaved(false), 2500);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar dados da pagina.");
    }
  };

  const applyLocalBlocos = (novosBlocos: BlocoConteudo[]) => {
    const updated = allConteudo.filter(p => p.pageId !== page.id);
    const nova: PaginaConteudo = {
      pageId: page.id,
      blocos: novosBlocos,
      ultimaEdicao: new Date().toISOString().split("T")[0],
    };
    setAllConteudo([...updated, nova]);
  };

  const persist = async (novosBlocos: BlocoConteudo[]) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    applyLocalBlocos(novosBlocos);
    setErro("");
    setSaveStatus("saving");
    try {
      await paginasService.atualizarBlocos(page.id, novosBlocos.map((bloco, index) => ({
        id: bloco.id,
        tipo: bloco.tipo,
        ordem: index + 1,
        titulo: bloco.titulo,
        subtitulo: bloco.subtitulo,
        texto: bloco.texto,
        image_url: bloco.imageUrl,
        image_alt: bloco.imageAlt,
        cta_label: bloco.ctaLabel,
        cta_url: bloco.ctaUrl,
        itens: bloco.itens,
        colunas: bloco.colunas,
        cor: bloco.cor,
        alinhamento: bloco.alinhamento,
      })));
      notifyPageContentUpdated(page.id);
      setSaveStatus("saved");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err) {
      setSaveStatus("error");
      setErro(err instanceof Error ? err.message : "Erro ao salvar blocos.");
    }
  };

  const schedulePersist = (novosBlocos: BlocoConteudo[]) => {
    applyLocalBlocos(novosBlocos);
    setErro("");
    setSaveStatus("dirty");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void persist(novosBlocos);
    }, 900);
  };

  const handleChangeBloco = (index: number, bloco: BlocoConteudo) => {
    const novo = [...blocos];
    novo[index] = bloco;
    schedulePersist(novo);
  };

  const handleDeleteBloco = async (index: number) => {
    await persist(blocos.filter((_, i) => i !== index));
  };

  const handleDuplicateBloco = async (index: number) => {
    const bloco = blocos[index];
    if (!bloco) return;
    const clone: BlocoConteudo = {
      ...bloco,
      id: `${bloco.id}-copy-${Date.now()}`,
      titulo: bloco.titulo ? `${bloco.titulo} (copia)` : bloco.titulo,
      itens: bloco.itens ? [...bloco.itens] : undefined,
      colunas: bloco.colunas ? bloco.colunas.map((col) => ({ ...col })) : undefined,
    };
    const novo = [...blocos];
    novo.splice(index + 1, 0, clone);
    await persist(novo);
  };

  const handleClearContent = async () => {
    if (!window.confirm("Remover todos os blocos desta pagina?")) return;
    await persist([]);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const novo = [...blocos];
    [novo[index - 1], novo[index]] = [novo[index], novo[index - 1]];
    await persist(novo);
  };

  const handleMoveDown = async (index: number) => {
    if (index === blocos.length - 1) return;
    const novo = [...blocos];
    [novo[index], novo[index + 1]] = [novo[index + 1], novo[index]];
    await persist(novo);
  };

  const handleAddBloco = async (tipo: BlocoTipo) => {
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
      imageAlt: tipo === "imagem" ? "Imagem da pagina" : undefined,
      alinhamento: tipo === "hero" ? "center" : undefined,
    };
    await persist([...blocos, novoBloco]);
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
              <span className="text-sm font-semibold text-gray-700">{pageDraft.nome}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400 font-mono">{pageDraft.rota}</span>
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

        <button
          onClick={() => setShowPageSettings((value) => !value)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors flex-shrink-0">
          <i className="ri-settings-3-line text-sm"></i> Dados da página
        </button>

        <a href={pageDraft.rota} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors flex-shrink-0">
          <i className="ri-external-link-line text-sm"></i> Ver página
        </a>
      </div>

      {/* Feedback salvo */}
      {saved && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Conteúdo salvo!
        </div>
      )}
      {pageSaved && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Dados da página salvos!
        </div>
      )}
      {erro && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2">
          <i className="ri-error-warning-line"></i> {erro}
        </div>
      )}

      {/* Info */}
      <div className="mb-4 px-4 py-3 rounded-xl flex items-start gap-3"
        style={{ backgroundColor: `${primaryColor}08`, border: `1px solid ${primaryColor}20` }}>
        <i className="ri-information-line text-sm mt-0.5 flex-shrink-0" style={{ color: primaryColor }}></i>
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong className="text-gray-800">Edite esta página de verdade</strong>: dados, SEO, status, rota e blocos de conteúdo.
          Use <strong>Split</strong> para ver o editor e a prévia ao mesmo tempo.
        </p>
      </div>

      {showPageSettings && (
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Dados, rota e SEO
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Essas informações controlam como a página aparece no painel, menu e site.</p>
            </div>
            <button
              onClick={() => void salvarDadosPagina()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              <i className="ri-save-line"></i> Salvar dados
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nome da página">
              <input value={pageDraft.nome} onChange={(e) => updatePageDraft("nome", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Nome da página" />
            </Field>
            <Field label="Rota / URL">
              <input value={pageDraft.rota} onChange={(e) => updatePageDraft("rota", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none font-mono"
                placeholder="/minha-pagina" />
            </Field>
            <Field label="Descrição interna">
              <input value={pageDraft.descricao} onChange={(e) => updatePageDraft("descricao", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Descrição para controle interno" />
            </Field>
            <Field label="Status">
              <select value={pageDraft.status} onChange={(e) => updatePageDraft("status", e.target.value as PageItem["status"])}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white">
                <option value="publicada">Publicada</option>
                <option value="rascunho">Rascunho</option>
                <option value="oculta">Oculta</option>
              </select>
            </Field>
            <Field label="Local no menu">
              <input value={pageDraft.menuLocal} onChange={(e) => updatePageDraft("menuLocal", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Institucional, Serviços..." />
            </Field>
            <Field label="Ordem">
              <input type="number" value={pageDraft.ordem} onChange={(e) => updatePageDraft("ordem", Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
            </Field>
            <Field label="Ícone Remix">
              <input value={pageDraft.icone} onChange={(e) => updatePageDraft("icone", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none font-mono"
                placeholder="ri-pages-line" />
            </Field>
            <Field label="Modelo">
              <input value={pageDraft.modelo} onChange={(e) => updatePageDraft("modelo", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="informativo" />
            </Field>
            <Field label="Título SEO">
              <input value={pageDraft.tituloSeo || ""} onChange={(e) => updatePageDraft("tituloSeo", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
            </Field>
            <Field label="Keywords SEO">
              <input value={pageDraft.keywordsSeo || ""} onChange={(e) => updatePageDraft("keywordsSeo", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Descrição SEO">
                <textarea value={pageDraft.descricaoSeo || ""} onChange={(e) => updatePageDraft("descricaoSeo", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-y" />
              </Field>
            </div>
            <button
              onClick={() => updatePageDraft("subMenu", !pageDraft.subMenu)}
              className="md:col-span-2 flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-left cursor-pointer"
            >
              <div className="w-11 h-6 rounded-full relative transition-all flex-shrink-0" style={{ backgroundColor: pageDraft.subMenu ? primaryColor : "#E5E7EB" }}>
                <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: pageDraft.subMenu ? "calc(100% - 22px)" : "2px" }}></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{pageDraft.subMenu ? "Aparece no sub-menu" : "Item direto no menu"}</p>
                <p className="text-xs text-gray-400">Controle de agrupamento usado no painel e no menu.</p>
              </div>
            </button>
          </div>
        </div>
      )}

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
              onDuplicate={() => handleDuplicateBloco(index)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              />
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
              <button
                onClick={() => setShowAddBloco(true)}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold border-2 border-dashed cursor-pointer hover:opacity-80 transition-all flex items-center justify-center gap-2"
                style={{ borderColor: primaryColor, color: primaryColor, backgroundColor: `${primaryColor}05` }}>
                <i className="ri-add-line text-base"></i> Adicionar Bloco de Conteúdo
              </button>
              {blocos.length > 0 && (
                <button
                  onClick={() => void handleClearContent()}
                  className="px-4 py-3.5 rounded-2xl text-sm font-semibold border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <i className="ri-delete-bin-line"></i> Limpar
                </button>
              )}
            </div>
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
                <span className="text-[10px] text-gray-300">Atualiza enquanto voce digita</span>
              </div>

              {/* Frame do preview */}
              <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white"
                style={{ maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}>
                <PreviewBlocos
                  blocos={blocos}
                  primaryColor={primaryColor}
                  secondaryColor={config.secondaryColor}
                  pageName={pageDraft.nome}
                />
              </div>

              {/* Stats */}
              <div className="mt-2 flex items-center gap-4 px-1">
                <span className="text-[10px] text-gray-400">
                  <i className="ri-stack-line mr-1"></i>{blocos.length} bloco{blocos.length !== 1 ? "s" : ""}
                </span>
                <span className="text-[10px] text-gray-400">
                  <i className={`${saveStatus === "saving" ? "ri-loader-4-line animate-spin" : saveStatus === "error" ? "ri-error-warning-line" : "ri-save-line"} mr-1`}></i>
                  {saveStatus === "dirty" ? "Alteracoes pendentes" : saveStatus === "saving" ? "Salvando..." : saveStatus === "error" ? "Erro ao salvar" : saveStatus === "saved" ? "Salvo" : "Auto-salvo"}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
