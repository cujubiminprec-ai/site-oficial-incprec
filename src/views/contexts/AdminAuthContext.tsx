import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { authService, LoginResponse } from "@/services/auth.service";
import { usuariosService } from "@/services/usuarios.service";
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
  carregando: boolean;
  recarregarUsuarios: () => Promise<void>;
  criarUsuario: (usuario: UsuarioAdmin) => Promise<void>;
  atualizarUsuario: (usuario: UsuarioAdmin) => Promise<void>;
  removerUsuario: (id: string) => Promise<void>;
  atualizarPerfil: (payload: { nome: string; descricao?: string; avatar?: string }) => Promise<void>;
  alterarSenha: (payload: { senhaAtual: string; novaSenha: string }) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function mapApiUser(apiUser: LoginResponse["usuario"]): UsuarioAdmin {
  const nivel = ["superadmin", "admin", "operador"].includes(apiUser.nivelAcesso)
    ? apiUser.nivelAcesso as NivelAcesso
    : "operador";
  const criadoEm = apiUser.criadoEm?.slice(0, 10) || new Date().toISOString().slice(0, 10);

  return {
    id: apiUser.id,
    nome: apiUser.nome,
    email: apiUser.email,
    avatar: apiUser.avatar || "",
    senha: "",
    criadoEm,
    dataCriacao: apiUser.criadoEm || `${criadoEm}T00:00:00.000Z`,
    descricao: apiUser.descricao || (nivel === "superadmin" ? "Superadministrador do sistema" : "Usuario administrativo"),
    cargo: nivel === "superadmin" ? "Super Administrador" : nivel === "admin" ? "Administrador" : "Operador",
    nivelAcesso: nivel,
    permissoes: Array.isArray(apiUser.permissoes) ? apiUser.permissoes as PermissaoModulo[] : [],
    ativo: true,
    ultimoAcesso: apiUser.ultimoAcesso || undefined,
  };
}

function mapUsuarioApi(usuario: Awaited<ReturnType<typeof usuariosService.listar>>[number]): UsuarioAdmin {
  const nivel = ["superadmin", "admin", "operador"].includes(usuario.nivelAcesso)
    ? usuario.nivelAcesso as NivelAcesso
    : "operador";

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    senha: "",
    avatar: usuario.avatar || "",
    cargo: nivel === "superadmin" ? "Super Administrador" : nivel === "admin" ? "Administrador" : "Operador",
    nivelAcesso: nivel,
    permissoes: usuario.permissoes as PermissaoModulo[],
    ativo: usuario.ativo,
    criadoEm: usuario.criadoEm?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    dataCriacao: usuario.criadoEm,
    ultimoAcesso: usuario.ultimoAcesso || undefined,
    descricao: usuario.descricao || "",
  };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioAdmin | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregarUsuarios = useCallback(async () => {
    try {
      const lista = await usuariosService.listar();
      setUsuarios(lista.map(mapUsuarioApi));
    } catch {
      setUsuarios([]);
    }
  }, []);

  useEffect(() => {
    const verificarSessao = async () => {
      try {
        const autenticado = await authService.isAuthenticated();
        if (autenticado) {
          const apiUser = await authService.me();
          const user = mapApiUser(apiUser);
          setUsuarioLogado(user);
          await recarregarUsuarios();
        }
      } catch {
        setUsuarioLogado(null);
        setUsuarios([]);
      } finally {
        setCarregando(false);
      }
    };
    verificarSessao();
  }, [recarregarUsuarios]);

  const login = useCallback(async (email: string, senha: string): Promise<{ ok: boolean; erro?: string }> => {
    try {
      const data = await authService.login({ email, senha });
      const user = mapApiUser(data.usuario);
      setUsuarioLogado(user);
      await recarregarUsuarios();
      appendAuditEntry(user.id, user.nome, user.email, "login", "Autenticação", "Realizou login no painel", "Sessão iniciada com sucesso");
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login";
      return { ok: false, erro: message };
    }
  }, [recarregarUsuarios]);

  const logout = useCallback(() => {
    if (usuarioLogado) {
      appendAuditEntry(usuarioLogado.id, usuarioLogado.nome, usuarioLogado.email, "logout", "Autenticação", "Encerrou sessão", "Logout manual");
    }
    void authService.logout();
    setUsuarioLogado(null);
    setUsuarios([]);
  }, [usuarioLogado]);

  const temPermissao = useCallback((modulo: PermissaoModulo): boolean => {
    if (!usuarioLogado) return false;
    if (usuarioLogado.nivelAcesso === "superadmin") return true;
    return usuarioLogado.permissoes.includes(modulo);
  }, [usuarioLogado]);

  const isSuperAdmin = useCallback((): boolean => {
    return usuarioLogado?.nivelAcesso === "superadmin";
  }, [usuarioLogado]);

  const criarUsuario = useCallback(async (usuario: UsuarioAdmin) => {
    const criado = await usuariosService.criar({
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      nivelAcesso: usuario.nivelAcesso,
      permissoes: usuario.nivelAcesso === "superadmin" ? MODULOS_DISPONIVEIS.map((m) => m.key) : usuario.permissoes,
      avatar: usuario.avatar,
      ativo: usuario.ativo,
      descricao: usuario.descricao,
    });
    setUsuarios((prev) => [...prev, mapUsuarioApi(criado)].sort((a, b) => a.nome.localeCompare(b.nome)));
  }, []);

  const atualizarUsuario = useCallback(async (usuario: UsuarioAdmin) => {
    const atualizado = await usuariosService.atualizar(usuario.id, {
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha || undefined,
      nivelAcesso: usuario.nivelAcesso,
      permissoes: usuario.nivelAcesso === "superadmin" ? MODULOS_DISPONIVEIS.map((m) => m.key) : usuario.permissoes,
      avatar: usuario.avatar,
      ativo: usuario.ativo,
      descricao: usuario.descricao,
    });

    const usuarioAtualizado = mapUsuarioApi(atualizado);
    setUsuarios((prev) => prev.map((item) => item.id === usuario.id ? usuarioAtualizado : item));
    if (usuarioLogado?.id === usuario.id) {
      setUsuarioLogado((prev) => prev ? { ...prev, ...usuarioAtualizado, senha: "" } : prev);
    }
  }, [usuarioLogado]);

  const removerUsuario = useCallback(async (id: string) => {
    await usuariosService.remover(id);
    setUsuarios((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const atualizarPerfil = useCallback(async (payload: { nome: string; descricao?: string; avatar?: string }) => {
    const atualizado = await authService.atualizarPerfil(payload);
    const usuario = mapApiUser(atualizado);
    setUsuarioLogado(usuario);
    setUsuarios((prev) => prev.map((item) => item.id === usuario.id ? { ...item, ...usuario } : item));
  }, []);

  const alterarSenha = useCallback(async (payload: { senhaAtual: string; novaSenha: string }) => {
    await authService.alterarSenha(payload);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        usuarioLogado,
        usuarios,
        login,
        logout,
        temPermissao,
        isSuperAdmin,
        carregando,
        recarregarUsuarios,
        criarUsuario,
        atualizarUsuario,
        removerUsuario,
        atualizarPerfil,
        alterarSenha,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
