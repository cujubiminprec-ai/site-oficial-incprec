import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import {
  NotificacaoAdmin,
  TipoNotificacao,
  notificacoesAdminDefault,
} from "@/mocks/notificacoes-admin";
import { notificacoesService } from "@/services/notificacoes.service";

interface NotificacoesContextValue {
  notificacoes: NotificacaoAdmin[];
  naoLidas: number;
  naoLidasPorTipo: (tipo: TipoNotificacao) => number;
  marcarLida: (id: string) => void;
  marcarTodasLidas: () => void;
  remover: (id: string) => void;
  limparTodas: () => void;
  adicionarNotificacao: (n: Omit<NotificacaoAdmin, "id" | "lida" | "data">) => void;
}

const NotificacoesContext = createContext<NotificacoesContextValue | null>(null);

function mapTipo(tipo: string): TipoNotificacao {
  if (tipo === "ouvidoria" || tipo === "lai" || tipo === "contato" || tipo === "pesquisa") return tipo;
  return "sistema";
}

function mapTabDestino(tipo: TipoNotificacao): string {
  if (tipo === "ouvidoria") return "ouvidoria-admin";
  if (tipo === "lai") return "lai-admin";
  if (tipo === "contato") return "contato-admin";
  if (tipo === "pesquisa") return "pesquisa-admin";
  return "dashboard";
}

function normalizeNotificacao(item: any): NotificacaoAdmin {
  const tipo = mapTipo(String(item.tipo || "sistema"));
  return {
    id: String(item.id),
    tipo,
    titulo: String(item.titulo || ""),
    mensagem: String(item.mensagem || ""),
    remetente: "Sistema",
    data: String(item.criado_em || new Date().toISOString()),
    lida: item.lida === true || item.lida === 1,
    tabDestino: mapTabDestino(tipo),
  };
}

export function NotificacoesProvider({ children }: { children: ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<NotificacaoAdmin[]>(notificacoesAdminDefault);

  useEffect(() => {
    let ativo = true;
    notificacoesService.listar()
      .then((lista) => {
        if (ativo) setNotificacoes(lista.map(normalizeNotificacao));
      })
      .catch(() => {
        if (ativo) setNotificacoes(notificacoesAdminDefault);
      });
    return () => { ativo = false; };
  }, []);

  const persist = useCallback((lista: NotificacaoAdmin[]) => {
    setNotificacoes(lista);
  }, []);

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  const naoLidasPorTipo = useCallback(
    (tipo: TipoNotificacao) => notificacoes.filter(n => !n.lida && n.tipo === tipo).length,
    [notificacoes]
  );

  const marcarLida = useCallback(
    (id: string) => {
      notificacoesService.marcarLida(id).catch(() => {});
      persist(notificacoes.map(n => n.id === id ? { ...n, lida: true } : n));
    },
    [notificacoes, persist]
  );

  const marcarTodasLidas = useCallback(
    () => {
      notificacoesService.marcarTodasLidas().catch(() => {});
      persist(notificacoes.map(n => ({ ...n, lida: true })));
    },
    [notificacoes, persist]
  );

  const remover = useCallback(
    (id: string) => {
      notificacoesService.remover(id).catch(() => {});
      persist(notificacoes.filter(n => n.id !== id));
    },
    [notificacoes, persist]
  );

  const limparTodas = useCallback(
    () => {
      notificacoesService.limparTodas().catch(() => {});
      persist([]);
    },
    [persist]
  );

  const adicionarNotificacao = useCallback(
    (n: Omit<NotificacaoAdmin, "id" | "lida" | "data">) => {
      const nova: NotificacaoAdmin = {
        ...n,
        id: `notif-${Date.now()}`,
        lida: false,
        data: new Date().toISOString(),
      };
      persist([nova, ...notificacoes]);
    },
    [notificacoes, persist]
  );

  return (
    <NotificacoesContext.Provider value={{
      notificacoes,
      naoLidas,
      naoLidasPorTipo,
      marcarLida,
      marcarTodasLidas,
      remover,
      limparTodas,
      adicionarNotificacao,
    }}>
      {children}
    </NotificacoesContext.Provider>
  );
}

export function useNotificacoes() {
  const ctx = useContext(NotificacoesContext);
  if (!ctx) throw new Error("useNotificacoes must be used within NotificacoesProvider");
  return ctx;
}
