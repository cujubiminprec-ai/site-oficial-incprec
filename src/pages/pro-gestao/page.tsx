import { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const PDF_URL = "https://storage.readdy-site.link/project_files/a27c3a2e-8a1c-41d2-b54e-de8d633f75ff/ff6c1eff-7d43-4aad-8d19-d2e90758372f_Cujubim_RPPS---Verso-3.6.pdf?v=716988d4da84295e4fb63bec7ac35326";

const FASES = [
  {
    numero: 1,
    titulo: "Fase I – Aderência ao Programa",
    descricao: "Cumprimento dos requisitos básicos de aderência ao Pró-Gestão, comprovando regularidade cadastral, demonstrações atuariais e financeiras aprovadas pelo Conselho.",
    status: "concluido",
    itens: [
      "Regularidade junto ao DRPSP/MPS",
      "DRAA – Demonstrativo de Resultado da Avaliação Atuarial entregue",
      "DIPR – Demonstrativo de Informações Previdenciárias em dia",
      "Segregação de massas implementada",
      "Deliberações do Conselho Deliberativo aprovadas",
    ],
  },
  {
    numero: 2,
    titulo: "Fase II – Gestão Financeira e Investimentos",
    descricao: "Estruturação da política de investimentos do RPPS de Cujubim, com carteira diversificada e conformidade plena com a Resolução CMN nº 4.963/2021.",
    status: "concluido",
    itens: [
      "Política de Investimentos 2024 aprovada pelo Conselho Deliberativo",
      "Carteira diversificada conforme Resolução CMN nº 4.963/2021",
      "Credenciamento de instituições financeiras habilitadas",
      "Relatórios trimestrais de investimentos publicados",
      "Comitê de Investimentos constituído e atuante",
      "ALM – Asset Liability Management implementado",
    ],
  },
  {
    numero: 3,
    titulo: "Fase III – Gestão Administrativa e Controles",
    descricao: "Implementação de normas de governança, controles internos, gestão de riscos e capacitação contínua dos gestores e membros dos conselhos do INPREC.",
    status: "em-andamento",
    itens: [
      "Manual de Normas e Procedimentos Administrativos aprovado",
      "Plano de Capacitação dos Gestores 2024–2025 em execução",
      "Sistema de controle interno e gestão de riscos operacional",
      "Metas e indicadores de desempenho definidos",
      "Avaliação anual de desempenho institucional realizada",
    ],
  },
  {
    numero: 4,
    titulo: "Fase IV – Governança e Transparência",
    descricao: "Aperfeiçoamento da governança corporativa do RPPS, com transparência total das informações previdenciárias e financeiras, e ampla participação social.",
    status: "pendente",
    itens: [
      "Código de Ética e Conduta publicado e vigente",
      "Portal de Transparência completo e atualizado",
      "Conselho Fiscal com relatórios periódicos publicados",
      "Audiências Públicas anuais de prestação de contas realizadas",
      "LGPD implementada — Encarregado de Dados designado",
    ],
  },
];

const INDICADORES = [
  { label: "Alíquota Patronal", valor: "22,00%", icone: "ri-percent-line", desc: "Contribuição do Município" },
  { label: "Alíquota Servidor", valor: "14,00%", icone: "ri-user-line", desc: "Contribuição do Servidor" },
  { label: "Segurados Ativos", valor: "856", icone: "ri-team-line", desc: "Servidores vinculados" },
  { label: "Aposentados/Pensões", valor: "142", icone: "ri-shield-check-line", desc: "Benefícios em manutenção" },
];

const DOCUMENTOS_PROG = [
  { titulo: "Política de Investimentos 2024", tipo: "PDF", icone: "ri-file-chart-line", ano: "2024" },
  { titulo: "Avaliação Atuarial 2023 – DRAA", tipo: "PDF", icone: "ri-calculator-line", ano: "2023" },
  { titulo: "Demonstrativo Financeiro 2023", tipo: "PDF", icone: "ri-bar-chart-box-line", ano: "2023" },
  { titulo: "Relatório Anual do Comitê de Invest.", tipo: "PDF", icone: "ri-funds-line", ano: "2024" },
  { titulo: "Plano de Capacitação 2024–2025", tipo: "PDF", icone: "ri-book-open-line", ano: "2024" },
  { titulo: "Normas e Procedimentos Admin.", tipo: "PDF", icone: "ri-file-list-3-line", ano: "2024" },
];

const STATUS_CONFIG = {
  concluido: { label: "Concluído", color: "bg-green-100 text-green-700", icon: "ri-checkbox-circle-line text-green-500" },
  "em-andamento": { label: "Em andamento", color: "bg-amber-100 text-amber-700", icon: "ri-refresh-line text-amber-500" },
  pendente: { label: "Pendente", color: "bg-gray-100 text-gray-500", icon: "ri-time-line text-gray-400" },
};

export default function ProGestaoPage() {
  const [faseAberta, setFaseAberta] = useState<number | null>(null);
  const [showPdf, setShowPdf] = useState(false);
  const { config } = useSiteConfig();
  const { ref: heroRef, isVisible: heroVis } = useScrollAnimation();
  const { ref: statsRef, isVisible: statsVis } = useScrollAnimation();
  const { ref: fasesRef, isVisible: fasesVis } = useScrollAnimation();
  const { ref: docsRef, isVisible: docsVis } = useScrollAnimation();

  const concluidas = FASES.filter((f) => f.status === "concluido").length;
  const progresso = Math.round((concluidas / FASES.length) * 100);

  return (
    <PageLayout>
      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className={`relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden transition-all duration-700 ${heroVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 bg-white"></div>
          <div className="absolute bottom-0 left-20 w-64 h-64 rounded-full opacity-10 bg-white"></div>
        </div>

        <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-12">
          {/* Texto */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-white/90 text-xs font-semibold mb-6">
              <i className="ri-medal-line text-sm"></i>
              Programa de Certificação — Ministério da Previdência Social
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Pró-Gestão RPPS
            </h1>
            <p className="text-white/80 text-base max-w-xl leading-relaxed mb-3">
              O <strong className="text-white">INPREC — Instituto de Previdência Social dos Servidores Públicos Municipais de Cujubim</strong> é detentor da Certificação Institucional do Pró-Gestão RPPS, <strong className="text-white">Nível II</strong>, conforme auditoria realizada pelo Instituto ATZert-ICQ Brasil.
            </p>
            <p className="text-white/65 text-sm max-w-xl leading-relaxed mb-8">
              Certificado nº <strong className="text-white/85">CPG 177/2025</strong> · Validade: <strong className="text-white/85">18/12/2028</strong> · Portaria SRPC nº 446 publicada no D.O.U. em 19/03/2026
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowPdf(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-sm font-semibold cursor-pointer whitespace-nowrap hover:bg-gray-100 transition-colors"
                style={{ color: config.secondaryColor }}
              >
                <i className="ri-file-pdf-line"></i>
                Ver Documento Completo (PDF)
              </button>
              <a
                href="https://www.gov.br/previdencia/pt-br/assuntos/previdencia-no-servico-publico/programa-pro-gestao-rpps"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 border border-white/25 text-white text-sm font-semibold cursor-pointer whitespace-nowrap hover:bg-white/25 transition-colors"
              >
                <i className="ri-external-link-line"></i>
                Portal MPS
              </a>
            </div>
          </div>

          {/* Certificado visual */}
          <div className="flex-shrink-0 flex flex-col items-center gap-5">
            {/* Medalha */}
            <div className="relative w-52 h-52 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-pulse"></div>
              <div className="absolute inset-4 rounded-full border-2 border-white/15"></div>
              <div className="w-44 h-44 rounded-full bg-white/15 border-2 border-white/30 flex flex-col items-center justify-center overflow-hidden p-3">
                <img
                  src="https://static.readdy.ai/image/98faa14093f63576e4d8e45c39fe43a1/3530c89e141078fc96c8dfcde60f7395.jpeg"
                  alt="Selo Pró-Gestão RPPS Nível II"
                  className="w-32 h-32 object-contain"
                />
              </div>
            </div>

            {/* Cards de destaque do certificado */}
            <div className="grid grid-cols-2 gap-3 w-52">
              <div className="bg-white/15 border border-white/20 rounded-xl p-3 text-center">
                <p className="text-white font-extrabold text-2xl" style={{ fontFamily: "'Poppins', sans-serif" }}>II</p>
                <p className="text-white/70 text-[10px] mt-0.5">Nível Certificado</p>
              </div>
              <div className="bg-white/15 border border-white/20 rounded-xl p-3 text-center">
                <p className="text-white font-extrabold text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>2028</p>
                <p className="text-white/70 text-[10px] mt-0.5">Validade</p>
              </div>
              <div className="bg-white/15 border border-white/20 rounded-xl p-3 text-center col-span-2">
                <p className="text-white font-bold text-xs">CPG 177/2025</p>
                <p className="text-white/70 text-[10px] mt-0.5">Nº do Certificado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DADOS DO CERTIFICADO ── */}
      <section className="py-10 px-4" style={{ backgroundColor: `${config.primaryColor}06` }}>
        <div className="max-w-screen-xl mx-auto">
          {/* Cards de dados reais */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <i className="ri-award-line" style={{ color: config.primaryColor }}></i>
              Dados do Certificado Oficial
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: "ri-building-line", label: "Instituição Certificada", value: "INPREC — Instituto de Previdência Social dos Serv. Públicos Mun. de Cujubim" },
                { icon: "ri-map-pin-line", label: "Endereço", value: "Av. Condor, Nº 2588, Centro — Cujubim/RO, CEP 76.864-000" },
                { icon: "ri-user-star-line", label: "Representante Legal", value: "Elias Cruz Santos" },
                { icon: "ri-government-line", label: "Representante do Ente", value: "João Becker — Município de Cujubim/RO" },
                { icon: "ri-shield-star-line", label: "Certificador Oficial", value: "ATZert-ICQ Brasil — CNPJ 01.659.386/0001-00" },
                { icon: "ri-file-text-line", label: "Manual / Versão", value: "Pró-Gestão RPPS — Versão 3.6 (aprovada em 03/02/2025)" },
                { icon: "ri-medal-2-line", label: "Nível de Certificação", value: "Nível II — Certificado nº CPG 177/2025" },
                { icon: "ri-calendar-check-line", label: "Data de Emissão", value: "19 de Março de 2026" },
                { icon: "ri-time-line", label: "Validade do Certificado", value: "18 de Dezembro de 2028" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5" style={{ backgroundColor: `${config.primaryColor}15` }}>
                    <i className={`${item.icon} text-sm`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{item.label}</p>
                    <p className="text-xs text-gray-800 font-medium mt-0.5 leading-snug">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Base legal */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 leading-relaxed">
                <i className="ri-information-line mr-1" style={{ color: config.primaryColor }}></i>
                Certificação concedida nos termos da <strong>Portaria MPS nº 577/2017</strong>, com auditoria realizada pelo Instituto ATZert-ICQ Brasil, tendo atendido todos os requisitos do Manual do Pró-Gestão RPPS versão 3.6.
                Autorização de divulgação pela <strong>Portaria SRPC nº 446</strong> publicada no Diário Oficial da União.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── INDICADORES DO RPPS ── */}
      <section
        ref={statsRef}
        className={`py-10 px-4 transition-all duration-700 delay-100 ${statsVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {INDICADORES.map((ind) => (
              <div key={ind.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto mb-3" style={{ backgroundColor: `${config.primaryColor}12` }}>
                  <i className={`${ind.icone} text-lg`} style={{ color: config.primaryColor }}></i>
                </div>
                <p className="text-2xl font-extrabold text-gray-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{ind.valor}</p>
                <p className="text-xs font-semibold text-gray-700">{ind.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{ind.desc}</p>
              </div>
            ))}
          </div>

          {/* Barra de progresso */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>Progresso de Certificação — Nível II Obtido</h3>
                <p className="text-xs text-gray-400 mt-0.5">INPREC / RPPS de Cujubim — Manual versão 3.6</p>
              </div>
              <span className="text-3xl font-extrabold" style={{ color: config.primaryColor }}>{progresso}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progresso}%`, backgroundColor: config.primaryColor }}></div>
            </div>
            <div className="flex flex-wrap gap-4">
              {FASES.map((f) => {
                const sc = STATUS_CONFIG[f.status as keyof typeof STATUS_CONFIG];
                return (
                  <div key={f.numero} className="flex items-center gap-1.5">
                    <i className={`${sc.icon} text-sm`}></i>
                    <span className="text-xs text-gray-600">Fase {f.numero}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${sc.color}`}>{sc.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── O QUE É O PRÓ-GESTÃO ── */}
      <section className="py-10 px-4" style={{ backgroundColor: `${config.primaryColor}06` }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
              O que é o Pró-Gestão RPPS?
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-gray-600 leading-relaxed">
              <div>
                <p className="mb-3">
                  O <strong>Pró-Gestão RPPS</strong> é um programa instituído pela <strong>Portaria MPS nº 577/2017</strong>, que tem como objetivo incentivar os Regimes Próprios de Previdência Social a adotarem boas práticas de gestão previdenciária e promover a melhoria contínua dos regimes.
                </p>
                <p>
                  A certificação é dividida em <strong>quatro fases progressivas</strong>: Aderência, Gestão Financeira, Gestão Administrativa e Governança/Transparência. O <strong>Nível II</strong> atesta o cumprimento das duas primeiras fases.
                </p>
              </div>
              <div>
                <p className="mb-3">
                  O <strong>INPREC — Cujubim/RO</strong> obteve oficialmente a Certificação Nível II, auditada pelo Instituto <strong>ATZert-ICQ Brasil</strong>, com aprovação na reunião da Comissão de Credenciamento e Avaliação do Pró-Gestão RPPS realizada em <strong>03/02/2025</strong>.
                </p>
                <p>
                  O certificado nº <strong>CPG 177/2025</strong> é válido até <strong>18/12/2028</strong> e vincula o INPREC ao Município de Cujubim/RO, representado por <strong>João Becker</strong>.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap gap-3">
              <button
                onClick={() => setShowPdf(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: config.primaryColor }}
              >
                <i className="ri-file-pdf-line"></i>
                Visualizar Documento — Versão 3.6
              </button>
              <a href={PDF_URL} download className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
                <i className="ri-download-line"></i>
                Baixar PDF
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FASES ── */}
      <section
        ref={fasesRef}
        className={`py-14 px-4 transition-all duration-700 delay-150 ${fasesVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Fases do Programa
          </h2>
          <div className="flex flex-col gap-4">
            {FASES.map((fase) => {
              const sc = STATUS_CONFIG[fase.status as keyof typeof STATUS_CONFIG];
              const isOpen = faseAberta === fase.numero;
              return (
                <div
                  key={fase.numero}
                  className={`bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 ${isOpen ? "" : "border-gray-100"}`}
                  style={isOpen ? { borderColor: config.primaryColor } : {}}
                >
                  <button
                    onClick={() => setFaseAberta(isOpen ? null : fase.numero)}
                    className="w-full flex items-center gap-5 p-5 cursor-pointer text-left"
                  >
                    <div
                      className="w-12 h-12 flex items-center justify-center rounded-2xl flex-shrink-0 font-extrabold text-xl"
                      style={
                        fase.status === "concluido"
                          ? { backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }
                          : fase.status === "em-andamento"
                          ? { backgroundColor: "#FEF3C7", color: "#92400E" }
                          : { backgroundColor: "#F3F4F6", color: "#9CA3AF" }
                      }
                    >
                      {fase.numero}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-bold text-gray-900 text-sm">{fase.titulo}</p>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${sc.color}`}>{sc.label}</span>
                        {fase.status === "concluido" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 flex items-center gap-1">
                            <i className="ri-award-line text-xs"></i>Certificado Nível {fase.numero === 1 ? "I" : "II"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{fase.descricao}</p>
                    </div>
                    <i className={`ri-arrow-down-s-line text-gray-400 text-xl transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}></i>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-gray-50">
                      <p className="text-sm text-gray-600 leading-relaxed mb-4 mt-4">{fase.descricao}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {fase.itens.map((item) => (
                          <div key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                            <div
                              className="w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0"
                              style={{ backgroundColor: fase.status === "concluido" ? `${config.primaryColor}15` : "#F3F4F6" }}
                            >
                              <i
                                className={`text-[10px] ${fase.status === "concluido" ? "ri-check-line" : "ri-time-line"}`}
                                style={{ color: fase.status === "concluido" ? config.primaryColor : "#9CA3AF" }}
                              ></i>
                            </div>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DOCUMENTOS ── */}
      <section
        ref={docsRef}
        className={`py-14 px-4 transition-all duration-700 delay-100 ${docsVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{ backgroundColor: `${config.primaryColor}06` }}
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Documentos do Programa</h2>
              <p className="text-sm text-gray-400 mt-1">Relatórios, políticas e demonstrativos do RPPS de Cujubim</p>
            </div>
            <button
              onClick={() => setShowPdf(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{ backgroundColor: config.primaryColor }}
            >
              <i className="ri-eye-line"></i>
              Ver Versão 3.6
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOCUMENTOS_PROG.map((doc) => (
              <div key={doc.titulo} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <div className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}12` }}>
                  <i className={`${doc.icone} text-lg`} style={{ color: config.primaryColor }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{doc.titulo}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 font-bold">{doc.tipo}</span>
                    <span className="text-[10px] text-gray-400">{doc.ano}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowPdf(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                  style={{ backgroundColor: `${config.primaryColor}12` }}
                >
                  <i className="ri-eye-line text-sm" style={{ color: config.primaryColor }}></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Saiba mais sobre o Pró-Gestão
          </h3>
          <p className="text-gray-500 text-sm mb-8 max-w-xl mx-auto">
            Acesse o portal oficial do MPS ou entre em contato com o INPREC para mais informações sobre o programa.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.gov.br/previdencia/pt-br/assuntos/previdencia-no-servico-publico/programa-pro-gestao-rpps"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity"
              style={{ backgroundColor: config.secondaryColor }}
            >
              <i className="ri-government-line"></i>
              Portal MPS
            </a>
            <Link to="/contato" className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap border border-gray-200 text-gray-700 hover:border-gray-300 transition-colors">
              <i className="ri-mail-line"></i>
              Fale com o INPREC
            </Link>
            <button
              onClick={() => setShowPdf(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: config.primaryColor }}
            >
              <i className="ri-file-pdf-line"></i>
              Ver Documento PDF
            </button>
          </div>
        </div>
      </section>

      {/* ── MODAL PDF ── */}
      {showPdf && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowPdf(false)}
        >
          <div className="w-full max-w-5xl h-[90vh] bg-white rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${config.primaryColor}15` }}>
                  <i className="ri-file-pdf-line text-sm" style={{ color: config.primaryColor }}></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Pró-Gestão RPPS — INPREC / Cujubim</p>
                  <p className="text-xs text-gray-400">Certificado CPG 177/2025 · Manual Versão 3.6</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={PDF_URL} download className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
                  <i className="ri-download-line text-xs"></i>Baixar
                </a>
                <button onClick={() => setShowPdf(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                  <i className="ri-close-line text-gray-500 text-lg"></i>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`${PDF_URL}#toolbar=1&navpanes=1&scrollbar=1`}
                title="Pró-Gestão RPPS INPREC Cujubim — Versão 3.6"
                className="w-full h-full"
                style={{ border: "none" }}
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
