import { Link } from "react-router-dom";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const FASES = [
  { numero: 1, label: "Aderência", status: "concluido" },
  { numero: 2, label: "Gestão Financeira", status: "concluido" },
  { numero: 3, label: "Gestão Administrativa", status: "em-andamento" },
  { numero: 4, label: "Governança", status: "pendente" },
];

export default function ProGestaoSection() {
  const { config } = useSiteConfig();
  const { ref, isVisible } = useScrollAnimation();

  const concluidas = FASES.filter((f) => f.status === "concluido").length;
  const progresso = Math.round((concluidas / FASES.length) * 100);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-20 px-4 md:px-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      style={{ background: "linear-gradient(135deg, #001f4d 0%, #003580 55%, #00266a 100%)" }}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-14">

          {/* Lado esquerdo: textos + fases */}
          <div className="flex-1 w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-semibold mb-5">
              <i className="ri-medal-line"></i>
              Certificação de Qualidade em Gestão Previdenciária
            </div>

            <h2
              className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Pró-Gestão RPPS
            </h2>

            <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-xl">
              O INPREC é participante do <strong className="text-white">Programa Pró-Gestão RPPS</strong> do Ministério da Previdência Social, comprometido com a excelência na gestão previdenciária, transparência e proteção dos servidores municipais.
            </p>

            {/* Progresso */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-xs font-medium">Progresso de Certificação</span>
                <span className="text-white font-bold text-sm">{progresso}% concluído</span>
              </div>
              <div className="h-2.5 bg-white/15 rounded-full overflow-hidden mb-5">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progresso}%`, backgroundColor: "#FBBF24" }}
                ></div>
              </div>

              {/* Fases */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {FASES.map((fase) => (
                  <div
                    key={fase.numero}
                    className={`rounded-xl px-3 py-3 border text-center transition-all ${
                      fase.status === "concluido"
                        ? "bg-white/15 border-white/30"
                        : fase.status === "em-andamento"
                        ? "bg-amber-400/15 border-amber-400/40"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1.5">
                      {fase.status === "concluido" ? (
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-400/20">
                          <i className="ri-checkbox-circle-fill text-green-400 text-sm"></i>
                        </div>
                      ) : fase.status === "em-andamento" ? (
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-400/20">
                          <i className="ri-refresh-line text-amber-400 text-sm"></i>
                        </div>
                      ) : (
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10">
                          <i className="ri-time-line text-white/40 text-sm"></i>
                        </div>
                      )}
                    </div>
                    <p className={`text-[10px] font-bold leading-tight ${
                      fase.status === "concluido" ? "text-white" :
                      fase.status === "em-andamento" ? "text-amber-300" : "text-white/40"
                    }`}>
                      Fase {fase.numero}
                    </p>
                    <p className={`text-[9px] mt-0.5 leading-tight ${
                      fase.status === "concluido" ? "text-white/70" :
                      fase.status === "em-andamento" ? "text-amber-400/80" : "text-white/25"
                    }`}>
                      {fase.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/pro-gestao"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-400 text-gray-900 text-sm font-bold cursor-pointer whitespace-nowrap hover:bg-yellow-300 transition-colors"
              >
                <i className="ri-award-line"></i>
                Ver detalhes do Pró-Gestão
              </Link>
              <a
                href="https://www.gov.br/previdencia/pt-br/assuntos/previdencia-no-servico-publico/programa-pro-gestao-rpps"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold cursor-pointer whitespace-nowrap hover:bg-white/20 transition-colors"
              >
                <i className="ri-external-link-line"></i>
                Portal MPS
              </a>
            </div>
          </div>

          {/* Lado direito: selo animado */}
          <div className="flex-shrink-0 flex flex-col items-center gap-5">
            {/* Selo principal */}
            <div className="relative w-60 h-60 flex items-center justify-center">
              {/* Anéis */}
              <div className="absolute inset-0 rounded-full border-2 border-yellow-400/30 animate-pulse"></div>
              <div className="absolute inset-4 rounded-full border border-white/15"></div>
              <div className="absolute inset-8 rounded-full border border-white/10"></div>

              {/* Círculo central */}
              <div
                className="w-40 h-40 rounded-full border-4 border-yellow-400/60 flex flex-col items-center justify-center text-center p-4"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)" }}
              >
                <i className="ri-medal-2-line text-5xl text-yellow-400 mb-1"></i>
                <p className="text-white font-extrabold text-base leading-none tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  PRÓ-GESTÃO
                </p>
                <p className="text-white/50 text-[9px] mt-1 font-medium tracking-widest uppercase">RPPS • MPS</p>
                <div className="mt-2 px-2.5 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40">
                  <p className="text-yellow-300 text-[9px] font-bold tracking-wide">CERTIFICADO</p>
                </div>
              </div>
            </div>

            {/* Stats mini */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              <div className="bg-white/10 border border-white/15 rounded-xl p-3 text-center">
                <p className="text-white font-extrabold text-xl" style={{ fontFamily: "'Poppins', sans-serif" }}>2/4</p>
                <p className="text-white/60 text-[10px] mt-0.5">Fases concluídas</p>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-xl p-3 text-center">
                <p className="text-white font-extrabold text-xl" style={{ fontFamily: "'Poppins', sans-serif" }}>MPS</p>
                <p className="text-white/60 text-[10px] mt-0.5">Certificador oficial</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
