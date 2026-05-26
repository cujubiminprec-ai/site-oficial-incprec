import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { formatarData } from "@/hooks/useProtocolo";

interface Props {
  protocolo: string;
  prazoResposta: string;
  onNovo: () => void;
}

export default function ProtocoloSucessoLAI({ protocolo, prazoResposta, onNovo }: Props) {
  const { config } = useSiteConfig();
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    await navigator.clipboard.writeText(protocolo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8">
      <div className="text-center mb-8">
        <div
          className="w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-5"
          style={{ backgroundColor: `${config.primaryColor}15` }}
        >
          <i className="ri-checkbox-circle-line text-4xl" style={{ color: config.primaryColor }}></i>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Pedido registrado com sucesso!
        </h3>
        <p className="text-sm text-gray-500">
          Seu pedido de informação foi recebido conforme a Lei nº 12.527/2011 (LAI).
        </p>
      </div>

      {/* Protocolo */}
      <div
        className="rounded-2xl border-2 border-dashed p-6 mb-6 text-center"
        style={{ borderColor: `${config.primaryColor}40` }}
      >
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Número de Protocolo LAI
        </p>
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
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Data do pedido</p>
          <p className="text-sm font-semibold text-gray-800">{formatarData(new Date().toISOString())}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Prazo legal (20 dias úteis)</p>
          <p className="text-sm font-semibold text-gray-800">{formatarData(prazoResposta)}</p>
        </div>
        <div className="col-span-2 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <i className="ri-information-line text-blue-500 flex-shrink-0 mt-0.5"></i>
            <p className="text-xs text-blue-700 leading-relaxed">
              Você receberá a resposta por e-mail dentro do prazo legal. Em caso de recurso, o prazo pode ser
              prorrogado por mais 10 dias. Use o protocolo para acompanhar na aba
              <strong> &quot;Consultar Protocolo&quot;</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onNovo}
          className="text-sm font-semibold cursor-pointer whitespace-nowrap hover:underline"
          style={{ color: config.primaryColor }}
        >
          Fazer novo pedido de informação
        </button>
      </div>
    </div>
  );
}
