import { useEffect, useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { servicos as servicosMock } from "@/mocks/servicos";
import { configuracoesService } from "@/services/configuracoes.service";
import { servicosService, ServicoSite } from "@/services/servicos.service";

type Servico = ServicoSite;
type CardSize = "compact" | "medium" | "large";

const iconesDisponiveis = [
  "ri-government-line", "ri-book-open-line", "ri-file-chart-line",
  "ri-shield-check-line", "ri-community-line", "ri-bar-chart-box-line",
  "ri-user-heart-line", "ri-hospital-line", "ri-briefcase-line",
  "ri-building-line", "ri-medal-line", "ri-calendar-line",
  "ri-phone-line", "ri-file-list-3-line", "ri-hand-coin-line",
  "ri-team-line", "ri-bank-line", "ri-secure-payment-line",
];

function ServicoFormModal({
  servico,
  onSave,
  onClose,
  primaryColor,
}: {
  servico: Servico;
  onSave: (s: Servico) => void;
  onClose: () => void;
  primaryColor: string;
}) {
  const [form, setForm] = useState<Servico>({ ...servico });
  const isNew = servico.id === 0;
  const upd = (k: keyof Servico, v: string | boolean | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {isNew ? "Novo Servico" : "Editar Servico"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Servicos aparecem na pagina <strong>/servicos</strong> e na secao da home.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: `${primaryColor}08` }}>
            <div className="w-12 h-12 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${primaryColor}20` }}>
              <i className={`${form.icone} text-xl`} style={{ color: primaryColor }}></i>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{form.titulo || "Titulo do servico"}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{form.descricao || "Descricao do servico..."}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Icone</label>
            <div className="flex flex-wrap gap-2">
              {iconesDisponiveis.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => upd("icone", ic)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all"
                  style={form.icone === ic ? { borderColor: primaryColor, backgroundColor: `${primaryColor}15` } : { borderColor: "#E5E7EB" }}
                >
                  <i className={`${ic} text-base`} style={{ color: form.icone === ic ? primaryColor : "#9CA3AF" }}></i>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Titulo do Servico</label>
            <input value={form.titulo} onChange={(e) => upd("titulo", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Descricao</label>
            <textarea value={form.descricao} onChange={(e) => upd("descricao", e.target.value)} rows={3} maxLength={200} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Link de Destino</label>
            <input value={form.link || ""} onChange={(e) => upd("link", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer" onClick={() => upd("ativo", form.ativo === false)}>
            <div className="w-10 h-5 rounded-full relative transition-all flex-shrink-0" style={{ backgroundColor: form.ativo !== false ? primaryColor : "#E5E7EB" }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: form.ativo !== false ? "calc(100% - 18px)" : "2px" }}></div>
            </div>
            <span className="text-sm font-medium text-gray-700">{form.ativo !== false ? "Ativo" : "Inativo"}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">Cancelar</button>
            <button onClick={() => onSave(form)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90" style={{ backgroundColor: primaryColor }}>
              {isNew ? "Adicionar Servico" : "Salvar Alteracoes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicosTab() {
  const { config } = useSiteConfig();
  const [lista, setLista] = useState<Servico[]>(servicosMock.map((x) => ({ ...x, ativo: true })));
  const [editando, setEditando] = useState<Servico | null>(null);
  const [saved, setSaved] = useState(false);
  const [cardSize, setCardSize] = useState<CardSize>("compact");

  useEffect(() => {
    Promise.all([
      servicosService.listarAdmin().catch(() => servicosMock.map((x) => ({ ...x, ativo: true }))),
      configuracoesService.obterServicosCardSize().catch(() => "compact"),
    ]).then(([servicos, size]) => {
      setLista(servicos);
      setCardSize((size as CardSize) || "compact");
    });
  }, []);

  const toast = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    window.dispatchEvent(new Event("inprec-servicos-updated"));
  };

  const handleSizeChange = async (size: CardSize) => {
    setCardSize(size);
    await configuracoesService.salvarServicosCardSize(size);
    toast();
  };

  const persist = async (updated: Servico[]) => {
    setLista(updated);
    toast();
  };

  const handleToggle = async (id: number) => {
    const alvo = lista.find((item) => item.id === id);
    if (!alvo) return;
    const salvo = await servicosService.salvar({ ...alvo, ativo: alvo.ativo === false, ordem: alvo.ordem || 0 });
    await persist(lista.map((item) => (item.id === id ? salvo : item)));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este servico permanentemente?")) return;
    await servicosService.remover(id);
    await persist(lista.filter((item) => item.id !== id));
  };

  const handleSave = async (s: Servico) => {
    const payload = { ...s, ordem: s.ordem || lista.length + 1 };
    const salvo = await servicosService.salvar(payload);
    if (s.id === 0) {
      await persist([...lista, salvo]);
    } else {
      await persist(lista.map((item) => (item.id === s.id ? salvo : item)));
    }
    setEditando(null);
  };

  const blank: Servico = {
    id: 0,
    icone: "ri-service-line",
    titulo: "",
    descricao: "",
    ativo: true,
    link: "",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Servicos</h1>
          <p className="text-sm text-gray-400 mt-1">Gerencie os servicos exibidos na pagina <strong>/servicos</strong> e na secao de servicos da home.</p>
        </div>
        <button onClick={() => setEditando(blank)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90" style={{ backgroundColor: config.primaryColor }}>
          <i className="ri-add-line"></i> Novo Servico
        </button>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Salvo com sucesso!
        </div>
      )}

      <div className="mb-5 p-4 rounded-xl bg-white border border-gray-100">
        <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <i className="ri-layout-grid-line text-sm" style={{ color: config.primaryColor }}></i>
          Tamanho dos atalhos de servico na home
        </p>
        <div className="flex gap-2">
          {([
            { key: "compact" as CardSize, label: "Compacto", desc: "Atalhos menores, cabe mais na tela", icon: "ri-grid-fill" },
            { key: "medium" as CardSize, label: "Medio", desc: "Tamanho equilibrado com descricao", icon: "ri-grid-line" },
            { key: "large" as CardSize, label: "Grande", desc: "Cards maiores e mais detalhados", icon: "ri-layout-grid-2-line" },
          ]).map((opt) => (
            <button key={opt.key} onClick={() => void handleSizeChange(opt.key)} className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 cursor-pointer transition-all" style={cardSize === opt.key ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}08` } : { borderColor: "#E5E7EB" }}>
              <i className={`${opt.icon} text-lg`} style={{ color: cardSize === opt.key ? config.primaryColor : "#9CA3AF" }}></i>
              <span className="text-xs font-semibold" style={{ color: cardSize === opt.key ? config.primaryColor : "#374151" }}>{opt.label}</span>
              <span className="text-[10px] text-gray-400 text-center leading-tight">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lista.map((s) => (
          <div key={s.id} className={`bg-white rounded-2xl border border-gray-100 p-5 transition-all ${s.ativo === false ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}15` }}>
                <i className={`${s.icone} text-base`} style={{ color: config.primaryColor }}></i>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.ativo === false ? "bg-gray-100 text-gray-400" : "bg-green-50 text-green-600"}`}>
                {s.ativo === false ? "Inativo" : "Ativo"}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">{s.titulo}</p>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">{s.descricao}</p>
            <div className="flex gap-1.5">
              <button onClick={() => void handleToggle(s.id)} className={`flex-1 py-1.5 flex items-center justify-center gap-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${s.ativo === false ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}>
                <i className={s.ativo === false ? "ri-eye-line text-xs" : "ri-eye-off-line text-xs"}></i>
                {s.ativo === false ? "Ativar" : "Ocultar"}
              </button>
              <button onClick={() => setEditando(s)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 cursor-pointer">
                <i className="ri-edit-line text-sm"></i>
              </button>
              <button onClick={() => void handleDelete(s.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer">
                <i className="ri-delete-bin-line text-sm"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {editando && <ServicoFormModal servico={editando} onSave={(item) => void handleSave(item)} onClose={() => setEditando(null)} primaryColor={config.primaryColor} />}
    </div>
  );
}
