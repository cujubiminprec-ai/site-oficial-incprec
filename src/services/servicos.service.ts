import { apiFetch } from "./api";

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
    return apiFetch<ServicoSite[]>("/servicos/admin");
  },
  salvar(servico: ServicoSite) {
    if (servico.id) {
      return apiFetch<ServicoSite>(`/servicos/${servico.id}`, { method: "PUT", body: servico });
    }
    return apiFetch<ServicoSite>("/servicos", { method: "POST", body: servico });
  },
  remover(id: number | string) {
    return apiFetch(`/servicos/${id}`, { method: "DELETE" });
  },
};
