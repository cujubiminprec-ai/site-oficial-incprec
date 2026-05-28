import { useCallback, useEffect, useRef, useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { chatService, ChatConversa } from "@/services/chat.service";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface Props {
  setActiveTab: (tab: string) => void;
}

function textoRelativo(value?: string) {
  if (!value) return "";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "";
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function ChatAdminFloating({ setActiveTab }: Props) {
  const { config } = useSiteConfig();
  const { temPermissao } = useAdminAuth();
  const [conversas, setConversas] = useState<ChatConversa[]>([]);
  const [aberto, setAberto] = useState(false);
  const [selecionada, setSelecionada] = useState<ChatConversa | null>(null);
  const [resposta, setResposta] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [novasMensagens, setNovasMensagens] = useState(false);
  const prevPendentesRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pendentes = conversas.filter((c) => c.status === "aberta" || c.status === "em-atendimento");

  const carregar = useCallback(async () => {
    try {
      const lista = await chatService.listarAdmin();
      const qtd = lista.filter((c) => c.status === "aberta" || c.status === "em-atendimento").length;
      if (qtd > prevPendentesRef.current) {
        setNovasMensagens(true);
        setTimeout(() => setNovasMensagens(false), 4000);
      }
      prevPendentesRef.current = qtd;
      setConversas(lista);
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => {
    if (!temPermissao("chat-admin")) return;
    void carregar();
    const id = setInterval(() => void carregar(), 25000);
    return () => clearInterval(id);
  }, [carregar, temPermissao]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selecionada?.mensagens?.length]);

  const abrirConversa = async (id: number) => {
    try {
      const data = await chatService.detalhar(id);
      setSelecionada(data);
      setResposta("");
    } catch { /* silencioso */ }
  };

  const enviarResposta = async () => {
    if (!selecionada?.id || !resposta.trim()) return;
    setSalvando(true);
    try {
      const msg = await chatService.responder(selecionada.id, resposta.trim());
      setSelecionada((prev) =>
        prev ? { ...prev, status: "respondida", mensagens: [...(prev.mensagens ?? []), msg] } : prev
      );
      setConversas((prev) =>
        prev.map((c) => c.id === selecionada.id ? { ...c, status: "respondida", ultima_mensagem: resposta } : c)
      );
      setResposta("");
    } catch { /* silencioso */ }
    finally { setSalvando(false); }
  };

  if (!temPermissao("chat-admin")) return null;

  const count = pendentes.length;

  return (
    <>
      {aberto && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setAberto(false); setSelecionada(null); }}
        />
      )}

      {aberto && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ maxHeight: "72vh" }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between flex-shrink-0" style={{ backgroundColor: config.primaryColor }}>
            <div className="flex items-center gap-2">
              <i className="ri-chat-3-line text-white text-base"></i>
              <span className="text-sm font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Chat Online
              </span>
              {count > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                  {count} pendente{count !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setActiveTab("chat-admin"); setAberto(false); setSelecionada(null); }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-semibold transition-colors"
                title="Abrir aba completa do chat"
              >
                <i className="ri-external-link-line text-xs"></i>Ver tudo
              </button>
              <button
                onClick={() => { setAberto(false); setSelecionada(null); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <i className="ri-close-line text-sm"></i>
              </button>
            </div>
          </div>

          {!selecionada ? (
            /* Lista de conversas pendentes */
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {pendentes.length === 0 ? (
                <div className="p-10 text-center">
                  <i className="ri-chat-check-line text-4xl text-gray-200 block mb-3"></i>
                  <p className="text-sm font-semibold text-gray-500">Nenhuma conversa pendente</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Todas as conversas foram respondidas.
                  </p>
                  <button
                    onClick={() => { setActiveTab("chat-admin"); setAberto(false); }}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    Ver histórico completo
                  </button>
                </div>
              ) : (
                pendentes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => void abrirConversa(c.id)}
                    className="w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-mono text-gray-400 truncate">{c.session_id.slice(0, 12)}…</span>
                          <span className="text-[9px] text-gray-400">{textoRelativo(c.atualizado_em ?? c.criado_em)}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">
                          {c.ultima_mensagem ?? "Conversa sem mensagens"}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          <i className="ri-message-2-line mr-1"></i>{c.total_mensagens ?? 0} msg
                        </p>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase flex-shrink-0 mt-0.5 ${
                          c.status === "aberta" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Conversa aberta */
            <div className="flex flex-col flex-1 min-h-0">
              <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setSelecionada(null)}
                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"
                >
                  <i className="ri-arrow-left-line text-sm"></i>
                </button>
                <span className="text-xs font-mono text-gray-500 truncate flex-1">
                  {selecionada.session_id.slice(0, 20)}…
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    selecionada.status === "respondida" ? "bg-green-50 text-green-700" :
                    selecionada.status === "aberta" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {selecionada.status}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {(selecionada.mensagens ?? []).length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">Sem mensagens.</p>
                )}
                {(selecionada.mensagens ?? []).map((m) => (
                  <div key={m.id} className={`flex ${m.origem === "visitante" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                        m.origem === "visitante" ? "text-white" : "bg-gray-100 text-gray-700"
                      }`}
                      style={m.origem === "visitante" ? { backgroundColor: config.primaryColor } : undefined}
                    >
                      <p className="text-[9px] font-bold opacity-60 mb-0.5">{m.origem}</p>
                      {m.mensagem}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-gray-100 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    value={resposta}
                    onChange={(e) => setResposta(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void enviarResposta();
                      }
                    }}
                    placeholder="Responda ao visitante… (Enter envia)"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gray-300"
                  />
                  <button
                    onClick={() => void enviarResposta()}
                    disabled={salvando || !resposta.trim()}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-white disabled:opacity-40 transition-opacity flex-shrink-0"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    {salvando
                      ? <i className="ri-loader-4-line animate-spin text-sm"></i>
                      : <i className="ri-send-plane-line text-sm"></i>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => setAberto((v) => !v)}
        className="fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 rounded-2xl text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: config.primaryColor }}
        title={count > 0 ? `${count} conversa${count !== 1 ? "s" : ""} pendente${count !== 1 ? "s" : ""}` : "Chat Online"}
      >
        {/* Anel de pulse quando há mensagens novas */}
        {(count > 0 || novasMensagens) && (
          <span
            className="absolute inset-0 rounded-2xl animate-ping opacity-30"
            style={{ backgroundColor: config.primaryColor }}
          />
        )}

        {/* Badge de contagem */}
        {count > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 shadow ${
              novasMensagens ? "animate-bounce" : ""
            }`}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}

        <i className="ri-chat-3-line text-xl relative z-10"></i>
      </button>
    </>
  );
}
