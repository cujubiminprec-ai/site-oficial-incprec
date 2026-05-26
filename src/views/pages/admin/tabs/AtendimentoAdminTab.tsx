import { useEffect, useMemo, useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { atendimentoService, type ContatoMensagem, type PesquisaResposta, type FormularioResposta } from "@/services/atendimento.service";

type AtendimentoTipo = "contato" | "pesquisa" | "formularios";

export default function AtendimentoAdminTab({ tipo }: { tipo: AtendimentoTipo }) {
  const { config } = useSiteConfig();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [contatos, setContatos] = useState<ContatoMensagem[]>([]);
  const [pesquisas, setPesquisas] = useState<PesquisaResposta[]>([]);
  const [formularios, setFormularios] = useState<FormularioResposta[]>([]);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    setErro("");

    const carregar = async () => {
      try {
        if (tipo === "contato") {
          const dados = await atendimentoService.listarContato();
          if (ativo) setContatos(dados);
        } else if (tipo === "pesquisa") {
          const dados = await atendimentoService.listarPesquisas();
          if (ativo) setPesquisas(dados);
        } else {
          const dados = await atendimentoService.listarFormularios();
          if (ativo) setFormularios(dados);
        }
      } catch (err) {
        if (ativo) setErro(err instanceof Error ? err.message : "Erro ao carregar dados.");
      } finally {
        if (ativo) setLoading(false);
      }
    };

    void carregar();
    return () => {
      ativo = false;
    };
  }, [tipo]);

  const titulo =
    tipo === "contato" ? "Contato & Mensagens" :
    tipo === "pesquisa" ? "Pesquisa de Satisfação" :
    "Formulários Recebidos";

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (tipo === "contato") {
      return contatos.filter((item) => !q || `${item.nome} ${item.email} ${item.assunto || ""} ${item.mensagem}`.toLowerCase().includes(q));
    }
    if (tipo === "pesquisa") {
      return pesquisas.filter((item) => !q || `${item.nome || ""} ${item.email || ""} ${item.servico || ""} ${item.comentario || ""} ${item.nota}`.toLowerCase().includes(q));
    }
    return formularios.filter((item) => !q || `${item.formulario_nome} ${item.nome_remetente || ""} ${item.email_remetente || ""} ${JSON.stringify(item.dados || {})}`.toLowerCase().includes(q));
  }, [busca, contatos, formularios, pesquisas, tipo]);

  const mediaPesquisa = pesquisas.length > 0 ? (pesquisas.reduce((acc, item) => acc + item.nota, 0) / pesquisas.length).toFixed(1) : "0.0";
  const naoLidos = contatos.filter((item) => item.status === "nao-lida").length + formularios.filter((item) => !item.lida).length;

  const marcarContato = async (item: ContatoMensagem, status: ContatoMensagem["status"]) => {
    const atualizado = await atendimentoService.atualizarContato(item.id, { status });
    setContatos((prev) => prev.map((entry) => (entry.id === item.id ? atualizado : entry)));
  };

  const marcarFormulario = async (id: number) => {
    await atendimentoService.marcarFormularioComoLido(id);
    setFormularios((prev) => prev.map((entry) => (entry.id === id ? { ...entry, lida: true } : entry)));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{titulo}</h1>
          <p className="mt-1 text-sm text-gray-400">Dados reais salvos e gerenciados diretamente no MySQL.</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total", value: filtrados.length, icon: "ri-inbox-line", color: config.primaryColor },
          { label: "Não lidos", value: naoLidos, icon: "ri-mail-unread-line", color: "#D97706" },
          { label: "Média pesquisa", value: tipo === "pesquisa" ? mediaPesquisa : "-", icon: "ri-star-line", color: "#059669" },
          { label: "Hoje", value: filtrados.filter((item: { criado_em: string }) => item.criado_em?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length, icon: "ri-calendar-check-line", color: "#2563EB" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${card.color}15` }}>
              <i className={`${card.icon} text-sm`} style={{ color: card.color }}></i>
            </div>
            <p className="text-xl font-bold text-gray-900">{card.value}</p>
            <p className="text-[10px] text-gray-400">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nos registros..." className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none" />
      </div>

      {erro && <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</div>}
      {loading && <div className="rounded-2xl border border-gray-100 bg-white px-4 py-8 text-center text-sm text-gray-500">Carregando dados...</div>}

      {!loading && tipo === "contato" && (
        <div className="flex flex-col gap-3">
          {(filtrados as ContatoMensagem[]).map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.nome}</p>
                  <p className="text-xs text-gray-400">{item.email}{item.telefone ? ` · ${item.telefone}` : ""}</p>
                  <p className="mt-2 text-xs font-semibold text-gray-600">{item.assunto || "Sem assunto"}</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap text-gray-600">{item.mensagem}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-600">{item.status}</span>
                  <span className="text-[10px] text-gray-400">{new Date(item.criado_em).toLocaleString("pt-BR")}</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {(["lida", "respondida", "arquivada"] as ContatoMensagem["status"][]).map((status) => (
                  <button key={status} onClick={() => void marcarContato(item, status)} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tipo === "pesquisa" && (
        <div className="flex flex-col gap-3">
          {(filtrados as PesquisaResposta[]).map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.servico || "Serviço não informado"}</p>
                  <p className="text-xs text-gray-400">{[item.nome, item.email].filter(Boolean).join(" · ") || "Respondente não identificado"}</p>
                  <p className="text-xs text-gray-400">{new Date(item.criado_em).toLocaleString("pt-BR")}</p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{item.nota}/5</span>
              </div>
              {item.comentario && <p className="mt-3 text-sm whitespace-pre-wrap text-gray-600">{item.comentario}</p>}
              {item.ratings && Object.keys(item.ratings).length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {Object.entries(item.ratings).map(([chave, valor]) => (
                    <div key={chave} className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
                      <span className="font-semibold text-gray-800">{chave}:</span> {valor}/5
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && tipo === "formularios" && (
        <div className="flex flex-col gap-3">
          {(filtrados as FormularioResposta[]).map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.formulario_nome}</p>
                  <p className="text-xs text-gray-400">{item.nome_remetente || "Sem remetente"}{item.email_remetente ? ` · ${item.email_remetente}` : ""}</p>
                  <pre className="mt-3 rounded-xl bg-gray-50 p-3 text-xs whitespace-pre-wrap text-gray-600">{JSON.stringify(item.dados, null, 2)}</pre>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full px-2 py-1 text-[10px] ${item.lida ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{item.lida ? "lida" : "nova"}</span>
                  <span className="text-[10px] text-gray-400">{new Date(item.criado_em).toLocaleString("pt-BR")}</span>
                  {!item.lida && (
                    <button onClick={() => void marcarFormulario(item.id)} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                      Marcar como lida
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
