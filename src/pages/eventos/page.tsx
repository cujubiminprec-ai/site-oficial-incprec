import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { eventos as eventosMock, Evento } from "@/mocks/eventos";
import { EventoAdmin } from "@/pages/admin/tabs/EventosAdminTab";
import { eventosService, Evento as ApiEvento } from "@/services/eventos.service";

const EVENTOS_KEY = "inprec_eventos_admin";

function getEventosPublicos(): Evento[] {
  try {
    const s = localStorage.getItem(EVENTOS_KEY);
    if (!s) return eventosMock;
    const adminList: EventoAdmin[] = JSON.parse(s);
    return adminList
      .filter((e) => e.publicado)
      .map((e) => {
        const coverImg = e.imagens.find((i) => i.isCover && i.ativo) || e.imagens.find((i) => i.ativo);
        const tipoMap: Record<string, Evento["tipo"]> = {
          evento: "evento",
          audiencia: "audiencia",
          capacitacao: "capacitacao",
          palestra: "capacitacao",
        };
        const statusMap: Record<string, Evento["status"]> = {
          publicado: "aberto",
          "em-breve": "em-breve",
          encerrado: "encerrado",
          rascunho: "encerrado",
        };
        const categoriaMap: Record<string, string> = {
          evento: "Evento",
          audiencia: "Audiência Pública",
          capacitacao: "Capacitação",
          palestra: "Palestra Online",
        };
        return {
          id: e.id,
          titulo: e.titulo,
          tipo: tipoMap[e.tipo] ?? "evento",
          data: e.data,
          hora: e.hora,
          local: e.local,
          descricao: e.descricao,
          imagem: coverImg?.url ?? "https://readdy.ai/api/search-image?query=government%20institutional%20event%20auditorium%20professional%20Brazil&width=800&height=450&seq=ev_fallback&orientation=landscape",
          status: statusMap[e.status] ?? "aberto",
          vagas: e.vagas || undefined,
          vagasRestantes: e.vagas || undefined,
          online: e.local?.toLowerCase().includes("online") || e.local?.toLowerCase().includes("zoom") || false,
          linkOnline: e.linkInscricao || undefined,
          categoria: categoriaMap[e.tipo] ?? "Evento",
          certificado: false,
        } as Evento;
      });
  } catch {
    return eventosMock;
  }
}

function normalizarEventoApi(e: ApiEvento): Evento {
  const tipo = (e.tipo || "evento") as Evento["tipo"];
  const categoriaMap: Record<string, string> = {
    evento: "Evento",
    audiencia: "Audiência Pública",
    capacitacao: "Capacitação",
    curso: "Curso",
    reuniao: "Reunião",
  };

  return {
    id: Number(e.id),
    titulo: e.titulo,
    tipo,
    data: e.data_inicio || e.data || new Date().toISOString().slice(0, 10),
    hora: e.hora_inicio || e.hora || "",
    local: e.local || "",
    descricao: e.descricao || "",
    imagem: e.imagem_url || e.imagem || "https://readdy.ai/api/search-image?query=government%20institutional%20event%20auditorium%20professional%20Brazil&width=800&height=450&seq=ev_fallback&orientation=landscape",
    status: (e.status || "em-breve") as Evento["status"],
    vagas: e.vagas || undefined,
    vagasRestantes: e.vagas_restantes || e.vagas || undefined,
    online: Boolean(e.online),
    linkOnline: e.link_online || e.link || undefined,
    palestrante: e.palestrante,
    categoria: e.categoria || categoriaMap[tipo] || "Evento",
    certificado: e.certificado,
    cargaHoraria: e.carga_horaria,
  };
}
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const TIPOS = ["Todos", "Audiência Pública", "Evento", "Capacitação", "Curso", "Reunião"];

// Tipos que NÃO permitem inscrição pelo site (apenas participação presencial)
const TIPOS_SEM_INSCRICAO = ["Audiência Pública", "Reunião"];
const STATUS_LABELS = { aberto: "Inscrições Abertas", encerrado: "Encerrado", "em-breve": "Em Breve" };
const STATUS_COLORS = { aberto: "bg-green-100 text-green-700", encerrado: "bg-gray-100 text-gray-500", "em-breve": "bg-amber-100 text-amber-700" };

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function getDayMonth(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return {
    day: d.toLocaleDateString("pt-BR", { day: "2-digit" }),
    month: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase(),
  };
}

function InscricaoModal({ evento, onClose, primaryColor }: { evento: Evento; onClose: () => void; primaryColor: string }) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new URLSearchParams(new FormData(form) as unknown as Record<string, string>);
    data.append("evento", evento.titulo);
    data.append("data_evento", evento.data);
    try {
      await fetch("https://readdy.ai/api/form/d7ei3edfi84lst2k04a0", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data.toString(),
      });
    } catch (_) { /* silent */ }
    setLoading(false);
    setStep("success");
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base">Inscrição no Evento</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>

        {step === "success" ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4" style={{ backgroundColor: `${primaryColor}15` }}>
              <i className="ri-check-line text-3xl" style={{ color: primaryColor }}></i>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Inscrição Realizada!</h4>
            <p className="text-sm text-gray-500 mb-6">Você receberá uma confirmação por e-mail com todos os detalhes do evento.</p>
            <button onClick={onClose} className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap" style={{ backgroundColor: primaryColor }}>
              Fechar
            </button>
          </div>
        ) : (
          <form
            data-readdy-form
            onSubmit={handleSubmit}
            className="p-6 flex flex-col gap-4"
          >
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 mb-1">
              <p className="text-xs font-semibold text-gray-700">{evento.titulo}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(evento.data)} • {evento.hora}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome completo *</label>
              <input name="nome" type="text" required placeholder="Seu nome completo" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail *</label>
              <input name="email" type="email" required placeholder="seu@email.com" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Telefone / WhatsApp</label>
              <input name="telefone" type="tel" placeholder="(69) 9 9999-9999" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Matrícula Funcional</label>
              <input name="matricula" type="text" placeholder="Número da matrícula (opcional)" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Secretaria / Órgão</label>
              <input name="secretaria" type="text" placeholder="Ex: SEMED, SEMSA, SEMSUR..." className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? "Enviando..." : "Confirmar Inscrição"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function EventoCard({ evento, primaryColor, onInscrever }: { evento: Evento; primaryColor: string; onInscrever: (e: Evento) => void }) {
  const { day, month } = getDayMonth(evento.data);
  const isAberto = evento.status === "aberto";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Imagem */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={evento.imagem}
          alt={evento.titulo}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        {/* Data badge */}
        <div className="absolute top-3 left-3 bg-white rounded-xl px-3 py-2 text-center shadow-sm min-w-[52px]">
          <p className="text-xl font-extrabold text-gray-900 leading-none">{day}</p>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5">{month}</p>
        </div>
        {/* Status badge */}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_COLORS[evento.status]}`}>
          {STATUS_LABELS[evento.status]}
        </span>
        {evento.online && (
          <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
            <i className="ri-live-line text-red-400"></i> Transmissão Online
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: primaryColor }}
        >
          {evento.categoria}
        </span>
        <h3 className="font-bold text-gray-900 text-base mt-1 leading-snug line-clamp-2">
          {evento.titulo}
        </h3>

        <div className="flex flex-col gap-1.5 mt-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <i className="ri-time-line text-sm flex-shrink-0" style={{ color: primaryColor }}></i>
            <span>{formatDate(evento.data)} às {evento.hora}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <i className="ri-map-pin-line text-sm flex-shrink-0" style={{ color: primaryColor }}></i>
            <span className="line-clamp-1">{evento.local}</span>
          </div>
          {evento.palestrante && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <i className="ri-user-line text-sm flex-shrink-0" style={{ color: primaryColor }}></i>
              <span className="line-clamp-1">{evento.palestrante}</span>
            </div>
          )}
        </div>

        {/* Vagas */}
        {evento.vagas && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Vagas disponíveis</span>
              <span className="font-semibold text-gray-700">{evento.vagasRestantes} / {evento.vagas}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${((evento.vagas - (evento.vagasRestantes || 0)) / evento.vagas) * 100}%`,
                  backgroundColor: primaryColor,
                }}
              ></div>
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {TIPOS_SEM_INSCRICAO.includes(evento.categoria) ? (
            <span className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center whitespace-nowrap"
              style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}>
              <i className="ri-community-line mr-1"></i>
              {isAberto ? "Participação Aberta" : evento.status === "em-breve" ? "Em breve" : "Encerrado"}
            </span>
          ) : isAberto ? (
            <button
              onClick={() => onInscrever(evento)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-all hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Inscrever-se
            </button>
          ) : (
            <span className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center text-gray-400 bg-gray-100 whitespace-nowrap">
              {evento.status === "em-breve" ? "Em breve" : "Encerrado"}
            </span>
          )}
          {evento.online && evento.linkOnline && (
            <a
              href={evento.linkOnline}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer flex-shrink-0"
              title="Assistir online"
            >
              <i className="ri-youtube-line text-gray-400"></i>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventosPage() {
  const [filtro, setFiltro] = useState("Todos");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [eventoModal, setEventoModal] = useState<Evento | null>(null);
  const { config } = useSiteConfig();
  const { ref: heroRef, isVisible: heroVis } = useScrollAnimation();
  const { ref: listRef, isVisible: listVis } = useScrollAnimation();
  const [eventos, setEventos] = useState<Evento[]>(getEventosPublicos);

  useEffect(() => {
    let ativo = true;
    eventosService
      .listar()
      .then((lista) => {
        if (ativo && lista.length > 0) setEventos(lista.map(normalizarEventoApi));
      })
      .catch(() => {
        if (ativo) setEventos(getEventosPublicos());
      });
    return () => {
      ativo = false;
    };
  }, []);

  const eventosFiltrados = eventos.filter((e) => {
    const tipoOk = filtro === "Todos" || e.categoria === filtro;
    const statusOk = statusFiltro === "todos" || e.status === statusFiltro;
    return tipoOk && statusOk;
  });

  const proximos = eventos.filter((e) => e.status === "aberto" || e.status === "em-breve");
  const audiencias = eventos.filter((e) => e.tipo === "audiencia");

  return (
    <PageLayout>
      {/* Hero */}
      <section
        ref={heroRef}
        className={`relative py-20 md:py-28 overflow-hidden transition-all duration-700 ${heroVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10 bg-white"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10" style={{ backgroundColor: config.primaryColor }}></div>
        </div>
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/15 flex-shrink-0">
              <i className="ri-calendar-event-line text-white text-xl"></i>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/80 text-xs font-medium mb-3 border border-white/20">
                <i className="ri-megaphone-line text-sm"></i>
                Agenda Institucional
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Eventos &amp; Audiências Públicas
              </h1>
              <p className="text-white/70 mt-3 text-lg max-w-2xl">
                Acompanhe a agenda do INPREC — audiências públicas, capacitações, reuniões do comitê e eventos institucionais abertos à participação dos servidores.
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-white">{proximos.length}</p>
              <p className="text-white/60 text-xs mt-0.5">Próximos Eventos</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-white">{audiencias.length}</p>
              <p className="text-white/60 text-xs mt-0.5">Audiências em 2026</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-white">{eventos.length}</p>
              <p className="text-white/60 text-xs mt-0.5">Total na Agenda</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros + Lista */}
      <section
        ref={listRef}
        className={`py-14 px-4 md:px-8 max-w-screen-xl mx-auto transition-all duration-700 delay-100 ${listVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
          <div className="flex flex-wrap gap-2">
            {TIPOS.map((t) => (
              <button
                key={t}
                onClick={() => setFiltro(t)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filtro === t ? "text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                style={filtro === t ? { backgroundColor: config.primaryColor } : {}}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            {[
              { val: "todos", label: "Todos" },
              { val: "aberto", label: "Abertos" },
              { val: "em-breve", label: "Em Breve" },
              { val: "encerrado", label: "Encerrados" },
            ].map((s) => (
              <button
                key={s.val}
                onClick={() => setStatusFiltro(s.val)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                  statusFiltro === s.val
                    ? "border-gray-300 text-gray-800 bg-gray-100"
                    : "border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {eventosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <i className="ri-calendar-close-line text-5xl text-gray-200"></i>
            <p className="text-gray-400 mt-3 text-sm">Nenhum evento encontrado com os filtros selecionados.</p>
            <button onClick={() => { setFiltro("Todos"); setStatusFiltro("todos"); }} className="mt-4 text-sm font-medium cursor-pointer" style={{ color: config.primaryColor }}>
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosFiltrados.map((ev) => (
              <EventoCard key={ev.id} evento={ev} primaryColor={config.primaryColor} onInscrever={setEventoModal} />
            ))}
          </div>
        )}
      </section>

      {/* Banner Audiências */}
      <section className="py-16 px-4" style={{ backgroundColor: "#f9f7ff" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-3xl p-8 border border-gray-100">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}15` }}>
              <i className="ri-government-line text-3xl" style={{ color: config.primaryColor }}></i>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Participação nas Audiências Públicas
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                As audiências públicas do INPREC são obrigatórias pela legislação e garantem a transparência na gestão do RPPS. Qualquer servidor pode participar, fazer perguntas e acompanhar as decisões.
              </p>
            </div>
            <Link
              to="/ouvidoria"
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap flex-shrink-0 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: config.primaryColor }}
            >
              Enviar Manifestação
            </Link>
          </div>
        </div>
      </section>

      {/* Modal de inscrição */}
      {eventoModal && (
        <InscricaoModal
          evento={eventoModal}
          onClose={() => setEventoModal(null)}
          primaryColor={config.primaryColor}
        />
      )}
    </PageLayout>
  );
}
