import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { floatingButtonsDefault, FloatingButtonConfig, FloatBtnType } from "@/mocks/floating-buttons";

export const FLOAT_STORAGE_KEY = "inprec_floating_buttons";

export function loadFloatingButtons(): FloatingButtonConfig[] {
  try {
    const s = localStorage.getItem(FLOAT_STORAGE_KEY);
    const saved = s ? JSON.parse(s) as FloatingButtonConfig[] : [];
    const byId = new Map(saved.map((btn) => [btn.id, btn]));
    const merged = [
      ...floatingButtonsDefault.map((btn) => ({ ...btn, ...(byId.get(btn.id) || {}) })),
      ...saved.filter((btn) => !floatingButtonsDefault.some((def) => def.id === btn.id)),
    ];
    const migratedKey = "inprec_float_survey_accessibility_migrated";
    if (!localStorage.getItem(migratedKey)) {
      const migrated = merged.map((btn) => {
        if (btn.id === "accessibility") return { ...btn, ativo: false };
        if (btn.id === "pesquisa-satisfacao") return { ...btn, ativo: true, lado: "esquerdo" as const, url: "/pesquisa-satisfacao#participar" };
        return btn;
      });
      localStorage.setItem(FLOAT_STORAGE_KEY, JSON.stringify(migrated));
      localStorage.setItem(migratedKey, "true");
      return migrated.sort((a, b) => a.ordem - b.ordem);
    }
    return merged.sort((a, b) => a.ordem - b.ordem);
  } catch {
    return floatingButtonsDefault;
  }
}

const iconesPicker = [
  "ri-whatsapp-line", "ri-phone-line", "ri-robot-2-line", "ri-file-text-line",
  "ri-hand-heart-line", "ri-survey-line", "ri-customer-service-2-line", "ri-mail-line", "ri-map-pin-line",
  "ri-calendar-line", "ri-question-answer-line", "ri-megaphone-line", "ri-star-line",
  "ri-link-m", "ri-external-link-line", "ri-home-line", "ri-information-line",
];

const tiposDisponiveis: { tipo: FloatBtnType; label: string; desc: string; icone: string }[] = [
  { tipo: "whatsapp", label: "WhatsApp", desc: "Abre conversa no WhatsApp", icone: "ri-whatsapp-line" },
  { tipo: "chat", label: "Chat / Assistente", desc: "Abre o chat do assistente virtual", icone: "ri-robot-2-line" },
  { tipo: "phone", label: "Telefone", desc: "Inicia ligaÃ§Ã£o ao clicar", icone: "ri-phone-line" },
  { tipo: "contracheque", label: "Contracheque", desc: "Link para acesso ao contracheque", icone: "ri-file-text-line" },
  { tipo: "accessibility", label: "Acessibilidade", desc: "Botão de zoom e contraste", icone: "ri-hand-heart-line" },
  { tipo: "link", label: "Link Personalizado", desc: "Qualquer URL interna ou externa", icone: "ri-link-m" },
];

const coresSugeridas = [
  "#25D366", "#059669", "#16a34a", "#1A56DB", "#DC2626",
  "#D97706", "#7C3AED", "#0891B2", "#374151", "#EC4899",
];

function BtnFormModal({
  btn,
  onSave,
  onClose,
  primaryColor,
}: {
  btn: FloatingButtonConfig;
  onSave: (b: FloatingButtonConfig) => void;
  onClose: () => void;
  primaryColor: string;
}) {
  const [form, setForm] = useState<FloatingButtonConfig>({ ...btn });
  const isNew = btn.id === "";
  const upd = (k: keyof FloatingButtonConfig, v: string | boolean | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  const needsUrl = form.tipo === "link" || form.tipo === "contracheque" || form.tipo === "phone";
  const urlLabel =
    form.tipo === "phone" ? "NÃºmero de Telefone (ex: tel:+556939013200)"
    : form.tipo === "contracheque" ? "URL do Contracheque"
    : "URL de destino";
  const urlPlaceholder =
    form.tipo === "phone" ? "tel:+556939013200"
    : form.tipo === "contracheque" ? "https://contracheque.prefeitura.gov.br"
    : "https://... ou /pagina-interna";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {isNew ? "Novo BotÃ£o Flutuante" : `Editar: ${btn.label}`}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Preview */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl flex-shrink-0"
              style={{ backgroundColor: form.cor }}>
              <i className={`${form.icone} text-white text-xl`}></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">PrÃ©-visualizaÃ§Ã£o</p>
              <p className="text-xs text-gray-400">{form.label || "Sem label"} â€” lado {form.lado}</p>
            </div>
          </div>

          {/* Tipo */}
          {isNew && (
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Tipo do BotÃ£o</label>
              <div className="grid grid-cols-2 gap-2">
                {tiposDisponiveis.map((t) => (
                  <button key={t.tipo} onClick={() => upd("tipo", t.tipo)}
                    className="flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all text-left"
                    style={form.tipo === t.tipo ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` } : { borderColor: "#E5E7EB" }}>
                    <i className={`${t.icone} text-base`} style={{ color: form.tipo === t.tipo ? primaryColor : "#9CA3AF" }}></i>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{t.label}</p>
                      <p className="text-[10px] text-gray-400">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Label */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Label / Nome</label>
            <input value={form.label} onChange={(e) => upd("label", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              placeholder="Ex: WhatsApp, Contracheque..." />
          </div>

          {/* URL (condicional) */}
          {needsUrl && (
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{urlLabel}</label>
              <input value={form.url} onChange={(e) => upd("url", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder={urlPlaceholder} />
            </div>
          )}

          {/* Ãcone */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Ãcone</label>
            <div className="flex flex-wrap gap-2">
              {iconesPicker.map((ic) => (
                <button key={ic} onClick={() => upd("icone", ic)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all"
                  style={form.icone === ic ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` } : { borderColor: "#E5E7EB" }}>
                  <i className={`${ic} text-base`} style={{ color: form.icone === ic ? primaryColor : "#9CA3AF" }}></i>
                </button>
              ))}
            </div>
          </div>

          {/* Cor */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Cor do BotÃ£o</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {coresSugeridas.map((c) => (
                <button key={c} onClick={() => upd("cor", c)}
                  className="w-8 h-8 rounded-full border-4 cursor-pointer transition-all"
                  style={{ backgroundColor: c, borderColor: form.cor === c ? "#1F2937" : "transparent" }}>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="color" value={form.cor} onChange={(e) => upd("cor", e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
              <input type="text" value={form.cor} onChange={(e) => upd("cor", e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none font-mono" />
            </div>
          </div>

          {/* Lado + Mostrar Label */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PosiÃ§Ã£o na Tela</label>
              <select value={form.lado} onChange={(e) => upd("lado", e.target.value as "direito" | "esquerdo")}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
                <option value="direito">Lado Direito</option>
                <option value="esquerdo">Lado Esquerdo</option>
              </select>
            </div>
            <div className="flex flex-col justify-between">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Mostrar Texto</label>
              <div className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-gray-50"
                onClick={() => upd("mostrarLabel", !form.mostrarLabel)}>
                <div className="w-9 h-5 rounded-full relative transition-all flex-shrink-0"
                  style={{ backgroundColor: form.mostrarLabel ? primaryColor : "#E5E7EB" }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: form.mostrarLabel ? "calc(100% - 18px)" : "2px" }}></div>
                </div>
                <span className="text-xs font-medium text-gray-700">{form.mostrarLabel ? "Sim" : "NÃ£o"}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer"
            onClick={() => upd("ativo", !form.ativo)}>
            <div className="w-11 h-6 rounded-full relative transition-all flex-shrink-0"
              style={{ backgroundColor: form.ativo ? primaryColor : "#E5E7EB" }}>
              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: form.ativo ? "calc(100% - 22px)" : "2px" }}></div>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {form.ativo ? "BotÃ£o ativo (visÃ­vel no site)" : "BotÃ£o desativado (oculto)"}
            </span>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">Cancelar</button>
            <button onClick={() => onSave(form)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90"
              style={{ backgroundColor: primaryColor }}>
              {isNew ? "Adicionar BotÃ£o" : "Salvar AlteraÃ§Ãµes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FloatingButtonsTab() {
  const { config, updateConfig } = useSiteConfig();
  const [lista, setLista] = useState<FloatingButtonConfig[]>(loadFloatingButtons);
  const [editando, setEditando] = useState<FloatingButtonConfig | null>(null);
  const [criando, setCriando] = useState(false);
  const [saved, setSaved] = useState(false);

  const persist = (updated: FloatingButtonConfig[]) => {
    setLista(updated);
    localStorage.setItem(FLOAT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("inprec-floating-buttons-updated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = (b: FloatingButtonConfig) => {
    if (criando) {
      const newId = `btn-${Date.now()}`;
      persist([...lista, { ...b, id: newId, ordem: lista.length + 1 }]);
    } else {
      persist(lista.map((x) => x.id === b.id ? b : x));
    }
    setEditando(null);
    setCriando(false);
  };

  const handleToggle = (id: string) =>
    persist(lista.map((b) => b.id === id ? { ...b, ativo: !b.ativo } : b));

  const handleDelete = (id: string) => {
    if (!confirm("Remover este botÃ£o flutuante?")) return;
    persist(lista.filter((b) => b.id !== id));
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...lista];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    persist(arr.map((b, i) => ({ ...b, ordem: i + 1 })));
  };

  const handleMoveDown = (idx: number) => {
    if (idx === lista.length - 1) return;
    const arr = [...lista];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    persist(arr.map((b, i) => ({ ...b, ordem: i + 1 })));
  };

  const blank: FloatingButtonConfig = {
    id: "", label: "", tipo: "link", icone: "ri-link-m", cor: config.primaryColor,
    url: "", lado: "direito", ativo: true, ordem: lista.length + 1, mostrarLabel: false,
  };

  const esquerdo = lista.filter((b) => b.lado === "esquerdo");
  const direito = lista.filter((b) => b.lado === "direito");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>BotÃµes Flutuantes</h1>
          <p className="text-sm text-gray-400 mt-1">Gerencie os botÃµes fixos que aparecem nos cantos do site (WhatsApp, Chat, Contracheque, etc.).</p>
        </div>
        <button onClick={() => { setCriando(true); setEditando(blank); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90"
          style={{ backgroundColor: config.primaryColor }}>
          <i className="ri-add-line"></i> Novo BotÃ£o
        </button>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> AlteraÃ§Ãµes salvas!
        </div>
      )}

      {/* SeÃ§Ã£o Barra de Acessibilidade (Topo) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Barra de Acessibilidade (Topo)</h2>
            <p className="text-[11px] text-gray-400">Controla a barra superior com botÃµes de zoom e contraste.</p>
          </div>
          <div className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg bg-gray-50"
            onClick={() => {
              const newVal = !config.topbarVisivel;
              updateConfig({ topbarVisivel: newVal });
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}>
            <div className="w-9 h-5 rounded-full relative transition-all"
              style={{ backgroundColor: config.topbarVisivel ? config.primaryColor : "#E5E7EB" }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: config.topbarVisivel ? "calc(100% - 18px)" : "2px" }}></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { key: "topbarEmailVisivel", label: "Mostrar E-mail" },
            { key: "topbarTelefoneVisivel", label: "Mostrar Telefone" },
            { key: "topbarRedesVisivel", label: "Mostrar Redes Sociais" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                // @ts-ignore
                updateConfig({ [item.key]: !config[item.key] });
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-all text-left"
            >
              <div className="w-5 h-5 flex items-center justify-center rounded-md border border-gray-200 bg-white">
                {/* @ts-ignore */}
                {config[item.key] && <i className="ri-check-line text-xs" style={{ color: config.primaryColor }}></i>}
              </div>
              <span className="text-xs font-medium text-gray-600">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview visual */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">PrÃ©-visualizaÃ§Ã£o</p>
        <div className="relative bg-gray-50 rounded-xl border border-dashed border-gray-200 h-40 overflow-hidden">
          <p className="absolute inset-0 flex items-center justify-center text-xs text-gray-300">Tela do site</p>
          {/* Esquerdo */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-2 items-start">
            {esquerdo.filter(b => b.ativo).map((b) => (
              <div key={b.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-white text-xs font-medium"
                style={{ backgroundColor: b.cor }}>
                <i className={`${b.icone} text-sm`}></i>
                {b.mostrarLabel && <span>{b.label}</span>}
              </div>
            ))}
          </div>
          {/* Direito */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-2 items-end">
            {direito.filter(b => b.ativo).map((b) => (
              <div key={b.id} className="w-8 h-8 flex items-center justify-center rounded-full text-white text-sm"
                style={{ backgroundColor: b.cor }}>
                <i className={`${b.icone}`}></i>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lado Direito */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <i className="ri-layout-right-2-line text-gray-400 text-sm"></i>
          <span className="text-sm font-bold text-gray-700">Lado Direito</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${config.primaryColor}10`, color: config.primaryColor }}>
            {direito.length}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {direito.map((b, idx) => (
            <BtnRow key={b.id} btn={b} idx={idx} total={direito.length}
              primaryColor={config.primaryColor}
              onEdit={() => { setCriando(false); setEditando(b); }}
              onToggle={() => handleToggle(b.id)}
              onDelete={() => handleDelete(b.id)}
              onUp={() => handleMoveUp(lista.indexOf(b))}
              onDown={() => handleMoveDown(lista.indexOf(b))} />
          ))}
          {direito.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">Nenhum botÃ£o no lado direito.</p>}
        </div>
      </div>

      {/* Lado Esquerdo */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <i className="ri-layout-left-2-line text-gray-400 text-sm"></i>
          <span className="text-sm font-bold text-gray-700">Lado Esquerdo</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${config.primaryColor}10`, color: config.primaryColor }}>
            {esquerdo.length}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {esquerdo.map((b, idx) => (
            <BtnRow key={b.id} btn={b} idx={idx} total={esquerdo.length}
              primaryColor={config.primaryColor}
              onEdit={() => { setCriando(false); setEditando(b); }}
              onToggle={() => handleToggle(b.id)}
              onDelete={() => handleDelete(b.id)}
              onUp={() => handleMoveUp(lista.indexOf(b))}
              onDown={() => handleMoveDown(lista.indexOf(b))} />
          ))}
          {esquerdo.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">Nenhum botÃ£o no lado esquerdo.</p>}
        </div>
      </div>

      {editando !== null && (
        <BtnFormModal btn={editando} onSave={handleSave}
          onClose={() => { setEditando(null); setCriando(false); }}
          primaryColor={config.primaryColor} />
      )}
    </div>
  );
}

function BtnRow({ btn, idx, total, primaryColor, onEdit, onToggle, onDelete, onUp, onDown }: {
  btn: FloatingButtonConfig; idx: number; total: number; primaryColor: string;
  onEdit: () => void; onToggle: () => void; onDelete: () => void; onUp: () => void; onDown: () => void;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 ${!btn.ativo ? "opacity-50" : ""}`}>
      <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
        style={{ backgroundColor: btn.cor }}>
        <i className={`${btn.icone} text-white text-lg`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">{btn.label}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${btn.ativo ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
            {btn.ativo ? "Ativo" : "Inativo"}
          </span>
          {btn.mostrarLabel && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Com texto</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Tipo: {btn.tipo} Â· #{idx + 1}</p>
        {btn.url && <p className="text-[10px] text-gray-300 truncate mt-0.5">{btn.url}</p>}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={onUp} disabled={idx === 0} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer disabled:opacity-30">
          <i className="ri-arrow-up-s-line text-sm"></i>
        </button>
        <button onClick={onDown} disabled={idx === total - 1} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer disabled:opacity-30">
          <i className="ri-arrow-down-s-line text-sm"></i>
        </button>
        <button onClick={onToggle}
          className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer ${btn.ativo ? "hover:bg-amber-50 text-amber-500" : "hover:bg-green-50 text-green-500"}`}>
          <i className={`${btn.ativo ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
        </button>
        <button onClick={onEdit} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer">
          <i className="ri-edit-line text-sm"></i>
        </button>
        <button onClick={onDelete} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer">
          <i className="ri-delete-bin-line text-sm"></i>
        </button>
      </div>
    </div>
  );
}
