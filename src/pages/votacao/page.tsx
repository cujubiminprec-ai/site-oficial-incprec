import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import PageLayout from "@/components/feature/PageLayout";
import { candidatosDefault, votacaoConfigDefault, Candidato, VotacaoConfig } from "@/mocks/votacao";

const CONSELHOS = [
  { key: "todos", label: "Todos os Cargos", icon: "ri-team-line" },
  { key: "deliberativo", label: "Conselho Deliberativo", icon: "ri-government-line" },
  { key: "fiscal", label: "Conselho Fiscal", icon: "ri-secure-payment-line" },
  { key: "comite_investimento", label: "Comitê de Investimento", icon: "ri-funds-box-line" },
] as const;

type ConselhoKey = Candidato["conselho"];

const TIPO_LABELS: Record<string, string> = {
  titular: "Titular",
  suplente: "Suplente",
};

const CATEGORIA_LABELS: Record<string, string> = {
  servidor_ativo: "Servidor Ativo",
  aposentado: "Aposentado",
};

function CandidatoCard({
  candidato,
  primaryColor,
  showNumero,
  showFoto,
}: {
  candidato: Candidato;
  primaryColor: string;
  showNumero: boolean;
  showFoto: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Número de votação */}
          {showNumero && (
            <div
              className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Nº</span>
              <span className="text-xl font-bold leading-tight">{candidato.numero}</span>
            </div>
          )}

          {/* Foto */}
          {showFoto && (
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              <img
                src={candidato.foto}
                alt={candidato.nomeCompleto}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://readdy.ai/api/search-image?query=professional%20neutral%20placeholder%20avatar%20person%20silhouette%20minimal&width=120&height=120&seq=placeholder-avatar&orientation=squarish";
                }}
              />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                {TIPO_LABELS[candidato.tipo]}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide">
                {CATEGORIA_LABELS[candidato.categoria]}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 leading-snug" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {candidato.nomeCompleto}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{candidato.lotacao}</p>
            {candidato.slogan && (
              <p className="text-xs italic text-gray-400 mt-1.5 leading-relaxed">
                &ldquo;{candidato.slogan}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Proposta */}
        {candidato.proposta && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: primaryColor }}
            >
              <i className={`${expanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-sm`}></i>
              {expanded ? "Ocultar proposta" : "Ver proposta"}
            </button>
            {expanded && (
              <p className="mt-2.5 text-sm text-gray-600 leading-relaxed">{candidato.proposta}</p>
            )}
          </div>
        )}
      </div>

      {/* LGPD note */}
      <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 flex items-center gap-1">
          <i className="ri-shield-check-line"></i>
          Dados divulgados com consentimento do candidato — LGPD
        </p>
      </div>
    </div>
  );
}

export default function VotacaoPage() {
  const { config } = useSiteConfig();
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

  const [eleicaoConfig, setEleicaoConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("inprec_eleicao_config");
      return saved ? JSON.parse(saved) : { titulo: "Eleição INPREC 2026", status: "em_andamento" };
    } catch {
      return { titulo: "Eleição INPREC 2026", status: "em_andamento" };
    }
  });

  const [filtroConselho, setFiltroConselho] = useState<"todos" | ConselhoKey>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const onStorage = () => {
      try {
        const savedC = localStorage.getItem("inprec_candidatos");
        if (savedC) setCandidatos(JSON.parse(savedC));
        const savedV = localStorage.getItem("inprec_votacao_config");
        if (savedV) setVotacaoConfig(prev => ({ ...prev, ...JSON.parse(savedV) }));
        const savedE = localStorage.getItem("inprec_eleicao_config");
        if (savedE) setEleicaoConfig(JSON.parse(savedE));
      } catch { /* ignore */ }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const candidatosFiltrados = candidatos
    .filter(c => c.ativo)
    .filter(c => filtroConselho === "todos" || c.conselho === filtroConselho)
    .filter(c => filtroTipo === "todos" || c.tipo === filtroTipo)
    .filter(c =>
      busca === "" ||
      c.nomeCompleto.toLowerCase().includes(busca.toLowerCase()) ||
      c.matricula.includes(busca) ||
      String(c.numero).includes(busca)
    );

  const grupos = ["deliberativo", "fiscal", "comite_investimento"] as const satisfies readonly ConselhoKey[];
  const grupoLabels: Record<string, string> = {
    deliberativo: "Conselho Deliberativo",
    fiscal: "Conselho Fiscal",
    comite_investimento: "Comitê de Investimento",
  };
  const grupoIcons: Record<string, string> = {
    deliberativo: "ri-government-line",
    fiscal: "ri-secure-payment-line",
    comite_investimento: "ri-funds-box-line",
  };

  const gruposCom = filtroConselho === "todos"
    ? grupos.filter(g => candidatosFiltrados.some(c => c.conselho === g))
    : [filtroConselho];

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative min-h-[380px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=elegant%20democratic%20voting%20election%20public%20institution%20civic%20participation%20Brazil%20government%20abstract%20professional%20warm%20dignified%20geometric%20pattern%20official%20ceremony%20clean%20modern%20design&width=1920&height=480&seq=votacao-hero-bg&orientation=landscape"
            alt="Eleição INPREC"
            className="w-full h-full object-cover object-top"
          />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(160deg, ${config.secondaryColor}f5 0%, ${config.primaryColor}dd 100%)` }}
          ></div>
        </div>
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-12 pt-20">
          <nav className="flex items-center gap-2 text-white/60 text-xs mb-5">
            <Link to="/" className="hover:text-white transition-colors cursor-pointer">Home</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link to="/eleicao" className="hover:text-white transition-colors cursor-pointer">Eleição</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-white">Candidatos</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm border border-white/20">
                  <i className="ri-checkbox-circle-line"></i>
                  {eleicaoConfig.status === "em_andamento" ? "Eleição em Andamento" : eleicaoConfig.titulo}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {votacaoConfig.tituloVotacao}
              </h1>
              <p className="text-white/70 text-sm mt-2 max-w-xl">
                Conheça os candidatos e suas propostas para os Conselhos e Comitê do INPREC.
              </p>
            </div>

            {/* Stats rápidos */}
            <div className="flex gap-3 flex-wrap">
              {grupos.map(g => {
                const count = candidatos.filter(c => c.ativo && c.conselho === g).length;
                return (
                  <div key={g} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 min-w-[100px]">
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>{count}</p>
                    <p className="text-white/60 text-[10px] uppercase tracking-wider mt-0.5">{grupoLabels[g].replace("Conselho ", "").replace("Comitê de ", "")}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Aviso LGPD */}
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-start gap-2.5">
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="ri-shield-check-line text-amber-600 text-sm"></i>
          </div>
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Proteção de Dados (LGPD):</strong> As informações dos candidatos (nome, foto, número, cargo e proposta) são divulgadas exclusivamente com o consentimento expresso de cada candidato, em conformidade com a Lei Geral de Proteção de Dados nº 13.709/2018. Outros dados pessoais não são exibidos publicamente.
          </p>
        </div>
      </div>

      {/* Filtros + Busca */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-gray-400 text-sm"></i>
            </div>
            <input
              type="text"
              placeholder="Buscar candidato..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none"
            />
          </div>

          {/* Filtro conselho */}
          <div className="flex gap-1.5 flex-wrap">
            {CONSELHOS.map(c => (
              <button
                key={c.key}
                onClick={() => setFiltroConselho(c.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 cursor-pointer transition-all whitespace-nowrap"
                style={filtroConselho === c.key
                  ? { backgroundColor: config.primaryColor, color: "white", borderColor: config.primaryColor }
                  : { borderColor: "#E5E7EB", color: "#6B7280" }
                }
              >
                <i className={`${c.icon} text-sm`}></i>
                {c.label}
              </button>
            ))}
          </div>

          {/* Filtro tipo */}
          <div className="flex gap-1.5">
            {[
              { key: "todos", label: "Todos" },
              { key: "titular", label: "Titular" },
              { key: "suplente", label: "Suplente" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setFiltroTipo(t.key)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all whitespace-nowrap"
                style={filtroTipo === t.key
                  ? { backgroundColor: `${config.primaryColor}15`, color: config.primaryColor, borderColor: `${config.primaryColor}30` }
                  : { borderColor: "#E5E7EB", color: "#6B7280" }
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Candidatos por grupo */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        {!votacaoConfig.ativa ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mx-auto mb-4">
              <i className="ri-lock-line text-gray-400 text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Votação não disponível
            </h2>
            <p className="text-sm text-gray-400">A lista de candidatos ainda não foi publicada. Aguarde o início oficial.</p>
          </div>
        ) : candidatosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">Nenhum candidato encontrado para o filtro selecionado.</div>
        ) : (
          <div className="flex flex-col gap-12">
            {gruposCom.map(grupo => {
              const doGrupo = candidatosFiltrados.filter(c => c.conselho === grupo);
              if (doGrupo.length === 0) return null;

              const titulares = doGrupo.filter(c => c.tipo === "titular");
              const suplentes = doGrupo.filter(c => c.tipo === "suplente");

              return (
                <div key={grupo}>
                  {/* Cabeçalho do grupo */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
                      style={{ backgroundColor: `${config.primaryColor}15` }}
                    >
                      <i className={`${grupoIcons[grupo]} text-lg`} style={{ color: config.primaryColor }}></i>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {grupoLabels[grupo]}
                      </h2>
                      <p className="text-xs text-gray-400">{doGrupo.length} candidato{doGrupo.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {/* Titulares */}
                  {titulares.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-white"
                          style={{ backgroundColor: config.primaryColor }}
                        >
                          Titulares
                        </span>
                        <span className="text-xs text-gray-400">{titulares.length} candidato{titulares.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {titulares.map(c => (
                          <CandidatoCard
                            key={c.id}
                            candidato={c}
                            primaryColor={config.primaryColor}
                            showNumero={votacaoConfig.exibirNumeros}
                            showFoto={votacaoConfig.exibirFotos}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suplentes */}
                  {suplentes.length > 0 && filtroTipo !== "titular" && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-200 text-gray-600">
                          Suplentes
                        </span>
                        <span className="text-xs text-gray-400">{suplentes.length} candidato{suplentes.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suplentes.map(c => (
                          <CandidatoCard
                            key={c.id}
                            candidato={c}
                            primaryColor={config.primaryColor}
                            showNumero={votacaoConfig.exibirNumeros}
                            showFoto={votacaoConfig.exibirFotos}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Seção de candidatura */}
        {votacaoConfig.permitirCandidatura && (
          <div
            className="mt-16 rounded-2xl p-8 text-center"
            style={{ background: `linear-gradient(135deg, ${config.primaryColor}10, ${config.secondaryColor}08)`, border: `1px solid ${config.primaryColor}20` }}
          >
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: `${config.primaryColor}15` }}>
              <i className="ri-user-add-line text-2xl" style={{ color: config.primaryColor }}></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Quero ser candidato
            </h3>
            <p className="text-sm text-gray-500 max-w-xl mx-auto mb-6 leading-relaxed">
              {votacaoConfig.mensagemInscricao}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/eleicao"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border-2 cursor-pointer transition-all hover:bg-gray-50 whitespace-nowrap"
                style={{ borderColor: config.primaryColor, color: config.primaryColor }}
              >
                <i className="ri-information-line"></i>
                Ver regras e edital
              </Link>
              {votacaoConfig.linkInscricaoOnline && (
                <a
                  href={votacaoConfig.linkInscricaoOnline}
                  target="_blank"
                  rel="nofollow noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <i className="ri-external-link-line"></i>
                  Inscrição Online
                </a>
              )}
              <Link
                to="/eleicao"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ backgroundColor: config.secondaryColor }}
              >
                <i className="ri-map-pin-line"></i>
                Inscrição Presencial
              </Link>
            </div>
          </div>
        )}
      </section>
    </PageLayout>
  );
}
