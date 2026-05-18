import { useState, useMemo } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

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

const MOCK_EVENTOS_CADASTROS: EventoCadastro[] = [
  { id: 2, titulo: "Capacitação: Reforma Previdenciária para Servidores", tipo: "Capacitação", data: "2026-05-08", vagas: 50 },
  { id: 4, titulo: "Semana da Previdência – INPREC 2026", tipo: "Evento", data: "2026-06-02", vagas: 500 },
  { id: 6, titulo: "Palestra: Planejamento para Aposentadoria", tipo: "Capacitação", data: "2026-04-18", vagas: 300 },
  { id: 7, titulo: "Curso: Gestão de Benefícios Previdenciários", tipo: "Curso", data: "2026-05-15", vagas: 40 },
  { id: 8, titulo: "Curso: Uso do Portal do Servidor INPREC", tipo: "Curso", data: "2026-05-22", vagas: 60 },
  { id: 9, titulo: "Capacitação: Saúde Financeira para Servidores", tipo: "Capacitação", data: "2026-06-10", vagas: 80 },
];

const MOCK_INSCRITOS: Inscrito[] = [
  { id: "i1", eventoId: 2, eventoTitulo: "Capacitação: Reforma Previdenciária para Servidores", nome: "Maria Aparecida Silva", email: "maria.silva@cujubim.ro.gov.br", telefone: "(69) 9 9845-1122", matricula: "14.521", secretaria: "SEMED", dataInscricao: "2026-04-10", status: "confirmado" },
  { id: "i2", eventoId: 2, eventoTitulo: "Capacitação: Reforma Previdenciária para Servidores", nome: "João Carlos Ferreira", email: "joao.ferreira@cujubim.ro.gov.br", telefone: "(69) 9 9712-3344", matricula: "11.089", secretaria: "SEMSA", dataInscricao: "2026-04-11", status: "confirmado" },
  { id: "i3", eventoId: 2, eventoTitulo: "Capacitação: Reforma Previdenciária para Servidores", nome: "Ana Paula Costa", email: "ana.costa@servidor.com.br", telefone: "(69) 9 9654-7788", matricula: "17.332", secretaria: "SEMSUR", dataInscricao: "2026-04-11", status: "pendente" },
  { id: "i4", eventoId: 2, eventoTitulo: "Capacitação: Reforma Previdenciária para Servidores", nome: "Pedro Henrique Oliveira", email: "pedro.oliveira@cujubim.ro.gov.br", telefone: "(69) 9 9501-9900", matricula: "09.774", secretaria: "SEMFAZ", dataInscricao: "2026-04-12", status: "confirmado" },
  { id: "i5", eventoId: 2, eventoTitulo: "Capacitação: Reforma Previdenciária para Servidores", nome: "Luciana Rodrigues", email: "luciana.rodrigues@gmail.com", telefone: "(69) 9 9367-0011", matricula: "20.155", secretaria: "SEMAGRI", dataInscricao: "2026-04-13", status: "cancelado" },
  { id: "i6", eventoId: 4, eventoTitulo: "Semana da Previdência – INPREC 2026", nome: "Carlos Alberto Mendes", email: "carlos.mendes@cujubim.ro.gov.br", telefone: "(69) 9 9241-5566", matricula: "06.331", secretaria: "SEMOB", dataInscricao: "2026-04-08", status: "confirmado" },
  { id: "i7", eventoId: 4, eventoTitulo: "Semana da Previdência – INPREC 2026", nome: "Fernanda Lima Santos", email: "fernanda.lima@cujubim.ro.gov.br", telefone: "(69) 9 9188-2233", matricula: "13.667", secretaria: "SEMED", dataInscricao: "2026-04-09", status: "confirmado" },
  { id: "i8", eventoId: 6, eventoTitulo: "Palestra: Planejamento para Aposentadoria", nome: "Roberto Alves Nascimento", email: "roberto.nascimento@servidor.ro.gov.br", telefone: "(69) 9 9045-4477", matricula: "08.222", secretaria: "SEMSA", dataInscricao: "2026-03-28", status: "confirmado" },
  { id: "i9", eventoId: 6, eventoTitulo: "Palestra: Planejamento para Aposentadoria", nome: "Simone Martins Oliveira", email: "simone.martins@cujubim.ro.gov.br", telefone: "(69) 9 9922-8899", matricula: "15.443", secretaria: "SEMFAZ", dataInscricao: "2026-03-29", status: "confirmado" },
  { id: "i10", eventoId: 7, eventoTitulo: "Curso: Gestão de Benefícios Previdenciários", nome: "Marcos Vinicius Torres", email: "marcos.torres@cujubim.ro.gov.br", telefone: "(69) 9 9800-3322", matricula: "12.998", secretaria: "INPREC", dataInscricao: "2026-04-14", status: "pendente" },
  { id: "i11", eventoId: 7, eventoTitulo: "Curso: Gestão de Benefícios Previdenciários", nome: "Juliana Freitas Costa", email: "juliana.freitas@cujubim.ro.gov.br", telefone: "(69) 9 9777-6655", matricula: "18.765", secretaria: "SEMED", dataInscricao: "2026-04-14", status: "confirmado" },
  { id: "i12", eventoId: 8, eventoTitulo: "Curso: Uso do Portal do Servidor INPREC", nome: "Andréa Souza Bezerra", email: "andrea.bezerra@cujubim.ro.gov.br", telefone: "(69) 9 9633-1100", matricula: "22.001", secretaria: "SEMOB", dataInscricao: "2026-04-15", status: "confirmado" },
];

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR");
}

const STATUS_COLORS: Record<string, string> = {
  confirmado: "bg-green-50 text-green-700",
  pendente: "bg-amber-50 text-amber-700",
  cancelado: "bg-red-50 text-red-500",
};

function exportToCSV(inscritos: Inscrito[], titulo: string) {
  const header = ["Nome", "E-mail", "Telefone", "Matrícula", "Secretaria", "Data Inscrição", "Status"];
  const rows = inscritos.map(i => [i.nome, i.email, i.telefone, i.matricula, i.secretaria, formatDate(i.dataInscricao), i.status]);
  const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
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
  const rows = inscritos.map(i => [i.nome, i.email, i.matricula, i.secretaria, presenca[i.id] ? "Presente" : "Ausente"]);
  const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `presenca_${titulo.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function EventosInscritosTab() {
  const { config } = useSiteConfig();
  const [tabView, setTabView] = useState<TabView>("inscritos");

  const [inscritos, setInscritos] = useState<Inscrito[]>(() => {
    try { const s = localStorage.getItem("inprec_inscritos_eventos"); return s ? JSON.parse(s) : MOCK_INSCRITOS; } catch { return MOCK_INSCRITOS; }
  });
  const [presenca, setPresenca] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem("inprec_presenca_eventos"); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });

  const [eventoSelecionado, setEventoSelecionado] = useState<number | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<"todos" | "confirmado" | "pendente" | "cancelado">("todos");
  const [detalheInscrito, setDetalheInscrito] = useState<Inscrito | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const persist = (data: Inscrito[]) => {
    setInscritos(data);
    localStorage.setItem("inprec_inscritos_eventos", JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const togglePresenca = (id: string) => {
    const updated = { ...presenca, [id]: !presenca[id] };
    setPresenca(updated);
    localStorage.setItem("inprec_presenca_eventos", JSON.stringify(updated));
  };

  const inscritosFiltrados = useMemo(() => {
    return inscritos.filter(i => {
      const eventoOk = eventoSelecionado === "todos" || i.eventoId === eventoSelecionado;
      const statusOk = statusFiltro === "todos" || i.status === statusFiltro;
      const buscaOk = !busca || i.nome.toLowerCase().includes(busca.toLowerCase()) ||
        i.email.toLowerCase().includes(busca.toLowerCase()) ||
        i.matricula.includes(busca) || i.secretaria.toLowerCase().includes(busca.toLowerCase());
      return eventoOk && statusOk && buscaOk;
    });
  }, [inscritos, eventoSelecionado, statusFiltro, busca]);

  const eventoAtual = MOCK_EVENTOS_CADASTROS.find(e => e.id === eventoSelecionado);

  const updateStatus = (id: string, status: Inscrito["status"]) => persist(inscritos.map(i => i.id === id ? { ...i, status } : i));
  const deleteInscrito = (id: string) => { if (!confirm("Remover este inscrito?")) return; persist(inscritos.filter(i => i.id !== id)); };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Inscritos em Eventos</h1>
          <p className="text-sm text-gray-400 mt-1">Gerencie os inscritos em cursos, capacitações e eventos do INPREC.</p>
        </div>
        <div className="flex items-center gap-2">
          {tabView === "inscritos" && (
            <>
              <button onClick={() => exportToCSV(inscritosFiltrados, eventoAtual?.titulo || "todos")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50 whitespace-nowrap">
                <i className="ri-download-2-line text-sm"></i> Exportar CSV
              </button>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90"
                style={{ backgroundColor: config.primaryColor }}>
                <i className="ri-add-line"></i> Adicionar Inscrito
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {([
          { key: "inscritos" as TabView, label: "Lista de Inscritos", icon: "ri-team-line" },
          { key: "presenca" as TabView, label: "Relatório de Presença", icon: "ri-checkbox-circle-line" },
        ]).map(t => (
          <button key={t.key} onClick={() => setTabView(t.key)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
            style={tabView === t.key ? { backgroundColor: config.primaryColor, color: "white" } : { color: "#6B7280" }}>
            <i className={`${t.icon} text-xs`}></i>{t.label}
          </button>
        ))}
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Alterações salvas!
        </div>
      )}

      {/* ── ABA INSCRITOS ── */}
      {tabView === "inscritos" && (
        <div>
          {/* Cards resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {MOCK_EVENTOS_CADASTROS.map(ev => {
              const count = inscritos.filter(i => i.eventoId === ev.id).length;
              const confirmados = inscritos.filter(i => i.eventoId === ev.id && i.status === "confirmado").length;
              const isSelected = eventoSelecionado === ev.id;
              return (
                <button key={ev.id} onClick={() => setEventoSelecionado(isSelected ? "todos" : ev.id)}
                  className="text-left p-4 rounded-2xl border-2 cursor-pointer transition-all"
                  style={isSelected ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}06` } : { borderColor: "#F3F4F6", backgroundColor: "white" }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}>{ev.tipo}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{formatDate(ev.data)}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-3">{ev.titulo}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-400">Inscrições</span>
                        <span className="text-xs font-bold text-gray-700">{count}{ev.vagas ? `/${ev.vagas}` : ""}</span>
                      </div>
                      {ev.vagas && (
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex-1 relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por nome, e-mail, matrícula..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["todos", "confirmado", "pendente", "cancelado"] as const).map(s => (
                <button key={s} onClick={() => setStatusFiltro(s)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap capitalize"
                  style={statusFiltro === s ? { backgroundColor: config.primaryColor, color: "white", borderColor: config.primaryColor } : { borderColor: "#E5E7EB", color: "#6B7280" }}>
                  {s === "todos" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            {eventoSelecionado !== "todos" && (
              <button onClick={() => setEventoSelecionado("todos")}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-500 cursor-pointer hover:bg-gray-50 whitespace-nowrap">
                <i className="ri-close-line text-xs"></i> Limpar filtro
              </button>
            )}
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                {inscritosFiltrados.length} {inscritosFiltrados.length === 1 ? "inscrito" : "inscritos"}
                {eventoSelecionado !== "todos" && eventoAtual ? ` — ${eventoAtual.titulo}` : " (todos os eventos)"}
              </span>
            </div>
            {inscritosFiltrados.length === 0 ? (
              <div className="py-16 text-center">
                <i className="ri-user-search-line text-4xl text-gray-200"></i>
                <p className="text-gray-400 text-sm mt-3">Nenhum inscrito encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="text-left bg-gray-50">
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Contato</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Matrícula / Secretaria</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Evento</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Inscrição</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inscritosFiltrados.map((inscrito, idx) => (
                      <tr key={inscrito.id} className={`border-t border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}>
                        <td className="px-4 py-3"><p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{inscrito.nome}</p></td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">{inscrito.email}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{inscrito.telefone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-mono text-gray-700">{inscrito.matricula || "—"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{inscrito.secretaria || "—"}</p>
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <p className="text-xs text-gray-600 line-clamp-2 leading-snug">{inscrito.eventoTitulo}</p>
                        </td>
                        <td className="px-4 py-3"><p className="text-xs text-gray-500 whitespace-nowrap">{formatDate(inscrito.dataInscricao)}</p></td>
                        <td className="px-4 py-3">
                          <select value={inscrito.status} onChange={e => updateStatus(inscrito.id, e.target.value as Inscrito["status"])}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[inscrito.status]}`}>
                            <option value="confirmado">Confirmado</option>
                            <option value="pendente">Pendente</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setDetalheInscrito(inscrito)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer" title="Ver detalhes">
                              <i className="ri-eye-line text-xs"></i>
                            </button>
                            <button onClick={() => deleteInscrito(inscrito.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer">
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

      {/* ── ABA PRESENÇA ── */}
      {tabView === "presenca" && (
        <div className="flex flex-col gap-6">
          {MOCK_EVENTOS_CADASTROS.map(ev => {
            const lista = inscritos.filter(i => i.eventoId === ev.id && i.status !== "cancelado");
            if (lista.length === 0) return null;
            const presentes = lista.filter(i => presenca[i.id]).length;
            const pct = lista.length > 0 ? Math.round((presentes / lista.length) * 100) : 0;
            return (
              <div key={ev.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mr-2"
                      style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}>{ev.tipo}</span>
                    <span className="text-sm font-bold text-gray-900">{ev.titulo}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(ev.data)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{presentes}/{lista.length}</p>
                      <p className="text-xs text-gray-400">presentes ({pct}%)</p>
                    </div>
                    <button onClick={() => exportPresencaCSV(lista, presenca, ev.titulo)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50 whitespace-nowrap">
                      <i className="ri-download-2-line text-xs"></i> Exportar CSV
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {lista.map(inscrito => (
                    <div key={inscrito.id}
                      className={`flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${presenca[inscrito.id] ? "bg-green-50/40" : ""}`}
                      onClick={() => togglePresenca(inscrito.id)}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all ${presenca[inscrito.id] ? "text-white" : "border-2 border-gray-300"}`}
                        style={presenca[inscrito.id] ? { backgroundColor: config.primaryColor } : {}}>
                        {presenca[inscrito.id] && <i className="ri-check-line text-[11px]"></i>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{inscrito.nome}</p>
                        <p className="text-xs text-gray-400">{inscrito.matricula && `Matr. ${inscrito.matricula} · `}{inscrito.secretaria}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${presenca[inscrito.id] ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                        {presenca[inscrito.id] ? "Presente" : "Ausente"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal detalhe */}
      {detalheInscrito && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setDetalheInscrito(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">Detalhes do Inscrito</h3>
              <button onClick={() => setDetalheInscrito(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-400 text-sm"></i>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}15` }}>
                  <i className="ri-user-line text-xl" style={{ color: config.primaryColor }}></i>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{detalheInscrito.nome}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[detalheInscrito.status]}`}>
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
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 flex-shrink-0 mt-0.5">
                    <i className={`${icon} text-sm text-gray-400`}></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-800 leading-snug">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">Adicionar Inscrito</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-400 text-sm"></i>
              </button>
            </div>
            <AddForm primaryColor={config.primaryColor} onClose={() => setShowAddModal(false)}
              onSave={(f) => {
                const ev = MOCK_EVENTOS_CADASTROS.find(e => e.id === f.eventoId);
                persist([...inscritos, { ...f, id: `i${Date.now()}`, eventoTitulo: ev?.titulo || "", status: "confirmado", dataInscricao: new Date().toISOString().slice(0, 10) }]);
                setShowAddModal(false);
              }} />
          </div>
        </div>
      )}
    </div>
  );
}

function AddForm({ primaryColor, onClose, onSave }: { primaryColor: string; onClose: () => void; onSave: (f: { eventoId: number; nome: string; email: string; telefone: string; matricula: string; secretaria: string }) => void }) {
  const [form, setForm] = useState({ eventoId: MOCK_EVENTOS_CADASTROS[0].id, nome: "", email: "", telefone: "", matricula: "", secretaria: "" });
  const upd = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }));
  return (
    <form data-readdy-form onSubmit={async e => { e.preventDefault(); const d = new URLSearchParams(); Object.entries(form).forEach(([k, v]) => d.append(k, String(v))); try { await fetch("https://readdy.ai/api/form/d7f8lm6ivmjfhtdrfrb0", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: d.toString() }); } catch (_) { /* silent */ } onSave(form); }}
      className="p-6 flex flex-col gap-4">
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Evento / Curso *</label>
        <select name="eventoId" value={form.eventoId} onChange={e => upd("eventoId", parseInt(e.target.value))} required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
          {MOCK_EVENTOS_CADASTROS.map(ev => <option key={ev.id} value={ev.id}>{ev.titulo}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome completo *</label>
        <input name="nome" value={form.nome} onChange={e => upd("nome", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="Nome do inscrito" />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail *</label>
        <input name="email" type="email" value={form.email} onChange={e => upd("email", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="email@servidor.com.br" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Telefone</label>
          <input name="telefone" value={form.telefone} onChange={e => upd("telefone", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="(69) 9 9999-9999" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Matrícula</label>
          <input name="matricula" value={form.matricula} onChange={e => upd("matricula", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="Nº matrícula" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Secretaria / Órgão</label>
        <input name="secretaria" value={form.secretaria} onChange={e => upd("secretaria", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="Ex: SEMED, SEMSA..." />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">Cancelar</button>
        <button type="submit" className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90" style={{ backgroundColor: primaryColor }}>Adicionar</button>
      </div>
    </form>
  );
}
