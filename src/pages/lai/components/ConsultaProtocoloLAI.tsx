import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { laiService, PedidoLAI } from "@/services/lai.service";

const STATUS_CONFIG = {
  pendente: { label: "Pendente", cor: "#F59E0B", icone: "ri-time-line" },
  em_analise: { label: "Em análise", cor: "#3B82F6", icone: "ri-loader-4-line" },
  respondida: { label: "Respondida", cor: "#059669", icone: "ri-check-double-line" },
  arquivada: { label: "Arquivada", cor: "#6B7280", icone: "ri-archive-line" },
  prorrogada: { label: "Prazo prorrogado", cor: "#D97706", icone: "ri-calendar-event-line" },
};

function formatarData(dataStr: string): string {
  if (!dataStr) return "-";
  const d = new Date(dataStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function ConsultaProtocoloLAI() {
  const { config } = useSiteConfig();
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState<PedidoLAI | null | undefined>(undefined);
  const [buscado, setBuscado] = useState(false);
  const [loading, setLoading] = useState(false);

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await laiService.consultarProtocolo(codigo.trim());
      setResultado(response.encontrado ? response.pedido ?? null : null);
    } catch {
      setResultado(null);
    } finally {
      setBuscado(true);
      setLoading(false);
    }
  };

  const limpar = () => {
    setCodigo("");
    setResultado(undefined);
    setBuscado(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ backgroundColor: `${config.primaryColor}15` }}
        >
          <i className="ri-search-line text-lg" style={{ color: config.primaryColor }}></i>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Consultar Pedido LAI
          </h2>
          <p className="text-xs text-gray-500">Acompanhe sua solicitação de acesso à informação</p>
        </div>
      </div>

      <form onSubmit={buscar} className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <i className="ri-hashtag absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            type="text"
            placeholder="Ex: LAI-20260427-1234"
            required
            className="w-full text-sm border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-gray-300 font-mono tracking-wider"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ backgroundColor: config.primaryColor }}
        >
          {loading ? <i className="ri-loader-4-line animate-spin"></i> : "Buscar"}
        </button>
        {buscado && (
          <button
            type="button"
            onClick={limpar}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 cursor-pointer whitespace-nowrap hover:bg-gray-50 transition-colors"
          >
            Limpar
          </button>
        )}
      </form>

      {buscado && resultado === null && (
        <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 mx-auto mb-3">
            <i className="ri-file-unknow-line text-xl text-gray-400"></i>
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Protocolo não encontrado</p>
          <p className="text-xs text-gray-400">
            Verifique o código. Exemplo: <span className="font-mono">LAI-20260427-1234</span>
          </p>
        </div>
      )}

      {buscado && resultado && <ResultadoLAI resultado={resultado} primaryColor={config.primaryColor} />}

      {!buscado && (
        <div className="space-y-3">
          <div className="border border-dashed border-gray-200 rounded-2xl p-6 text-center">
            <i className="ri-file-search-line text-3xl text-gray-300 mb-2 block"></i>
            <p className="text-sm text-gray-400">
              Digite o número de protocolo recebido para consultar o andamento do seu pedido.
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              <i className="ri-scales-line mr-1.5"></i>Prazos legais (Lei nº 12.527/2011)
            </p>
            <ul className="flex flex-col gap-1.5">
              {[
                "20 dias corridos para resposta inicial",
                "Prorrogação de até 10 dias com justificativa",
                "Recurso em 10 dias se negado ou sem resposta",
                "Resposta gratuita para qualquer cidadão",
              ].map((item) => (
                <li key={item} className="text-xs text-gray-500 flex items-start gap-2">
                  <i className="ri-check-line text-green-500 flex-shrink-0 mt-0.5"></i>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultadoLAI({
  resultado,
  primaryColor,
}: {
  resultado: PedidoLAI;
  primaryColor: string;
}) {
  const st = STATUS_CONFIG[resultado.status || "pendente"];
  const diasRestantes = resultado.data_resposta
    ? Math.max(0, Math.ceil((new Date(resultado.data_resposta).getTime() - Date.now()) / 86400000))
    : 0;
  const percentual =
    resultado.status === "respondida" ? 100 :
    resultado.status === "em_analise" ? 55 :
    resultado.status === "prorrogada" ? 70 : 15;

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: `${primaryColor}08` }}>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Protocolo LAI</p>
          <p className="font-mono font-bold text-lg text-gray-900 tracking-widest">{resultado.protocolo}</p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ backgroundColor: `${st.cor}15`, color: st.cor }}
        >
          <i className={st.icone}></i>
          {st.label}
        </span>
      </div>

      <div className="p-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Solicitante</p>
            <p className="text-sm font-semibold text-gray-800">{resultado.solicitante}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Data do pedido</p>
            <p className="text-sm font-semibold text-gray-800">{formatarData(resultado.created_at || "")}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-0.5">Pedido</p>
          <p className="text-sm text-gray-700 leading-relaxed">{resultado.descricao}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-600">Andamento</span>
            <span className="text-xs text-gray-500">{percentual}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ backgroundColor: primaryColor, width: `${percentual}%` }}
            ></div>
          </div>
          {resultado.status === "pendente" && diasRestantes > 0 && (
            <p className="text-xs text-gray-400 mt-1.5">
              <i className="ri-timer-line mr-1"></i>
              {diasRestantes} dias restantes para resposta
            </p>
          )}
          {resultado.prorrogado && (
            <p className="text-xs text-amber-600 mt-1.5">
              <i className="ri-calendar-event-line mr-1"></i>
              Prazo prorrogado: {resultado.motivo_prorrogacao || "Justificativa legal"}
            </p>
          )}
        </div>

        {resultado.resposta && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-700 mb-1.5">
              <i className="ri-reply-line mr-1"></i>Resposta do INPREC
            </p>
            <p className="text-sm text-green-800 leading-relaxed">{resultado.resposta}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-gray-500 mb-3">Etapas</p>
          <ol className="relative border-l border-gray-200 ml-3 flex flex-col gap-4">
            {[
              { label: "Pedido recebido", done: true, data: resultado.created_at },
              { label: "Análise técnica", done: resultado.status !== "pendente", data: null },
              { label: "Resposta enviada", done: resultado.status === "respondida", data: resultado.data_resposta },
            ].map((etapa) => (
              <li key={etapa.label} className="ml-4">
                <span
                  className="absolute -left-1.5 w-3 h-3 rounded-full border-2 border-white"
                  style={{ backgroundColor: etapa.done ? primaryColor : "#D1D5DB" }}
                ></span>
                <p className={`text-xs font-semibold ${etapa.done ? "text-gray-800" : "text-gray-400"}`}>
                  {etapa.label}
                </p>
                {etapa.data && (
                  <p className="text-xs text-gray-400">{formatarData(etapa.data)}</p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}