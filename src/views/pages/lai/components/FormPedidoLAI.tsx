import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { laiService } from "@/services/lai.service";
import ProtocoloSucessoLAI from "./ProtocoloSucessoLAI";

interface Props {
  onProtocoloGerado?: (protocolo: string) => void;
}

export default function FormPedidoLAI({ onProtocoloGerado }: Props) {
  const { config } = useSiteConfig();
  const [charCount, setCharCount] = useState(0);
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [prazo, setPrazo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const classificacaoMap: Record<string, string> = {
      "Cidadão": "cidadao",
      "Jornalista": "jornalista",
      "Empresa": "empresa",
      "Outro": "outro",
    };

    const formaMap: Record<string, string> = {
      "E-mail": "email",
      "Correspondência física": "correio",
      "Atendimento presencial": "presencial",
    };

    try {
      const response = await laiService.registrar({
        solicitante: formData.get("nome") as string,
        email: formData.get("email") as string,
        cpf: (formData.get("cpf") as string) || undefined,
        telefone: (formData.get("telefone") as string) || undefined,
        endereco: (formData.get("endereco") as string) || undefined,
        descricao: formData.get("informacao") as string,
        classificacao: (classificacaoMap[formData.get("classificacao") as string] || "cidadao") as "cidadao" | "jornalista" | "empresa" | "outro",
        formaResposta: (formaMap[formData.get("formato") as string] || "email") as "email" | "correio" | "presencial",
      });

      setProtocolo(response.protocolo);
      setPrazo(response.prazo_legal || "");
      onProtocoloGerado?.(response.protocolo);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao enviar. Tente novamente.";
      setErro(message);
    } finally {
      setLoading(false);
    }
  };

  if (protocolo) {
    return (
      <ProtocoloSucessoLAI
        protocolo={protocolo}
        prazoResposta={prazo}
        onNovo={() => { setProtocolo(null); setCharCount(0); }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-white rounded-2xl border border-gray-100 p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome completo</label>
            <input
              name="nome"
              type="text"
              required
              placeholder="Seu nome completo"
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail</label>
            <input
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">CPF</label>
            <input
              name="cpf"
              type="text"
              placeholder="000.000.000-00"
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Telefone</label>
            <input
              name="telefone"
              type="tel"
              placeholder="(00) 00000-0000"
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Endereço (opcional)</label>
          <input
            name="endereco"
            type="text"
            placeholder="Rua, número, bairro, cidade"
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Classificação</label>
            <select
              name="classificacao"
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none cursor-pointer"
            >
              <option>Cidadão</option>
              <option>Jornalista</option>
              <option>Empresa</option>
              <option>Outro</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Formato de resposta</label>
            <select
              name="formato"
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none cursor-pointer"
            >
              <option>E-mail</option>
              <option>Correspondência física</option>
              <option>Atendimento presencial</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            Informação solicitada
          </label>
          <textarea
            name="informacao"
            rows={5}
            maxLength={500}
            required
            placeholder="Descreva de forma clara as informações que deseja obter..."
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none resize-none"
            onChange={(e) => setCharCount(e.target.value.length)}
          ></textarea>
          <p className={`text-xs text-right mt-1 ${charCount >= 480 ? "text-red-400" : "text-gray-400"}`}>
            {charCount}/500
          </p>
        </div>

        {erro && (
          <p className="text-sm text-red-500 flex items-center gap-1.5">
            <i className="ri-error-warning-line"></i>
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ backgroundColor: config.primaryColor }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <i className="ri-loader-4-line animate-spin"></i> Enviando...
            </span>
          ) : (
            "Enviar Pedido de Informação"
          )}
        </button>
      </form>
    </div>
  );
}
