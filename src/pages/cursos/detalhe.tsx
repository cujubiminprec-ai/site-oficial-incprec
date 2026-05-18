import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cursosAdminDefault, CursoItem } from "@/mocks/cursos-admin";
import { conteudoService } from "@/services/conteudo.service";

function loadCursos(): CursoItem[] {
  try {
    const s = localStorage.getItem("inprec_cursos_admin");
    return s ? JSON.parse(s) : cursosAdminDefault;
  } catch { return cursosAdminDefault; }
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function organizarConteudo(texto: string): string[] {
  if (!texto) return [];
  return texto.split(/\n|;/).map(l => l.trim()).filter(l => l.length > 2);
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  aberto: { label: "Inscrições Abertas", bg: "bg-green-100", text: "text-green-700" },
  "em-breve": { label: "Em Breve", bg: "bg-amber-100", text: "text-amber-700" },
  encerrado: { label: "Encerrado", bg: "bg-gray-100", text: "text-gray-500" },
  rascunho: { label: "Rascunho", bg: "bg-gray-100", text: "text-gray-400" },
};

function InscricaoModal({ curso, onClose, primaryColor }: { curso: CursoItem; onClose: () => void; primaryColor: string }) {
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
          <h3 className="font-bold text-gray-900 text-sm">Inscrição — {curso.titulo}</h3>
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
            <button onClick={onClose} className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap" style={{ backgroundColor: primaryColor }}>Fechar</button>
          </div>
        ) : (
          <form data-readdy-form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs font-bold text-gray-800">{curso.titulo}</p>
              <div className="flex flex-wrap gap-3 mt-1.5">
                {curso.data && <span className="text-xs text-gray-500 flex items-center gap-1"><i className="ri-calendar-line"></i>{formatDate(curso.data)} às {curso.hora}</span>}
                {curso.cargaHoraria && <span className="text-xs text-gray-500 flex items-center gap-1"><i className="ri-time-line"></i>{curso.cargaHoraria}</span>}
                {curso.certificado && <span className="text-xs text-green-600 font-semibold flex items-center gap-1"><i className="ri-award-line"></i>Certificado</span>}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome completo *</label>
              <input name="nome" type="text" required placeholder="Seu nome completo" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail *</label>
              <input name="email" type="email" required placeholder="seu@email.com" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none" />
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

export default function CursoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { config } = useSiteConfig();
  const { ref, isVisible } = useScrollAnimation();
  const [showModal, setShowModal] = useState(false);

  const [cursosData, setCursosData] = useState<CursoItem[]>(() => loadCursos());
  useEffect(() => {
    conteudoService.listarCursosPublicos()
      .then((remote) => {
        if (Array.isArray(remote)) setCursosData(remote);
      })
      .catch(() => setCursosData(loadCursos()));
  }, []);
  const cursos = useMemo(() => cursosData, [cursosData]);
  const curso = useMemo(() => cursos.find(c => c.id === parseInt(id || "0")), [cursos, id]);
  const outros = useMemo(() => cursos.filter(c => c.id !== parseInt(id || "0") && c.publicado && c.status !== "encerrado").slice(0, 3), [cursos, id]);

  if (!curso) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <i className="ri-graduation-cap-line text-6xl text-gray-200"></i>
          <p className="text-gray-400 text-lg">Curso não encontrado.</p>
          <Link to="/cursos" className="px-6 py-3 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: config.primaryColor }}>
            Ver todos os cursos
          </Link>
        </div>
      </PageLayout>
    );
  }

  const st = STATUS_MAP[curso.status] || STATUS_MAP["encerrado"];
  const conteudo = organizarConteudo(curso.conteudoProgramatico);
  const pctVagas = curso.vagas > 0 ? ((curso.vagas - curso.vagasRestantes) / curso.vagas) * 100 : 0;
  const bannerImg = curso.bannerUrl || curso.imagem;

  return (
    <PageLayout>
      {/* Hero com banner */}
      <section className="relative h-[280px] md:h-[420px] overflow-hidden">
        {bannerImg ? (
          <img src={bannerImg} alt={curso.titulo} className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${config.secondaryColor}, ${config.primaryColor})` }}></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        {/* Info no hero */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-8 max-w-screen-xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${st.bg} ${st.text}`}>{st.label}</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white/90" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              {curso.tipo === "curso" ? "Curso" : "Capacitação"}
            </span>
            {curso.certificado && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-white flex items-center gap-1">
                <i className="ri-award-line"></i> Certificado
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight max-w-3xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {curso.titulo}
          </h1>
        </div>
      </section>

      {/* Conteúdo principal */}
      <section ref={ref} className={`max-w-screen-xl mx-auto px-4 md:px-8 py-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Sobre o curso */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}15` }}>
                  <i className="ri-file-text-line text-sm" style={{ color: config.primaryColor }}></i>
                </div>
                Sobre o Curso
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">{curso.descricao}</p>

              {/* Destaques */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                {[
                  { icon: "ri-calendar-line", label: "Data", value: curso.data ? formatDate(curso.data) : "—" },
                  { icon: "ri-time-line", label: "Horário", value: curso.hora || "—" },
                  { icon: "ri-hourglass-line", label: "Carga Horária", value: curso.cargaHoraria || "—" },
                  { icon: "ri-map-pin-line", label: "Local", value: curso.local || "—" },
                ].map(item => (
                  <div key={item.label} className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50">
                    <div className="w-6 h-6 flex items-center justify-center rounded-lg mb-1" style={{ backgroundColor: `${config.primaryColor}15` }}>
                      <i className={`${item.icon} text-xs`} style={{ color: config.primaryColor }}></i>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{item.label}</p>
                    <p className="text-xs font-semibold text-gray-800 leading-snug">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Conteúdo programático */}
            {conteudo.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}15` }}>
                    <i className="ri-list-check text-sm" style={{ color: config.primaryColor }}></i>
                  </div>
                  Conteúdo Programático
                </h2>
                <div className="flex flex-col gap-3">
                  {conteudo.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: config.primaryColor }}>{i + 1}</span>
                      <p className="text-sm text-gray-700 leading-snug pt-0.5">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instrutor */}
            {curso.palestrante && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}15` }}>
                    <i className="ri-user-star-line text-sm" style={{ color: config.primaryColor }}></i>
                  </div>
                  Instrutor / Palestrante
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}15` }}>
                    <i className="ri-user-line text-2xl" style={{ color: config.primaryColor }}></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{curso.palestrante}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Instrutor responsável pelo curso</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Coluna lateral — Inscrição */}
          <div className="flex flex-col gap-4">
            {/* Card de inscrição */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              {/* Vagas */}
              {curso.vagas > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Vagas disponíveis</span>
                    <span className="font-bold text-gray-900">{curso.vagasRestantes} / {curso.vagas}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pctVagas}%`, backgroundColor: config.primaryColor }}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {curso.vagas - curso.vagasRestantes} inscrições confirmadas
                  </p>
                </div>
              )}

              {/* Info badges */}
              <div className="flex flex-col gap-2 mb-5">
                {[
                  { icon: "ri-calendar-line", label: formatDate(curso.data) || "—" },
                  { icon: "ri-time-line", label: `${curso.hora}${curso.cargaHoraria ? ` · ${curso.cargaHoraria}` : ""}` },
                  { icon: "ri-map-pin-line", label: curso.local || "—" },
                  ...(curso.certificado ? [{ icon: "ri-award-line", label: "Emite Certificado" }] : []),
                  ...(curso.online ? [{ icon: "ri-live-line", label: "Transmissão Online" }] : []),
                ].map((it, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${config.primaryColor}10` }}>
                      <i className={`${it.icon} text-xs`} style={{ color: config.primaryColor }}></i>
                    </div>
                    <span className="text-xs leading-snug">{it.label}</span>
                  </div>
                ))}
              </div>

              {/* Botão de inscrição */}
              {curso.status === "aberto" ? (
                <button onClick={() => setShowModal(true)}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: config.primaryColor }}>
                  <i className="ri-edit-line mr-2"></i>
                  Inscrever-se Agora
                </button>
              ) : (
                <div className="w-full py-3.5 rounded-xl text-sm font-semibold text-center text-gray-400 bg-gray-100">
                  {curso.status === "em-breve" ? "Inscrições em breve" : "Inscrições encerradas"}
                </div>
              )}

              {/* PDF */}
              {curso.pdfUrl && (
                <a href={curso.pdfUrl} target="_blank" rel="nofollow noopener noreferrer"
                  className="mt-3 w-full py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer whitespace-nowrap hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <i className="ri-file-pdf-line text-red-400"></i>
                  Baixar Material / PDF
                </a>
              )}

              {/* Link online */}
              {curso.online && curso.linkOnline && (
                <a href={curso.linkOnline} target="_blank" rel="nofollow noopener noreferrer"
                  className="mt-3 w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity flex items-center justify-center gap-2 bg-red-500">
                  <i className="ri-youtube-line"></i>
                  Assistir Online
                </a>
              )}
            </div>

            {/* Outros cursos */}
            {outros.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Outros Cursos</h3>
                <div className="flex flex-col gap-3">
                  {outros.map(c => (
                    <Link key={c.id} to={`/cursos/${c.id}`}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-xl p-2 -m-2 transition-colors">
                      <div className="w-12 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <img src={c.bannerUrl || c.imagem} alt={c.titulo} className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">{c.titulo}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{c.data ? formatDate(c.data) : ""}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link to="/cursos" className="block text-center text-xs font-semibold mt-3 cursor-pointer" style={{ color: config.primaryColor }}>
                  Ver todos os cursos →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {showModal && (
        <InscricaoModal curso={curso} onClose={() => setShowModal(false)} primaryColor={config.primaryColor} />
      )}
    </PageLayout>
  );
}
