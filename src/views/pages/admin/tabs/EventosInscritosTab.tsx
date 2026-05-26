import { useEffect, useMemo, useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { eventosService, type Evento } from "@/services/eventos.service";

type TabView = "inscritos" | "presenca";

export interface Inscrito {
  id: string;
  eventoId: number;
  eventoTitulo: string;
  nome: string;
  email: string;
  telefone: string;
  matricula: string;
  secretaria: string;
  dataInscricao: string;
  status: "confirmado" | "pendente" | "cancelado";
}

export interface EventoCadastro {
  id: number;
  titulo: string;
  tipo: string;
  data: string;
  vagas?: number;
}

function formatDate(d: string) {
  return new Date(`${d}T12:00:00`).toLocaleDateString("pt-BR");
}

const STATUS_COLORS: Record<string, string> = {
  confirmado: "bg-green-50 text-green-700",
  pendente: "bg-amber-50 text-amber-700",
  cancelado: "bg-red-50 text-red-500",
};

function exportToCSV(inscritos: Inscrito[], titulo: string) {
  const header = ["Nome", "E-mail", "Telefone", "Matrícula", "Secretaria", "Data Inscrição", "Status"];
  const rows = inscritos.map((i) => [i.nome, i.email, i.telefone, i.matricula, i.secretaria, formatDate(i.dataInscricao), i.status]);
  const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inscritos_${titulo.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPresencaCSV(inscritos: Inscrito[], presenca: Record<string, boolean>, titulo: string) {
  const header = ["Nome", "E-mail", "Matrícula", "Secretaria", "Presença"];
  const rows = inscritos.map((i) => [i.nome, i.email, i.matricula, i.secretaria, presenca[i.id] ? "Presente" : "Ausente"]);
  const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `presenca_${titulo.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function mapEventoAdmin(evento: Evento): EventoCadastro {
  return {
    id: Number(evento.id),
    titulo: evento.titulo,
    tipo: evento.tipo || "Evento",
    data: String(evento.data_inicio || evento.data || new Date().toISOString().slice(0, 10)).slice(0, 10),
    vagas: evento.vagas,
  };
}

function mapInscricao(item: Awaited<ReturnType<typeof eventosService.listarInscricoesAdmin>>[number]): Inscrito {
  const statusRaw = String(item.status || "confirmado");
  return {
    id: String(item.id || ""),
    eventoId: Number(item.evento_id),
    eventoTitulo: item.evento_titulo || "",
    nome: item.nome,
    email: item.email,
    telefone: item.telefone || "",
    matricula: item.matricula || "",
    secretaria: item.cargo || "",
    dataInscricao: String(item.created_at || item.data_inicio || new Date().toISOString().slice(0, 10)).slice(0, 10),
    status: statusRaw === "lista-espera" ? "pendente" : (statusRaw as Inscrito["status"]),
  };
}

export default function EventosInscritosTab() {
  const { config } = useSiteConfig();
  const [tabView, setTabView] = useState<TabView>("inscritos");
  const [inscritos, setInscritos] = useState<Inscrito[]>([]);
  const [presenca, setPresenca] = useState<Record<string, boolean>>({});
  const [eventosDisponiveis, setEventosDisponiveis] = useState<EventoCadastro[]>([]);
  const [eventoSelecionado, setEventoSelecionado] = useState<number | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<"todos" | "confirmado" | "pendente" | "cancelado">("todos");
  const [detalheInscrito, setDetalheInscrito] = useState<Inscrito | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      setLoading(true);
      setErro("");
      try {
        const [eventos, inscricoes] = await Promise.all([
          eventosService.listarAdmin(),
          eventosService.listarInscricoesAdmin(),
        ]);
        if (!ativo) return;
        setEventosDisponiveis(eventos.map(mapEventoAdmin));
        setInscritos(inscricoes.map(mapInscricao));
        setPresenca(
          Object.fromEntries(
            inscricoes.map((item) => [String(item.id || ""), item.presenca === true || item.presenca === 1])
          )
        );
      } catch (err) {
        if (!ativo) return;
        setErro(err instanceof Error ? err.message : "Erro ao carregar inscritos.");
        setEventosDisponiveis([]);
        setInscritos([]);
        setPresenca({});
      } finally {
        if (ativo) setLoading(false);
      }
    };

    void carregar();
    return () => {
      ativo = false;
    };
  }, []);

  const persist = (data: Inscrito[]) => {
    setInscritos(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const togglePresenca = async (id: string) => {
    const inscrito = inscritos.find((item) => item.id === id);
    if (!inscrito) return;
    const novoValor = !presenca[id];
    await eventosService.atualizarInscricao(String(inscrito.eventoId), id, { presenca: novoValor ? 1 : 0 });
    setPresenca((prev) => ({ ...prev, [id]: novoValor }));
  };

  const inscritosFiltrados = useMemo(() => {
    return inscritos.filter((i) => {
      const eventoOk = eventoSelecionado === "todos" || i.eventoId === eventoSelecionado;
      const statusOk = statusFiltro === "todos" || i.status === statusFiltro;
      const buscaOk =
        !busca ||
        i.nome.toLowerCase().includes(busca.toLowerCase()) ||
        i.email.toLowerCase().includes(busca.toLowerCase()) ||
        i.matricula.includes(busca) ||
        i.secretaria.toLowerCase().includes(busca.toLowerCase());
      return eventoOk && statusOk && buscaOk;
    });
  }, [inscritos, eventoSelecionado, statusFiltro, busca]);

  const eventosCadastrados = useMemo(() => {
    return eventosDisponiveis
      .filter((evento) => inscritos.some((inscrito) => inscrito.eventoId === evento.id))
      .sort((a, b) => a.data.localeCompare(b.data));
  }, [eventosDisponiveis, inscritos]);

  const eventoAtual = eventosDisponiveis.find((e) => e.id === eventoSelecionado);

  const updateStatus = async (id: string, status: Inscrito["status"]) => {
    const item = inscritos.find((i) => i.id === id);
    if (!item) return;
    await eventosService.atualizarInscricao(String(item.eventoId), id, {
      status: status === "pendente" ? "lista-espera" : status,
    });
    persist(inscritos.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const deleteInscrito = async (id: string) => {
    const item = inscritos.find((i) => i.id === id);
    if (!item || !confirm("Remover este inscrito?")) return;
    await eventosService.deletarInscricao(String(item.eventoId), id);
    persist(inscritos.filter((i) => i.id !== id));
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Inscritos em Eventos</h1>
          <p className="mt-1 text-sm text-gray-400">Gerencie os inscritos reais em cursos, capacitações e eventos do INPREC.</p>
        </div>
        <div className="flex items-center gap-2">
          {tabView === "inscritos" && (
            <>
              <button
                onClick={() => exportToCSV(inscritosFiltrados, eventoAtual?.titulo || "todos")}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-gray-600 hover:bg-gray-50"
              >
                <i className="ri-download-2-line text-sm"></i> Exportar CSV
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={eventosDisponiveis.length === 0}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: config.primaryColor }}
              >
                <i className="ri-add-line"></i> Adicionar Inscrito
              </button>
            </>
          )}
        </div>
      </div>

      {erro && <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>}
      {loading && <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">Carregando inscrições reais do MySQL...</div>}

      <div className="mb-6 flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
        {([
          { key: "inscritos" as TabView, label: "Lista de Inscritos", icon: "ri-team-line" },
          { key: "presenca" as TabView, label: "Relatório de Presença", icon: "ri-checkbox-circle-line" },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTabView(t.key)}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all"
            style={tabView === t.key ? { backgroundColor: config.primaryColor, color: "white" } : { color: "#6B7280" }}
          >
            <i className={`${t.icon} text-xs`}></i>{t.label}
          </button>
        ))}
      </div>

      {saved && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
          <i className="ri-check-line"></i> Alterações salvas!
        </div>
      )}

      {tabView === "inscritos" && (
        <div>
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {eventosCadastrados.map((ev) => {
              const count = inscritos.filter((i) => i.eventoId === ev.id).length;
              const confirmados = inscritos.filter((i) => i.eventoId === ev.id && i.status === "confirmado").length;
              const isSelected = eventoSelecionado === ev.id;
              return (
                <button
                  key={ev.id}
                  onClick={() => setEventoSelecionado(isSelected ? "todos" : ev.id)}
                  className="cursor-pointer rounded-2xl border-2 p-4 text-left transition-all"
                  style={isSelected ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}06` } : { borderColor: "#F3F4F6", backgroundColor: "white" }}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}>{ev.tipo}</span>
                    <span className="flex-shrink-0 text-xs whitespace-nowrap text-gray-400">{formatDate(ev.data)}</span>
                  </div>
                  <p className="mb-3 line-clamp-2 text-xs font-semibold leading-snug text-gray-800">{ev.titulo}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">Inscrições</span>
                        <span className="text-xs font-bold text-gray-700">{count}{ev.vagas ? `/${ev.vagas}` : ""}</span>
                      </div>
                      {ev.vagas && (
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full" style={{ width: `${Math.min((count / ev.vagas) * 100, 100)}%`, backgroundColor: config.primaryColor }}></div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-green-600">{confirmados}</span>
                      <span className="text-[10px] text-gray-400">confirm.</span>
                    </div>
                  </div>
                </button>
              );
            })}
            {!loading && eventosCadastrados.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white py-10 text-center text-sm text-gray-400">
                Ainda não há inscrições reais cadastradas.
              </div>
            )}
          </div>

          <div className="mb-4 flex flex-col items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <i className="ri-search-line absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-400"></i>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, e-mail, matrícula..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pr-4 pl-9 text-sm focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["todos", "confirmado", "pendente", "cancelado"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFiltro(s)}
                  className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold whitespace-nowrap capitalize transition-all"
                  style={statusFiltro === s ? { backgroundColor: config.primaryColor, color: "white", borderColor: config.primaryColor } : { borderColor: "#E5E7EB", color: "#6B7280" }}
                >
                  {s === "todos" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            {eventoSelecionado !== "todos" && (
              <button
                onClick={() => setEventoSelecionado("todos")}
                className="flex cursor-pointer items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold whitespace-nowrap text-gray-500 hover:bg-gray-50"
              >
                <i className="ri-close-line text-xs"></i> Limpar filtro
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <div className="border-b border-gray-50 px-4 py-3">
              <span className="text-xs font-bold tracking-wider text-gray-600 uppercase">
                {inscritosFiltrados.length} {inscritosFiltrados.length === 1 ? "inscrito" : "inscritos"}
                {eventoSelecionado !== "todos" && eventoAtual ? ` — ${eventoAtual.titulo}` : " (todos os eventos)"}
              </span>
            </div>
            {inscritosFiltrados.length === 0 ? (
              <div className="py-16 text-center">
                <i className="ri-user-search-line text-4xl text-gray-200"></i>
                <p className="mt-3 text-sm text-gray-400">Nenhum inscrito encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Nome</th>
                      <th className="px-4 py-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Contato</th>
                      <th className="px-4 py-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Matrícula / Secretaria</th>
                      <th className="px-4 py-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Evento</th>
                      <th className="px-4 py-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Inscrição</th>
                      <th className="px-4 py-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inscritosFiltrados.map((inscrito, idx) => (
                      <tr key={inscrito.id} className={`border-t border-gray-50 transition-colors hover:bg-gray-50/50 ${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}>
                        <td className="px-4 py-3"><p className="text-sm font-semibold whitespace-nowrap text-gray-900">{inscrito.nome}</p></td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">{inscrito.email}</p>
                          <p className="mt-0.5 text-xs text-gray-400">{inscrito.telefone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-mono text-gray-700">{inscrito.matricula || "—"}</p>
                          <p className="mt-0.5 text-xs text-gray-400">{inscrito.secretaria || "—"}</p>
                        </td>
                        <td className="max-w-[200px] px-4 py-3">
                          <p className="line-clamp-2 text-xs leading-snug text-gray-600">{inscrito.eventoTitulo}</p>
                        </td>
                        <td className="px-4 py-3"><p className="text-xs whitespace-nowrap text-gray-500">{formatDate(inscrito.dataInscricao)}</p></td>
                        <td className="px-4 py-3">
                          <select
                            value={inscrito.status}
                            onChange={(e) => void updateStatus(inscrito.id, e.target.value as Inscrito["status"])}
                            className={`cursor-pointer rounded-full border-0 px-2.5 py-1.5 text-xs font-semibold focus:outline-none ${STATUS_COLORS[inscrito.status]}`}
                          >
                            <option value="confirmado">Confirmado</option>
                            <option value="pendente">Pendente</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setDetalheInscrito(inscrito)} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100" title="Ver detalhes">
                              <i className="ri-eye-line text-xs"></i>
                            </button>
                            <button onClick={() => void deleteInscrito(inscrito.id)} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
                              <i className="ri-delete-bin-line text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tabView === "presenca" && (
        <div className="flex flex-col gap-6">
          {eventosCadastrados.map((ev) => {
            const lista = inscritos.filter((i) => i.eventoId === ev.id && i.status !== "cancelado");
            if (lista.length === 0) return null;
            const presentes = lista.filter((i) => presenca[i.id]).length;
            const pct = lista.length > 0 ? Math.round((presentes / lista.length) * 100) : 0;
            return (
              <div key={ev.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <div className="flex flex-col justify-between gap-3 border-b border-gray-50 px-5 py-4 sm:flex-row sm:items-center">
                  <div>
                    <span className="mr-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}>{ev.tipo}</span>
                    <span className="text-sm font-bold text-gray-900">{ev.titulo}</span>
                    <p className="mt-0.5 text-xs text-gray-400">{formatDate(ev.data)}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{presentes}/{lista.length}</p>
                      <p className="text-xs text-gray-400">presentes ({pct}%)</p>
                    </div>
                    <button onClick={() => exportPresencaCSV(lista, presenca, ev.titulo)} className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold whitespace-nowrap text-gray-600 hover:bg-gray-50">
                      <i className="ri-download-2-line text-xs"></i> Exportar CSV
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {lista.map((inscrito) => (
                    <div
                      key={inscrito.id}
                      className={`flex cursor-pointer items-center gap-4 px-5 py-3 transition-colors hover:bg-gray-50 ${presenca[inscrito.id] ? "bg-green-50/40" : ""}`}
                      onClick={() => void togglePresenca(inscrito.id)}
                    >
                      <div className={`relative flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-all ${presenca[inscrito.id] ? "text-white" : "border-2 border-gray-300"}`} style={presenca[inscrito.id] ? { backgroundColor: config.primaryColor } : {}}>
                        {presenca[inscrito.id] && <i className="ri-check-line text-[11px]"></i>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{inscrito.nome}</p>
                        <p className="text-xs text-gray-400">{inscrito.matricula && `Matr. ${inscrito.matricula} · `}{inscrito.secretaria}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${presenca[inscrito.id] ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                        {presenca[inscrito.id] ? "Presente" : "Ausente"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {!loading && eventosCadastrados.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-10 text-center text-sm text-gray-400">
              Nenhum evento com presença registrada ainda.
            </div>
          )}
        </div>
      )}

      {detalheInscrito && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && setDetalheInscrito(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-sm font-bold text-gray-900">Detalhes do Inscrito</h3>
              <button onClick={() => setDetalheInscrito(null)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-gray-100">
                <i className="ri-close-line text-sm text-gray-400"></i>
              </button>
            </div>
            <div className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${config.primaryColor}15` }}>
                  <i className="ri-user-line text-xl" style={{ color: config.primaryColor }}></i>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{detalheInscrito.nome}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[detalheInscrito.status]}`}>
                    {detalheInscrito.status.charAt(0).toUpperCase() + detalheInscrito.status.slice(1)}
                  </span>
                </div>
              </div>
              {([
                ["E-mail", detalheInscrito.email, "ri-mail-line"],
                ["Telefone", detalheInscrito.telefone || "Não informado", "ri-phone-line"],
                ["Matrícula", detalheInscrito.matricula || "Não informada", "ri-id-card-line"],
                ["Secretaria", detalheInscrito.secretaria || "Não informado", "ri-government-line"],
                ["Data de Inscrição", formatDate(detalheInscrito.dataInscricao), "ri-calendar-line"],
                ["Evento", detalheInscrito.eventoTitulo, "ri-calendar-event-line"],
              ] as [string, string, string][]).map(([label, value, icon]) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <i className={`${icon} text-sm text-gray-400`}></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm leading-snug font-medium text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-sm font-bold text-gray-900">Adicionar Inscrito</h3>
              <button onClick={() => setShowAddModal(false)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-gray-100">
                <i className="ri-close-line text-sm text-gray-400"></i>
              </button>
            </div>
            <AddForm
              primaryColor={config.primaryColor}
              eventos={eventosDisponiveis}
              onClose={() => setShowAddModal(false)}
              onSave={async (f) => {
                const ev = eventosDisponiveis.find((e) => e.id === f.eventoId);
                const criada = await eventosService.criarInscricaoAdmin(String(f.eventoId), {
                  nome: f.nome,
                  email: f.email,
                  telefone: f.telefone,
                  matricula: f.matricula,
                  cargo: f.secretaria,
                  status: "confirmado",
                });
                persist([
                  ...inscritos,
                  {
                    ...f,
                    id: String(criada.id || `i${Date.now()}`),
                    eventoTitulo: ev?.titulo || "",
                    status: "confirmado",
                    dataInscricao: new Date().toISOString().slice(0, 10),
                  },
                ]);
                setShowAddModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AddForm({
  primaryColor,
  eventos,
  onClose,
  onSave,
}: {
  primaryColor: string;
  eventos: EventoCadastro[];
  onClose: () => void;
  onSave: (f: { eventoId: number; nome: string; email: string; telefone: string; matricula: string; secretaria: string }) => void;
}) {
  const [form, setForm] = useState({
    eventoId: eventos[0]?.id || 0,
    nome: "",
    email: "",
    telefone: "",
    matricula: "",
    secretaria: "",
  });
  const upd = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="flex flex-col gap-4 p-6"
    >
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">Evento / Curso *</label>
        <select
          name="eventoId"
          value={form.eventoId}
          onChange={(e) => upd("eventoId", parseInt(e.target.value, 10))}
          required
          className="w-full cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none"
        >
          {eventos.map((ev) => <option key={ev.id} value={ev.id}>{ev.titulo}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">Nome completo *</label>
        <input name="nome" value={form.nome} onChange={(e) => upd("nome", e.target.value)} required className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" placeholder="Nome do inscrito" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">E-mail *</label>
        <input name="email" type="email" value={form.email} onChange={(e) => upd("email", e.target.value)} required className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" placeholder="email@servidor.com.br" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Telefone</label>
          <input name="telefone" value={form.telefone} onChange={(e) => upd("telefone", e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" placeholder="(69) 9 9999-9999" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Matrícula</label>
          <input name="matricula" value={form.matricula} onChange={(e) => upd("matricula", e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" placeholder="Nº matrícula" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">Secretaria / Órgão</label>
        <input name="secretaria" value={form.secretaria} onChange={(e) => upd("secretaria", e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" placeholder="Ex: SEMED, SEMSA..." />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
        <button type="submit" className="flex-1 cursor-pointer rounded-xl py-3 text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: primaryColor }}>Adicionar</button>
      </div>
    </form>
  );
}
