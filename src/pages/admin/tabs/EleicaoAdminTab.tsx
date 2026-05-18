import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

interface CargoCandidatura {
  id: number;
  nome: string;
  vagas: number;
  tipo: "titular" | "suplente";
}

interface EleicaoConfig {
  titulo: string;
  subtitulo: string;
  descricao: string;
  dataInicio: string;
  dataEncerramento: string;
  horaEncerramento: string;
  local: string;
  linkEdital: string;
  linkResultado: string;
  status: "em_breve" | "em_andamento" | "encerrada";
  cargos: CargoCandidatura[];
}

const defaultConfig: EleicaoConfig = {
  titulo: "Eleição dos Conselhos e Comitê INPREC 2026",
  subtitulo: "Exercício da Democracia Previdenciária",
  descricao: "Participe da eleição para composição dos Conselhos Deliberativo, Fiscal e Comitê de Investimento do INPREC. Sua participação garante uma gestão transparente e representativa do instituto.",
  dataInicio: "2026-05-01",
  dataEncerramento: "2026-05-31",
  horaEncerramento: "17:00",
  local: "Sede do INPREC — Rua 31 de Março, s/n, Centro, Cujubim - RO",
  linkEdital: "",
  linkResultado: "",
  status: "em_andamento",
  cargos: [
    { id: 1, nome: "Conselho Deliberativo — Titular", vagas: 3, tipo: "titular" },
    { id: 2, nome: "Conselho Deliberativo — Suplente", vagas: 2, tipo: "suplente" },
    { id: 3, nome: "Conselho Fiscal — Titular", vagas: 3, tipo: "titular" },
    { id: 4, nome: "Conselho Fiscal — Suplente", vagas: 2, tipo: "suplente" },
    { id: 5, nome: "Comitê de Investimento — Titular", vagas: 2, tipo: "titular" },
  ],
};

export default function EleicaoAdminTab() {
  const { config } = useSiteConfig();
  const [form, setForm] = useState<EleicaoConfig>(() => {
    try {
      const saved = localStorage.getItem("inprec_eleicao_config");
      return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
    } catch {
      return defaultConfig;
    }
  });
  const [saved, setSaved] = useState(false);
  const [newCargo, setNewCargo] = useState({ nome: "", vagas: 1, tipo: "titular" as "titular" | "suplente" });

  const upd = (k: keyof EleicaoConfig, v: string) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    localStorage.setItem("inprec_eleicao_config", JSON.stringify(form));
    window.dispatchEvent(new Event("storage"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addCargo = () => {
    if (!newCargo.nome.trim()) return;
    const id = Math.max(0, ...form.cargos.map(c => c.id)) + 1;
    setForm(p => ({ ...p, cargos: [...p.cargos, { ...newCargo, id }] }));
    setNewCargo({ nome: "", vagas: 1, tipo: "titular" });
  };

  const removeCargo = (id: number) =>
    setForm(p => ({ ...p, cargos: p.cargos.filter(c => c.id !== id) }));

  const formatDate = (d: string) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  const statusOptions = [
    { value: "em_breve", label: "Em Breve", color: "#D97706", icon: "ri-time-line" },
    { value: "em_andamento", label: "Em Andamento", color: "#16a34a", icon: "ri-checkbox-circle-line" },
    { value: "encerrada", label: "Encerrada", color: "#6B7280", icon: "ri-close-circle-line" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Gestão da Eleição
          </h1>
          <p className="text-sm text-gray-400 mt-1">Configure a página de Eleição dos Conselhos e Comitê INPREC.</p>
        </div>
        <a
          href="/eleicao"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-all hover:bg-gray-50"
          style={{ borderColor: config.primaryColor, color: config.primaryColor }}
        >
          <i className="ri-external-link-line text-sm"></i>
          Ver Página
        </a>
      </div>

      {saved && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Configurações salvas! A página já está atualizada.
        </div>
      )}

      <div className="flex flex-col gap-6 max-w-2xl">

        {/* Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <i className="ri-signal-wifi-line" style={{ color: config.primaryColor }}></i>
            Status da Eleição
          </h2>
          <p className="text-xs text-gray-400 mb-4">Controla o estado exibido no topo da página e ativa/desativa o formulário de inscrição.</p>
          <div className="grid grid-cols-3 gap-3">
            {statusOptions.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setForm(p => ({ ...p, status: s.value as EleicaoConfig["status"] }))}
                className="flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 cursor-pointer transition-all"
                style={form.status === s.value ? { borderColor: s.color, backgroundColor: `${s.color}08` } : { borderColor: "#F3F4F6" }}
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full" style={{ backgroundColor: form.status === s.value ? `${s.color}20` : "#F9FAFB" }}>
                  <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                </div>
                <span className="text-xs font-semibold text-gray-700">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Informações gerais */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <i className="ri-edit-line" style={{ color: config.primaryColor }}></i>
            Textos da Página
          </h2>
          <p className="text-xs text-gray-400 mb-4">Personalize o nome e os textos da eleição.</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Título da Eleição</label>
              <input
                type="text"
                value={form.titulo}
                onChange={e => upd("titulo", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Ex: Eleição dos Conselhos e Comitê INPREC 2026"
              />
              <p className="text-[11px] text-gray-400 mt-1">Aparece como título principal na página e no hero.</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Subtítulo</label>
              <input
                type="text"
                value={form.subtitulo}
                onChange={e => upd("subtitulo", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Ex: Exercício da Democracia Previdenciária"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Descrição / Apresentação</label>
              <textarea
                value={form.descricao}
                onChange={e => upd("descricao", e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
                placeholder="Descreva o objetivo e a importância desta eleição..."
              />
              <p className="text-[11px] text-gray-400 mt-1">{form.descricao.length}/500 caracteres</p>
            </div>
          </div>
        </div>

        {/* Datas e local */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <i className="ri-calendar-event-line" style={{ color: config.primaryColor }}></i>
            Datas e Local
          </h2>
          <p className="text-xs text-gray-400 mb-4">Defina o período da eleição. O contador regressivo usa a data/hora de encerramento automaticamente.</p>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Data de Início</label>
                <input
                  type="date"
                  value={form.dataInicio}
                  onChange={e => upd("dataInicio", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
                />
                {form.dataInicio && <p className="text-[11px] text-gray-400 mt-1">{formatDate(form.dataInicio)}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Data de Encerramento</label>
                <input
                  type="date"
                  value={form.dataEncerramento}
                  onChange={e => upd("dataEncerramento", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
                />
                {form.dataEncerramento && <p className="text-[11px] text-gray-400 mt-1">{formatDate(form.dataEncerramento)}</p>}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Horário de Encerramento</label>
              <input
                type="time"
                value={form.horaEncerramento}
                onChange={e => upd("horaEncerramento", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
              />
              <p className="text-[11px] text-gray-400 mt-1">O contador regressivo zera neste horário do dia de encerramento.</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Local de Votação</label>
              <input
                type="text"
                value={form.local}
                onChange={e => upd("local", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Ex: Sede do INPREC — Rua 31 de Março, s/n, Cujubim - RO"
              />
            </div>
          </div>
        </div>

        {/* Documentos */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <i className="ri-file-text-line" style={{ color: config.primaryColor }}></i>
            Documentos (opcional)
          </h2>
          <p className="text-xs text-gray-400 mb-4">Links para edital e resultado. Deixe em branco para ocultar.</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Link do Edital (PDF ou URL)</label>
              <input
                type="text"
                value={form.linkEdital}
                onChange={e => upd("linkEdital", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="https://... (link do edital em PDF ou Google Drive)"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Link do Resultado Oficial</label>
              <input
                type="text"
                value={form.linkResultado}
                onChange={e => upd("linkResultado", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="https://... (link do resultado após a eleição)"
              />
            </div>
          </div>
        </div>

        {/* Cargos */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <i className="ri-group-line" style={{ color: config.primaryColor }}></i>
            Cargos em Disputa
          </h2>
          <p className="text-xs text-gray-400 mb-4">Configure os cargos disponíveis para candidatura. Aparecem na página e no formulário de inscrição.</p>

          <div className="flex flex-col gap-2 mb-4">
            {form.cargos.map((cargo) => (
              <div key={cargo.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div
                  className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ backgroundColor: cargo.tipo === "titular" ? config.primaryColor : "#9CA3AF" }}
                >
                  <i className={`${cargo.tipo === "titular" ? "ri-user-star-line" : "ri-user-line"} text-white text-xs`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{cargo.nome}</p>
                  <p className="text-[11px] text-gray-400">{cargo.vagas} vaga{cargo.vagas !== 1 ? "s" : ""} · {cargo.tipo === "titular" ? "Titular" : "Suplente"}</p>
                </div>
                <button
                  onClick={() => removeCargo(cargo.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer flex-shrink-0 transition-colors"
                >
                  <i className="ri-delete-bin-line text-xs"></i>
                </button>
              </div>
            ))}
          </div>

          {/* Adicionar cargo */}
          <div className="border border-dashed border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-600 mb-3">Adicionar novo cargo</p>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={newCargo.nome}
                onChange={e => setNewCargo(p => ({ ...p, nome: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Ex: Conselho Deliberativo — Titular"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">Nº de vagas</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newCargo.vagas}
                    onChange={e => setNewCargo(p => ({ ...p, vagas: parseInt(e.target.value) || 1 }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">Tipo</label>
                  <select
                    value={newCargo.tipo}
                    onChange={e => setNewCargo(p => ({ ...p, tipo: e.target.value as "titular" | "suplente" }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="titular">Titular</option>
                    <option value="suplente">Suplente</option>
                  </select>
                </div>
              </div>
              <button
                onClick={addCargo}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity text-white"
                style={{ backgroundColor: config.primaryColor }}
              >
                <i className="ri-add-line"></i>
                Adicionar Cargo
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="py-3.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: config.primaryColor }}
        >
          {saved ? "Salvo com sucesso!" : "Salvar Configurações da Eleição"}
        </button>
      </div>
    </div>
  );
}
