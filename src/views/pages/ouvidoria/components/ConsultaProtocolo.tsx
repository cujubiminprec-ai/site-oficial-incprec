import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { ouvidoriaService, Manifestacao } from "@/services/ouvidoria.service";

const STATUS_CONFIG = {
  pendente: { label: "Pendente", cor: "#F59E0B", icone: "ri-time-line" },
  "em-analise": { label: "Em análise", cor: "#3B82F6", icone: "ri-loader-4-line" },
  respondida: { label: "Respondida", cor: "#059669", icone: "ri-check-double-line" },
  arquivada: { label: "Arquivada", cor: "#6B7280", icone: "ri-archive-line" },
} as const;

function formatarData(dataStr: string): string {
  if (!dataStr) return "-";
  return new Date(dataStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function ConsultaProtocolo() {
  const { config } = useSiteConfig();
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState<Manifestacao | null | undefined>(undefined);
  const [buscado, setBuscado] = useState(false);
  const [loading, setLoading] = useState(false);

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await ouvidoriaService.consultarProtocolo(codigo.trim());
      setResultado({
        protocolo: response.protocolo,
        tipo: response.tipo as Manifestacao["tipo"],
        assunto: response.assunto,
        anonimo: false,
        status: response.status,
        resposta: response.resposta || undefined,
        criado_em: response.criado_em,
        respondido_em: response.respondido_em || undefined,
      });
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
        <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}15` }}>
          <i className="ri-search-line text-lg" style={{ color: config.primaryColor }}></i>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Consultar Protocolo
          </h2>
          <p className="text-xs text-gray-500">Acompanhe o status da sua manifestação</p>
        </div>
      </div>

      <form onSubmit={buscar} className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <i className="ri-hashtag absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            type="text"
            placeholder="Ex: OUV-20260427-1234"
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
            Verifique se o código está correto. Exemplo: <span className="font-mono">OUV-20260427-1234</span>
          </p>
        </div>
      )}

      {buscado && resultado && <ResultadoCard resultado={resultado} primaryColor={config.primaryColor} />}

      {!buscado && (
        <div className="border border-dashed border-gray-200 rounded-2xl p-6 text-center">
          <i className="ri-file-search-line text-3xl text-gray-300 mb-2 block"></i>
          <p className="text-sm text-gray-400">
            Digite o número de protocolo recebido ao enviar sua manifestação para acompanhar seu andamento.
          </p>
        </div>
      )}
    </div>
  );
}

function ResultadoCard({ resultado, primaryColor }: { resultado: Manifestacao; primaryColor: string }) {
  const st = STATUS_CONFIG[(resultado.status || "pendente") as keyof typeof STATUS_CONFIG];
  const diasRestantes = resultado.respondido_em
    ? 0
    : Math.max(0, Math.ceil((new Date(resultado.criado_em || "").getTime() + 20 * 86400000 - Date.now()) / 86400000));

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: `${primaryColor}08` }}>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Protocolo</p>
          <p className="font-mono font-bold text-lg text-gray-900 tracking-widest">{resultado.protocolo}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${st.cor}15`, color: st.cor }}>
          <i className={st.icone}></i>
          {st.label}
        </span>
      </div>

      <div className="p-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Tipo</p>
            <p className="text-sm font-semibold text-gray-800 capitalize">{resultado.tipo.replace("_", " ")}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Data do envio</p>
            <p className="text-sm font-semibold text-gray-800">{formatarData(resultado.criado_em || "")}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-0.5">Assunto</p>
          <p className="text-sm text-gray-700 leading-relaxed">{resultado.assunto}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600">Prazo legal de resposta</p>
            <p className="text-xs text-gray-500">{resultado.respondido_em ? formatarData(resultado.respondido_em) : "Até 20 dias úteis"}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                backgroundColor: resultado.status === "respondida" ? "#059669" : primaryColor,
                width: resultado.status === "respondida" ? "100%" : resultado.status === "em-analise" ? "50%" : "10%",
              }}
            ></div>
          </div>
          {resultado.status === "pendente" && diasRestantes > 0 && (
            <p className="text-xs text-gray-400 mt-1.5">
              <i className="ri-timer-line mr-1"></i>
              {diasRestantes} dias úteis restantes
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
      </div>
    </div>
  );
}
