import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { eleicaoService } from "@/services/eleicao.service";
import { votacaoConfigDefault } from "@/mocks/votacao";

interface EleicaoData {
  titulo: string;
  status: "em_breve" | "em_andamento" | "encerrada";
  dataEncerramento: string;
  horaEncerramento: string;
  ativo?: boolean;
}

const defaultEleicao: EleicaoData = {
  titulo: "Eleição dos Conselhos e Comitê INPREC 2026",
  status: "em_andamento",
  dataEncerramento: "2026-05-31",
  horaEncerramento: "17:00",
  ativo: true,
};

function useCountdown(targetDate: string, targetTime: string) {
  const calc = useCallback(() => {
    const target = new Date(`${targetDate}T${targetTime}:00`).getTime();
    const diff = target - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    return {
      total: diff,
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [targetDate, targetTime]);

  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return t;
}

export default function EleicaoBanner() {
  const { config } = useSiteConfig();
  const [eleicao, setEleicao] = useState<EleicaoData>(defaultEleicao);

  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      try {
        const [eleicaoConfig, votacaoConfig] = await Promise.all([
          eleicaoService.obterConfig(),
          eleicaoService.obterVotacaoConfig().catch(() => votacaoConfigDefault),
        ]);
        if (ativo) {
          setEleicao({
            ...defaultEleicao,
            ...eleicaoConfig,
            ativo: votacaoConfig.ativa !== undefined ? votacaoConfig.ativa : true,
          });
        }
      } catch {
        if (ativo) setEleicao(defaultEleicao);
      }
    };
    carregar();
    window.addEventListener("inprec-eleicao-updated", carregar);
    window.addEventListener("inprec-votacao-updated", carregar);
    return () => {
      ativo = false;
      window.removeEventListener("inprec-eleicao-updated", carregar);
      window.removeEventListener("inprec-votacao-updated", carregar);
    };
  }, []);

  const countdown = useCountdown(eleicao.dataEncerramento, eleicao.horaEncerramento);

  if (eleicao.status === "encerrada" || !eleicao.ativo) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-10 bg-white"></div>
        <div className="absolute -left-10 -bottom-20 w-64 h-64 rounded-full opacity-5 bg-white"></div>
        <div className="absolute right-1/3 top-0 bottom-0 w-px bg-white/10"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 md:gap-10 min-w-0">
          {/* Icon + Title */}
          <div className="flex items-center gap-4 flex-shrink-0 min-w-0">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/15 border border-white/20 flex-shrink-0">
              <i className="ri-checkbox-circle-line text-white text-2xl"></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block animate-pulse"></span>
                  Em Andamento
                </span>
              </div>
              <h2
                className="text-white font-bold text-lg md:text-xl leading-snug max-w-sm break-words"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {eleicao.titulo}
              </h2>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-20 bg-white/20 flex-shrink-0"></div>

          {/* Countdown */}
          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-xs uppercase tracking-widest mb-3 text-center md:text-left">
              Tempo restante para encerramento
            </p>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-center md:justify-start">
              {[
                { value: countdown.days, label: "dias" },
                { value: countdown.hours, label: "horas" },
                { value: countdown.minutes, label: "min" },
                { value: countdown.seconds, label: "seg" },
              ].map((unit, i) => (
                <>
                  <div key={unit.label} className="flex flex-col items-center">
                    <div className="bg-white/15 border border-white/25 rounded-xl px-2.5 sm:px-3 py-2 min-w-[50px] sm:min-w-[54px] text-center">
                      <span className="text-xl sm:text-2xl font-bold text-white tabular-nums" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {pad(unit.value)}
                      </span>
                    </div>
                    <span className="text-white/50 text-[10px] mt-1 uppercase tracking-wider">{unit.label}</span>
                  </div>
                  {i < 3 && (
                    <span className="text-white/40 text-lg sm:text-xl font-bold mb-4">:</span>
                  )}
                </>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-20 bg-white/20 flex-shrink-0"></div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0">
            <Link
              to="/votacao"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-sm font-bold cursor-pointer hover:bg-gray-50 transition-all"
              style={{ color: config.primaryColor }}
            >
              <i className="ri-user-star-line"></i>
              Ver Candidatos
            </Link>
            <Link
              to="/eleicao"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/15 border border-white/30 text-white text-sm font-semibold cursor-pointer hover:bg-white/25 transition-all"
            >
              <i className="ri-information-line"></i>
              Saiba Mais
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
