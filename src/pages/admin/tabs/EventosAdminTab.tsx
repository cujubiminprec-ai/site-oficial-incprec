import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useSlidesAdmin } from "@/hooks/useSlidesAdmin";
import ImageGalleryUploader, { GalleryImage } from "@/components/base/ImageGalleryUploader";
import TextoMagico, { MagicFields } from "@/components/base/TextoMagico";

export interface EventoAdmin {
  id: number;
  titulo: string;
  tipo: "evento" | "audiencia" | "capacitacao" | "palestra";
  status: "publicado" | "rascunho" | "encerrado" | "em-breve";
  data: string;
  dataFim?: string;
  hora: string;
  local: string;
  descricao: string;
  conteudo: string;
  tags: string[];
  vagas?: number;
  inscricaoAberta: boolean;
  linkInscricao?: string;
  publicado: boolean;
  destaque: boolean;
  imagens: GalleryImage[];
  criado: string;
}

const STORAGE_KEY = "inprec_eventos_admin";

const EVENTOS_DEFAULT: EventoAdmin[] = [
  {
    id: 1,
    titulo: "Semana da Previdência – INPREC 2026",
    tipo: "evento",
    status: "em-breve",
    data: "2026-06-02",
    hora: "09:00",
    local: "Auditório da Prefeitura Municipal de Cujubim",
    descricao: "Evento comemorativo com palestras, stands informativos e atendimento especializado aos servidores.",
    conteudo: "O INPREC realizará mais uma edição da Semana da Previdência, um evento especial com palestras, stands informativos e atendimento personalizado.\n\nDurante os cinco dias do evento, os servidores poderão tirar dúvidas sobre benefícios previdenciários, solicitar simulações de aposentadoria e conhecer mais sobre os serviços oferecidos pelo instituto.\n\nA participação é gratuita e aberta a todos os servidores municipais ativos, aposentados e pensionistas.",
    tags: ["evento", "previdência", "INPREC", "servidores"],
    vagas: 500,
    inscricaoAberta: true,
    linkInscricao: "/eventos",
    publicado: true,
    destaque: true,
    imagens: [
      { id: "ev1_1", url: "https://readdy.ai/api/search-image?query=government%20institutional%20event%20auditorium%20audience%20seminar%20formal%20setting%20professional%20lighting%20rows%20of%20seats%20podium%20banner%20clean%20background&width=800&height=500&seq=ev_default_1&orientation=landscape", isCover: true, ativo: true },
    ],
    criado: "2026-04-01",
  },
  {
    id: 2,
    titulo: "Audiência Pública: Prestação de Contas 1º Trimestre 2026",
    tipo: "audiencia",
    status: "publicado",
    data: "2026-04-28",
    hora: "14:00",
    local: "Câmara Municipal de Cujubim",
    descricao: "Audiência pública para apresentação dos resultados financeiros e previdenciários do 1º trimestre de 2026.",
    conteudo: "O INPREC convoca todos os servidores e cidadãos interessados para a Audiência Pública de Prestação de Contas referente ao 1º trimestre de 2026.\n\nSerão apresentados os demonstrativos financeiros, atuariais e de gestão do Regime Próprio de Previdência Social do município de Cujubim.\n\nA participação da comunidade é fundamental para garantir a transparência na gestão dos recursos previdenciários.",
    tags: ["audiência pública", "transparência", "prestação de contas", "INPREC"],
    inscricaoAberta: false,
    publicado: true,
    destaque: false,
    imagens: [
      { id: "ev2_1", url: "https://readdy.ai/api/search-image?query=public%20hearing%20chamber%20government%20meeting%20official%20presentation%20accountability%20formal%20room%20microphone%20table%20clean%20neutral%20background&width=800&height=500&seq=ev_default_2&orientation=landscape", isCover: true, ativo: true },
    ],
    criado: "2026-04-05",
  },
  {
    id: 3,
    titulo: "Palestra: Planejamento para Aposentadoria",
    tipo: "palestra",
    status: "publicado",
    data: "2026-04-18",
    hora: "10:00",
    local: "Auditório INPREC",
    descricao: "Palestra sobre como planejar a aposentadoria com antecedência, incluindo simulações e orientações práticas.",
    conteudo: "O INPREC promove palestra especial sobre planejamento previdenciário, destinada a servidores que pretendem se aposentar nos próximos anos.\n\nO evento abordará temas como cálculo do tempo de contribuição, regras de transição pós-EC 103/2019, estratégias de planejamento financeiro e os principais cuidados na fase de transição para a aposentadoria.",
    tags: ["palestra", "aposentadoria", "previdência", "planejamento"],
    vagas: 100,
    inscricaoAberta: true,
    publicado: true,
    destaque: false,
    imagens: [],
    criado: "2026-03-20",
  },
];

function loadEventos(): EventoAdmin[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : EVENTOS_DEFAULT;
  } catch { return EVENTOS_DEFAULT; }
}

function saveEventos(data: EventoAdmin[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR");
}

const TIPO_OPTS = [
  { value: "evento", label: "Evento", icon: "ri-calendar-event-line", color: "#7C3AED" },
  { value: "audiencia", label: "Audiência Pública", icon: "ri-government-line", color: "#0891B2" },
  { value: "capacitacao", label: "Capacitação", icon: "ri-book-open-line", color: "#059669" },
  { value: "palestra", label: "Palestra", icon: "ri-mic-line", color: "#D97706" },
];

const STATUS_OPTS = [
  { value: "publicado", label: "Publicado", color: "bg-green-100 text-green-700" },
  { value: "em-breve", label: "Em Breve", color: "bg-amber-100 text-amber-700" },
  { value: "encerrado", label: "Encerrado", color: "bg-gray-100 text-gray-500" },
  { value: "rascunho", label: "Rascunho", color: "bg-gray-100 text-gray-400" },
];

const STATUS_COLORS: Record<string, string> = {
  publicado: "bg-green-100 text-green-700",
  "em-breve": "bg-amber-100 text-amber-700",
  encerrado: "bg-gray-100 text-gray-500",
  rascunho: "bg-gray-100 text-gray-400",
};

// ── Formulário Modal ─────────────────────────────────────────────────────────────
interface EventoFormProps {
  evento: EventoAdmin;
  onSave: (e: EventoAdmin) => void;
  onClose: () => void;
  primaryColor: string;
}

function EventoForm({ evento, onSave, onClose, primaryColor }: EventoFormProps) {
  const [form, setForm] = useState<EventoAdmin>({ ...evento });
  const [tagsInput, setTagsInput] = useState(evento.tags.join(", "));
  const [activeSection, setActiveSection] = useState<"info" | "conteudo" | "imagens">("info");
  const isNew = evento.id === 0;

  const upd = <K extends keyof EventoAdmin>(k: K, v: EventoAdmin[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleMagic = (fields: MagicFields) => {
    setForm(p => ({
      ...p,
      titulo: fields.titulo,
      descricao: fields.resumo,
      conteudo: fields.conteudo,
      tags: fields.tags,
    }));
    setTagsInput(fields.tags.join(", "));
  };

  const handleSubmit = () => {
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    onSave({ ...form, tags });
  };

  const tipoInfo = TIPO_OPTS.find(t => t.value === form.tipo);

  const sections = [
    { key: "info" as const, label: "Informações", icon: "ri-information-line" },
    { key: "conteudo" as const, label: "Conteúdo", icon: "ri-article-line" },
    { key: "imagens" as const, label: "Imagens", icon: "ri-image-line" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[94vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            {tipoInfo && (
              <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${tipoInfo.color}20` }}>
                <i className={`${tipoInfo.icon} text-sm`} style={{ color: tipoInfo.color }}></i>
              </div>
            )}
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {isNew ? "Novo Evento / Audiência" : `Editar: ${form.titulo || "Sem título"}`}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 px-6 pt-4 pb-0 bg-white">
          {sections.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-xs font-semibold cursor-pointer border-b-2 transition-all whitespace-nowrap"
              style={activeSection === s.key
                ? { color: primaryColor, borderColor: primaryColor, backgroundColor: `${primaryColor}08` }
                : { color: "#9CA3AF", borderColor: "transparent" }}>
              <i className={`${s.icon} text-xs`}></i>{s.label}
              {s.key === "imagens" && form.imagens.length > 0 && (
                <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: primaryColor, color: "white" }}>
                  {form.imagens.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 border-t border-gray-100">

          {/* ── SEÇÃO INFO ── */}
          {activeSection === "info" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-4">
                {/* Texto Mágico */}
                <TextoMagico onGenerate={handleMagic} primaryColor={primaryColor} tipo={form.tipo === "audiencia" ? "audiencia" : "evento"} />

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Título *</label>
                  <input value={form.titulo} onChange={e => upd("titulo", e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    placeholder="Título do evento ou audiência" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tipo</label>
                    <select value={form.tipo} onChange={e => upd("tipo", e.target.value as EventoAdmin["tipo"])}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
                      {TIPO_OPTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                    <select value={form.status} onChange={e => upd("status", e.target.value as EventoAdmin["status"])}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
                      {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Data *</label>
                    <input type="date" value={form.data} onChange={e => upd("data", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Horário *</label>
                    <input type="time" value={form.hora} onChange={e => upd("hora", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Local / Endereço</label>
                  <input value={form.local} onChange={e => upd("local", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    placeholder="Ex: Auditório INPREC ou Online" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tags</label>
                  <input value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    placeholder="evento, INPREC, servidores (separar por vírgula)" />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Resumo / Descrição</label>
                  <textarea value={form.descricao} onChange={e => upd("descricao", e.target.value)} rows={4}
                    maxLength={500}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
                    placeholder="Breve descrição que aparece nos cards..." />
                  <p className="text-xs text-gray-400 mt-1">{form.descricao.length}/500</p>
                </div>

                {/* Vagas + inscrição */}
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex flex-col gap-3">
                  <p className="text-xs font-bold text-gray-700">Vagas e Inscrição</p>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Número de Vagas (deixe 0 para ilimitado)</label>
                    <input type="number" min={0} value={form.vagas || 0} onChange={e => upd("vagas", parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Link de Inscrição</label>
                    <input value={form.linkInscricao || ""} onChange={e => upd("linkInscricao", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
                      placeholder="/eventos ou https://forms.google.com/..." />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-col gap-2.5">
                  {([
                    ["inscricaoAberta", "Inscrições Abertas", "ri-edit-line"],
                    ["publicado", "Publicado (visível no site)", "ri-eye-line"],
                    ["destaque", "Destacado na listagem", "ri-star-line"],
                  ] as [keyof EventoAdmin, string, string][]).map(([k, label, icon]) => (
                    <div key={k}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 cursor-pointer"
                      onClick={() => upd(k, !form[k] as EventoAdmin[typeof k])}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${primaryColor}15` }}>
                          <i className={`${icon} text-sm`} style={{ color: primaryColor }}></i>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                      </div>
                      <div className="w-10 h-5 rounded-full relative transition-all flex-shrink-0"
                        style={{ backgroundColor: form[k] ? primaryColor : "#E5E7EB" }}>
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                          style={{ left: form[k] ? "calc(100% - 18px)" : "2px" }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SEÇÃO CONTEÚDO ── */}
          {activeSection === "conteudo" && (
            <div className="flex flex-col gap-5">
              <TextoMagico onGenerate={handleMagic} primaryColor={primaryColor} tipo={form.tipo === "audiencia" ? "audiencia" : "evento"} />
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Conteúdo Completo</label>
                <textarea value={form.conteudo} onChange={e => upd("conteudo", e.target.value)} rows={16}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
                  placeholder="Texto completo do evento, programação, objetivos, informações adicionais..." />
                <p className="text-xs text-gray-400 mt-1">
                  <i className="ri-information-line mr-1"></i>
                  Este texto aparece na página de detalhes do evento. Use parágrafos separados por linha em branco.
                </p>
              </div>
            </div>
          )}

          {/* ── SEÇÃO IMAGENS ── */}
          {activeSection === "imagens" && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-bold text-gray-800 mb-1">Galeria de Imagens</p>
                <p className="text-xs text-gray-400">
                  Adicione várias fotos do evento. A foto marcada com estrela será a imagem de capa usada nos cards.
                </p>
              </div>
              <ImageGalleryUploader
                images={form.imagens}
                onChange={imgs => upd("imagens", imgs)}
                primaryColor={primaryColor}
                maxImages={12}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90"
            style={{ backgroundColor: primaryColor }}>
            {isNew ? "Criar Evento" : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────────────────────────
export default function EventosAdminTab() {
  const { config } = useSiteConfig();
  const { promoteToSlide } = useSlidesAdmin();
  const [eventos, setEventos] = useState<EventoAdmin[]>(loadEventos);
  const [editando, setEditando] = useState<EventoAdmin | null>(null);
  const [saved, setSaved] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [busca, setBusca] = useState("");

  const persist = (data: EventoAdmin[]) => {
    setEventos(data);
    saveEventos(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = (ev: EventoAdmin) => {
    if (ev.id === 0) {
      const newId = Math.max(0, ...eventos.map(e => e.id)) + 1;
      persist([...eventos, { ...ev, id: newId, criado: new Date().toISOString().slice(0, 10) }]);
    } else {
      persist(eventos.map(e => e.id === ev.id ? ev : e));
    }
    setEditando(null);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Remover este evento permanentemente?")) return;
    persist(eventos.filter(e => e.id !== id));
  };

  const handleDuplicate = (ev: EventoAdmin) => {
    const newId = Math.max(0, ...eventos.map(e => e.id)) + 1;
    persist([...eventos, { ...ev, id: newId, titulo: `${ev.titulo} (Cópia)`, publicado: false, status: "rascunho", criado: new Date().toISOString().slice(0, 10) }]);
  };

  const handlePromote = (ev: EventoAdmin) => {
    const coverImg = ev.imagens.find(i => i.isCover) || ev.imagens[0];
    const ok = promoteToSlide({
      id: ev.id,
      titulo: ev.titulo,
      resumo: ev.descricao,
      image_url: coverImg?.url || "",
      tag: TIPO_OPTS.find(t => t.value === ev.tipo)?.label || ev.tipo,
      cta_url: `/eventos`,
      type: ev.tipo === "audiencia" ? "audiencia" : "evento",
    });
    if (ok) setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const togglePublicado = (id: number) => persist(eventos.map(e => e.id === id ? { ...e, publicado: !e.publicado } : e));

  const filtrados = eventos.filter(e => {
    const tipoOk = filtroTipo === "todos" || e.tipo === filtroTipo;
    const statusOk = filtroStatus === "todos" || e.status === filtroStatus;
    const buscaOk = !busca || e.titulo.toLowerCase().includes(busca.toLowerCase()) || e.local.toLowerCase().includes(busca.toLowerCase());
    return tipoOk && statusOk && buscaOk;
  });

  const blankEvento: EventoAdmin = {
    id: 0, titulo: "", tipo: "evento", status: "rascunho",
    data: "", hora: "09:00", local: "", descricao: "", conteudo: "",
    tags: [], vagas: 0, inscricaoAberta: false, publicado: false, destaque: false,
    imagens: [], criado: "",
  };

  const stats = [
    { label: "Total", value: eventos.length, icon: "ri-calendar-event-line", color: "#7C3AED" },
    { label: "Publicados", value: eventos.filter(e => e.publicado).length, icon: "ri-eye-line", color: "#059669" },
    { label: "Audiências", value: eventos.filter(e => e.tipo === "audiencia").length, icon: "ri-government-line", color: "#0891B2" },
    { label: "Com Imagens", value: eventos.filter(e => e.imagens.length > 0).length, icon: "ri-image-line", color: "#D97706" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Eventos &amp; Audiências
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Crie e gerencie eventos, audiências públicas e palestras do INPREC.
          </p>
        </div>
        <button onClick={() => setEditando(blankEvento)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90"
          style={{ backgroundColor: config.primaryColor }}>
          <i className="ri-add-line"></i> Novo Evento
        </button>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Alterações salvas com sucesso!
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl mb-2" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar evento ou local..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFiltroTipo("todos")}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer whitespace-nowrap transition-all"
            style={filtroTipo === "todos" ? { backgroundColor: config.primaryColor, color: "white", borderColor: config.primaryColor } : { borderColor: "#E5E7EB", color: "#6B7280" }}>
            Todos
          </button>
          {TIPO_OPTS.map(t => (
            <button key={t.value} onClick={() => setFiltroTipo(t.value)}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer whitespace-nowrap transition-all"
              style={filtroTipo === t.value ? { backgroundColor: t.color, color: "white", borderColor: t.color } : { borderColor: "#E5E7EB", color: "#6B7280" }}>
              <i className={`${t.icon} text-xs`}></i>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro status */}
      <div className="flex gap-2 flex-wrap mb-4">
        {["todos", "publicado", "em-breve", "encerrado", "rascunho"].map(s => (
          <button key={s} onClick={() => setFiltroStatus(s)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer whitespace-nowrap transition-all"
            style={filtroStatus === s ? { backgroundColor: config.primaryColor, color: "white", borderColor: config.primaryColor } : { borderColor: "#E5E7EB", color: "#6B7280" }}>
            {s === "todos" ? "Todos os Status" : STATUS_OPTS.find(o => o.value === s)?.label || s}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {filtrados.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <i className="ri-calendar-event-line text-4xl text-gray-200"></i>
            <p className="text-gray-400 text-sm mt-3">Nenhum evento encontrado.</p>
          </div>
        )}

        {filtrados.map(ev => {
          const tipoInfo = TIPO_OPTS.find(t => t.value === ev.tipo);
          const coverImg = ev.imagens.find(i => i.isCover) || ev.imagens[0];

          return (
            <div key={ev.id}
              className={`bg-white rounded-2xl border overflow-hidden transition-all ${!ev.publicado ? "opacity-70 border-dashed border-gray-200" : "border-gray-100"}`}>
              <div className="flex items-center gap-4 p-4">
                {/* Thumb */}
                <div className="w-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100" style={{ height: "72px" }}>
                  {coverImg ? (
                    <img src={coverImg.url} alt={ev.titulo}
                      className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      <i className="ri-image-line text-gray-300 text-xl"></i>
                      <span className="text-[10px] text-gray-300">Sem foto</span>
                    </div>
                  )}
                  {ev.imagens.length > 1 && (
                    <div className="absolute -mt-5 ml-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: config.primaryColor }}>
                        +{ev.imagens.length - 1}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[ev.status]}`}>
                      {STATUS_OPTS.find(s => s.value === ev.status)?.label || ev.status}
                    </span>
                    {tipoInfo && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${tipoInfo.color}15`, color: tipoInfo.color }}>
                        <i className={`${tipoInfo.icon} mr-1 text-[9px]`}></i>{tipoInfo.label}
                      </span>
                    )}
                    {!ev.publicado && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium">Não publicado</span>}
                    {ev.destaque && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium"><i className="ri-star-line text-[9px] mr-0.5"></i>Destaque</span>}
                    {ev.imagens.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 font-medium">
                        <i className="ri-image-line text-[9px] mr-0.5"></i>{ev.imagens.length} foto{ev.imagens.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate">{ev.titulo}</p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <i className="ri-calendar-line text-xs"></i>{formatDate(ev.data)} às {ev.hora}
                    </span>
                    {ev.local && (
                      <span className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[200px]">
                        <i className="ri-map-pin-line text-xs"></i>{ev.local}
                      </span>
                    )}
                    {ev.vagas && ev.vagas > 0 ? (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <i className="ri-team-line text-xs"></i>{ev.vagas} vagas
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handlePromote(ev)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 text-purple-500 cursor-pointer"
                    title="Promover para Slide da Home">
                    <i className="ri-slideshow-line text-sm"></i>
                  </button>
                  <button onClick={() => togglePublicado(ev.id)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${ev.publicado ? "hover:bg-amber-50 text-amber-500" : "hover:bg-green-50 text-green-500"}`}
                    title={ev.publicado ? "Despublicar" : "Publicar"}>
                    <i className={`${ev.publicado ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                  </button>
                  <button onClick={() => handleDuplicate(ev)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
                    title="Duplicar">
                    <i className="ri-file-copy-line text-sm"></i>
                  </button>
                  <button onClick={() => setEditando(ev)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
                    title="Editar">
                    <i className="ri-edit-line text-sm"></i>
                  </button>
                  <button onClick={() => handleDelete(ev.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
                    title="Excluir">
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de edição */}
      {editando && (
        <EventoForm
          evento={editando}
          onSave={handleSave}
          onClose={() => setEditando(null)}
          primaryColor={config.primaryColor}
        />
      )}
    </div>
  );
}
