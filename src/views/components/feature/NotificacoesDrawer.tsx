import { useState } from "react";
import { useNotificacoes } from "@/contexts/NotificacoesContext";
import { TipoNotificacao, NotificacaoAdmin } from "@/mocks/notificacoes-admin";

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  primaryColor: string;
}

const TIPO_CONFIG: Record<TipoNotificacao, { label: string; icon: string; color: string; bg: string }> = {
  ouvidoria: { label: "Ouvidoria", icon: "ri-speak-line", color: "#7C3AED", bg: "#F5F3FF" },
  lai: { label: "LAI", icon: "ri-file-info-line", color: "#0891B2", bg: "#ECFEFF" },
  contato: { label: "Contato", icon: "ri-mail-line", color: "#059669", bg: "#ECFDF5" },
  pesquisa: { label: "Pesquisa", icon: "ri-survey-line", color: "#D97706", bg: "#FFFBEB" },
  sistema: { label: "Sistema", icon: "ri-settings-3-line", color: "#6B7280", bg: "#F9FAFB" },
};

function formatarData(iso: string): string {
  const d = new Date(iso);
  const agora = new Date();
  const diff = Math.floor((agora.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "agora mesmo";
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  if (diff < 172800) return "ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function NotifCard({ notif, onLer, onRemover, onNavegar }: {
  notif: NotificacaoAdmin;
  onLer: () => void;
  onRemover: () => void;
  onNavegar: () => void;
}) {
  const tipo = TIPO_CONFIG[notif.tipo];
  return (
    <div
      className={`relative flex gap-3 p-3.5 rounded-xl border transition-all cursor-pointer hover:border-gray-200 group ${
        notif.lida ? "bg-white border-gray-100" : "border-l-2 bg-white"
      }`}
      style={!notif.lida ? { borderLeftColor: tipo.color } : {}}
      onClick={() => { onLer(); onNavegar(); }}
    >
      {/* Ícone tipo */}
      <div
        className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 mt-0.5"
        style={{ backgroundColor: tipo.bg }}
      >
        <i className={`${tipo.icon} text-sm`} style={{ color: tipo.color }}></i>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: tipo.bg, color: tipo.color }}
          >
            {tipo.label}
          </span>
          <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
            {formatarData(notif.data)}
          </span>
        </div>
        <p className={`text-xs font-semibold leading-snug mb-1 ${notif.lida ? "text-gray-600" : "text-gray-900"}`}>
          {notif.titulo}
        </p>
        <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{notif.mensagem}</p>
        {notif.remetente !== "Sistema" && notif.remetente !== "Sistema INPREC" && (
          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <i className="ri-user-line text-[9px]"></i>{notif.remetente}
          </p>
        )}
      </div>

      {/* Ponto não lido */}
      {!notif.lida && (
        <div
          className="absolute top-3.5 right-3 w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: tipo.color }}
        ></div>
      )}

      {/* Botão remover (aparece no hover) */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onRemover(); }}
        className="absolute bottom-3 right-3 w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        title="Remover notificação"
      >
        <i className="ri-close-line text-[9px]"></i>
      </button>
    </div>
  );
}

type FiltroTipo = "todas" | TipoNotificacao;

export default function NotificacoesDrawer({ open, onClose, onNavigate, primaryColor }: Props) {
  const { notificacoes, naoLidas, marcarLida, marcarTodasLidas, remover, limparTodas } = useNotificacoes();
  const [filtro, setFiltro] = useState<FiltroTipo>("todas");
  const [apenasNaoLidas, setApenasNaoLidas] = useState(false);

  const notifFiltradas = notificacoes.filter(n => {
    if (filtro !== "todas" && n.tipo !== filtro) return false;
    if (apenasNaoLidas && n.lida) return false;
    return true;
  });

  const filtros: { key: FiltroTipo; label: string; icon: string }[] = [
    { key: "todas", label: "Todas", icon: "ri-notification-3-line" },
    { key: "ouvidoria", label: "Ouvidoria", icon: "ri-speak-line" },
    { key: "lai", label: "LAI", icon: "ri-file-info-line" },
    { key: "contato", label: "Contato", icon: "ri-mail-line" },
    { key: "pesquisa", label: "Pesquisa", icon: "ri-survey-line" },
  ];

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 flex flex-col"
        style={{ boxShadow: "-4px 0 24px rgba(0,0,0,0.10)" }}>

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl relative"
              style={{ backgroundColor: `${primaryColor}15` }}>
              <i className="ri-notification-3-line text-sm" style={{ color: primaryColor }}></i>
              {naoLidas > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-white text-[9px] font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {naoLidas > 9 ? "9+" : naoLidas}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Notificações
              </h2>
              <p className="text-[10px] text-gray-400">
                {naoLidas > 0 ? `${naoLidas} não lida${naoLidas > 1 ? "s" : ""}` : "Tudo em dia"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {naoLidas > 0 && (
              <button
                type="button"
                onClick={marcarTodasLidas}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors hover:bg-gray-100"
                style={{ color: primaryColor }}
                title="Marcar todas como lidas"
              >
                <i className="ri-check-double-line text-xs"></i>
                Lidas
              </button>
            )}
            {notificacoes.length > 0 && (
              <button
                type="button"
                onClick={() => { if (confirm("Limpar todas as notificações?")) limparTodas(); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer hover:bg-red-50 text-red-400 transition-colors"
                title="Limpar todas"
              >
                <i className="ri-delete-bin-line text-xs"></i>
                Limpar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer ml-1"
            >
              <i className="ri-close-line text-gray-400 text-sm"></i>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {filtros.map(f => {
              const count = f.key === "todas"
                ? notificacoes.filter(n => !n.lida).length
                : notificacoes.filter(n => n.tipo === f.key && !n.lida).length;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFiltro(f.key)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap cursor-pointer transition-all flex-shrink-0"
                  style={filtro === f.key
                    ? { backgroundColor: primaryColor, color: "white" }
                    : { backgroundColor: "#F3F4F6", color: "#6B7280" }}
                >
                  <i className={`${f.icon} text-[10px]`}></i>
                  {f.label}
                  {count > 0 && (
                    <span
                      className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold"
                      style={filtro === f.key
                        ? { backgroundColor: "rgba(255,255,255,0.3)", color: "white" }
                        : { backgroundColor: primaryColor, color: "white" }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div
            className="mt-2 flex items-center gap-2 cursor-pointer w-fit"
            onClick={() => setApenasNaoLidas(v => !v)}
          >
            <div
              className="w-8 h-4 rounded-full relative transition-all"
              style={{ backgroundColor: apenasNaoLidas ? primaryColor : "#E5E7EB" }}
            >
              <div
                className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                style={{ left: apenasNaoLidas ? "calc(100% - 14px)" : "2px" }}
              ></div>
            </div>
            <span className="text-[10px] text-gray-500 font-medium">Mostrar apenas não lidas</span>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {notifFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="w-14 h-14 flex items-center justify-center rounded-2xl mb-3"
                style={{ backgroundColor: `${primaryColor}10` }}
              >
                <i className="ri-notification-off-line text-2xl" style={{ color: primaryColor }}></i>
              </div>
              <p className="text-sm font-semibold text-gray-700">Nenhuma notificação</p>
              <p className="text-xs text-gray-400 mt-1">
                {apenasNaoLidas ? "Todas as notificações foram lidas." : "Nenhuma mensagem no momento."}
              </p>
            </div>
          ) : (
            notifFiltradas.map(n => (
              <NotifCard
                key={n.id}
                notif={n}
                onLer={() => marcarLida(n.id)}
                onRemover={() => remover(n.id)}
                onNavegar={() => { onNavigate(n.tabDestino); onClose(); }}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifFiltradas.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0">
            <p className="text-[10px] text-gray-400 text-center">
              {notifFiltradas.length} notificação{notifFiltradas.length > 1 ? "ões" : ""} •{" "}
              Clique para ir ao módulo correspondente
            </p>
          </div>
        )}
      </div>
    </>
  );
}
