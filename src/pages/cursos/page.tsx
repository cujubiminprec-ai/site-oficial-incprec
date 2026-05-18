import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cursosAdminDefault, CursoItem } from "@/mocks/cursos-admin";
import { conteudoService } from "@/services/conteudo.service";

type CursoAdmin = CursoItem;

function loadCursosAdmin(): CursoItem[] {
  try {
    const s = localStorage.getItem("inprec_cursos_admin");
    return s ? JSON.parse(s) : cursosAdminDefault;
  } catch { return cursosAdminDefault; }
}

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatDate(d: string) {
  const dt = new Date(d + "T12:00:00");
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function getDayMonth(d: string) {
  const dt = new Date(d + "T12:00:00");
  return {
    day: dt.toLocaleDateString("pt-BR", { day: "2-digit" }),
    month: MESES[dt.getMonth()],
  };
}

// Função que organiza texto livre de forma estruturada
function organizarConteudo(texto: string): string[] {
  if (!texto) return [];
  const linhas = texto.split(/\n|;/).map(l => l.trim()).filter(l => l.length > 2);
  return linhas;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  aberto: { bg: "bg-green-100", text: "text-green-700", label: "Inscrições Abertas" },
  "em-breve": { bg: "bg-amber-100", text: "text-amber-700", label: "Em Breve" },
  encerrado: { bg: "bg-gray-100", text: "text-gray-500", label: "Encerrado" },
};

function InscricaoModal({ curso, onClose, primaryColor }: { curso: CursoAdmin; onClose: () => void; primaryColor: string }) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new URLSearchParams(new FormData(form) as unknown as Record<string, string>);
    data.append("evento", curso.titulo);
    data.append("tipo", curso.tipo);
    data.append("data_evento", curso.data);
    try {
      await fetch("https://readdy.ai/api/form/d7f8lm6ivmjfhtdrfrb0", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data.toString(),
      });
    } catch (_) { /* silent */ }
    setLoading(false);
    setStep("success");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Inscrição no Curso</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>
        {step === "success" ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4" style={{ backgroundColor: `${primaryColor}15` }}>
              <i className="ri-check-line text-3xl" style={{ color: primaryColor }}></i>
            </div>
            <h4 className="text-base font-bold text-gray-900 mb-2">Inscrição Confirmada!</h4>
            <p className="text-sm text-gray-500 mb-2">Você receberá uma confirmação no e-mail informado com todos os detalhes do curso.</p>
            <p className="text-xs text-gray-400 mb-6">Verifique sua caixa de entrada e spam.</p>
            <button onClick={onClose} className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap" style={{ backgroundColor: primaryColor }}>
              Fechar
            </button>
          </div>
        ) : (
          <form data-readdy-form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs font-bold text-gray-800">{curso.titulo}</p>
              <div className="flex flex-wrap gap-3 mt-1.5">
                <span className="text-xs text-gray-500 flex items-center gap-1"><i className="ri-calendar-line"></i>{formatDate(curso.data)} às {curso.hora}</span>
                {curso.cargaHoraria && <span className="text-xs text-gray-500 flex items-center gap-1"><i className="ri-time-line"></i>{curso.cargaHoraria}</span>}
                {curso.certificado && <span className="text-xs text-green-600 font-semibold flex items-center gap-1"><i className="ri-award-line"></i>Certificado</span>}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome completo *</label>
              <input name="nome" type="text" required placeholder="Seu nome completo" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail *</label>
              <input name="email" type="email" required placeholder="seu@email.com" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Telefone / WhatsApp</label>
                <input name="telefone" type="tel" placeholder="(69) 9 9999-9999" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Matrícula</label>
                <input name="matricula" type="text" placeholder="Nº matrícula" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Secretaria / Órgão</label>
              <input name="secretaria" type="text" placeholder="Ex: SEMED, SEMSA, SEMSUR..." className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none" />
            </div>
            <button type="submit" disabled={loading}
              className="py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap disabled:opacity-60"
              style={{ backgroundColor: primaryColor }}>
              {loading ? "Enviando..." : "Confirmar Inscrição"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function CursoCard({ curso, primaryColor, onInscrever }: { curso: CursoAdmin; primaryColor: string; onInscrever: (c: CursoAdmin) => void }) {
  const [expandido, setExpandido] = useState(false);
  const { day, month } = getDayMonth(curso.data);
  const st = STATUS_COLORS[curso.status];
  const conteudo = organizarConteudo(curso.conteudoProgramatico || "");
  const isAberto = curso.status === "aberto";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all duration-300 group">
      {/* Banner / Imagem */}
      <div className="relative h-44 overflow-hidden">
        {curso.bannerUrl ? (
          <img src={curso.bannerUrl} alt={curso.titulo} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <img src={curso.imagem} alt={curso.titulo} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
        )}
        <div className="absolute top-3 left-3 bg-white rounded-xl px-3 py-2 text-center shadow-sm min-w-[50px]">
          <p className="text-lg font-extrabold text-gray-900 leading-none">{day}</p>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5">{month}</p>
        </div>
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
          {st.label}
        </span>
        {curso.certificado && (
          <span className="absolute bottom-3 left-3 bg-amber-500/90 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 font-semibold">
            <i className="ri-award-line"></i> Certificado
          </span>
        )}
      </div>

      <div className="p-5">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: primaryColor }}>
          {curso.categoria}
        </span>
        <h3 className="font-bold text-gray-900 text-sm mt-1 leading-snug line-clamp-2">{curso.titulo}</h3>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <i className="ri-time-line text-sm flex-shrink-0" style={{ color: primaryColor }}></i>
            {curso.hora} {curso.cargaHoraria && `• ${curso.cargaHoraria}`}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <i className="ri-map-pin-line text-sm flex-shrink-0" style={{ color: primaryColor }}></i>
            <span className="line-clamp-1">{curso.local}</span>
          </span>
          {curso.palestrante && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <i className="ri-user-star-line text-sm flex-shrink-0" style={{ color: primaryColor }}></i>
              <span className="line-clamp-1">{curso.palestrante}</span>
            </span>
          )}
        </div>

        {/* Vagas */}
        {curso.vagasIlimitadas ? (
          <div className="mt-3 flex items-center gap-1.5">
            <div className="w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
              <i className="ri-infinity-line text-[10px]" style={{ color: primaryColor }}></i>
            </div>
            <span className="text-xs text-gray-500">Vagas ilimitadas</span>
          </div>
        ) : curso.vagas > 0 ? (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Vagas</span>
              <span className="font-semibold text-gray-700">{curso.vagasRestantes} disponíveis / {curso.vagas} total</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{
                width: `${Math.min(((curso.vagas - (curso.vagasRestantes || 0)) / curso.vagas) * 100, 100)}%`,
                backgroundColor: curso.vagasRestantes === 0 ? "#EF4444" : primaryColor,
              }}></div>
            </div>
            {curso.vagasRestantes === 0 && (
              <p className="text-[10px] text-red-500 font-semibold mt-1">Vagas esgotadas</p>
            )}
            {curso.vagasRestantes > 0 && curso.vagasRestantes <= 5 && (
              <p className="text-[10px] text-amber-600 font-semibold mt-1">Últimas vagas!</p>
            )}
          </div>
        ) : null}

        {/* Conteúdo programático expansível */}
        {conteudo.length > 0 && (
          <div className="mt-3">
            <button onClick={() => setExpandido(!expandido)}
              className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              style={{ color: primaryColor }}>
              <i className={`ri-${expandido ? "arrow-up" : "arrow-down"}-s-line text-sm`}></i>
              {expandido ? "Ocultar" : "Ver"} conteúdo programático
            </button>
            {expandido && (
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {conteudo.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold text-white mt-0.5"
                      style={{ backgroundColor: primaryColor }}>{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="mt-4 flex gap-2">
          <Link to={`/cursos/${curso.id}`}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity"
            style={isAberto ? { backgroundColor: primaryColor, color: "white" } : { backgroundColor: "#F3F4F6", color: "#6B7280" }}>
            {isAberto ? "Inscrever-se" : curso.status === "em-breve" ? "Ver Detalhes" : "Ver Detalhes"}
          </Link>
          {curso.pdfUrl && (
            <a href={curso.pdfUrl} target="_blank" rel="nofollow noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer flex-shrink-0"
              title="Baixar PDF / Material">
              <i className="ri-file-pdf-line text-red-400"></i>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CursosPage() {
  const { config } = useSiteConfig();
  const { ref: heroRef, isVisible: heroVis } = useScrollAnimation();
  const { ref: listRef, isVisible: listVis } = useScrollAnimation();

  const [filtroStatus, setFiltroStatus] = useState<"todos" | "aberto" | "em-breve" | "encerrado">("todos");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "curso" | "capacitacao">("todos");
  const [mesAtivo, setMesAtivo] = useState<number | null>(null);
  const [cursoModal, setCursoModal] = useState<CursoAdmin | null>(null);
  const [cursosPublicos, setCursosPublicos] = useState<CursoAdmin[]>(() => loadCursosAdmin().filter(c => c.publicado));

  useEffect(() => {
    conteudoService.listarCursosPublicos()
      .then((remote) => {
        if (Array.isArray(remote)) setCursosPublicos(remote.filter(c => c.publicado));
      })
      .catch(() => {
        setCursosPublicos(loadCursosAdmin().filter(c => c.publicado));
      });
  }, []);

  const cursos = useMemo(() => cursosPublicos, [cursosPublicos]);

  const mesesComEventos = useMemo(() => {
    const set = new Set<number>();
    cursos.forEach(c => set.add(new Date(c.data + "T12:00:00").getMonth()));
    return Array.from(set).sort((a, b) => a - b);
  }, [cursos]);

  const filtrados = useMemo(() => {
    return cursos.filter(c => {
      const statusOk = filtroStatus === "todos" || c.status === filtroStatus;
      const tipoOk = filtroTipo === "todos" || c.tipo === filtroTipo;
      const mesOk = mesAtivo === null || new Date(c.data + "T12:00:00").getMonth() === mesAtivo;
      return statusOk && tipoOk && mesOk;
    });
  }, [cursos, filtroStatus, filtroTipo, mesAtivo]);

  const proximos = cursos.filter(c => c.status === "aberto" || c.status === "em-breve");
  const comCertificado = cursos.filter(c => c.certificado);

  return (
    <PageLayout>
      {/* Hero */}
      <section
        ref={heroRef}
        className={`relative py-20 md:py-28 overflow-hidden transition-all duration-700 ${heroVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 bg-white"></div>
          <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full opacity-10 bg-white"></div>
        </div>
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 w-full">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/15 flex-shrink-0">
              <i className="ri-graduation-cap-line text-white text-xl"></i>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/80 text-xs font-medium mb-3 border border-white/20">
                <i className="ri-book-open-line text-sm"></i>
                Educação Previdenciária
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Cursos &amp; Capacitações
              </h1>
              <p className="text-white/70 mt-3 text-base md:text-lg max-w-2xl">
                Aprimore seus conhecimentos sobre previdência social, benefícios e gestão pública. Cursos gratuitos para servidores municipais de Cujubim.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-8">
            {[
              { label: "Cursos Abertos", value: proximos.length },
              { label: "Com Certificado", value: comCertificado.length },
              { label: "Total de Cursos", value: cursos.length },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calendário de Meses */}
      <section className="bg-white border-b border-gray-100 sticky top-16 md:top-20 z-40">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap mr-2">Mês:</span>
          <button
            onClick={() => setMesAtivo(null)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all"
            style={mesAtivo === null ? { backgroundColor: config.primaryColor, color: "white" } : { backgroundColor: "#F3F4F6", color: "#6B7280" }}>
            Todos
          </button>
          {mesesComEventos.map(m => (
            <button key={m}
              onClick={() => setMesAtivo(mesAtivo === m ? null : m)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all"
              style={mesAtivo === m ? { backgroundColor: config.primaryColor, color: "white" } : { backgroundColor: "#F3F4F6", color: "#6B7280" }}>
              {MESES[m]}
            </button>
          ))}
        </div>
      </section>

      {/* Filtros + Grid */}
      <section
        ref={listRef}
        className={`py-12 px-4 md:px-8 max-w-screen-xl mx-auto transition-all duration-700 delay-100 ${listVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 items-start sm:items-center">
          <div className="flex flex-wrap gap-2">
            {(["todos", "curso", "capacitacao"] as const).map(t => (
              <button key={t}
                onClick={() => setFiltroTipo(t)}
                className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all capitalize"
                style={filtroTipo === t ? { backgroundColor: config.primaryColor, color: "white" } : { backgroundColor: "#F3F4F6", color: "#6B7280" }}>
                {t === "todos" ? "Todos os Tipos" : t === "curso" ? "Cursos" : "Capacitações"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            {(["todos", "aberto", "em-breve", "encerrado"] as const).map(s => (
              <button key={s}
                onClick={() => setFiltroStatus(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer whitespace-nowrap transition-all"
                style={filtroStatus === s
                  ? { borderColor: config.primaryColor, color: config.primaryColor, backgroundColor: `${config.primaryColor}10` }
                  : { borderColor: "#E5E7EB", color: "#9CA3AF" }}>
                {s === "todos" ? "Todos" : s === "aberto" ? "Abertos" : s === "em-breve" ? "Em Breve" : "Encerrados"}
              </button>
            ))}
          </div>
        </div>

        {filtrados.length === 0 ? (
          <div className="text-center py-20">
            <i className="ri-book-open-line text-5xl text-gray-200"></i>
            <p className="text-gray-400 mt-3 text-sm">Nenhum curso encontrado com os filtros selecionados.</p>
            <button onClick={() => { setFiltroTipo("todos"); setFiltroStatus("todos"); setMesAtivo(null); }}
              className="mt-4 text-sm font-medium cursor-pointer" style={{ color: config.primaryColor }}>
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrados.map(curso => (
              <CursoCard key={curso.id} curso={curso} primaryColor={config.primaryColor} onInscrever={setCursoModal} />
            ))}
          </div>
        )}
      </section>

      {/* Banner Informativo */}
      <section className="py-14 px-4" style={{ backgroundColor: "#f8f9ff" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-3xl p-8 border border-gray-100">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl flex-shrink-0"
              style={{ backgroundColor: `${config.primaryColor}15` }}>
              <i className="ri-award-line text-3xl" style={{ color: config.primaryColor }}></i>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Certificados de Participação
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Os cursos e capacitações com certificado emitem documentos reconhecidos pela Prefeitura de Cujubim. Frequência mínima de 75% obrigatória. Para solicitar seu certificado, entre em contato com a equipe do INPREC.
              </p>
            </div>
            <a href="/contato"
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap flex-shrink-0 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: config.primaryColor }}>
              Solicitar Certificado
            </a>
          </div>
        </div>
      </section>

      {cursoModal && (
        <InscricaoModal curso={cursoModal} onClose={() => setCursoModal(null)} primaryColor={config.primaryColor} />
      )}
    </PageLayout>
  );
}
