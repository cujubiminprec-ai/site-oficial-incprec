import { useState, useMemo, useEffect } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { loadAuditLog } from "@/hooks/useAuditLog";
import {
  AuditoriaRegistro,
  AuditoriaAcao,
  AuditoriaModulo,
} from "@/mocks/auditoria";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `há ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `há ${days}d`;
}

const ACAO_CONFIG: Record<AuditoriaAcao, { label: string; icon: string; color: string; bg: string }> = {
  login:      { label: "Login",       icon: "ri-login-box-line",       color: "#059669", bg: "#f0fdf4" },
  logout:     { label: "Logout",      icon: "ri-logout-box-line",      color: "#6b7280", bg: "#f9fafb" },
  criar:      { label: "Criou",       icon: "ri-add-circle-line",      color: "#2563eb", bg: "#eff6ff" },
  editar:     { label: "Editou",      icon: "ri-edit-line",            color: "#d97706", bg: "#fffbeb" },
  excluir:    { label: "Excluiu",     icon: "ri-delete-bin-line",      color: "#dc2626", bg: "#fef2f2" },
  ativar:     { label: "Ativou",      icon: "ri-toggle-line",          color: "#059669", bg: "#f0fdf4" },
  desativar:  { label: "Desativou",   icon: "ri-toggle-fill",          color: "#9ca3af", bg: "#f9fafb" },
  publicar:   { label: "Publicou",    icon: "ri-send-plane-line",      color: "#7c3aed", bg: "#f5f3ff" },
  arquivar:   { label: "Arquivou",    icon: "ri-archive-line",         color: "#78716c", bg: "#fafaf9" },
  exportar:   { label: "Exportou",    icon: "ri-download-line",        color: "#0891b2", bg: "#ecfeff" },
  upload:     { label: "Upload",      icon: "ri-upload-2-line",        color: "#7c3aed", bg: "#f5f3ff" },
  configurar: { label: "Configurou",  icon: "ri-settings-3-line",      color: "#b45309", bg: "#fef3c7" },
  restaurar:  { label: "Restaurou",   icon: "ri-refresh-line",         color: "#0891b2", bg: "#ecfeff" },
};

// ── Row ───────────────────────────────────────────────────────────────────────
function AuditoriaRow({ registro }: { registro: AuditoriaRegistro }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = ACAO_CONFIG[registro.acao];

  return (
    <div
      className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors cursor-pointer"
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Ícone de ação */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: cfg.bg }}
        >
          <i className={`${cfg.icon} text-sm`} style={{ color: cfg.color }}></i>
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </span>
            <span className="text-xs font-semibold text-gray-800 truncate">{registro.descricao}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] text-gray-400 font-medium">{registro.usuarioNome}</span>
            <span className="text-[10px] text-gray-300">·</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
              style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
            >
              {registro.modulo}
            </span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
          <span className="text-[10px] text-gray-400">{formatRelative(registro.timestamp)}</span>
          <span className="text-[9px] text-gray-300">{formatDate(registro.timestamp)}</span>
        </div>

        <i
          className={`ri-arrow-down-s-line text-gray-300 text-sm flex-shrink-0 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        ></i>
      </div>

      {/* Detalhes expandidos */}
      {expanded && (
        <div className="px-4 pb-3 pt-1 border-t border-gray-50 bg-gray-50/60">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Usuário</p>
              <p className="text-xs font-semibold text-gray-700">{registro.usuarioNome}</p>
              <p className="text-[10px] text-gray-400">{registro.usuarioEmail}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Data / Hora</p>
              <p className="text-xs font-semibold text-gray-700">{formatDate(registro.timestamp)}</p>
              <p className="text-[10px] text-gray-400">{formatTime(registro.timestamp)}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Módulo</p>
              <p className="text-xs font-semibold text-gray-700">{registro.modulo}</p>
              <p className="text-[10px] text-gray-400">{registro.acao}</p>
            </div>
            {registro.detalhes && (
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Detalhes</p>
                <p className="text-xs text-gray-600 leading-relaxed">{registro.detalhes}</p>
              </div>
            )}
          </div>
          <p className="text-[9px] text-gray-300 mt-2 font-mono">ID: {registro.id}</p>
        </div>
      )}
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────────────────────
export default function AuditoriaTab() {
  const { config } = useSiteConfig();
  const { usuarios, isSuperAdmin } = useAdminAuth();
  const [registros, setRegistros] = useState<AuditoriaRegistro[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroAcao, setFiltroAcao] = useState<AuditoriaAcao | "">("");
  const [filtroModulo, setFiltroModulo] = useState<AuditoriaModulo | "">("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 20;

  useEffect(() => {
    setRegistros(loadAuditLog());
  }, []);

  const acoes = Object.keys(ACAO_CONFIG) as AuditoriaAcao[];
  const modulos: AuditoriaModulo[] = [
    "Autenticação", "Notícias", "Serviços", "Slides", "Gestores", "Eventos",
    "Cursos", "Transparência", "FAQ", "Finanças", "Menus", "Banner",
    "Aparência", "Configurações", "Usuários", "Painel", "Eleição", "Votação",
    "Botões", "Páginas",
  ];

  const filtrados = useMemo(() => {
    let list = [...registros];
    if (busca.trim()) {
      const q = busca.toLowerCase();
      list = list.filter(
        (r) =>
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
    if (filtroData) {
      list = list.filter((r) => r.timestamp.slice(0, 10) === filtroData);
    }
    return list;
  }, [registros, busca, filtroAcao, filtroModulo, filtroUsuario, filtroData]);

  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const paginados = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const limparFiltros = () => {
    setBusca("");
    setFiltroAcao("");
    setFiltroModulo("");
    setFiltroUsuario("");
    setFiltroData("");
    setPagina(1);
  };

  // Stats rápidos
  const hoje = new Date().toISOString().slice(0, 10);
  const registrosHoje = registros.filter((r) => r.timestamp.slice(0, 10) === hoje).length;
  const usuariosAtivos = new Set(
    registros.filter((r) => r.timestamp.slice(0, 10) === hoje).map((r) => r.usuarioId)
  ).size;

  // Exportar CSV
  const exportarCSV = () => {
    const header = ["ID", "Data", "Hora", "Usuário", "E-mail", "Ação", "Módulo", "Descrição", "Detalhes"];
    const rows = filtrados.map((r) => [
      r.id,
      formatDate(r.timestamp),
      formatTime(r.timestamp),
      r.usuarioNome,
      r.usuarioEmail,
      r.acao,
      r.modulo,
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

  // Limpar log (só superadmin)
  const limparLog = () => {
    if (!confirm("Apagar todo o histórico de auditoria? Esta ação não pode ser desfeita.")) return;
    localStorage.removeItem("inprec_auditoria_log");
    setRegistros([]);
  };

  const temFiltroAtivo = !!(busca || filtroAcao || filtroModulo || filtroUsuario || filtroData);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Registro de Atividades
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Histórico completo de ações realizadas no painel — quem fez, o quê e quando.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isSuperAdmin() && (
            <button
              onClick={limparLog}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border border-red-100 text-red-500 hover:bg-red-50 cursor-pointer whitespace-nowrap"
            >
              <i className="ri-delete-bin-line text-xs"></i> Limpar
            </button>
          )}
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: config.primaryColor }}
          >
            <i className="ri-download-line text-sm"></i> Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Registros", value: registros.length, icon: "ri-history-line", color: config.primaryColor },
          { label: "Hoje", value: registrosHoje, icon: "ri-calendar-check-line", color: "#059669" },
          { label: "Usuários Ativos Hoje", value: usuariosAtivos, icon: "ri-user-line", color: "#7c3aed" },
          { label: "Resultados Filtrados", value: filtrados.length, icon: "ri-filter-3-line", color: "#d97706" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ backgroundColor: `${s.color}15` }}
            >
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {s.value}
              </p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <i className="ri-filter-3-line text-gray-400 text-sm"></i>
          <p className="text-xs font-bold text-gray-700">Filtros e Busca</p>
          {temFiltroAtivo && (
            <button
              onClick={limparFiltros}
              className="ml-auto text-xs font-semibold cursor-pointer hover:opacity-80"
              style={{ color: config.primaryColor }}
            >
              Limpar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Busca livre */}
          <div className="lg:col-span-2 relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
            <input
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
              placeholder="Buscar por usuário, ação, módulo..."
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"
            />
          </div>
          {/* Filtro ação */}
          <select
            value={filtroAcao}
            onChange={(e) => { setFiltroAcao(e.target.value as AuditoriaAcao | ""); setPagina(1); }}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
          >
            <option value="">Todas as ações</option>
            {acoes.map((a) => (
              <option key={a} value={a}>{ACAO_CONFIG[a].label}</option>
            ))}
          </select>
          {/* Filtro módulo */}
          <select
            value={filtroModulo}
            onChange={(e) => { setFiltroModulo(e.target.value as AuditoriaModulo | ""); setPagina(1); }}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
          >
            <option value="">Todos os módulos</option>
            {modulos.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {/* Filtro data */}
          <input
            type="date"
            value={filtroData}
            onChange={(e) => { setFiltroData(e.target.value); setPagina(1); }}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
          />
        </div>
        {/* Filtro usuário (linha separada) */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => { setFiltroUsuario(""); setPagina(1); }}
            className="text-[11px] px-3 py-1.5 rounded-full font-semibold cursor-pointer transition-all whitespace-nowrap border"
            style={
              filtroUsuario === ""
                ? { backgroundColor: config.primaryColor, color: "white", borderColor: config.primaryColor }
                : { backgroundColor: "white", color: "#6b7280", borderColor: "#e5e7eb" }
            }
          >
            Todos os usuários
          </button>
          {usuarios.map((u) => (
            <button
              key={u.id}
              onClick={() => { setFiltroUsuario(u.id); setPagina(1); }}
              className="text-[11px] px-3 py-1.5 rounded-full font-semibold cursor-pointer transition-all whitespace-nowrap border"
              style={
                filtroUsuario === u.id
                  ? { backgroundColor: config.primaryColor, color: "white", borderColor: config.primaryColor }
                  : { backgroundColor: "white", color: "#6b7280", borderColor: "#e5e7eb" }
              }
            >
              {u.nome.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {paginados.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {paginados.map((r) => (
            <AuditoriaRow key={r.id} registro={r} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <div
            className="w-14 h-14 flex items-center justify-center rounded-2xl mx-auto mb-4"
            style={{ backgroundColor: `${config.primaryColor}10` }}
          >
            <i className="ri-history-line text-2xl" style={{ color: config.primaryColor }}></i>
          </div>
          <p className="text-sm font-semibold text-gray-700">Nenhum registro encontrado</p>
          <p className="text-xs text-gray-400 mt-1">Tente ajustar os filtros ou realizar mais ações no painel.</p>
          {temFiltroAtivo && (
            <button
              onClick={limparFiltros}
              className="mt-4 text-sm font-semibold cursor-pointer hover:opacity-80"
              style={{ color: config.primaryColor }}
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3">
          <p className="text-xs text-gray-400">
            Mostrando {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, filtrados.length)} de {filtrados.length} registros
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 cursor-pointer disabled:opacity-30"
            >
              <i className="ri-arrow-left-s-line text-sm"></i>
            </button>
            {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
              const p = pagina <= 3 ? i + 1 : pagina - 2 + i;
              if (p < 1 || p > totalPaginas) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPagina(p)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold cursor-pointer transition-all"
                  style={
                    p === pagina
                      ? { backgroundColor: config.primaryColor, color: "white" }
                      : { color: "#6b7280" }
                  }
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 cursor-pointer disabled:opacity-30"
            >
              <i className="ri-arrow-right-s-line text-sm"></i>
            </button>
          </div>
        </div>
      )}

      {/* Info exportação */}
      <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
        <i className="ri-information-line text-amber-500 text-base flex-shrink-0 mt-0.5"></i>
        <div>
          <p className="text-xs font-semibold text-amber-800">Sobre a Exportação</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            O botão <strong>Exportar CSV</strong> baixa os registros atualmente filtrados em formato planilha (compatível com Excel e LibreOffice). Os registros podem ser persistidos no SQLite do backend e migrados para MySQL futuramente.
          </p>
        </div>
      </div>
    </div>
  );
}
