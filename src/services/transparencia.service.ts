import { apiFetch, getToken } from "./api";

export interface DocumentoTransparencia {
  id?: string;
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
}

export interface FinancaInvestimento {
  id?: string;
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
}

export interface Legislacao {
  id?: string;
  titulo: string;
  tipo: string;
  numero?: string;
  dataPublicacao: string;
  ementa?: string;
  url: string;
  ativo: boolean;
  created_at?: string;
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
  async listarDocumentos(): Promise<DocumentoTransparencia[]> {
    return apiFetch<DocumentoTransparencia[]>("/transparencia/documentos");
  },

  async criarDocumento(doc: Omit<DocumentoTransparencia, "id" | "created_at">): Promise<DocumentoTransparencia> {
    const token = getToken();
    return apiFetch<DocumentoTransparencia>("/transparencia/documentos", {
      method: "POST",
      body: doc,
      token,
    });
  },

  async listarFinancas(): Promise<FinancaInvestimento[]> {
    return apiFetch<FinancaInvestimento[]>("/transparencia/financas");
  },

  async criarFinanca(financa: Omit<FinancaInvestimento, "id" | "created_at">): Promise<FinancaInvestimento> {
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

  async criarLegislacao(leg: Omit<Legislacao, "id" | "created_at">): Promise<Legislacao> {
    const token = getToken();
    return apiFetch<Legislacao>("/transparencia/legislacao", {
      method: "POST",
      body: leg,
      token,
    });
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