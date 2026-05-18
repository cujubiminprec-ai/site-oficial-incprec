import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { formatarData } from "@/hooks/useProtocolo";

interface Props {
  protocolo: string;
  prazoResposta: string;
  onNova: () => void;
}

export default function ProtocoloSucesso({ protocolo, prazoResposta, onNova }: Props) {
  const { config } = useSiteConfig();
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    await navigator.clipboard.writeText(protocolo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
      <div
        className="w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-5"
        style={{ backgroundColor: `${config.primaryColor}15` }}
      >
        <i className="ri-checkbox-circle-line text-4xl" style={{ color: config.primaryColor }}></i>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
        Manifestação registrada!
      </h3>
      <p className="text-sm text-gray-500 mb-8">
        Sua manifestação foi recebida com sucesso. Guarde o número de protocolo abaixo.
      </p>

      {/* Protocolo */}
      <div className="rounded-2xl border-2 border-dashed p-6 mb-6" style={{ borderColor: `${config.primaryColor}40` }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Número de Protocolo</p>
        <p
          className="text-3xl font-bold tracking-widest mb-4"
          style={{ fontFamily: "'Courier New', monospace", color: config.primaryColor }}
        >
          {protocolo}
        </p>
        <button
          onClick={copiar}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
          style={{
            backgroundColor: copiado ? "#059669" : `${config.primaryColor}15`,
            color: copiado ? "#fff" : config.primaryColor,
          }}
        >
          <i className={copiado ? "ri-check-line" : "ri-clipboard-line"}></i>
          {copiado ? "Copiado!" : "Copiar protocolo"}
        </button>
      </div>

      {/* Infos */}
      <div className="grid grid-cols-2 gap-3 mb-8 text-left">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Data do envio</p>
          <p className="text-sm font-semibold text-gray-800">{formatarData(new Date().toISOString())}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Prazo de resposta</p>
          <p className="text-sm font-semibold text-gray-800">{formatarData(prazoResposta)}</p>
        </div>
        <div className="col-span-2 bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <i className="ri-information-line text-amber-500 flex-shrink-0 mt-0.5"></i>
            <p className="text-xs text-amber-700 leading-relaxed">
              Anote ou salve este número. Você pode usá-lo para acompanhar o andamento da sua manifestação na aba
              <strong> &quot;Consultar Protocolo&quot;</strong>.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onNova}
        className="text-sm font-semibold cursor-pointer whitespace-nowrap hover:underline"
        style={{ color: config.primaryColor }}
      >
        Registrar nova manifestação
      </button>
    </div>
  );
}
