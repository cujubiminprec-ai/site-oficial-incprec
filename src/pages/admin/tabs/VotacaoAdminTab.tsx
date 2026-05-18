import { useState, useRef, useCallback } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import {
  candidatosDefault,
  votacaoConfigDefault,
  Candidato,
  VotacaoConfig,
} from "@/mocks/votacao";

const CONSELHO_OPTIONS = [
  { key: "deliberativo", label: "Conselho Deliberativo", icon: "ri-government-line" },
  { key: "fiscal", label: "Conselho Fiscal", icon: "ri-secure-payment-line" },
  { key: "comite_investimento", label: "Comitê de Investimento (opcional)", icon: "ri-funds-box-line" },
];

const grupoLabels: Record<string, string> = {
  deliberativo: "Conselho Deliberativo",
  fiscal: "Conselho Fiscal",
  comite_investimento: "Comitê de Investimento",
};

const blankCandidato: Candidato = {
  id: 0,
  numero: 0,
  nomeCompleto: "",
  foto: "",
  cargo: "",
  conselho: "deliberativo",
  tipo: "titular",
  matricula: "",
  lotacao: "",
  categoria: "servidor_ativo",
  slogan: "",
  proposta: "",
  ativo: true,
};

function Toggle({
  value,
  onChange,
  label,
  desc,
  primaryColor,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
  primaryColor: string;
}) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 cursor-pointer"
      onClick={() => onChange(!value)}
    >
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <div
        className="w-11 h-6 rounded-full relative transition-all duration-200 flex-shrink-0 ml-4"
        style={{ backgroundColor: value ? primaryColor : "#E5E7EB" }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
          style={{ left: value ? "calc(100% - 22px)" : "2px" }}
        ></div>
      </div>
    </div>
  );
}

function CandidatoFormModal({
  candidato,
  onSave,
  onClose,
  primaryColor,
}: {
  candidato: Candidato;
  onSave: (c: Candidato) => void;
  onClose: () => void;
  primaryColor: string;
}) {
  const [form, setForm] = useState<Candidato>({ ...candidato });
  const [fotoPreviewError, setFotoPreviewError] = useState(false);
  const [fotoUploading, setFotoUploading] = useState(false);
  const fotoFileRef = useRef<HTMLInputElement>(null);

  const upd = <K extends keyof Candidato>(k: K, v: Candidato[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (k === "foto") setFotoPreviewError(false);
  };

  const handleFotoFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      upd("foto", dataUrl);
    } finally {
      setFotoUploading(false);
      if (fotoFileRef.current) fotoFileRef.current.value = "";
    }
  }, []);

  const isNew = candidato.id === 0;

  const fotoValida = form.foto && !fotoPreviewError;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            {fotoValida ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: primaryColor }}>
                <img
                  src={form.foto}
                  alt={form.nomeCompleto}
                  className="w-full h-full object-cover object-top"
                  onError={() => setFotoPreviewError(true)}
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <i className="ri-user-line text-gray-400"></i>
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {isNew ? "Novo Candidato" : (form.nomeCompleto || "Editar Candidato")}
              </h3>
              {!isNew && <p className="text-xs text-gray-400">{grupoLabels[form.conselho]} · {form.tipo === "titular" ? "Titular" : "Suplente"}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-5">

          {/* FOTO DESTAQUE */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <i className="ri-image-line" style={{ color: primaryColor }}></i>
              Foto do Candidato
            </p>
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-200 flex items-center justify-center">
                {fotoValida ? (
                  <img
                    src={form.foto}
                    alt="Preview"
                    className="w-full h-full object-cover object-top"
                    onError={() => setFotoPreviewError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-300">
                    <i className="ri-user-line text-3xl"></i>
                    <span className="text-[9px]">Sem foto</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                {/* Input de arquivo oculto */}
                <input
                  ref={fotoFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoFile}
                />
                {/* Botão de upload do computador */}
                <button
                  type="button"
                  onClick={() => fotoFileRef.current?.click()}
                  disabled={fotoUploading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-gray-400 text-xs font-semibold text-gray-600 mb-2"
                  style={{ borderColor: `${primaryColor}60`, backgroundColor: `${primaryColor}06` }}
                >
                  {fotoUploading ? (
                    <><i className="ri-loader-4-line animate-spin text-sm" style={{ color: primaryColor }}></i> Carregando...</>
                  ) : (
                    <><i className="ri-upload-2-line text-sm" style={{ color: primaryColor }}></i> Escolher foto do computador</>
                  )}
                </button>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Ou cole a URL da foto:</label>
                <input
                  type="url"
                  value={form.foto.startsWith("data:") ? "" : form.foto}
                  onChange={(e) => upd("foto", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400 bg-white"
                  placeholder="https://site.com/foto.jpg"
                />
                {fotoPreviewError && form.foto && (
                  <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i>
                    URL inválida ou imagem não carregou
                  </p>
                )}
                {form.foto && !fotoPreviewError && (
                  <p className="text-[11px] text-green-600 mt-1.5 flex items-center gap-1">
                    <i className="ri-check-line"></i> {form.foto.startsWith("data:") ? "Foto carregada do computador" : "Foto carregada com sucesso"}
                  </p>
                )}
                {form.foto && (
                  <button
                    type="button"
                    onClick={() => upd("foto", "")}
                    className="mt-1.5 text-[11px] text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-1"
                  >
                    <i className="ri-delete-bin-line text-xs"></i> Remover foto
                  </button>
                )}
                <p className="text-[10px] text-amber-600 mt-2 leading-relaxed">
                  <i className="ri-shield-check-line mr-1"></i>
                  Divulgar apenas com consentimento LGPD do candidato
                </p>
              </div>
            </div>
          </div>

          {/* IDENTIFICAÇÃO */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Identificação</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Número para Votar *
                  <span className="ml-1 text-[10px] text-gray-400 font-normal">(exibido no card)</span>
                </label>
                <input
                  type="number"
                  value={form.numero || ""}
                  onChange={(e) => upd("numero", parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
                  placeholder="Ex: 10"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Matrícula *</label>
                <input
                  type="text"
                  value={form.matricula}
                  onChange={(e) => upd("matricula", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
                  placeholder="Ex: 00234"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome Completo *</label>
              <input
                type="text"
                value={form.nomeCompleto}
                onChange={(e) => upd("nomeCompleto", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
                placeholder="Nome completo do candidato"
              />
            </div>
          </div>

          {/* VAGA */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Vaga disputada</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Conselho / Órgão *</label>
                <select
                  value={form.conselho}
                  onChange={(e) => upd("conselho", e.target.value as Candidato["conselho"])}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
                >
                  {CONSELHO_OPTIONS.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tipo *</label>
                <select
                  value={form.tipo}
                  onChange={(e) => upd("tipo", e.target.value as Candidato["tipo"])}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="titular">Titular</option>
                  <option value="suplente">Suplente</option>
                </select>
              </div>
            </div>
          </div>

          {/* DADOS FUNCIONAIS */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Dados Funcionais</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Categoria</label>
                <select
                  value={form.categoria}
                  onChange={(e) => upd("categoria", e.target.value as Candidato["categoria"])}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="servidor_ativo">Servidor Ativo</option>
                  <option value="aposentado">Aposentado</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Lotação / Secretaria</label>
                <input
                  type="text"
                  value={form.lotacao}
                  onChange={(e) => upd("lotacao", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
                  placeholder="Ex: Secretaria de Saúde"
                />
              </div>
            </div>
          </div>

          {/* PROPOSTA */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Campanha</p>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Slogan / Lema (opcional)</label>
              <input
                type="text"
                value={form.slogan}
                onChange={(e) => upd("slogan", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
                placeholder="Ex: Gestão transparente para todos"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Proposta / Plataforma
                <span className="ml-1 text-[10px] text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={form.proposta}
                onChange={(e) => upd("proposta", e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
                placeholder="Descreva brevemente as propostas do candidato..."
              />
              <p className="text-[10px] text-gray-400 mt-1 text-right">{form.proposta.length}/500</p>
            </div>
          </div>

          {/* ATIVO */}
          <div
            className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50"
            onClick={() => upd("ativo", !form.ativo)}
          >
            <div
              className="w-5 h-5 rounded flex items-center justify-center transition-all flex-shrink-0"
              style={form.ativo ? { backgroundColor: primaryColor } : { border: "1.5px solid #D1D5DB" }}
            >
              {form.ativo && <i className="ri-check-line text-white text-xs"></i>}
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-800">Candidato ativo</span>
              <p className="text-xs text-gray-400">Visível na página pública de votação</p>
            </div>
          </div>

          <div className="flex gap-3 pt-1 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50 whitespace-nowrap"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(form)}
              disabled={!form.nomeCompleto.trim() || !form.numero}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
              style={{ backgroundColor: primaryColor }}
            >
              {isNew ? "Adicionar Candidato" : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  desc,
  confirmLabel,
  confirmColor,
  onConfirm,
  onClose,
}: {
  title: string;
  desc: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <i className="ri-alert-line text-red-500 text-xl"></i>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{desc}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90"
            style={{ backgroundColor: confirmColor }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VotacaoAdminTab() {
  const { config } = useSiteConfig();
  const importInputRef = useRef<HTMLInputElement>(null);

  const [candidatos, setCandidatos] = useState<Candidato[]>(() => {
    try {
      const saved = localStorage.getItem("inprec_candidatos");
      return saved ? JSON.parse(saved) : candidatosDefault;
    } catch {
      return candidatosDefault;
    }
  });

  const [votacaoConfig, setVotacaoConfig] = useState<VotacaoConfig>(() => {
    try {
      const saved = localStorage.getItem("inprec_votacao_config");
      return saved ? { ...votacaoConfigDefault, ...JSON.parse(saved) } : votacaoConfigDefault;
    } catch {
      return votacaoConfigDefault;
    }
  });

  const [editando, setEditando] = useState<Candidato | null>(null);
  const [grupoAtivo, setGrupoAtivo] = useState<string>("deliberativo");
  const [saved, setSaved] = useState(false);
  const [savedConfig, setSavedConfig] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // detecta se ainda tem dados padrão/mock
  const isUsingDefaultData = JSON.stringify(candidatos) === JSON.stringify(candidatosDefault);

  const persist = (updated: Candidato[]) => {
    setCandidatos(updated);
    localStorage.setItem("inprec_candidatos", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const saveConfig = (cfg: VotacaoConfig) => {
    setVotacaoConfig(cfg);
    localStorage.setItem("inprec_votacao_config", JSON.stringify(cfg));
    window.dispatchEvent(new Event("storage"));
    setSavedConfig(true);
    setTimeout(() => setSavedConfig(false), 2500);
  };

  const handleToggleAtivo = (id: number) => {
    persist(candidatos.map((c) => (c.id === id ? { ...c, ativo: !c.ativo } : c)));
  };

  const handleDelete = (id: number) => {
    persist(candidatos.filter((c) => c.id !== id));
  };

  const handleSave = (cand: Candidato) => {
    if (cand.id === 0) {
      const newId = Math.max(0, ...candidatos.map((c) => c.id)) + 1;
      persist([...candidatos, { ...cand, id: newId }]);
    } else {
      persist(candidatos.map((c) => (c.id === cand.id ? cand : c)));
    }
    setEditando(null);
  };

  const handleClearAll = () => {
    persist([]);
    setConfirmClear(false);
  };

  const handleExport = () => {
    const data = JSON.stringify(candidatos, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidatos-inprec-2026.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    setImportError("");
    importInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Candidato[];
        if (!Array.isArray(data)) throw new Error("Formato inválido");
        persist(data);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch {
        setImportError("Arquivo inválido. Certifique-se de importar um JSON exportado deste sistema.");
        setTimeout(() => setImportError(""), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const filtrados = candidatos.filter((c) => {
    const matchConselho = c.conselho === grupoAtivo;
    const matchSearch = !searchQuery || c.nomeCompleto.toLowerCase().includes(searchQuery.toLowerCase()) || String(c.numero).includes(searchQuery);
    return matchConselho && matchSearch;
  });

  const stats = {
    total: candidatos.filter((c) => c.ativo).length,
    deliberativo: candidatos.filter((c) => c.ativo && c.conselho === "deliberativo").length,
    fiscal: candidatos.filter((c) => c.ativo && c.conselho === "fiscal").length,
    comite: candidatos.filter((c) => c.ativo && c.conselho === "comite_investimento").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Sistema de Votação
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gerencie candidatos, configurações de exibição e inscrições.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/votacao"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border cursor-pointer transition-all hover:bg-gray-50 whitespace-nowrap"
            style={{ borderColor: config.primaryColor, color: config.primaryColor }}
          >
            <i className="ri-external-link-line text-sm"></i>
            Ver página
          </a>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50 whitespace-nowrap"
          >
            <i className="ri-upload-line text-sm"></i>
            Importar
          </button>
          <button
            onClick={handleExport}
            disabled={candidatos.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50 whitespace-nowrap disabled:opacity-40"
          >
            <i className="ri-download-line text-sm"></i>
            Exportar
          </button>
          <button
            onClick={() => setEditando({ ...blankCandidato, conselho: grupoAtivo as Candidato["conselho"] })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: config.primaryColor }}
          >
            <i className="ri-add-line"></i>
            Novo Candidato
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </div>

      {/* Alertas */}
      {isUsingDefaultData && (
        <div className="mb-5 px-4 py-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="ri-alert-line text-amber-600 text-base"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800 mb-0.5">Dados de exemplo — personalize antes de publicar</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Os candidatos exibidos são fictícios. Clique no lápis de cada candidato para substituir pelos dados reais, ou limpe a lista e cadastre do zero.
            </p>
          </div>
          <button
            onClick={() => setConfirmClear(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 cursor-pointer whitespace-nowrap flex-shrink-0 transition-colors"
          >
            Limpar lista
          </button>
        </div>
      )}

      {(saved || importSuccess) && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-checkbox-circle-line text-green-600"></i>
          {importSuccess ? "Lista importada com sucesso!" : "Alterações salvas com sucesso!"}
        </div>
      )}
      {importError && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2">
          <i className="ri-error-warning-line"></i>
          {importError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total de Candidatos", value: stats.total, icon: "ri-team-line", color: config.primaryColor },
          { label: "C. Deliberativo", value: stats.deliberativo, icon: "ri-government-line", color: "#059669" },
          { label: "C. Fiscal", value: stats.fiscal, icon: "ri-secure-payment-line", color: "#D97706" },
          { label: "Comitê Invest.", value: stats.comite, icon: "ri-funds-box-line", color: "#6D28D9" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-base`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.value}</p>
              <p className="text-[11px] text-gray-400 leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Configurações de exibição */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <i className="ri-settings-3-line" style={{ color: config.primaryColor }}></i>
              Configurações da Votação
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Controle o que é exibido na página pública.</p>
          </div>
          <button
            onClick={() => saveConfig(votacaoConfig)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: config.primaryColor }}
          >
            {savedConfig ? "Salvo!" : "Salvar configurações"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <Toggle
            value={votacaoConfig.ativa}
            onChange={(v) => setVotacaoConfig((p) => ({ ...p, ativa: v }))}
            label="Página de votação ativa"
            desc="Exibe a lista de candidatos publicamente"
            primaryColor={config.primaryColor}
          />
          <Toggle
            value={votacaoConfig.exibirFotos}
            onChange={(v) => setVotacaoConfig((p) => ({ ...p, exibirFotos: v }))}
            label="Exibir fotos dos candidatos"
            desc="Requer consentimento LGPD de cada candidato"
            primaryColor={config.primaryColor}
          />
          <Toggle
            value={votacaoConfig.exibirNumeros}
            onChange={(v) => setVotacaoConfig((p) => ({ ...p, exibirNumeros: v }))}
            label="Exibir número de votação"
            desc="Número visível nos cards dos candidatos"
            primaryColor={config.primaryColor}
          />
          <Toggle
            value={votacaoConfig.exibirResultados}
            onChange={(v) => setVotacaoConfig((p) => ({ ...p, exibirResultados: v }))}
            label="Exibir resultados da votação"
            desc="Ativar apenas após o encerramento"
            primaryColor={config.primaryColor}
          />
          <Toggle
            value={votacaoConfig.permitirCandidatura}
            onChange={(v) => setVotacaoConfig((p) => ({ ...p, permitirCandidatura: v }))}
            label="Exibir seção de candidatura"
            desc="Mostra opções de inscrição na página"
            primaryColor={config.primaryColor}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Título da página de candidatos</label>
            <input
              type="text"
              value={votacaoConfig.tituloVotacao}
              onChange={(e) => setVotacaoConfig((p) => ({ ...p, tituloVotacao: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              placeholder="Ex: Candidatos à Eleição INPREC 2026"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Link inscrição online (opcional)</label>
            <input
              type="text"
              value={votacaoConfig.linkInscricaoOnline}
              onChange={(e) => setVotacaoConfig((p) => ({ ...p, linkInscricaoOnline: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              placeholder="https://forms.google.com/..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Mensagem de inscrição</label>
            <textarea
              value={votacaoConfig.mensagemInscricao}
              onChange={(e) => setVotacaoConfig((p) => ({ ...p, mensagemInscricao: e.target.value }))}
              rows={2}
              maxLength={300}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Tabs por conselho + busca */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {CONSELHO_OPTIONS.map((g) => (
            <button
              key={g.key}
              onClick={() => setGrupoAtivo(g.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
              style={
                grupoAtivo === g.key
                  ? { backgroundColor: config.primaryColor, color: "white" }
                  : { color: "#6B7280" }
              }
            >
              <i className={`${g.icon} text-xs`}></i>
              {g.label.replace(" (opcional)", "")}
              <span className="ml-1 text-[10px] font-bold">
                {candidatos.filter((c) => c.conselho === g.key).length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2">
            <i className="ri-search-line text-gray-400 text-sm"></i>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar candidato..."
            className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 w-52"
          />
        </div>
      </div>

      {/* Lista de candidatos */}
      <div className="flex flex-col gap-3">
        {filtrados.length === 0 && (
          <div className="text-center py-14 text-gray-400 text-sm border border-dashed border-gray-200 rounded-2xl">
            <i className="ri-user-add-line text-3xl block mb-2 text-gray-300"></i>
            {searchQuery
              ? `Nenhum candidato encontrado para "${searchQuery}"`
              : `Nenhum candidato cadastrado para ${grupoLabels[grupoAtivo]}.`}
          </div>
        )}
        {filtrados.map((c) => (
          <div
            key={c.id}
            className={`bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 transition-opacity ${!c.ativo ? "opacity-55" : ""}`}
          >
            {/* Número */}
            <div
              className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white"
              style={{ background: c.ativo ? `linear-gradient(135deg, ${config.primaryColor}, ${config.primaryColor}cc)` : "#9CA3AF" }}
            >
              <span className="text-[9px] font-semibold uppercase opacity-80">Nº</span>
              <span className="text-lg font-bold leading-tight">{c.numero}</span>
            </div>

            {/* Foto */}
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              {c.foto ? (
                <img
                  src={c.foto}
                  alt={c.nomeCompleto}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="ri-user-line text-gray-300 text-lg"></i>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}
                >
                  {c.tipo === "titular" ? "Titular" : "Suplente"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {c.categoria === "aposentado" ? "Aposentado" : "Servidor Ativo"}
                </span>
                {!c.foto && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 flex items-center gap-1">
                    <i className="ri-image-line text-[9px]"></i>
                    Sem foto
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.ativo ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  {c.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900 truncate">{c.nomeCompleto}</p>
              <p className="text-xs text-gray-400 truncate">{c.lotacao} · Mat. {c.matricula}</p>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => handleToggleAtivo(c.id)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${c.ativo ? "hover:bg-amber-50 text-amber-500" : "hover:bg-green-50 text-green-500"}`}
                title={c.ativo ? "Desativar" : "Ativar"}
              >
                <i className={`${c.ativo ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
              </button>
              <button
                onClick={() => setEditando(c)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 cursor-pointer"
                title="Editar dados"
              >
                <i className="ri-edit-line text-sm"></i>
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
                title="Remover candidato"
              >
                <i className="ri-delete-bin-line text-sm"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ações em lote */}
      {candidatos.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">{candidatos.length} candidato{candidatos.length !== 1 ? "s" : ""} no total</p>
          <button
            onClick={() => setConfirmClear(true)}
            className="text-xs text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-1 hover:underline"
          >
            <i className="ri-delete-bin-line text-xs"></i>
            Limpar todos os candidatos
          </button>
        </div>
      )}

      {/* LGPD notice */}
      <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i className="ri-shield-check-line text-amber-600"></i>
        </div>
        <div>
          <p className="text-xs font-bold text-amber-800 mb-1">Conformidade LGPD</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Antes de cadastrar um candidato com foto e dados pessoais, certifique-se de ter obtido o consentimento expresso por escrito, conforme a Lei nº 13.709/2018. A divulgação de dados pessoais sem consentimento é vedada. Guarde os termos de consentimento assinados.
          </p>
        </div>
      </div>

      {/* Modais */}
      {editando && (
        <CandidatoFormModal
          candidato={editando}
          onSave={handleSave}
          onClose={() => setEditando(null)}
          primaryColor={config.primaryColor}
        />
      )}

      {confirmClear && (
        <ConfirmModal
          title="Limpar todos os candidatos?"
          desc="Todos os candidatos serão removidos permanentemente. Esta ação não pode ser desfeita."
          confirmLabel="Sim, limpar lista"
          confirmColor="#EF4444"
          onConfirm={handleClearAll}
          onClose={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
}
