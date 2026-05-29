import { useEffect, useMemo, useRef, useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { chatService, ChatConversa } from "@/services/chat.service";
import { ApiError } from "@/services/api";

const STATUS_OPTIONS = ["aberta", "em-atendimento", "respondida", "arquivada"];

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string; text: string }> = {
  aberta:          { label: "Aberta",          dot: "bg-amber-400",  badge: "bg-amber-50 border-amber-200",  text: "text-amber-700" },
  "em-atendimento":{ label: "Em atendimento",  dot: "bg-blue-400",   badge: "bg-blue-50 border-blue-200",    text: "text-blue-700" },
  respondida:      { label: "Respondida",       dot: "bg-green-400",  badge: "bg-green-50 border-green-200",  text: "text-green-700" },
  arquivada:       { label: "Arquivada",        dot: "bg-gray-300",   badge: "bg-gray-100 border-gray-200",   text: "text-gray-500" },
};

function textoData(value?: string) {
  if (!value) return "–";
  const d = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return value;
  const agora = new Date();
  const diff = Math.floor((agora.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function Iniciais({ nome }: { nome?: string }) {
  const letras = (nome || "?").split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {letras}
    </div>
  );
}

export default function ChatAdminTab() {
  const { config } = useSiteConfig();
  const [conversas, setConversas] = useState<ChatConversa[]>([]);
  const [selecionada, setSelecionada] = useState<ChatConversa | null>(null);
  const [filtro, setFiltro] = useState("todos");
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [busca, setBusca] = useState("");
  const msgFimRef = useRef<HTMLDivElement>(null);

  const carregar = async () => {
    setLoading(true);
    setErro("");
    try {
      setConversas(await chatService.listarAdmin());
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível carregar chats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void carregar();
    const id = setInterval(() => void carregar(), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    msgFimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selecionada?.mensagens]);

  const filtradas = useMemo(() => {
    let lista = conversas;
    if (filtro !== "todos") lista = lista.filter((c) => c.status === filtro);
    if (busca.trim()) lista = lista.filter((c) =>
      `${c.session_id} ${c.nome || ""} ${c.email || ""} ${c.ultima_mensagem || ""}`.toLowerCase().includes(busca.toLowerCase())
    );
    return lista;
  }, [conversas, filtro, busca]);

  const stats = useMemo(() => ({
    total:      conversas.length,
    abertas:    conversas.filter((c) => c.status === "aberta").length,
    atendimento:conversas.filter((c) => c.status === "em-atendimento").length,
    respondidas:conversas.filter((c) => c.status === "respondida").length,
  }), [conversas]);

  const abrir = async (id: number) => {
    setErro("");
    try {
      const data = await chatService.detalhar(id);
      setSelecionada(data);
      setResposta("");
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível abrir o chat.");
    }
  };

  const responder = async () => {
    if (!selecionada?.id || !resposta.trim()) return;
    setSalvando(true);
    setErro("");
    try {
      const msg = await chatService.responder(selecionada.id, resposta.trim());
      setSelecionada((prev) => prev ? { ...prev, status: "respondida", mensagens: [...(prev.mensagens || []), msg] } : prev);
      setConversas((prev) => prev.map((c) => c.id === selecionada.id ? { ...c, status: "respondida", ultima_mensagem: resposta } : c));
      setResposta("");
      setOk("Resposta registrada!");
      setTimeout(() => setOk(""), 2500);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível responder.");
    } finally {
      setSalvando(false);
    }
  };

  const alterarStatus = async (item: ChatConversa, status: string) => {
    try {
      await chatService.atualizarStatus(item.id, status);
      setConversas((prev) => prev.map((c) => c.id === item.id ? { ...c, status } : c));
      setSelecionada((prev) => prev?.id === item.id ? { ...prev, status } : prev);
    } catch { setErro("Não foi possível atualizar status."); }
  };

  const excluir = async (item: ChatConversa) => {
    if (!confirm(`Excluir a conversa de "${item.session_id}"?`)) return;
    try {
      await chatService.excluir(item.id);
      setConversas((prev) => prev.filter((c) => c.id !== item.id));
      if (selecionada?.id === item.id) setSelecionada(null);
    } catch { setErro("Não foi possível excluir."); }
  };

  const sc = selecionada ? (STATUS_CONFIG[selecionada.status] || STATUS_CONFIG.aberta) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Chat Online</h1>
          <p className="text-sm text-gray-400 mt-0.5">Atendimento em tempo real com visitantes do site.</p>
        </div>
        <button onClick={() => void carregar()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: config.primaryColor }}>
          <i className={`ri-refresh-line ${loading ? "animate-spin" : ""}`}></i> Atualizar
        </button>
      </div>

      {/* Alerts */}
      {erro && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          <i className="ri-error-warning-line flex-shrink-0"></i> {erro}
        </div>
      )}
      {ok && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700">
          <i className="ri-check-line flex-shrink-0"></i> {ok}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total de Chats",   value: stats.total,       icon: "ri-chat-3-line",             color: config.primaryColor, bg: `${config.primaryColor}12` },
          { label: "Abertas",          value: stats.abertas,     icon: "ri-inbox-line",              color: "#D97706",           bg: "#FFFBEB" },
          { label: "Em Atendimento",   value: stats.atendimento, icon: "ri-customer-service-2-line", color: "#0891B2",           bg: "#EFF6FF" },
          { label: "Respondidas",      value: stats.respondidas, icon: "ri-check-double-line",       color: "#059669",           bg: "#ECFDF5" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: s.bg }}>
              <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-5 min-h-[600px]">

        {/* Lista de conversas */}
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
          {/* Filtros + busca */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input value={busca} onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar conversa..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[{ key: "todos", label: "Todos" }, ...STATUS_OPTIONS.map((s) => ({ key: s, label: STATUS_CONFIG[s]?.label || s }))].map((f) => (
                <button key={f.key} onClick={() => setFiltro(f.key)}
                  className="px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all"
                  style={filtro === f.key
                    ? { backgroundColor: config.primaryColor, color: "white" }
                    : { backgroundColor: "#F3F4F6", color: "#6B7280" }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <i className="ri-loader-4-line animate-spin text-2xl mb-2"></i>
                <p className="text-sm">Carregando chats...</p>
              </div>
            ) : filtradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <i className="ri-chat-off-line text-3xl mb-2 text-gray-200"></i>
                <p className="text-sm font-medium">Nenhum chat encontrado</p>
              </div>
            ) : (
              filtradas.map((item) => {
                const sc2 = STATUS_CONFIG[item.status] || STATUS_CONFIG.aberta;
                const isSelected = selecionada?.id === item.id;
                return (
                  <button key={item.id}
                    onClick={() => void abrir(item.id)}
                    className={`w-full text-left p-4 transition-all hover:bg-gray-50 ${isSelected ? "bg-gray-50 border-l-4" : "border-l-4 border-l-transparent"}`}
                    style={isSelected ? { borderLeftColor: config.primaryColor } : {}}>
                    <div className="flex items-start gap-3">
                      <Iniciais nome={item.nome || item.session_id} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-sm font-bold text-gray-900 truncate">
                            {item.nome || `Visitante #${item.id}`}
                          </span>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">{textoData(item.atualizado_em || item.criado_em)}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mb-2">{item.ultima_mensagem || "Sem mensagens"}</p>
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${sc2.badge} ${sc2.text}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${sc2.dot}`}></div>
                            {sc2.label}
                          </div>
                          <span className="text-[10px] text-gray-300">{Number(item.total_mensagens || 0)} msg</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">{filtradas.length} conversa{filtradas.length !== 1 ? "s" : ""} · atualiza a cada 30s</p>
          </div>
        </div>

        {/* Painel de detalhe */}
        {!selecionada ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${config.primaryColor}12` }}>
              <i className="ri-chat-3-line text-3xl" style={{ color: config.primaryColor }}></i>
            </div>
            <p className="text-base font-bold text-gray-800 mb-1">Selecione uma conversa</p>
            <p className="text-sm text-gray-400 text-center max-w-xs">Clique em uma conversa ao lado para ver o histórico completo e responder.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
            {/* Header da conversa */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3 min-w-0">
                <Iniciais nome={selecionada.nome || selecionada.session_id} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{selecionada.nome || `Visitante #${selecionada.id}`}</p>
                  <p className="text-xs text-gray-400 font-mono truncate">{selecionada.session_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${sc?.badge} ${sc?.text}`}>
                  <div className={`w-2 h-2 rounded-full ${sc?.dot}`}></div>
                  {sc?.label}
                </div>
                <select value={selecionada.status}
                  onChange={(e) => void alterarStatus(selecionada, e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-white focus:outline-none cursor-pointer">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
                </select>
                <button onClick={() => void excluir(selecionada)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 cursor-pointer transition-colors"
                  title="Excluir conversa">
                  <i className="ri-delete-bin-line text-sm"></i>
                </button>
              </div>
            </div>

            {/* Info do visitante */}
            {selecionada.email && (
              <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-100">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <i className="ri-mail-line text-gray-400"></i> {selecionada.email}
                </span>
                <span className="ml-auto text-xs text-gray-400">{textoData(selecionada.criado_em)}</span>
              </div>
            )}

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50/30 min-h-[300px] max-h-[420px]">
              {(!selecionada.mensagens || selecionada.mensagens.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <i className="ri-chat-1-line text-3xl text-gray-200 mb-2"></i>
                  <p className="text-sm">Nenhuma mensagem registrada.</p>
                </div>
              ) : (
                selecionada.mensagens.map((m) => {
                  const isVisitante = m.origem === "visitante";
                  return (
                    <div key={m.id} className={`flex ${isVisitante ? "justify-end" : "justify-start"} gap-2`}>
                      {!isVisitante && (
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                          style={{ backgroundColor: `${config.primaryColor}15` }}>
                          <i className="ri-customer-service-2-line text-xs" style={{ color: config.primaryColor }}></i>
                        </div>
                      )}
                      <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${isVisitante
                        ? "rounded-br-sm text-white"
                        : "rounded-bl-sm bg-white border border-gray-100 text-gray-700"
                      }`}
                        style={isVisitante ? { backgroundColor: config.primaryColor } : {}}>
                        <p className={`text-[10px] font-bold mb-1 ${isVisitante ? "text-white/60" : "text-gray-400"}`}>
                          {isVisitante ? "Visitante" : "Operador"}
                        </p>
                        <p className="text-sm leading-relaxed">{m.mensagem}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={msgFimRef} />
            </div>

            {/* Resposta */}
            <div className="px-5 py-4 border-t border-gray-100 bg-white">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Registrar resposta do operador</label>
              <div className="flex gap-3">
                <textarea
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) void responder(); }}
                  rows={3}
                  placeholder="Digite a resposta... (Ctrl+Enter para enviar)"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-gray-300 transition-colors"
                />
                <button onClick={() => void responder()}
                  disabled={salvando || !resposta.trim()}
                  className="flex flex-col items-center justify-center gap-1 px-4 rounded-xl text-white cursor-pointer disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0 min-w-[72px]"
                  style={{ backgroundColor: config.primaryColor }}>
                  {salvando
                    ? <i className="ri-loader-4-line animate-spin text-lg"></i>
                    : <i className="ri-send-plane-fill text-lg"></i>}
                  <span className="text-[10px] font-semibold">{salvando ? "..." : "Enviar"}</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Ctrl+Enter para enviar rapidamente.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
