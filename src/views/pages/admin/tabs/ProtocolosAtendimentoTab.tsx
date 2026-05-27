import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { ouvidoriaService, Manifestacao } from "@/services/ouvidoria.service";
import { laiService, PedidoLAI } from "@/services/lai.service";
import { ApiError } from "@/services/api";

type TipoAtendimento = "ouvidoria" | "lai";
type Registro = (Manifestacao | PedidoLAI) & { id?: string | number; protocolo: string; status?: string; criado_em?: string };

const STATUS_OUVIDORIA = ["pendente", "em-analise", "respondida", "arquivada"];
const STATUS_LAI = ["pendente", "em-analise", "respondido", "negado", "arquivado"];

function textoData(value?: string) {
  if (!value) return "-";
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

function assuntoRegistro(item: Registro, tipo: TipoAtendimento) {
  if (tipo === "ouvidoria") return String((item as Manifestacao).assunto || "Sem assunto");
  return String((item as PedidoLAI).descricao_pedido || (item as PedidoLAI).descricao || "Pedido LAI");
}

function mensagemRegistro(item: Registro, tipo: TipoAtendimento) {
  if (tipo === "ouvidoria") return String((item as any).mensagem || (item as Manifestacao).descricao || "");
  return String((item as PedidoLAI).descricao_pedido || (item as PedidoLAI).descricao || "");
}

function solicitanteRegistro(item: Registro, tipo: TipoAtendimento) {
  if (tipo === "ouvidoria") {
    const ouv = item as Manifestacao;
    return ouv.anonimo ? "Anonimo" : String(ouv.nome || ouv.email || "Nao informado");
  }
  const lai = item as PedidoLAI;
  return String((lai as any).nome || lai.solicitante || lai.email || "Nao informado");
}

function statusClass(status?: string) {
  if (status === "respondida" || status === "respondido") return "bg-green-50 text-green-700 border-green-100";
  if (status === "em-analise") return "bg-blue-50 text-blue-700 border-blue-100";
  if (status === "arquivada" || status === "arquivado" || status === "negado") return "bg-gray-100 text-gray-600 border-gray-200";
  return "bg-amber-50 text-amber-700 border-amber-100";
}

export default function ProtocolosAtendimentoTab({ tipo }: { tipo: TipoAtendimento }) {
  const { config } = useSiteConfig();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [selecionado, setSelecionado] = useState<Registro | null>(null);
  const [resposta, setResposta] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  const info = tipo === "ouvidoria"
    ? { titulo: "Ouvidoria", icon: "ri-speak-line", color: "#7C3AED", desc: "Manifestacoes recebidas pelo formulario publico da Ouvidoria.", linkPublico: "/ouvidoria", respondido: "respondida" }
    : { titulo: "LAI - Acesso a Informacao", icon: "ri-file-info-line", color: "#0891B2", desc: "Pedidos de acesso a informacao registrados no portal.", linkPublico: "/lai", respondido: "respondido" };

  const statusDisponiveis = tipo === "ouvidoria" ? STATUS_OUVIDORIA : STATUS_LAI;

  const carregar = async () => {
    setLoading(true);
    setErro("");
    try {
      const data = tipo === "ouvidoria" ? await ouvidoriaService.listar() : await laiService.listar();
      setRegistros(data as Registro[]);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Nao foi possivel carregar os registros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void carregar();
  }, [tipo]);

  const filtrados = useMemo(() => registros.filter((item) => filtro === "todos" || item.status === filtro), [registros, filtro]);

  const stats = useMemo(() => {
    const respondidos = registros.filter((item) => item.status === "respondida" || item.status === "respondido").length;
    return [
      { label: "Recebidos", value: registros.length, icon: "ri-inbox-line" },
      { label: "Pendentes", value: registros.filter((item) => !item.status || item.status === "pendente").length, icon: "ri-time-line" },
      { label: "Em analise", value: registros.filter((item) => item.status === "em-analise").length, icon: "ri-loader-line" },
      { label: "Respondidos", value: respondidos, icon: "ri-check-double-line" },
    ];
  }, [registros]);

  const abrir = async (item: Registro) => {
    if (!item.id) return;
    setErro("");
    try {
      const completo = tipo === "ouvidoria" ? await ouvidoriaService.detalhar(item.id) : await laiService.detalhar(item.id);
      setSelecionado(completo as Registro);
      setResposta(String((completo as Registro).resposta || ""));
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Nao foi possivel abrir o registro.");
    }
  };

  const responder = async () => {
    if (!selecionado?.id || !resposta.trim()) return;
    setSalvando(true);
    setErro("");
    try {
      if (tipo === "ouvidoria") await ouvidoriaService.responder(selecionado.id, resposta, info.respondido);
      else await laiService.responder(selecionado.id, resposta, info.respondido);
      setOk("Resposta salva com sucesso.");
      await carregar();
      setSelecionado((prev) => prev ? { ...prev, resposta, status: info.respondido, respondido_em: new Date().toISOString() } : prev);
      setTimeout(() => setOk(""), 2500);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Nao foi possivel salvar a resposta.");
    } finally {
      setSalvando(false);
    }
  };

  const alterarStatus = async (item: Registro, status: string) => {
    if (!item.id) return;
    setErro("");
    try {
      if (tipo === "ouvidoria") await ouvidoriaService.atualizarStatus(item.id, status);
      else await laiService.atualizarStatus(item.id, status);
      setRegistros((prev) => prev.map((r) => String(r.id) === String(item.id) ? { ...r, status } : r));
      setSelecionado((prev) => prev && String(prev.id) === String(item.id) ? { ...prev, status } : prev);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Nao foi possivel atualizar o status.");
    }
  };

  const excluir = async (item: Registro) => {
    if (!item.id || !confirm(`Excluir definitivamente o protocolo ${item.protocolo}?`)) return;
    setErro("");
    try {
      if (tipo === "ouvidoria") await ouvidoriaService.excluir(item.id);
      else await laiService.excluir(item.id);
      setRegistros((prev) => prev.filter((r) => String(r.id) !== String(item.id)));
      if (selecionado && String(selecionado.id) === String(item.id)) setSelecionado(null);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Nao foi possivel excluir o registro.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{info.titulo}</h1>
          <p className="text-sm text-gray-400 mt-1">{info.desc}</p>
        </div>
        <Link to={info.linkPublico} target="_blank" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border whitespace-nowrap hover:bg-gray-50" style={{ borderColor: info.color, color: info.color }}>
          <i className="ri-external-link-line text-sm"></i> Ver pagina publica
        </Link>
      </div>

      {(erro || ok) && <div className={`px-4 py-3 rounded-xl border text-sm ${erro ? "bg-red-50 border-red-100 text-red-600" : "bg-green-50 border-green-100 text-green-700"}`}>{erro || ok}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4"><div className="w-8 h-8 flex items-center justify-center rounded-xl mb-2" style={{ backgroundColor: `${info.color}15` }}><i className={`${s.icon} text-sm`} style={{ color: info.color }}></i></div><p className="text-xl font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
              <option value="todos">Todos os status</option>
              {statusDisponiveis.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => void carregar()} className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"><i className="ri-refresh-line mr-1"></i>Atualizar</button>
          </div>
          {loading ? <div className="p-10 text-center text-sm text-gray-400">Carregando registros do MySQL...</div> : filtrados.length === 0 ? <div className="p-10 text-center text-sm text-gray-400">Nenhum registro encontrado.</div> : <div className="divide-y divide-gray-100">{filtrados.map((item) => <div key={String(item.id)} className="p-4 hover:bg-gray-50 transition-colors"><div className="flex items-start justify-between gap-3"><button onClick={() => void abrir(item)} className="text-left min-w-0 flex-1"><p className="text-xs font-bold text-gray-400 font-mono">{item.protocolo}</p><h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-1">{assuntoRegistro(item, tipo)}</h3><p className="text-xs text-gray-500 mt-1">{solicitanteRegistro(item, tipo)} - {textoData(item.criado_em)}</p></button><span className={`px-2 py-1 rounded-full border text-[10px] font-bold uppercase ${statusClass(item.status)}`}>{item.status || "pendente"}</span></div><div className="mt-3 flex items-center gap-2 flex-wrap"><select value={item.status || "pendente"} onChange={(e) => void alterarStatus(item, e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white">{statusDisponiveis.map((s) => <option key={s} value={s}>{s}</option>)}</select><button onClick={() => void abrir(item)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold">Responder</button><button onClick={() => void excluir(item)} className="px-3 py-1.5 rounded-lg border border-red-100 text-red-500 text-xs font-semibold">Excluir</button></div></div>)}</div>}
        </div>

        <aside className="bg-white rounded-2xl border border-gray-100 p-5 h-fit sticky top-4">
          {!selecionado ? <div className="text-center py-12"><div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ backgroundColor: `${info.color}15`, color: info.color }}><i className={`${info.icon} text-2xl`}></i></div><p className="text-sm font-bold text-gray-800">Selecione um protocolo</p><p className="text-xs text-gray-400 mt-1">Abra um registro para ler e responder.</p></div> : <div className="space-y-4"><div><p className="text-xs font-mono text-gray-400">{selecionado.protocolo}</p><h2 className="text-base font-bold text-gray-900 mt-1">{assuntoRegistro(selecionado, tipo)}</h2><p className="text-xs text-gray-500 mt-1">{solicitanteRegistro(selecionado, tipo)} - {textoData(selecionado.criado_em)}</p></div><div className="rounded-xl bg-gray-50 border border-gray-100 p-3"><p className="text-xs font-bold text-gray-500 mb-2">Mensagem recebida</p><p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{mensagemRegistro(selecionado, tipo) || "Sem mensagem detalhada."}</p></div><div className="grid grid-cols-2 gap-3 text-xs"><div className="rounded-xl border border-gray-100 p-3"><p className="text-gray-400">E-mail</p><p className="font-semibold text-gray-700 break-all">{String((selecionado as any).email || "-")}</p></div><div className="rounded-xl border border-gray-100 p-3"><p className="text-gray-400">Telefone</p><p className="font-semibold text-gray-700">{String((selecionado as any).telefone || "-")}</p></div></div><div><label className="text-xs font-bold text-gray-600 mb-2 block">Resposta oficial</label><textarea value={resposta} onChange={(e) => setResposta(e.target.value)} rows={7} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none" placeholder="Digite a resposta que ficara disponivel na consulta por protocolo..." /></div><button onClick={() => void responder()} disabled={salvando || !resposta.trim()} className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: config.primaryColor }}>{salvando ? "Salvando..." : "Salvar resposta"}</button></div>}
        </aside>
      </div>
    </div>
  );
}
