import { apiFetch, getToken } from "./api";

export interface UsuarioApi {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  nivelAcesso: string;
  permissoes: string[];
  ativo: boolean;
  criadoEm?: string;
  descricao?: string;
  ultimoAcesso?: string;
  [key: string]: any;
}

export const usuariosService = {
  listar(): Promise<UsuarioApi[]> {
    const token = getToken();
    return apiFetch<UsuarioApi[]>("/usuarios", { token });
  },
  criar(payload: Record<string, unknown>): Promise<UsuarioApi> {
    const token = getToken();
    return apiFetch<UsuarioApi>("/usuarios", { method: "POST", body: payload, token });
  },
  atualizar(id: string, payload: Record<string, unknown>): Promise<UsuarioApi> {
    const token = getToken();
    return apiFetch<UsuarioApi>(`/usuarios/${id}`, { method: "PUT", body: payload, token });
  },
  remover(id: string): Promise<void> {
    const token = getToken();
    return apiFetch<void>(`/usuarios/${id}`, { method: "DELETE", token });
  },
};
