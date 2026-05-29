import { useState, useEffect, useRef } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { atalhosService, type AtalhoRapido, LOCAIS_DISPONIVEIS, ICONES_ATALHOS } from "@/services/atalhos.service";
import { uploadService } from "@/services/upload.service";

const LOCAL_CORES: Record<string, string> = {
  rodape:    "bg-purple-50 text-purple-700",
  inicio:    "bg-green-50 text-green-700",
  cabecalho: "bg-blue-50 text-blue-700",
};

const LOCAL_LABELS: Record<string, string> = {
  rodape:    "Rodapé",
  inicio:    "Início",
  cabecalho: "Cabeçalho",
};

const blank: Omit<AtalhoRapido, "id"> = {
  label: "",
  descricao: "",
  href: "",
  icone: "ri-link-line",
  iconeImg: "",
  cor: "#16a34a",
  locais: ["rodape"],
  externo: false,
  ordem: 0,
  ativo: true,
};

interface ModalProps {
  atalho: Omit<AtalhoRapido, "id"> & { id?: number };
  onSave: (a: Omit<AtalhoRapido, "id"> & { id?: number }) => void;
  onClose: () => void;
  primaryColor: string;
}

function AtalhoModal({ atalho, onSave, onClose, primaryColor }: ModalProps) {
  const [form, setForm] = useState({ ...atalho });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isNew = !atalho.id;
  const upd = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const toggleLocal = (key: string) => {
    setForm((p) => ({
      ...p,
      locais: p.locais.includes(key) ? p.locais.filter((l) => l !== key) : [...p.locais, key],
    }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const resp = await uploadService.upload(file, "atalhos");
      const url = resp.url;
      upd("iconeImg", url);
    } catch {
      alert("Erro ao enviar imagem.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {isNew ? "Novo Atalho" : "Editar Atalho"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Configure o link, ícone e onde ele vai aparecer</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6">
          {/* Preview */}
          <div className="flex items-center gap-3 p-4 rounded-2xl border-2" style={{ borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}06` }}>
            <div className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 overflow-hidden" style={{ backgroundColor: form.cor }}>
              {form.iconeImg ? (
                <img src={form.iconeImg} alt="" className="w-10 h-10 object-contain" />
              ) : (
                <i className={`${form.icone} text-white text-xl`}></i>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{form.label || "Rótulo do atalho"}</p>
              <p className="text-xs text-gray-400">{form.descricao || "Descrição opcional"}</p>
              <p className="text-xs font-mono text-gray-300 mt-0.5">{form.href || "/rota"}</p>
            </div>
            <div className="ml-auto flex flex-wrap gap-1">
              {form.locais.map((l) => (
                <span key={l} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${LOCAL_CORES[l] || "bg-gray-100 text-gray-500"}`}>
                  {LOCAL_LABELS[l] || l}
                </span>
              ))}
            </div>
          </div>

          {/* Dados básicos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Rótulo *</label>
              <input value={form.label} onChange={(e) => upd("label", e.target.value)}
                placeholder="Ex: Ouvidoria"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Descrição</label>
              <input value={form.descricao || ""} onChange={(e) => upd("descricao", e.target.value)}
                placeholder="Texto de apoio opcional"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Link de Destino *</label>
            <div className="flex gap-2">
              <input value={form.href} onChange={(e) => upd("href", e.target.value)}
                placeholder="/rota ou https://site.com"
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-mono focus:outline-none" />
              <div className="flex items-center gap-2 cursor-pointer px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 whitespace-nowrap"
                onClick={() => upd("externo", !form.externo)}>
                <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: form.externo ? primaryColor : "#E5E7EB" }}>
                  {form.externo && <i className="ri-check-line text-white text-[10px]"></i>}
                </div>
                <span className="text-xs text-gray-600">Link externo</span>
                <i className="ri-external-link-line text-gray-400 text-xs"></i>
              </div>
            </div>
          </div>

          {/* Locais */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Onde exibir *</label>
            <div className="grid grid-cols-3 gap-2">
              {LOCAIS_DISPONIVEIS.map((local) => {
                const ativo = form.locais.includes(local.key);
                return (
                  <button key={local.key} onClick={() => toggleLocal(local.key)}
                    className="flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all"
                    style={ativo ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` } : { borderColor: "#E5E7EB" }}>
                    <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: ativo ? `${primaryColor}20` : "#F3F4F6" }}>
                      <i className={`${local.icon} text-sm`} style={{ color: ativo ? primaryColor : "#9CA3AF" }}></i>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: ativo ? primaryColor : "#6B7280" }}>{local.label}</span>
                    {ativo && <i className="ri-check-line ml-auto text-xs" style={{ color: primaryColor }}></i>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ícone */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Ícone</label>
            <div className="flex flex-wrap gap-2 mb-3 p-3 rounded-xl border border-gray-100 bg-gray-50 max-h-32 overflow-y-auto">
              {ICONES_ATALHOS.map((ic) => (
                <button key={ic} onClick={() => { upd("icone", ic); upd("iconeImg", ""); }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all"
                  style={form.icone === ic && !form.iconeImg ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` } : { borderColor: "#E5E7EB" }}>
                  <i className={`${ic} text-sm`} style={{ color: form.icone === ic && !form.iconeImg ? primaryColor : "#9CA3AF" }}></i>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">Ou URL de imagem/logo</label>
                <input value={form.iconeImg || ""} onChange={(e) => upd("iconeImg", e.target.value)}
                  placeholder="https://... ou deixe em branco"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono focus:outline-none" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-gray-400">Upload</label>
                <button onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-50">
                  {uploading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-upload-line"></i>}
                  {uploading ? "Enviando..." : "Do computador"}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </div>
              {form.iconeImg && (
                <button onClick={() => upd("iconeImg", "")} className="text-xs text-red-400 hover:text-red-600 cursor-pointer mt-4">
                  <i className="ri-delete-bin-line"></i>
                </button>
              )}
            </div>
          </div>

          {/* Cor */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Cor do Ícone</label>
            <div className="flex items-center gap-3 flex-wrap">
              {["#16a34a","#0891B2","#7C3AED","#DC2626","#D97706","#059669","#1a3a5c","#374151"].map((c) => (
                <button key={c} onClick={() => upd("cor", c)}
                  className="w-8 h-8 rounded-full border-4 cursor-pointer transition-all"
                  style={{ backgroundColor: c, borderColor: form.cor === c ? "#000" : "transparent" }}>
                </button>
              ))}
              <input type="color" value={form.cor} onChange={(e) => upd("cor", e.target.value)}
                className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer" title="Cor personalizada" />
            </div>
          </div>

          {/* Ordem e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Ordem de exibição</label>
              <input type="number" min={0} value={form.ordem}
                onChange={(e) => upd("ordem", Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
              <div className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl bg-gray-50 border border-gray-100"
                onClick={() => upd("ativo", !form.ativo)}>
                <div className="w-11 h-6 rounded-full relative flex-shrink-0 transition-all" style={{ backgroundColor: form.ativo ? "#059669" : "#E5E7EB" }}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: form.ativo ? "calc(100% - 22px)" : "2px" }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: form.ativo ? "#059669" : "#9CA3AF" }}>
                  {form.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={() => onSave(form)} disabled={!form.label || !form.href || form.locais.length === 0}
              className="flex-1 cursor-pointer rounded-xl py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: primaryColor }}>
              {isNew ? "Criar Atalho" : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AtalhosAdminTab() {
  const { config } = useSiteConfig();
  const [lista, setLista] = useState<AtalhoRapido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<(Omit<AtalhoRapido, "id"> & { id?: number }) | null>(null);
  const [confirmarExcluir, setConfirmarExcluir] = useState<AtalhoRapido | null>(null);
  const [saved, setSaved] = useState(false);
  const [erro, setErro] = useState("");
  const [filtroLocal, setFiltroLocal] = useState("todos");

  const carregar = async () => {
    setCarregando(true);
    setErro("");
    try {
      const dados = await atalhosService.listarAdmin();
      setLista(dados);
    } catch {
      setErro("Erro ao carregar atalhos.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { void carregar(); }, []);

  const toast = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
    window.dispatchEvent(new Event("inprec-atalhos-updated"));
  };

  const handleSave = async (form: Omit<AtalhoRapido, "id"> & { id?: number }) => {
    setErro("");
    try {
      if (form.id) {
        const atualizado = await atalhosService.atualizar(form.id, form);
        setLista((prev) => prev.map((a) => a.id === form.id ? atualizado : a));
      } else {
        const criado = await atalhosService.criar(form);
        setLista((prev) => [...prev, criado].sort((a, b) => a.ordem - b.ordem));
      }
      setEditando(null);
      toast();
    } catch {
      setErro("Erro ao salvar atalho.");
    }
  };

  const handleToggle = async (atalho: AtalhoRapido) => {
    try {
      const atualizado = await atalhosService.atualizar(atalho.id, { ...atalho, ativo: !atalho.ativo });
      setLista((prev) => prev.map((a) => a.id === atalho.id ? atualizado : a));
      toast();
    } catch {
      setErro("Erro ao atualizar status.");
    }
  };

  const handleDelete = async (atalho: AtalhoRapido) => {
    try {
      await atalhosService.deletar(atalho.id);
      setLista((prev) => prev.filter((a) => a.id !== atalho.id));
      setConfirmarExcluir(null);
      toast();
    } catch {
      setErro("Erro ao excluir atalho.");
    }
  };

  const filtrados = filtroLocal === "todos"
    ? lista
    : lista.filter((a) => a.locais.includes(filtroLocal));

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Atalhos de Acesso Rápido
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gerencie links exibidos no rodapé, na barra de atalhos da home e em outros locais. Controle total: ícone, cor, local e destino.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => void carregar()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">
            <i className="ri-refresh-line"></i> Atualizar
          </button>
          <button onClick={() => setEditando({ ...blank, ordem: lista.length + 1 })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90"
            style={{ backgroundColor: config.primaryColor }}>
            <i className="ri-add-line"></i> Novo Atalho
          </button>
        </div>
      </div>

      {saved && <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700"><i className="ri-check-line"></i> Salvo com sucesso!</div>}
      {erro && <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"><i className="ri-error-warning-line"></i> {erro}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: lista.length, color: config.primaryColor, icon: "ri-links-line" },
          { label: "Ativos", value: lista.filter((a) => a.ativo).length, color: "#059669", icon: "ri-checkbox-circle-line" },
          { label: "No Rodapé", value: lista.filter((a) => a.locais.includes("rodape")).length, color: "#7C3AED", icon: "ri-layout-bottom-2-line" },
          { label: "Na Home", value: lista.filter((a) => a.locais.includes("inicio")).length, color: "#0891B2", icon: "ri-home-4-line" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-base`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtro por local */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[{ key: "todos", label: "Todos os locais" }, ...LOCAIS_DISPONIVEIS].map((l) => (
          <button key={l.key} onClick={() => setFiltroLocal(l.key)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all"
            style={filtroLocal === l.key
              ? { backgroundColor: config.primaryColor, color: "white" }
              : { backgroundColor: "#F3F4F6", color: "#6B7280" }}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <i className="ri-loader-4-line animate-spin mr-2"></i> Carregando...
        </div>
      ) : filtrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <i className="ri-links-line text-4xl text-gray-200 block mb-3"></i>
          <p className="text-sm font-semibold text-gray-400">Nenhum atalho encontrado.</p>
          <p className="text-xs text-gray-300 mt-1">Clique em "Novo Atalho" para começar.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map((atalho) => (
            <div key={atalho.id}
              className={`flex items-center gap-4 rounded-2xl border bg-white p-4 transition-all ${atalho.ativo ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
              {/* Ícone */}
              <div className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 overflow-hidden" style={{ backgroundColor: atalho.cor }}>
                {atalho.iconeImg ? (
                  <img src={atalho.iconeImg} alt="" className="w-10 h-10 object-contain" />
                ) : (
                  <i className={`${atalho.icone} text-white text-xl`}></i>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-bold text-gray-900">{atalho.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${atalho.ativo ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {atalho.ativo ? "Ativo" : "Inativo"}
                  </span>
                  {atalho.externo && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold flex items-center gap-1">
                      <i className="ri-external-link-line text-[10px]"></i>Externo
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-gray-400 truncate mb-1">{atalho.href}</p>
                <div className="flex flex-wrap gap-1">
                  {atalho.locais.map((l) => (
                    <span key={l} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${LOCAL_CORES[l] || "bg-gray-100 text-gray-500"}`}>
                      {LOCAL_LABELS[l] || l}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setEditando({ ...atalho })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}
                  title="Editar">
                  <i className="ri-pencil-line"></i> Editar
                </button>
                <button onClick={() => void handleToggle(atalho)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${atalho.ativo ? "text-amber-500 hover:bg-amber-50" : "text-green-500 hover:bg-green-50"}`}
                  title={atalho.ativo ? "Desativar" : "Ativar"}>
                  <i className={`${atalho.ativo ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                </button>
                <button onClick={() => setConfirmarExcluir(atalho)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                  title="Excluir">
                  <i className="ri-delete-bin-line text-sm"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de criação/edição */}
      {editando !== null && (
        <AtalhoModal
          atalho={editando}
          onSave={handleSave}
          onClose={() => setEditando(null)}
          primaryColor={config.primaryColor}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {confirmarExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setConfirmarExcluir(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <i className="ri-delete-bin-line text-xl text-red-500"></i>
            </div>
            <h3 className="mb-2 text-center text-base font-bold text-gray-900">Excluir Atalho?</h3>
            <p className="mb-6 text-center text-sm text-gray-500">
              Tem certeza que deseja excluir <strong>"{confirmarExcluir.label}"</strong>? Ele será removido de todos os locais onde aparece.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarExcluir(null)}
                className="flex-1 cursor-pointer rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => void handleDelete(confirmarExcluir)}
                className="flex-1 cursor-pointer rounded-xl bg-red-500 py-3 text-sm font-semibold text-white hover:bg-red-600">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
