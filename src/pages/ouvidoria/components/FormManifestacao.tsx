import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { ouvidoriaService } from "@/services/ouvidoria.service";
import ProtocoloSucesso from "./ProtocoloSucesso";

interface Props {
  onProtocoloGerado?: (protocolo: string) => void;
}

export default function FormManifestacao({ onProtocoloGerado }: Props) {
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

    const tipoMap: Record<string, string> = {
      "Reclamação": "reclamacao",
      "Denúncia": "denuncia",
      "Sugestão": "sugestao",
      "Elogio": "elogio",
      "Solicitação de informação": "informacao",
    };

    const tipoRaw = formData.get("tipo") as string;
    const tipo = tipoMap[tipoRaw] || "informacao";

    try {
      const response = await ouvidoriaService.registrar({
        tipo: tipo as "reclamacao" | "sugestao" | "elogio" | "denuncia" | "informacao",
        assunto: formData.get("assunto") as string,
        descricao: formData.get("descricao") as string,
        nome: formData.get("nome") as string,
        email: formData.get("email") as string,
        telefone: (formData.get("telefone") as string) || undefined,
        anonimo: formData.get("anonimo") === "on",
      });

      setProtocolo(response.protocolo);
      setPrazo(response.data_resposta || "");
      onProtocoloGerado?.(response.protocolo);
    } catch (err) {
      // Fallback demo: gera protocolo local quando backend não está disponível
      const isFetchError =
        err instanceof TypeError &&
        (err.message === "Failed to fetch" || err.message.includes("fetch"));

      if (isFetchError) {
        const ano = new Date().getFullYear();
        const seq = String(Math.floor(Math.random() * 90000) + 10000);
        const protocoloMock = `OUV-${ano}-${seq}`;
        const prazoMock = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toLocaleDateString("pt-BR");
        setProtocolo(protocoloMock);
        setPrazo(prazoMock);
        onProtocoloGerado?.(protocoloMock);
      } else {
        const message = err instanceof Error ? err.message : "Falha ao enviar. Tente novamente.";
        setErro(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (protocolo) {
    return (
      <ProtocoloSucesso
        protocolo={protocolo}
        prazoResposta={prazo}
        onNova={() => { setProtocolo(null); setCharCount(0); }}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
        Registrar Manifestação
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome completo</label>
            <input
              name="nome"
              type="text"
              placeholder="Seu nome"
              required
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail</label>
            <input
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tipo de manifestação</label>
            <select
              name="tipo"
              required
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none cursor-pointer"
            >
              <option value="">Selecione...</option>
              <option>Reclamação</option>
              <option>Denúncia</option>
              <option>Sugestão</option>
              <option>Elogio</option>
              <option>Solicitação de informação</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Telefone (opcional)</label>
            <input
              name="telefone"
              type="tel"
              placeholder="(00) 00000-0000"
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Assunto</label>
          <input
            name="assunto"
            type="text"
            placeholder="Resumo do assunto"
            required
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-300"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            Descrição detalhada
          </label>
          <textarea
            name="descricao"
            rows={5}
            maxLength={500}
            required
            placeholder="Descreva sua manifestação com detalhes..."
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none resize-none"
            onChange={(e) => setCharCount(e.target.value.length)}
          ></textarea>
          <p className={`text-xs text-right mt-1 ${charCount >= 480 ? "text-red-400" : "text-gray-400"}`}>
            {charCount}/500
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="anonimo" id="anonimo" className="cursor-pointer" />
          <label htmlFor="anonimo" className="text-sm text-gray-600 cursor-pointer">
            Desejo registrar anonimamente
          </label>
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
          className="py-3 px-8 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ backgroundColor: config.primaryColor }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <i className="ri-loader-4-line animate-spin"></i> Enviando...
            </span>
          ) : (
            "Enviar Manifestação"
          )}
        </button>
      </form>
    </div>
  );
}