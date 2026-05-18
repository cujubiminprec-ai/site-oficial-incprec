import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  NotificacaoAdmin,
  TipoNotificacao,
  notificacoesAdminDefault,
} from "@/mocks/notificacoes-admin";

const STORAGE_KEY = "inprec_notificacoes_admin";

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

function carregar(): NotificacaoAdmin[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : notificacoesAdminDefault;
  } catch {
    return notificacoesAdminDefault;
  }
}

function salvar(lista: NotificacaoAdmin[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function NotificacoesProvider({ children }: { children: ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<NotificacaoAdmin[]>(carregar);

  const persist = useCallback((lista: NotificacaoAdmin[]) => {
    setNotificacoes(lista);
    salvar(lista);
  }, []);

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  const naoLidasPorTipo = useCallback(
    (tipo: TipoNotificacao) => notificacoes.filter(n => !n.lida && n.tipo === tipo).length,
    [notificacoes]
  );

  const marcarLida = useCallback(
    (id: string) => persist(notificacoes.map(n => n.id === id ? { ...n, lida: true } : n)),
    [notificacoes, persist]
  );

  const marcarTodasLidas = useCallback(
    () => persist(notificacoes.map(n => ({ ...n, lida: true }))),
    [notificacoes, persist]
  );

  const remover = useCallback(
    (id: string) => persist(notificacoes.filter(n => n.id !== id)),
    [notificacoes, persist]
  );

  const limparTodas = useCallback(
    () => persist([]),
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
