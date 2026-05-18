import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { authService, LoginResponse } from "@/services/auth.service";
import { ApiError } from "@/services/api";
import { appendAuditEntry } from "@/hooks/useAuditLog";
import {
  MODULOS_DISPONIVEIS,
  type NivelAcesso,
  type PermissaoModulo,
  type UsuarioAdmin as UsuarioAdminBase,
} from "@/mocks/usuarios-admin";

export type { NivelAcesso, PermissaoModulo };

export interface UsuarioAdmin extends UsuarioAdminBase {
  cargo?: string;
  dataCriacao?: string;
}

interface AdminAuthContextValue {
  usuarioLogado: UsuarioAdmin | null;
  usuarios: UsuarioAdmin[];
  login: (email: string, senha: string) => Promise<{ ok: boolean; erro?: string }>;
  logout: () => void;
  temPermissao: (modulo: PermissaoModulo) => boolean;
  isSuperAdmin: () => boolean;
  salvarUsuarios: (lista: UsuarioAdmin[]) => void;
  carregando: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const STORAGE_SESSION = "inprec_admin_session";

function mapApiUser(apiUser: LoginResponse["usuario"]): UsuarioAdmin {
  const nivel = ["superadmin", "admin", "operador"].includes(apiUser.nivelAcesso)
    ? apiUser.nivelAcesso as NivelAcesso
    : "operador";
  const hoje = new Date().toISOString().slice(0, 10);

  return {
    id: apiUser.id,
    nome: apiUser.nome,
    email: apiUser.email,
    avatar: apiUser.avatar,
    senha: "",
    criadoEm: hoje,
    dataCriacao: `${hoje}T00:00:00.000Z`,
    descricao: nivel === "superadmin" ? "Superadministrador do sistema" : "Usuario administrativo",
    cargo: nivel === "superadmin" ? "Super Administrador" : nivel === "admin" ? "Administrador" : "Operador",
    nivelAcesso: nivel,
    permissoes: apiUser.permissoes as PermissaoModulo[],
    ativo: true,
  };
}

// Credenciais mock para preview/demo (quando o backend não está rodando)
const MOCK_CREDENTIALS = [
  { email: "admin@inprec.net", senha: "inprec@2026" },
];

const MOCK_ADMIN: UsuarioAdmin = {
  id: "mock-admin-001",
  nome: "Administrador Geral",
  email: "admin@inprec.net",
  senha: "inprec@2026",
  avatar: "",
  cargo: "Super Administrador",
  nivelAcesso: "superadmin",
  permissoes: MODULOS_DISPONIVEIS.map((m) => m.key),
  ativo: true,
  ultimoAcesso: new Date().toISOString(),
  criadoEm: "2026-01-01",
  dataCriacao: "2026-01-01T00:00:00.000Z",
  descricao: "Superadministrador com acesso total ao sistema",
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioAdmin | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Verifica sessão ao iniciar
  useEffect(() => {
    const verificarSessao = async () => {
      try {
        // Verifica sessão mock primeiro
        const session = localStorage.getItem(STORAGE_SESSION);
        if (session) {
          const parsed = JSON.parse(session) as { id: string; mock?: boolean };
          if (parsed.mock) {
            setUsuarioLogado(MOCK_ADMIN);
            setCarregando(false);
            return;
          }
        }
        if (authService.isAuthenticated()) {
          const apiUser = await authService.me();
          const user = mapApiUser(apiUser);
          setUsuarioLogado(user);
          localStorage.setItem(STORAGE_SESSION, JSON.stringify({ id: user.id }));
        }
      } catch {
        // Token inválido, limpa
        localStorage.removeItem("inprec_api_token");
        localStorage.removeItem("inprec_api_refresh_token");
        localStorage.removeItem(STORAGE_SESSION);
      } finally {
        setCarregando(false);
      }
    };
    verificarSessao();
  }, []);

  const login = useCallback(async (email: string, senha: string): Promise<{ ok: boolean; erro?: string }> => {
    try {
      const data = await authService.login({ email, senha });
      const user = mapApiUser(data.usuario);
      setUsuarioLogado(user);
      localStorage.setItem(STORAGE_SESSION, JSON.stringify({ id: user.id }));
      appendAuditEntry(user.id, user.nome, user.email, "login", "Autenticação", "Realizou login no painel", "Sessão iniciada com sucesso");
      return { ok: true };
    } catch (err) {
      // Fallback mock: quando o backend não está disponível (ex: preview/demo)
      const isFetchError =
        err instanceof TypeError &&
        (err.message === "Failed to fetch" || err.message.includes("fetch"));
      const isApiUnavailable =
        err instanceof ApiError &&
        [404, 502, 503, 504].includes(err.status);

      if (isFetchError || isApiUnavailable) {
        const credOk = MOCK_CREDENTIALS.some(
          (c) => c.email === email && c.senha === senha
        );
        if (credOk) {
          const user = { ...MOCK_ADMIN, email, ultimoAcesso: new Date().toISOString() };
          setUsuarioLogado(user);
          localStorage.setItem(STORAGE_SESSION, JSON.stringify({ id: user.id, mock: true }));
          appendAuditEntry(user.id, user.nome, user.email, "login", "Autenticação", "Realizou login no painel (modo demo)", "Sessão mock iniciada");
          return { ok: true };
        }
        return { ok: false, erro: "E-mail ou senha incorretos." };
      }

      const message = err instanceof Error ? err.message : "Erro ao fazer login";
      return { ok: false, erro: message };
    }
  }, []);

  const logout = useCallback(() => {
    if (usuarioLogado) {
      appendAuditEntry(usuarioLogado.id, usuarioLogado.nome, usuarioLogado.email, "logout", "Autenticação", "Encerrou sessão", "Logout manual");
    }
    authService.logout();
    localStorage.removeItem(STORAGE_SESSION);
    localStorage.removeItem("inprec_api_token");
    localStorage.removeItem("inprec_api_refresh_token");
    setUsuarioLogado(null);
  }, [usuarioLogado]);

  const temPermissao = useCallback((modulo: PermissaoModulo): boolean => {
    if (!usuarioLogado) return false;
    if (usuarioLogado.nivelAcesso === "superadmin") return true;
    return usuarioLogado.permissoes.includes(modulo);
  }, [usuarioLogado]);

  const isSuperAdmin = useCallback((): boolean => {
    return usuarioLogado?.nivelAcesso === "superadmin";
  }, [usuarioLogado]);

  const salvarUsuarios = useCallback((lista: UsuarioAdmin[]) => {
    setUsuarios(lista);
    if (usuarioLogado) {
      const atualizado = lista.find(u => u.id === usuarioLogado.id);
      if (atualizado) setUsuarioLogado(atualizado);
    }
  }, [usuarioLogado]);

  return (
    <AdminAuthContext.Provider value={{ usuarioLogado, usuarios, login, logout, temPermissao, isSuperAdmin, salvarUsuarios, carregando }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
