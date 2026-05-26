import { useEffect, useMemo, useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { auditoriaService } from "@/services/auditoria.service";
import { type AuditoriaRegistro, type AuditoriaAcao } from "@/mocks/auditoria";
import { ApiError } from "@/services/api";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `há ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  return `há ${Math.floor(hrs / 24)}d`;
}

const ACAO_CONFIG: Record<AuditoriaAcao, { label: string; icon: string; color: string; bg: string }> = {
  login: { label: "Login", icon: "ri-login-box-line", color: "#059669", bg: "#f0fdf4" },
  logout: { label: "Logout", icon: "ri-logout-box-line", color: "#6b7280", bg: "#f9fafb" },
  criar: { label: "Criou", icon: "ri-add-circle-line", color: "#2563eb", bg: "#eff6ff" },
  editar: { label: "Editou", icon: "ri-edit-line", color: "#d97706", bg: "#fffbeb" },
  atualizar: { label: "Atualizou", icon: "ri-refresh-line", color: "#d97706", bg: "#fffbeb" },
  responder: { label: "Respondeu", icon: "ri-reply-line", color: "#0891b2", bg: "#ecfeff" },
  excluir: { label: "Excluiu", icon: "ri-delete-bin-line", color: "#dc2626", bg: "#fef2f2" },
  ativar: { label: "Ativou", icon: "ri-toggle-line", color: "#059669", bg: "#f0fdf4" },
  desativar: { label: "Desativou", icon: "ri-toggle-fill", color: "#9ca3af", bg: "#f9fafb" },
  publicar: { label: "Publicou", icon: "ri-send-plane-line", color: "#7c3aed", bg: "#f5f3ff" },
  arquivar: { label: "Arquivou", icon: "ri-archive-line", color: "#78716c", bg: "#fafaf9" },
  exportar: { label: "Exportou", icon: "ri-download-line", color: "#0891b2", bg: "#ecfeff" },
  upload: { label: "Upload", icon: "ri-upload-2-line", color: "#7c3aed", bg: "#f5f3ff" },
  configurar: { label: "Configurou", icon: "ri-settings-3-line", color: "#b45309", bg: "#fef3c7" },
  restaurar: { label: "Restaurou", icon: "ri-refresh-line", color: "#0891b2", bg: "#ecfeff" },
};

const MODULO_LABELS: Record<string, string> = {
  auth: "Autenticação",
  noticias: "Notícias",
  servicos: "Serviços",
  slides: "Slides",
  gestores: "Gestores",
  eventos: "Eventos",
  cursos: "Cursos",
  transparencia: "Transparência",
  faq: "FAQ",
  financas: "Finanças",
  menus: "Menus",
  menu: "Menus",
  banner: "Banner",
  aparencia: "Aparência",
  configuracoes: "Configurações",
  usuarios: "Usuários",
  painel: "Painel",
  eleicao: "Eleição",
  votacao: "Votação",
  botoes: "Botões",
  paginas: "Páginas",
};

function getModuloLabel(modulo: string) {
  return MODULO_LABELS[modulo] || modulo;
}

function AuditoriaRow({ registro }: { registro: AuditoriaRegistro }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = ACAO_CONFIG[registro.acao] || ACAO_CONFIG.editar;

  return (
    <div className="cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white transition-colors hover:border-gray-200" onClick={() => setExpanded((v) => !v)}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: cfg.bg }}>
          <i className={`${cfg.icon} text-sm`} style={{ color: cfg.color }}></i>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
            <span className="truncate text-xs font-semibold text-gray-800">{registro.descricao}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-medium text-gray-400">{registro.usuarioNome}</span>
            <span className="text-[10px] text-gray-300">·</span>
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">{getModuloLabel(registro.modulo)}</span>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-0.5">
          <span className="text-[10px] text-gray-400">{formatRelative(registro.timestamp)}</span>
          <span className="text-[9px] text-gray-300">{formatDate(registro.timestamp)}</span>
        </div>
        <i className={`ri-arrow-down-s-line flex-shrink-0 text-sm text-gray-300 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}></i>
      </div>

      {expanded && (
        <div className="border-t border-gray-50 bg-gray-50/60 px-4 pt-1 pb-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div>
              <p className="mb-0.5 text-[9px] font-bold tracking-wider text-gray-400 uppercase">Usuário</p>
              <p className="text-xs font-semibold text-gray-700">{registro.usuarioNome}</p>
              <p className="text-[10px] text-gray-400">{registro.usuarioEmail}</p>
            </div>
            <div>
              <p className="mb-0.5 text-[9px] font-bold tracking-wider text-gray-400 uppercase">Data / Hora</p>
              <p className="text-xs font-semibold text-gray-700">{formatDate(registro.timestamp)}</p>
              <p className="text-[10px] text-gray-400">{formatTime(registro.timestamp)}</p>
            </div>
            <div>
              <p className="mb-0.5 text-[9px] font-bold tracking-wider text-gray-400 uppercase">Módulo</p>
              <p className="text-xs font-semibold text-gray-700">{getModuloLabel(registro.modulo)}</p>
              <p className="text-[10px] text-gray-400">{registro.acao}</p>
            </div>
            {registro.detalhes && (
              <div>
                <p className="mb-0.5 text-[9px] font-bold tracking-wider text-gray-400 uppercase">Detalhes</p>
                <p className="text-xs leading-relaxed text-gray-600">{registro.detalhes}</p>
              </div>
            )}
          </div>
          <p className="mt-2 font-mono text-[9px] text-gray-300">ID: {registro.id}</p>
        </div>
      )}
    </div>
  );
}

export default function AuditoriaTab() {
  const { config } = useSiteConfig();
  const { usuarios, isSuperAdmin } = useAdminAuth();
  const [registros, setRegistros] = useState<AuditoriaRegistro[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroAcao, setFiltroAcao] = useState<AuditoriaAcao | "">("");
  const [filtroModulo, setFiltroModulo] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [pagina, setPagina] = useState(1);
  const [erro, setErro] = useState("");
  const POR_PAGINA = 20;

  useEffect(() => {
    let ativo = true;
    auditoriaService.listar()
      .then((lista) => {
        if (ativo) {
          setRegistros(lista);
          setErro("");
        }
      })
      .catch((err) => {
        if (!ativo) return;
        setRegistros([]);
        if (err instanceof ApiError && err.status === 404) {
          setErro("A rota /api/auditoria não está disponível no backend atual. Atualize e reinicie o servidor da API.");
          return;
        }
        setErro(err instanceof Error ? err.message : "Erro ao carregar auditoria.");
      });
    return () => {
      ativo = false;
    };
  }, []);

  const acoes = Object.keys(ACAO_CONFIG) as AuditoriaAcao[];
  const modulos = useMemo(() => {
    return Array.from(new Set(registros.map((r) => r.modulo))).sort((a, b) => getModuloLabel(a).localeCompare(getModuloLabel(b)));
  }, [registros]);

  const filtrados = useMemo(() => {
    let list = [...registros];
    if (busca.trim()) {
      const q = busca.toLowerCase();
      list = list.filter((r) =>
        r.usuarioNome.toLowerCase().includes(q) ||
        r.descricao.toLowerCase().includes(q) ||
        r.modulo.toLowerCase().includes(q) ||
        (r.detalhes || "").toLowerCase().includes(q) ||
        r.usuarioEmail.toLowerCase().includes(q)
      );
    }
    if (filtroAcao) list = list.filter((r) => r.acao === filtroAcao);
    if (filtroModulo) list = list.filter((r) => r.modulo === filtroModulo);
    if (filtroUsuario) list = list.filter((r) => r.usuarioId === filtroUsuario);
    if (filtroData) list = list.filter((r) => r.timestamp.slice(0, 10) === filtroData);
    return list;
  }, [registros, busca, filtroAcao, filtroModulo, filtroUsuario, filtroData]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginados = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const limparFiltros = () => {
    setBusca("");
    setFiltroAcao("");
    setFiltroModulo("");
    setFiltroUsuario("");
    setFiltroData("");
    setPagina(1);
  };

  const hoje = new Date().toISOString().slice(0, 10);
  const registrosHoje = registros.filter((r) => r.timestamp.slice(0, 10) === hoje).length;
  const usuariosAtivos = new Set(registros.filter((r) => r.timestamp.slice(0, 10) === hoje).map((r) => r.usuarioId)).size;

  const exportarCSV = () => {
    const header = ["ID", "Data", "Hora", "Usuário", "E-mail", "Ação", "Módulo", "Descrição", "Detalhes"];
    const rows = filtrados.map((r) => [
      r.id,
      formatDate(r.timestamp),
      formatTime(r.timestamp),
      r.usuarioNome,
      r.usuarioEmail,
      r.acao,
      getModuloLabel(r.modulo),
      `"${r.descricao.replace(/"/g, "'")}"`,
      `"${(r.detalhes || "").replace(/"/g, "'")}"`,
    ]);
    const csv = [header, ...rows].map((row) => row.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditoria-inprec-${hoje}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const limparLog = async () => {
    if (!confirm("Apagar todo o histórico de auditoria? Esta ação não pode ser desfeita.")) return;
    await auditoriaService.limpar();
    setRegistros([]);
  };

  const temFiltroAtivo = !!(busca || filtroAcao || filtroModulo || filtroUsuario || filtroData);

  return (
    <div>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Registro de Atividades</h1>
          <p className="mt-1 text-sm text-gray-400">Histórico completo de ações realizadas no painel — quem fez, o quê e quando.</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {isSuperAdmin() && (
            <button onClick={() => void limparLog()} className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-100 px-3 py-2.5 text-xs font-semibold whitespace-nowrap text-red-500 hover:bg-red-50">
              <i className="ri-delete-bin-line text-xs"></i> Limpar
            </button>
          )}
          <button onClick={exportarCSV} className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white hover:opacity-90" style={{ backgroundColor: config.primaryColor }}>
            <i className="ri-download-line text-sm"></i> Exportar CSV
          </button>
        </div>
      </div>

      {erro && <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</div>}

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total Registros", value: registros.length, icon: "ri-history-line", color: config.primaryColor },
          { label: "Hoje", value: registrosHoje, icon: "ri-calendar-check-line", color: "#059669" },
          { label: "Usuários Ativos Hoje", value: usuariosAtivos, icon: "ri-user-line", color: "#7c3aed" },
          { label: "Resultados Filtrados", value: filtrados.length, icon: "ri-filter-3-line", color: "#d97706" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.value}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <i className="ri-filter-3-line text-sm text-gray-400"></i>
          <p className="text-xs font-bold text-gray-700">Filtros e Busca</p>
          {temFiltroAtivo && (
            <button onClick={limparFiltros} className="ml-auto cursor-pointer text-xs font-semibold hover:opacity-80" style={{ color: config.primaryColor }}>
              Limpar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <i className="ri-search-line absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-300"></i>
            <input value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1); }} placeholder="Buscar por usuário, ação, módulo..." className="w-full rounded-xl border border-gray-200 py-2.5 pr-3 pl-9 text-sm focus:outline-none" />
          </div>
          <select value={filtroAcao} onChange={(e) => { setFiltroAcao(e.target.value as AuditoriaAcao | ""); setPagina(1); }} className="cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none">
            <option value="">Todas as ações</option>
            {acoes.map((a) => <option key={a} value={a}>{ACAO_CONFIG[a].label}</option>)}
          </select>
          <select value={filtroModulo} onChange={(e) => { setFiltroModulo(e.target.value); setPagina(1); }} className="cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none">
            <option value="">Todos os módulos</option>
            {modulos.map((m) => <option key={m} value={m}>{getModuloLabel(m)}</option>)}
          </select>
          <input type="date" value={filtroData} onChange={(e) => { setFiltroData(e.target.value); setPagina(1); }} className="cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => { setFiltroUsuario(""); setPagina(1); }}
            className="cursor-pointer rounded-full border px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-all"
            style={filtroUsuario === "" ? { backgroundColor: config.primaryColor, color: "white", borderColor: config.primaryColor } : { backgroundColor: "white", color: "#6b7280", borderColor: "#e5e7eb" }}
          >
            Todos os usuários
          </button>
          {usuarios.map((u) => (
            <button
              key={u.id}
              onClick={() => { setFiltroUsuario(u.id); setPagina(1); }}
              className="cursor-pointer rounded-full border px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-all"
              style={filtroUsuario === u.id ? { backgroundColor: config.primaryColor, color: "white", borderColor: config.primaryColor } : { backgroundColor: "white", color: "#6b7280", borderColor: "#e5e7eb" }}
            >
              {u.nome.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {paginados.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {paginados.map((r) => <AuditoriaRow key={r.id} registro={r} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${config.primaryColor}10` }}>
            <i className="ri-history-line text-2xl" style={{ color: config.primaryColor }}></i>
          </div>
          <p className="text-sm font-semibold text-gray-700">Nenhum registro encontrado</p>
          <p className="mt-1 text-xs text-gray-400">Tente ajustar os filtros ou realizar mais ações no painel.</p>
          {temFiltroAtivo && <button onClick={limparFiltros} className="mt-4 cursor-pointer text-sm font-semibold hover:opacity-80" style={{ color: config.primaryColor }}>Limpar filtros</button>}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="mt-4 flex items-center justify-between pt-3">
          <p className="text-xs text-gray-400">Mostrando {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, filtrados.length)} de {filtrados.length} registros</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30">
              <i className="ri-arrow-left-s-line text-sm"></i>
            </button>
            {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
              const p = pagina <= 3 ? i + 1 : pagina - 2 + i;
              if (p < 1 || p > totalPaginas) return null;
              return (
                <button key={p} onClick={() => setPagina(p)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xs font-semibold transition-all" style={p === pagina ? { backgroundColor: config.primaryColor, color: "white" } : { color: "#6b7280" }}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30">
              <i className="ri-arrow-right-s-line text-sm"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
