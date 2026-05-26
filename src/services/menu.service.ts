import { apiFetch, getToken } from "./api";
import type { MenuItem } from "@/pages/admin/tabs/MenuNavegacaoTab";

export const menuService = {
  listar(): Promise<MenuItem[]> {
    return apiFetch<MenuItem[]>("/menu/admin");
  },
  listarPublico(): Promise<MenuItem[]> {
    return apiFetch<MenuItem[]>("/menu");
  },
  salvarBulk(menus: MenuItem[]): Promise<MenuItem[]> {
    const token = getToken();
    return apiFetch<MenuItem[]>("/menu/bulk", { method: "PUT", body: { menus }, token });
  },
};
