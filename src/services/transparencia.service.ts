import { apiFetch, getToken } from "./api";
import type { TransparenciaMenu } from "@/mocks/transparencia-docs";

export interface DocumentoTransparencia {
  id?: number;
  titulo: string;
  descricao?: string;
  categoria: string;
  url: string;
  tamanho?: string;
  dataPublicacao: string;
  ano: number;
  mes?: number;
  ativo: boolean;
  ordem: number;
  created_at?: string;
  [key: string]: any;
}

export interface FinancaInvestimento {
  id?: number;
  titulo: string;
  descricao?: string;
  valor: number;
  tipo: "receita" | "despesa" | "investimento";
  categoria: string;
  ano: number;
  mes?: number;
  url?: string;
  ativo: boolean;
  created_at?: string;
  [key: string]: any;
}

export interface Legislacao {
  id?: number;
  titulo: string;
  tipo: string;
  numero?: string;
  dataPublicacao: string;
  ementa?: string;
  url: string;
  ativo: boolean;
  created_at?: string;
  [key: string]: any;
}

export interface PainelSlide {
  id: number;
  titulo: string;
  embedUrl: string;
  sourceUrl?: string;
  tipo?: "PDF" | "PPT" | "LINK";
  tamanho?: string;
  ativo: boolean;
  ordem: number;
  descricao?: string;
  dataAtualizacao?: string;
  slidesImg?: string[];
}

export const transparenciaService = {
  async listarDocumentos(): Promise<any[]> {
    return apiFetch<any[]>("/transparencia/documentos");
  },

  async listarDocumentosAdmin(): Promise<any[]> {
    const token = getToken();
    return apiFetch<any[]>("/transparencia/documentos/admin", { token });
  },

  async criarDocumento(doc: any): Promise<any> {
    const token = getToken();
    return apiFetch<DocumentoTransparencia>("/transparencia/documentos", {
      method: "POST",
      body: doc,
      token,
    });
  },

  async listarFinancas(): Promise<any[]> {
    return apiFetch<any[]>("/transparencia/financas");
  },

  async listarFinancasAdmin(): Promise<any[]> {
    const token = getToken();
    return apiFetch<any[]>("/transparencia/financas/admin", { token });
  },

  async criarFinanca(financa: any): Promise<any> {
    const token = getToken();
    return apiFetch<FinancaInvestimento>("/transparencia/financas", {
      method: "POST",
      body: financa,
      token,
    });
  },

  async listarLegislacao(): Promise<Legislacao[]> {
    return apiFetch<Legislacao[]>("/transparencia/legislacao");
  },

  async criarLegislacao(leg: any): Promise<any> {
    const token = getToken();
    return apiFetch<Legislacao>("/transparencia/legislacao", {
      method: "POST",
      body: leg,
      token,
    });
  },

  async salvarDocumento(doc: any): Promise<any> {
    const token = getToken();
    return apiFetch<any>(doc.id ? `/transparencia/documentos/${doc.id}` : "/transparencia/documentos", { method: doc.id ? "PUT" : "POST", body: doc, token });
  },

  async excluirDocumento(id: number | string): Promise<void> {
    const token = getToken();
    return apiFetch<void>(`/transparencia/documentos/${id}`, { method: "DELETE", token });
  },

  async salvarFinanca(financa: any): Promise<any> {
    const token = getToken();
    return apiFetch<any>(financa.id ? `/transparencia/financas/${financa.id}` : "/transparencia/financas", { method: financa.id ? "PUT" : "POST", body: financa, token });
  },

  async excluirFinanca(id: number | string): Promise<void> {
    const token = getToken();
    return apiFetch<void>(`/transparencia/financas/${id}`, { method: "DELETE", token });
  },

  async listarPainel(): Promise<PainelSlide[]> {
    const data = await apiFetch<any[]>("/transparencia/painel");
    return data.map(item => ({
      id: item.id,
      titulo: item.title,
      descricao: item.description,
      embedUrl: item.fileUrl || "",
      sourceUrl: item.fileUrl || "",
      tipo: item.fileType as "PDF" | "PPT" | "LINK",
      tamanho: item.fileName || "",
      ativo: item.isActive === 1,
      ordem: item.order,
      dataAtualizacao: item.updatedAt ? item.updatedAt.split(" ")[0] : "",
      slidesImg: Array.isArray(item.slideImages) ? item.slideImages : (typeof item.slideImages === "string" ? JSON.parse(item.slideImages) : [])
    }));
  },

  async obterPainelConfig<T = any>(): Promise<T | null> {
    return apiFetch<any>("/configuracoes/app/painel_transparencia").catch(() => null);
  },

  async salvarPainelConfig(config: any): Promise<any> {
    const token = getToken();
    return apiFetch<any>("/configuracoes/app/painel_transparencia", { method: "PUT", body: config, token });
  },

  async listarMenus(): Promise<TransparenciaMenu[]> {
    return apiFetch<TransparenciaMenu[]>("/configuracoes/app/transparencia_menus").catch(() => []);
  },

  async listarMenusAdmin(): Promise<TransparenciaMenu[]> {
    const token = getToken();
    return apiFetch<TransparenciaMenu[]>("/configuracoes/app/transparencia_menus", { token }).catch(() => []);
  },

  async salvarMenus(menus: TransparenciaMenu[]): Promise<TransparenciaMenu[]> {
    const token = getToken();
    return apiFetch<TransparenciaMenu[]>("/configuracoes/app/transparencia_menus", {
      method: "PUT",
      body: menus,
      token,
    });
  },

  async listarPainelAdmin(): Promise<PainelSlide[]> {
    const token = getToken();
    const data = await apiFetch<any[]>("/transparencia/painel/admin", { token });
    return data.map(item => ({
      id: item.id,
      titulo: item.title,
      descricao: item.description,
      embedUrl: item.fileUrl || "",
      sourceUrl: item.fileUrl || "",
      tipo: item.fileType as "PDF" | "PPT" | "LINK",
      tamanho: item.fileName || "",
      ativo: item.isActive === 1,
      ordem: item.order,
      dataAtualizacao: item.updatedAt ? item.updatedAt.split(" ")[0] : "",
      slidesImg: Array.isArray(item.slideImages) ? item.slideImages : (typeof item.slideImages === "string" ? JSON.parse(item.slideImages) : [])
    }));
  },

  async salvarPainel(item: PainelSlide): Promise<PainelSlide> {
    const token = getToken();
    const body = {
      title: item.titulo,
      description: item.descricao || "",
      fileUrl: item.sourceUrl || "",
      fileName: item.tamanho || "",
      fileType: item.tipo || "PDF",
      mimeType: item.tipo === "PDF" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      slideImages: item.slidesImg || [],
      order: item.ordem,
      isActive: item.ativo ? 1 : 0
    };

    if (item.id === 0) {
      const resp = await apiFetch<any>("/transparencia/painel", {
        method: "POST",
        body,
        token
      });
      return {
        id: resp.id,
        titulo: resp.title,
        descricao: resp.description,
        embedUrl: resp.fileUrl || "",
        sourceUrl: resp.fileUrl || "",
        tipo: resp.fileType,
        tamanho: resp.fileName,
        ativo: resp.isActive === 1,
        ordem: resp.order,
        dataAtualizacao: resp.updatedAt ? resp.updatedAt.split(" ")[0] : "",
        slidesImg: Array.isArray(resp.slideImages) ? resp.slideImages : (typeof resp.slideImages === "string" ? JSON.parse(resp.slideImages) : [])
      };
    } else {
      const resp = await apiFetch<any>(`/transparencia/painel/${item.id}`, {
        method: "PUT",
        body,
        token
      });
      return {
        id: resp.id,
        titulo: resp.title,
        descricao: resp.description,
        embedUrl: resp.fileUrl || "",
        sourceUrl: resp.fileUrl || "",
        tipo: resp.fileType,
        tamanho: resp.fileName,
        ativo: resp.isActive === 1,
        ordem: resp.order,
        dataAtualizacao: resp.updatedAt ? resp.updatedAt.split(" ")[0] : "",
        slidesImg: Array.isArray(resp.slideImages) ? resp.slideImages : (typeof resp.slideImages === "string" ? JSON.parse(resp.slideImages) : [])
      };
    }
  },

  async excluirPainel(id: number): Promise<void> {
    const token = getToken();
    await apiFetch<any>(`/transparencia/painel/${id}`, {
      method: "DELETE",
      token
    });
  }
};





