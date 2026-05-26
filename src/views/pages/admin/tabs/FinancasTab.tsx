import { useEffect, useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { docsFinanceiros as mockDocs, secoesFinancas, DocFinanceiro } from "@/mocks/financas-investimentos";
import { uploadService } from "@/services/upload.service";
import { arquivoPermitidoDocumento, pastaPublicaPorArquivo, tipoArquivo } from "@/utils/uploadFolders";
import { transparenciaService } from "@/services/transparencia.service";

const anosOpcoes = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

function fileSizeLabel(size?: number) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function DocModal({ doc, onSave, onClose, primaryColor }: { doc: DocFinanceiro; onSave: (d: DocFinanceiro) => void; onClose: () => void; primaryColor: string }) {
  const [form, setForm] = useState<DocFinanceiro>({ ...doc });
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const isNew = doc.id === 0;
  const upd = <K extends keyof DocFinanceiro>(k: K, v: DocFinanceiro[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleArquivo = async (file?: File) => {
    if (!file) return;
    if (!arquivoPermitidoDocumento(file)) {
      setUploadMsg("Tipo de arquivo nao permitido.");
      return;
    }
    setUploading(true);
    setUploadMsg("Enviando arquivo...");
    try {
      const enviado = await uploadService.upload(file, pastaPublicaPorArquivo("financas", file));
      setForm((p) => ({ ...p, link: enviado.url, tamanho: fileSizeLabel(enviado.tamanho || file.size), tipo: tipoArquivo(file) }));
      setUploadMsg(`Arquivo salvo em public/uploads: ${file.name}`);
    } catch {
      setUploadMsg("Nao foi possivel salvar na pasta publica.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{isNew ? "Novo Documento" : "Editar Documento"}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Aparece na pagina <strong>/financas-investimentos</strong>.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><i className="ri-close-line text-gray-400"></i></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Secao</label>
            <select value={form.secao} onChange={(e) => upd("secao", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
              {secoesFinancas.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Titulo do Documento</label>
            <input value={form.titulo} onChange={(e) => upd("titulo", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Descricao</label>
            <textarea value={form.descricao || ""} onChange={(e) => upd("descricao", e.target.value)} rows={2} maxLength={300} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Ano</label>
              <select value={form.ano} onChange={(e) => upd("ano", parseInt(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
                {anosOpcoes.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tipo</label>
              <select value={form.tipo} onChange={(e) => upd("tipo", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
                <option>PDF</option><option>DOC</option><option>XLS</option><option>ZIP</option><option>LINK</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tamanho</label>
              <input value={form.tamanho} onChange={(e) => upd("tamanho", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Data de Publicacao</label>
            <input type="date" value={form.data} onChange={(e) => upd("data", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Link do Arquivo / PDF</label>
            <input type="text" value={form.link || ""} onChange={(e) => upd("link", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap text-center hover:opacity-90 inline-flex items-center gap-2" style={{ backgroundColor: primaryColor }}>
              <i className="ri-upload-cloud-line"></i>{uploading ? "Anexando..." : "Anexar do computador"}
              <input type="file" accept=".pdf,.doc,.docx,.odt,.xls,.xlsx,.ods,.csv,.ppt,.pptx,.pps,.ppsx,.zip" className="hidden" onChange={(e) => void handleArquivo(e.target.files?.[0])} />
            </label>
            {uploadMsg && <p className="text-xs text-gray-400 mt-2">{uploadMsg}</p>}
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer" onClick={() => upd("ativo", !form.ativo)}>
            <div className="w-10 h-5 rounded-full relative transition-all flex-shrink-0" style={{ backgroundColor: form.ativo ? primaryColor : "#E5E7EB" }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: form.ativo ? "calc(100% - 18px)" : "2px" }}></div>
            </div>
            <span className="text-sm font-medium text-gray-700">{form.ativo ? "Ativo" : "Inativo"}</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50 whitespace-nowrap">Cancelar</button>
            <button onClick={() => form.titulo.trim() && onSave(form)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 whitespace-nowrap" style={{ backgroundColor: primaryColor }}>{isNew ? "Adicionar Documento" : "Salvar Alteracoes"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FinancasTab() {
  const { config } = useSiteConfig();
  const [lista, setLista] = useState<DocFinanceiro[]>(mockDocs);
  const [editando, setEditando] = useState<DocFinanceiro | null>(null);
  const [secaoFiltro, setSecaoFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    transparenciaService.listarFinancasAdmin().then((docs) => setLista(docs as DocFinanceiro[])).catch(() => setLista(mockDocs));
  }, []);

  const toast = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    window.dispatchEvent(new Event("inprec-financas-updated"));
  };

  const persist = async (doc: DocFinanceiro) => {
    const salvo = await transparenciaService.salvarFinanca(doc);
    setLista((prev) => {
      const existe = prev.some((item) => item.id === salvo.id);
      return existe ? prev.map((item) => item.id === salvo.id ? salvo as DocFinanceiro : item) : [salvo as DocFinanceiro, ...prev];
    });
    toast();
  };

  const handleToggle = async (id: number) => {
    const item = lista.find((d) => d.id === id);
    if (!item) return;
    await persist({ ...item, ativo: !item.ativo });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este documento permanentemente?")) return;
    await transparenciaService.excluirFinanca(id);
    setLista((prev) => prev.filter((item) => item.id !== id));
    toast();
  };

  const blank: DocFinanceiro = {
    id: 0,
    titulo: "",
    secao: "prestacao-contas",
    ano: 2025,
    tipo: "PDF",
    tamanho: "",
    data: new Date().toISOString().split("T")[0],
    link: "",
    ativo: true,
    descricao: "",
  };

  const filtrados = lista.filter((d) => {
    const secaoOk = secaoFiltro === "todos" || d.secao === secaoFiltro;
    const buscaOk = !busca || d.titulo.toLowerCase().includes(busca.toLowerCase());
    return secaoOk && buscaOk;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Financas e Investimentos</h1>
          <p className="text-sm text-gray-400 mt-1">Gerencie todos os documentos da pagina <strong>/financas-investimentos</strong>.</p>
        </div>
        <button onClick={() => setEditando(blank)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 flex-shrink-0" style={{ backgroundColor: config.primaryColor }}>
          <i className="ri-add-line"></i>Novo Documento
        </button>
      </div>

      {saved && <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2"><i className="ri-check-line"></i> Salvo com sucesso!</div>}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar documento..." className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
        </div>
        <select value={secaoFiltro} onChange={(e) => setSecaoFiltro(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
          <option value="todos">Todas as secoes</option>
          {secoesFinancas.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 mb-6">
        {secoesFinancas.map((s) => {
          const count = lista.filter((d) => d.secao === s.key).length;
          const ativos = lista.filter((d) => d.secao === s.key && d.ativo).length;
          return (
            <button key={s.key} onClick={() => setSecaoFiltro(secaoFiltro === s.key ? "todos" : s.key)} className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 cursor-pointer transition-all text-center" style={secaoFiltro === s.key ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}08` } : { borderColor: "#E5E7EB" }}>
              <i className={`${s.icon} text-base`} style={{ color: secaoFiltro === s.key ? config.primaryColor : "#9CA3AF" }}></i>
              <span className="text-[10px] font-bold" style={{ color: secaoFiltro === s.key ? config.primaryColor : "#374151" }}>{count}</span>
              <span className="text-[9px] text-gray-400 leading-tight">{ativos} ativo{ativos !== 1 ? "s" : ""}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filtrados.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">Nenhum documento encontrado.</div>}
        {filtrados.map((d, i) => {
          const secao = secoesFinancas.find((s) => s.key === d.secao);
          return (
            <div key={d.id} className={`flex items-center gap-4 p-4 ${i < filtrados.length - 1 ? "border-b border-gray-50" : ""} ${!d.ativo ? "opacity-50" : ""}`}>
              <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}12` }}>
                <i className={`${secao?.icon || "ri-file-text-line"} text-sm`} style={{ color: config.primaryColor }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${d.ativo ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>{d.ativo ? "Visivel" : "Oculto"}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">{secao?.label}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">{d.ano}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">{d.tipo}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{d.titulo}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-400">{d.tamanho}</span>
                  {d.link ? <a href={d.link} target="_blank" rel="nofollow noopener noreferrer" className="text-xs font-medium underline" style={{ color: config.primaryColor }}><i className="ri-external-link-line mr-0.5"></i>ver arquivo</a> : <span className="text-xs text-amber-500"><i className="ri-time-line mr-0.5"></i>Sem link</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => void handleToggle(d.id)} className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer ${!d.ativo ? "hover:bg-green-50 text-green-500" : "hover:bg-amber-50 text-amber-500"}`}><i className={`${!d.ativo ? "ri-eye-line" : "ri-eye-off-line"} text-sm`}></i></button>
                <button onClick={() => setEditando(d)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"><i className="ri-edit-line text-sm"></i></button>
                <button onClick={() => void handleDelete(d.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"><i className="ri-delete-bin-line text-sm"></i></button>
              </div>
            </div>
          );
        })}
      </div>

      {editando && <DocModal doc={editando} onSave={(doc) => void persist(doc)} onClose={() => setEditando(null)} primaryColor={config.primaryColor} />}
    </div>
  );
}
