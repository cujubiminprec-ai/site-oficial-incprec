import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import PageLayout from "@/components/feature/PageLayout";
import { eleicaoService, EleicaoConfig } from "@/services/eleicao.service";

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

function useCountdown(targetDate: string, targetTime: string) {
  const calcTimeLeft = useCallback(() => {
    const target = new Date(`${targetDate}T${targetTime}:00`).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    return {
      total: diff,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [targetDate, targetTime]);

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [calcTimeLeft]);

  return timeLeft;
}

function CountdownUnit({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}22, ${color}11)`, border: `2px solid ${color}44` }}
      >
        <span
          className="text-3xl md:text-4xl font-bold tabular-nums leading-none"
          style={{ color, fontFamily: "'Poppins', sans-serif" }}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs font-semibold text-gray-500 mt-2 uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function EleicaoPage() {
  const { config } = useSiteConfig();
  const [eleicao, setEleicao] = useState<EleicaoConfig>(defaultConfig);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nome: "", matricula: "", cargo_concorre: "", email: "", telefone: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Listen for admin updates
  useEffect(() => {
    let ativo = true;
    const carregar = () => {
      eleicaoService.obterConfig()
        .then((dados) => {
          if (ativo) setEleicao({ ...defaultConfig, ...dados });
        })
        .catch(() => {
          if (ativo) setEleicao(defaultConfig);
        });
    };
    carregar();
    window.addEventListener("inprec-eleicao-updated", carregar);
    return () => {
      ativo = false;
      window.removeEventListener("inprec-eleicao-updated", carregar);
    };
  }, []);

  const countdown = useCountdown(eleicao.dataEncerramento, eleicao.horaEncerramento);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const statusInfo = {
    em_breve: { label: "Em Breve", color: "#D97706", bg: "#FEF3C7", icon: "ri-time-line" },
    em_andamento: { label: "Em Andamento", color: "#16a34a", bg: "#DCFCE7", icon: "ri-checkbox-circle-line" },
    encerrada: { label: "Encerrada", color: "#6B7280", bg: "#F3F4F6", icon: "ri-close-circle-line" },
  }[eleicao.status];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await eleicaoService.enviarInscricaoCandidatura({
        nome: formData.nome,
        matricula: formData.matricula,
        cargo_concorre: formData.cargo_concorre,
        email: formData.email,
        telefone: formData.telefone,
        eleicao_titulo: eleicao.titulo,
      });
      setSubmitted(true);
    } catch {
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  const isEncerrada = eleicao.status === "encerrada" || countdown.total <= 0;

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=Brazilian%20municipal%20government%20election%20voting%20civic%20participation%20public%20institution%20abstract%20democratic%20process%20official%20ceremony%20urban%20environment%20dignified%20professional%20warm%20tones%20soft%20focus%20architectural%20details&width=1920&height=600&seq=eleicao-hero-01&orientation=landscape"
            alt="Eleição INPREC"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${config.secondaryColor}ee, ${config.primaryColor}cc)` }}></div>
        </div>
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-16">

          <div className="flex items-center gap-3 mb-4">
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
            >
              <i className={statusInfo.icon}></i>
              {statusInfo.label}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {eleicao.titulo}
          </h1>
          <p className="text-white/80 text-base md:text-xl max-w-2xl leading-relaxed">
            {eleicao.subtitulo}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20">
              <i className="ri-calendar-event-line text-white/70 text-sm"></i>
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wider">Início</p>
                <p className="text-white text-sm font-semibold">{formatDate(eleicao.dataInicio)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20">
              <i className="ri-flag-2-line text-white/70 text-sm"></i>
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wider">Encerramento</p>
                <p className="text-white text-sm font-semibold">{formatDate(eleicao.dataEncerramento)} às {eleicao.horaEncerramento}</p>
              </div>
            </div>
            {eleicao.local && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20">
                <i className="ri-map-pin-line text-white/70 text-sm"></i>
                <p className="text-white text-sm font-medium">{eleicao.local}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Countdown */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="text-center mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              {isEncerrada ? "Eleição encerrada" : "Tempo restante para o encerramento"}
            </p>
            {!isEncerrada && (
              <p className="text-sm text-gray-500">
                Prazo final: <strong>{formatDate(eleicao.dataEncerramento)}</strong> às <strong>{eleicao.horaEncerramento}h</strong>
              </p>
            )}
          </div>

          {isEncerrada ? (
            <div className="flex items-center justify-center gap-3 py-6">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
                <i className="ri-close-circle-line text-gray-400 text-2xl"></i>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-700" style={{ fontFamily: "'Poppins', sans-serif" }}>Período de votação encerrado</p>
                <p className="text-sm text-gray-400">O prazo para participação foi finalizado.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 md:gap-6">
              <CountdownUnit value={countdown.days} label="Dias" color={config.primaryColor} />
              <span className="text-3xl font-bold text-gray-300 mb-6">:</span>
              <CountdownUnit value={countdown.hours} label="Horas" color={config.primaryColor} />
              <span className="text-3xl font-bold text-gray-300 mb-6">:</span>
              <CountdownUnit value={countdown.minutes} label="Minutos" color={config.primaryColor} />
              <span className="text-3xl font-bold text-gray-300 mb-6">:</span>
              <CountdownUnit value={countdown.seconds} label="Segundos" color={config.primaryColor} />
            </div>
          )}
        </div>
      </section>

      {/* Conteúdo principal */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: descrição + cargos */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Sobre a eleição */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0" style={{ color: config.primaryColor }}>
                  <i className="ri-information-line"></i>
                </div>
                Sobre a Eleição
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">{eleicao.descricao}</p>
            </div>

            {/* Cargos em disputa */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0" style={{ color: config.primaryColor }}>
                  <i className="ri-group-line"></i>
                </div>
                Cargos em Disputa
              </h2>
              <div className="flex flex-col gap-3">
                {eleicao.cargos.map((cargo) => (
                  <div
                    key={cargo.id}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ backgroundColor: `${config.primaryColor}08`, border: `1px solid ${config.primaryColor}20` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                        style={{ backgroundColor: cargo.tipo === "titular" ? config.primaryColor : "#9CA3AF" }}
                      >
                        <i className={`${cargo.tipo === "titular" ? "ri-user-star-line" : "ri-user-line"} text-white text-sm`}></i>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{cargo.nome}</span>
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}
                    >
                      {cargo.vagas} vaga{cargo.vagas !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            {(eleicao.linkEdital || eleicao.linkResultado) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Documentos</h2>
                <div className="flex flex-col gap-3">
                  {eleicao.linkEdital && (
                    <a
                      href={eleicao.linkEdital}
                      target="_blank"
                      rel="nofollow noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
                    >
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50">
                        <i className="ri-file-pdf-line text-red-500 text-lg"></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Edital da Eleição</p>
                        <p className="text-xs text-gray-400">Clique para visualizar o edital completo</p>
                      </div>
                      <i className="ri-external-link-line text-gray-300 ml-auto"></i>
                    </a>
                  )}
                  {eleicao.linkResultado && (
                    <a
                      href={eleicao.linkResultado}
                      target="_blank"
                      rel="nofollow noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
                    >
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-50">
                        <i className="ri-trophy-line text-green-500 text-lg"></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Resultado Oficial</p>
                        <p className="text-xs text-gray-400">Clique para ver o resultado da eleição</p>
                      </div>
                      <i className="ri-external-link-line text-gray-300 ml-auto"></i>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: CTA inscrição */}
          <div className="flex flex-col gap-4">
            {/* Card inscrição */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <div
                className="w-12 h-12 flex items-center justify-center rounded-2xl mb-4"
                style={{ backgroundColor: `${config.primaryColor}15` }}
              >
                <i className="ri-checkbox-circle-line text-2xl" style={{ color: config.primaryColor }}></i>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Quero me candidatar
              </h3>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Servidores e aposentados do município podem se candidatar. Confira o edital e preencha o formulário de inscrição.
              </p>

              {eleicao.status !== "encerrada" && !isEncerrada ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <i className="ri-edit-line mr-2"></i>
                  Inscrever-se Agora
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl text-sm font-semibold text-center bg-gray-100 text-gray-400">
                  <i className="ri-close-circle-line mr-2"></i>
                  Inscrições encerradas
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <i className="ri-calendar-line" style={{ color: config.primaryColor }}></i>
                  <span>Início: <strong>{formatDate(eleicao.dataInicio)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <i className="ri-flag-line" style={{ color: config.primaryColor }}></i>
                  <span>Encerramento: <strong>{formatDate(eleicao.dataEncerramento)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <i className="ri-time-line" style={{ color: config.primaryColor }}></i>
                  <span>Hora limite: <strong>{eleicao.horaEncerramento}h</strong></span>
                </div>
              </div>
            </div>

            {/* Dúvidas */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Dúvidas?</h3>
              <p className="text-xs text-gray-500 mb-3">Entre em contato com a Comissão Eleitoral do INPREC.</p>
              <Link
                to="/contato"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all hover:bg-gray-50"
                style={{ borderColor: config.primaryColor, color: config.primaryColor }}
              >
                <i className="ri-customer-service-line"></i>
                Falar com a Comissão
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de inscrição */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Inscrição de Candidatura</h3>
                <p className="text-xs text-gray-400 mt-0.5">{eleicao.titulo}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-400"></i>
              </button>
            </div>
            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4" style={{ backgroundColor: `${config.primaryColor}15` }}>
                    <i className="ri-checkbox-circle-line text-3xl" style={{ color: config.primaryColor }}></i>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Inscrição enviada!</h4>
                  <p className="text-sm text-gray-500 mb-6">Sua inscrição foi registrada com sucesso. A Comissão Eleitoral entrará em contato pelo e-mail informado.</p>
                  <button onClick={() => { setShowForm(false); setSubmitted(false); }} className="px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90" style={{ backgroundColor: config.primaryColor }}>
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome Completo *</label>
                    <input
                      name="nome"
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData(p => ({ ...p, nome: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Matrícula Funcional *</label>
                    <input
                      name="matricula"
                      type="text"
                      required
                      value={formData.matricula}
                      onChange={(e) => setFormData(p => ({ ...p, matricula: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                      placeholder="Ex: 00123"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Cargo para o qual se candidata *</label>
                    <select
                      name="cargo_concorre"
                      required
                      value={formData.cargo_concorre}
                      onChange={(e) => setFormData(p => ({ ...p, cargo_concorre: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="">Selecione o cargo</option>
                      {eleicao.cargos.map((c) => (
                        <option key={c.id} value={c.nome}>{c.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Telefone / WhatsApp</label>
                    <input
                      name="telefone"
                      type="text"
                      value={formData.telefone}
                      onChange={(e) => setFormData(p => ({ ...p, telefone: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                      placeholder="(69) 99999-9999"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">Ao enviar, você confirma que está ciente das regras do edital eleitoral do INPREC.</p>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">
                      Cancelar
                    </button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: config.primaryColor }}>
                      {submitting ? "Enviando..." : "Enviar Inscrição"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
