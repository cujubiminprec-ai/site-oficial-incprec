import { useEffect, useMemo, useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { chatService, ChatConversa } from "@/services/chat.service";
import { ApiError } from "@/services/api";

const STATUS = ["aberta", "em-atendimento", "respondida", "arquivada"];

function textoData(value?: string) {
  if (!value) return "-";
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function statusClass(status?: string) {
  if (status === "respondida") return "bg-green-50 text-green-700 border-green-100";
  if (status === "em-atendimento") return "bg-blue-50 text-blue-700 border-blue-100";
  if (status === "arquivada") return "bg-gray-100 text-gray-600 border-gray-200";
  return "bg-amber-50 text-amber-700 border-amber-100";
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

  const carregar = async () => {
    setLoading(true);
    setErro("");
    try {
      setConversas(await chatService.listarAdmin());
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Nao foi possivel carregar chats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void carregar(); }, []);

  const filtradas = useMemo(() => conversas.filter((c) => filtro === "todos" || c.status === filtro), [conversas, filtro]);
  const stats = useMemo(() => [
    { label: "Conversas", value: conversas.length, icon: "ri-chat-3-line" },
    { label: "Abertas", value: conversas.filter((c) => c.status === "aberta").length, icon: "ri-inbox-line" },
    { label: "Em atendimento", value: conversas.filter((c) => c.status === "em-atendimento").length, icon: "ri-customer-service-2-line" },
    { label: "Respondidas", value: conversas.filter((c) => c.status === "respondida").length, icon: "ri-check-double-line" },
  ], [conversas]);

  const abrir = async (id: number) => {
    setErro("");
    try {
      const data = await chatService.detalhar(id);
      setSelecionada(data);
      setResposta("");
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Nao foi possivel abrir o chat.");
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
      setOk("Resposta registrada no histórico do chat.");
      setTimeout(() => setOk(""), 2500);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Nao foi possivel responder o chat.");
    } finally {
      setSalvando(false);
    }
  };

  const alterarStatus = async (item: ChatConversa, status: string) => {
    setErro("");
    try {
      await chatService.atualizarStatus(item.id, status);
      setConversas((prev) => prev.map((c) => c.id === item.id ? { ...c, status } : c));
      setSelecionada((prev) => prev?.id === item.id ? { ...prev, status } : prev);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Nao foi possivel atualizar status.");
    }
  };

  const excluir = async (item: ChatConversa) => {
    if (!confirm("Excluir definitivamente esta conversa?")) return;
    setErro("");
    try {
      await chatService.excluir(item.id);
      setConversas((prev) => prev.filter((c) => c.id !== item.id));
      if (selecionada?.id === item.id) setSelecionada(null);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Nao foi possivel excluir chat.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Chat Online</h1>
          <p className="text-sm text-gray-400 mt-1">Conversas reais registradas pelo assistente flutuante do site no MySQL.</p>
        </div>
        <button onClick={() => void carregar()} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: config.primaryColor }}><i className="ri-refresh-line mr-1"></i>Atualizar</button>
      </div>

      {(erro || ok) && <div className={`px-4 py-3 rounded-xl border text-sm ${erro ? "bg-red-50 border-red-100 text-red-600" : "bg-green-50 border-green-100 text-green-700"}`}>{erro || ok}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4"><div className="w-8 h-8 flex items-center justify-center rounded-xl mb-2" style={{ backgroundColor: `${config.primaryColor}15` }}><i className={`${s.icon} text-sm`} style={{ color: config.primaryColor }}></i></div><p className="text-xl font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_460px] gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100"><select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white"><option value="todos">Todos os status</option>{STATUS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          {loading ? <div className="p-10 text-center text-sm text-gray-400">Carregando chats do MySQL...</div> : filtradas.length === 0 ? <div className="p-10 text-center text-sm text-gray-400">Nenhum chat encontrado.</div> : <div className="divide-y divide-gray-100">{filtradas.map((item) => <div key={item.id} className="p-4 hover:bg-gray-50"><div className="flex items-start justify-between gap-3"><button onClick={() => void abrir(item.id)} className="text-left min-w-0 flex-1"><p className="text-xs font-mono text-gray-400">{item.session_id}</p><h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-1">{item.ultima_mensagem || "Conversa sem mensagens"}</h3><p className="text-xs text-gray-500 mt-1">{Number(item.total_mensagens || 0)} mensagens - {textoData(item.atualizado_em || item.criado_em)}</p></button><span className={`px-2 py-1 rounded-full border text-[10px] font-bold uppercase ${statusClass(item.status)}`}>{item.status}</span></div><div className="mt-3 flex items-center gap-2 flex-wrap"><select value={item.status} onChange={(e) => void alterarStatus(item, e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white">{STATUS.map((s) => <option key={s} value={s}>{s}</option>)}</select><button onClick={() => void abrir(item.id)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold">Abrir</button><button onClick={() => void excluir(item)} className="px-3 py-1.5 rounded-lg border border-red-100 text-red-500 text-xs font-semibold">Excluir</button></div></div>)}</div>}
        </div>

        <aside className="bg-white rounded-2xl border border-gray-100 p-5 h-fit sticky top-4">
          {!selecionada ? <div className="text-center py-12"><div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}><i className="ri-chat-3-line text-2xl"></i></div><p className="text-sm font-bold text-gray-800">Selecione uma conversa</p><p className="text-xs text-gray-400 mt-1">Abra um chat para ver o histórico e responder.</p></div> : <div className="space-y-4"><div><p className="text-xs font-mono text-gray-400">{selecionada.session_id}</p><h2 className="text-base font-bold text-gray-900 mt-1">Histórico do atendimento</h2><p className="text-xs text-gray-500 mt-1">Status: {selecionada.status}</p></div><div className="rounded-xl bg-gray-50 border border-gray-100 p-3 max-h-[360px] overflow-y-auto space-y-2">{(selecionada.mensagens || []).map((m) => <div key={m.id} className={`flex ${m.origem === "visitante" ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${m.origem === "visitante" ? "text-white" : "bg-white border border-gray-100 text-gray-700"}`} style={m.origem === "visitante" ? { backgroundColor: config.primaryColor } : undefined}><p className="text-[10px] font-bold opacity-70 mb-1">{m.origem}</p>{m.mensagem}</div></div>)}{(!selecionada.mensagens || selecionada.mensagens.length === 0) && <p className="text-sm text-gray-400 text-center py-8">Sem mensagens.</p>}</div><div><label className="text-xs font-bold text-gray-600 mb-2 block">Resposta do operador</label><textarea value={resposta} onChange={(e) => setResposta(e.target.value)} rows={5} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none" placeholder="Digite a resposta para registrar no histórico..." /></div><button onClick={() => void responder()} disabled={salvando || !resposta.trim()} className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: config.primaryColor }}>{salvando ? "Salvando..." : "Registrar resposta"}</button></div>}
        </aside>
      </div>
    </div>
  );
}
