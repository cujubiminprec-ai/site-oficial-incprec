import { apiFetch, getToken } from "./api";

export interface ServicoSite {
  id: number;
  icone: string;
  titulo: string;
  descricao: string;
  link?: string;
  linkUrl?: string;
  ordem?: number;
  destaque?: boolean;
  ativo?: boolean;
}

export const servicosService = {
  listar() {
    return apiFetch<ServicoSite[]>("/servicos");
  },
  listarAdmin() {
    const token = getToken();
    return apiFetch<ServicoSite[]>("/servicos/admin", { token });
  },
  salvar(servico: ServicoSite) {
    const token = getToken();
    if (servico.id) {
      return apiFetch<ServicoSite>(`/servicos/${servico.id}`, { method: "PUT", body: servico, token });
    }
    return apiFetch<ServicoSite>("/servicos", { method: "POST", body: servico, token });
  },
  remover(id: number | string) {
    const token = getToken();
    return apiFetch(`/servicos/${id}`, { method: "DELETE", token });
  },
};
