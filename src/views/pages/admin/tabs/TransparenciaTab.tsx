import { useEffect, useMemo, useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { uploadService } from "@/services/upload.service";
import { arquivoPermitidoDocumento, pastaPublicaPorArquivo, tipoArquivo } from "@/utils/uploadFolders";
import {
  DocumentoTransparencia,
  SecaoTransparencia,
  anosDocs,
  categoriasDocs,
  documentos as docsMock,
  menusPorSecao,
  secoesTransparencia,
  TransparenciaMenu,
  defaultMenusPrimarios,
} from "@/mocks/transparencia-docs";
import { transparenciaService } from "@/services/transparencia.service";

const anosOpcoes = anosDocs.filter((a) => a !== "Todos").map(Number);
const categorias = categoriasDocs.filter((c) => c !== "Todos");

const iconesDoc = [
  { ic: "ri-file-chart-line", label: "Relatorio" },
  { ic: "ri-file-list-3-line", label: "Balanco" },
  { ic: "ri-file-paper-2-line", label: "Prestacao" },
  { ic: "ri-auction-line", label: "Licitacao" },
  { ic: "ri-file-text-line", label: "Contrato" },
  { ic: "ri-shield-user-line", label: "LGPD" },
  { ic: "ri-links-line", label: "Link" },
  { ic: "ri-file-pdf-line", label: "PDF" },
];

function fileSizeLabel(size?: number) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeDoc(d: Partial<DocumentoTransparencia>): DocumentoTransparencia {
  const secao = (d.secao || "primario") as SecaoTransparencia;
  return {
    id: Number(d.id || 0),
    titulo: d.titulo || "",
    descricao: d.descricao || "",
    secao,
    menu: d.menu || menusPorSecao[secao][0],
    categoria: d.categoria || "Relatorios",
    ano: Number(d.ano || new Date().getFullYear()),
    tamanho: d.tamanho || "",
    tipo: d.tipo || "PDF",
    data: d.data || new Date().toISOString().split("T")[0],
    icone: d.icone || "ri-file-pdf-line",
    link: d.link || "",
    arquivoNome: d.arquivoNome || "",
    ativo: d.ativo !== false,
  };
}

function DocFormModal({ doc, onSave, onClose, primaryColor, menusAtuais }: { doc: DocumentoTransparencia; onSave: (d: DocumentoTransparencia) => void; onClose: () => void; primaryColor: string; menusAtuais: TransparenciaMenu[] }) {
  const [form, setForm] = useState<DocumentoTransparencia>({ ...doc });
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const isNew = doc.id === 0;
  const upd = <K extends keyof DocumentoTransparencia>(k: K, v: DocumentoTransparencia[K]) => setForm((p) => ({ ...p, [k]: v }));

  const menusDinamicos = useMemo(() => {
    if (form.secao === "primario") {
      return menusAtuais.map((item) => item.titulo);
    }
    return menusPorSecao[form.secao];
  }, [form.secao, menusAtuais]);

  const handleArquivo = async (file?: File) => {
    if (!file) return;
    if (!arquivoPermitidoDocumento(file)) {
      setUploadMsg("Tipo de arquivo nao permitido.");
      return;
    }
    setUploading(true);
    setUploadMsg("Enviando arquivo...");
    try {
      const enviado = await uploadService.upload(file, pastaPublicaPorArquivo("transparencia", file));
      setForm((p) => ({ ...p, link: enviado.url, arquivoNome: enviado.nome || file.name, tamanho: fileSizeLabel(enviado.tamanho || file.size), tipo: tipoArquivo(file) }));
      setUploadMsg("Arquivo salvo em public/uploads.");
    } catch {
      setUploadMsg("Nao foi possivel salvar na pasta publica.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-[1280px] h-[94vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white p-5 md:p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{isNew ? "Novo Documento" : "Editar Documento"}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Cadastre PDFs, links e documentos para o Portal da Transparencia e LGPD.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><i className="ri-close-line text-gray-400"></i></button>
        </div>

        <div className="p-5 md:p-6 flex flex-col gap-5">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Secao onde o documento vai aparecer</label>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
              {secoesTransparencia.map((s) => (
                <button key={s.key} type="button" onClick={() => setForm((p) => ({ ...p, secao: s.key, menu: s.key === "primario" ? menusAtuais[0]?.titulo || "" : menusPorSecao[s.key][0] }))} className="p-3 rounded-xl border-2 text-left cursor-pointer transition-all" style={form.secao === s.key ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` } : { borderColor: "#E5E7EB" }}>
                  <i className={`${s.icon} text-base`} style={{ color: form.secao === s.key ? primaryColor : "#9CA3AF" }}></i>
                  <p className="text-xs font-bold text-gray-800 mt-2">{s.label}</p>
                  <p className="text-[10px] text-gray-400 leading-tight mt-1">{s.descricao}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Menu / Categoria interna</label>
              <select value={form.menu} onChange={(e) => upd("menu", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
                {menusDinamicos.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Filtro de tipo</label>
              <select value={form.categoria} onChange={(e) => upd("categoria", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome do documento</label><input value={form.titulo} onChange={(e) => upd("titulo", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" /></div>
          <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Descricao opcional</label><textarea value={form.descricao || ""} onChange={(e) => upd("descricao", e.target.value)} rows={4} maxLength={300} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" /></div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Ano</label><select value={form.ano} onChange={(e) => upd("ano", Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">{anosOpcoes.map((a) => <option key={a} value={a}>{a}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Data</label><input type="date" value={form.data} onChange={(e) => upd("data", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tipo</label><input value={form.tipo} onChange={(e) => upd("tipo", e.target.value.toUpperCase())} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tamanho</label><input value={form.tamanho} onChange={(e) => upd("tamanho", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" /></div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Icone do documento</label>
            <div className="flex flex-wrap gap-2">
              {iconesDoc.map(({ ic, label }) => (
                <button key={ic} type="button" onClick={() => upd("icone", ic)} title={label} className="flex items-center gap-2 p-2 rounded-xl border-2 cursor-pointer transition-all" style={form.icone === ic ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` } : { borderColor: "#E5E7EB" }}>
                  <i className={`${ic} text-base`} style={{ color: form.icone === ic ? primaryColor : "#9CA3AF" }}></i>
                  <span className="text-[10px] text-gray-500">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
            <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Link do arquivo ou PDF anexado</label><input type="text" value={form.link || ""} onChange={(e) => upd("link", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" /></div>
            <label className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap text-center hover:opacity-90" style={{ backgroundColor: primaryColor }}>
              <i className="ri-upload-cloud-line mr-1"></i>{uploading ? "Anexando..." : "Anexar arquivo"}
              <input type="file" accept=".pdf,.doc,.docx,.odt,.xls,.xlsx,.ods,.csv,.ppt,.pptx,.pps,.ppsx,.zip" className="hidden" onChange={(e) => void handleArquivo(e.target.files?.[0])} />
            </label>
          </div>
          {(form.arquivoNome || uploadMsg) && <p className="text-xs text-gray-400">{uploadMsg} {form.arquivoNome && <span>Arquivo: <strong className="text-gray-600">{form.arquivoNome}</strong></span>}</p>}

          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer" onClick={() => upd("ativo", form.ativo === false)}>
            <div className="w-10 h-5 rounded-full relative transition-all flex-shrink-0" style={{ backgroundColor: form.ativo !== false ? primaryColor : "#E5E7EB" }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: form.ativo !== false ? "calc(100% - 18px)" : "2px" }}></div>
            </div>
            <span className="text-sm font-medium text-gray-700">{form.ativo !== false ? "Ativo" : "Inativo"}</span>
          </div>

          <div className="sticky bottom-0 z-10 flex gap-3 pt-4 pb-1 bg-white border-t border-gray-100">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">Cancelar</button>
            <button onClick={() => form.titulo.trim() && onSave(form)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90" style={{ backgroundColor: primaryColor }}>{isNew ? "Adicionar Documento" : "Salvar Alteracoes"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuFormModal({ menu, onSave, onClose, primaryColor }: { menu: TransparenciaMenu; onSave: (m: TransparenciaMenu) => void; onClose: () => void; primaryColor: string }) {
  const [form, setForm] = useState<TransparenciaMenu>({ ...menu });
  const isNew = menu.id === "";
  const upd = <K extends keyof TransparenciaMenu>(k: K, v: TransparenciaMenu[K]) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[90vh] flex flex-col">
        <div className="sticky top-0 z-10 bg-white p-5 md:p-6 border-b border-gray-100 flex items-center justify-between">
          <div><h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{isNew ? "Novo Menu Primario" : "Editar Menu Primario"}</h3><p className="text-xs text-gray-400 mt-0.5">Gerencie os botoes de atalhos principais da Transparencia.</p></div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><i className="ri-close-line text-gray-400"></i></button>
        </div>

        <div className="p-5 md:p-6 flex-1 overflow-y-auto flex flex-col gap-4">
          <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Titulo do Menu</label><input value={form.titulo} onChange={(e) => upd("titulo", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" /></div>
          <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Descricao</label><textarea value={form.descricao} onChange={(e) => upd("descricao", e.target.value)} rows={2} maxLength={100} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" /></div>
          <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Link de Redirecionamento Direto</label><input value={form.href || ""} onChange={(e) => upd("href", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" /></div>
          <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Icone</label><input value={form.icon} onChange={(e) => upd("icon", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" /></div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer mt-2" onClick={() => upd("ativo", form.ativo === false)}>
            <div className="w-10 h-5 rounded-full relative transition-all flex-shrink-0" style={{ backgroundColor: form.ativo !== false ? primaryColor : "#E5E7EB" }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: form.ativo !== false ? "calc(100% - 18px)" : "2px" }}></div>
            </div>
            <span className="text-xs font-semibold text-gray-700">{form.ativo !== false ? "Ativo" : "Inativo"}</span>
          </div>
        </div>

        <div className="p-5 md:p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">Cancelar</button>
          <button onClick={() => form.titulo.trim() && onSave(form)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90" style={{ backgroundColor: primaryColor }}>{isNew ? "Criar Menu" : "Salvar Menu"}</button>
        </div>
      </div>
    </div>
  );
}

export default function TransparenciaTab() {
  const { config } = useSiteConfig();
  const [aba, setAba] = useState<"documentos" | "menus">("documentos");
  const [menusList, setMenusList] = useState<TransparenciaMenu[]>(defaultMenusPrimarios);
  const [editandoMenu, setEditandoMenu] = useState<TransparenciaMenu | null>(null);
  const [lista, setLista] = useState<DocumentoTransparencia[]>(docsMock.map(normalizeDoc));
  const [editando, setEditando] = useState<DocumentoTransparencia | null>(null);
  const [secaoFiltro, setSecaoFiltro] = useState<"todos" | SecaoTransparencia>("todos");
  const [busca, setBusca] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      transparenciaService.listarDocumentosAdmin().catch(() => docsMock.map(normalizeDoc)),
      transparenciaService.listarMenusAdmin().catch(() => defaultMenusPrimarios),
    ]).then(([docs, menus]) => {
      setLista((docs as DocumentoTransparencia[]).map(normalizeDoc));
      setMenusList((menus as TransparenciaMenu[]).length > 0 ? menus as TransparenciaMenu[] : defaultMenusPrimarios);
    });
  }, []);

  const toast = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    window.dispatchEvent(new Event("inprec-transparencia-updated"));
  };

  const handleToggle = async (id: number) => {
    const alvo = lista.find((item) => item.id === id);
    if (!alvo) return;
    const salvo = await transparenciaService.salvarDocumento({ ...alvo, ativo: alvo.ativo === false });
    setLista((prev) => prev.map((item) => item.id === id ? normalizeDoc(salvo as Partial<DocumentoTransparencia>) : item));
    toast();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este documento permanentemente?")) return;
    await transparenciaService.excluirDocumento(id);
    setLista((prev) => prev.filter((item) => item.id !== id));
    toast();
  };

  const handleSave = async (d: DocumentoTransparencia) => {
    const salvo = await transparenciaService.salvarDocumento(d);
    setLista((prev) => {
      const existe = prev.some((item) => item.id === salvo.id);
      return existe ? prev.map((item) => item.id === salvo.id ? normalizeDoc(salvo as Partial<DocumentoTransparencia>) : item) : [normalizeDoc(salvo as Partial<DocumentoTransparencia>), ...prev];
    });
    setEditando(null);
    toast();
  };

  const salvarMenus = async (updated: TransparenciaMenu[]) => {
    setMenusList(updated);
    await transparenciaService.salvarMenus(updated);
    setEditandoMenu(null);
    toast();
  };

  const handleMenuDelete = async (id: string) => {
    if (!confirm("Excluir este menu primario permanentemente?")) return;
    await salvarMenus(menusList.filter((item) => item.id !== id));
  };

  const handleMenuToggle = async (id: string) => {
    await salvarMenus(menusList.map((item) => (item.id === id ? { ...item, ativo: item.ativo === false } : item)));
  };

  const handleMenuSave = async (menu: TransparenciaMenu) => {
    if (menu.id === "") {
      const newId = String(Math.max(0, ...menusList.map((x) => Number(x.id))) + 1);
      await salvarMenus([...menusList, { ...menu, id: newId }]);
      return;
    }
    await salvarMenus(menusList.map((item) => (item.id === menu.id ? menu : item)));
  };

  const blank: DocumentoTransparencia = {
    id: 0,
    titulo: "",
    descricao: "",
    secao: "primario",
    menu: menusList[0]?.titulo || "Estrutura Organizacional",
    categoria: "Relatorios",
    ano: new Date().getFullYear(),
    tamanho: "",
    tipo: "PDF",
    data: new Date().toISOString().split("T")[0],
    icone: "ri-file-pdf-line",
    link: "",
    arquivoNome: "",
    ativo: true,
  };

  const blankMenu: TransparenciaMenu = { id: "", icon: "ri-links-line", titulo: "", descricao: "", href: "", ativo: true };

  const filtrados = lista.filter((d) => {
    const secaoOk = secaoFiltro === "todos" || d.secao === secaoFiltro;
    const buscaOk = !busca || `${d.titulo} ${d.menu} ${d.categoria}`.toLowerCase().includes(busca.toLowerCase());
    return secaoOk && buscaOk;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {aba === "documentos" ? "Portal da Transparencia - Documentos" : "Portal da Transparencia - Menus Primarios"}
          </h1>
          <p className="text-sm text-gray-400 mt-1">{aba === "documentos" ? "Alimente os menus primario, secundario, recursos complementares e LGPD." : "Crie, edite e ative/desative os atalhos da pagina de Transparencia."}</p>
        </div>
        {aba === "documentos" ? (
          <button onClick={() => setEditando(blank)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 animate-fade-in" style={{ backgroundColor: config.primaryColor }}><i className="ri-add-line"></i> Novo Documento</button>
        ) : (
          <button onClick={() => setEditandoMenu(blankMenu)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 animate-fade-in" style={{ backgroundColor: config.primaryColor }}><i className="ri-add-line"></i> Novo Menu Primario</button>
        )}
      </div>

      {saved && <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2 animate-fade-in"><i className="ri-check-line"></i> Salvo com sucesso!</div>}

      <div className="flex border-b border-gray-200 mb-6 gap-6">
        <button onClick={() => setAba("documentos")} className="pb-3 text-sm font-bold relative cursor-pointer transition-colors" style={aba === "documentos" ? { color: config.primaryColor } : { color: "#9CA3AF" }}>Documentos Anexados{aba === "documentos" && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: config.primaryColor }}></span>}</button>
        <button onClick={() => setAba("menus")} className="pb-3 text-sm font-bold relative cursor-pointer transition-colors" style={aba === "menus" ? { color: config.primaryColor } : { color: "#9CA3AF" }}>Menus Primarios{aba === "menus" && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: config.primaryColor }}></span>}</button>
      </div>

      {aba === "documentos" ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {secoesTransparencia.map((s) => {
              const count = lista.filter((d) => d.secao === s.key).length;
              const ativos = lista.filter((d) => d.secao === s.key && d.ativo !== false).length;
              return (
                <button key={s.key} onClick={() => setSecaoFiltro(secaoFiltro === s.key ? "todos" : s.key)} className="p-4 rounded-2xl border-2 text-left cursor-pointer transition-all bg-white" style={secaoFiltro === s.key ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}08` } : { borderColor: "#F3F4F6" }}>
                  <i className={`${s.icon} text-lg`} style={{ color: secaoFiltro === s.key ? config.primaryColor : "#9CA3AF" }}></i>
                  <p className="text-sm font-bold text-gray-900 mt-2">{s.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{ativos} ativo{ativos !== 1 ? "s" : ""} de {count}</p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1"><i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, menu ou categoria..." className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white" /></div>
            <select value={secaoFiltro} onChange={(e) => setSecaoFiltro(e.target.value as "todos" | SecaoTransparencia)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer bg-white">
              <option value="todos">Todas as secoes</option>
              {secoesTransparencia.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {filtrados.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">Nenhum documento encontrado.</div>}
            {filtrados.map((d, i) => {
              const secao = secoesTransparencia.find((s) => s.key === d.secao);
              return (
                <div key={d.id} className={`flex items-center gap-4 p-4 ${i < filtrados.length - 1 ? "border-b border-gray-50" : ""} ${d.ativo === false ? "opacity-50" : ""}`}>
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}15` }}><i className={`${d.icone} text-base`} style={{ color: config.primaryColor }}></i></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${d.ativo === false ? "bg-gray-100 text-gray-400" : "bg-green-50 text-green-600"}`}>{d.ativo === false ? "Inativo" : "Visivel"}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">{secao?.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">{d.menu}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">{d.ano}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">{d.titulo}</p>
                    <p className="text-xs text-gray-400 truncate">{d.categoria} · {d.tipo} · {d.tamanho || "sem tamanho"}{d.link && <a href={d.link} target="_blank" rel="nofollow noopener noreferrer" className="ml-2 underline" style={{ color: config.primaryColor }}>ver arquivo</a>}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => void handleToggle(d.id)} className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer ${d.ativo === false ? "hover:bg-green-50 text-green-500" : "hover:bg-amber-50 text-amber-500"}`}><i className={d.ativo === false ? "ri-eye-line text-sm" : "ri-eye-off-line text-sm"}></i></button>
                    <button onClick={() => setEditando(d)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"><i className="ri-edit-line text-sm"></i></button>
                    <button onClick={() => void handleDelete(d.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"><i className="ri-delete-bin-line text-sm"></i></button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menusList.map((item) => (
            <div key={item.id} className={`p-5 bg-white rounded-2xl border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all ${item.ativo === false ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}12` }}><i className={`${item.icon} text-xl`} style={{ color: config.primaryColor }}></i></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.ativo !== false ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>{item.ativo !== false ? "Ativo" : "Inativo"}</span>
                    {item.href ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Link Externo</span> : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">Filtro PDF</span>}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 leading-snug">{item.titulo}</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.descricao || "Sem descricao cadastrada."}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-5 pt-3 border-t border-gray-50">
                <button onClick={() => void handleMenuToggle(item.id)} className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer ${item.ativo === false ? "hover:bg-green-50 text-green-500" : "hover:bg-amber-50 text-amber-500"}`}><i className={item.ativo === false ? "ri-eye-line text-sm" : "ri-eye-off-line text-sm"}></i></button>
                <button onClick={() => setEditandoMenu(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 cursor-pointer"><i className="ri-edit-line text-sm"></i></button>
                <button onClick={() => void handleMenuDelete(item.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"><i className="ri-delete-bin-line text-sm"></i></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editando && <DocFormModal doc={editando} onSave={(doc) => void handleSave(doc)} onClose={() => setEditando(null)} primaryColor={config.primaryColor} menusAtuais={menusList} />}
      {editandoMenu && <MenuFormModal menu={editandoMenu} onSave={(menu) => void handleMenuSave(menu)} onClose={() => setEditandoMenu(null)} primaryColor={config.primaryColor} />}
    </div>
  );
}
