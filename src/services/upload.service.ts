import { apiFetch, getToken, setRefreshToken, setToken } from "./api";

export interface UploadResponse {
  id?: string | number;
  url: string;
  nome: string;
  tamanho?: number;
  tipo?: string;
  tipo_mime?: string;
  caminho?: string;
  pasta?: string;
}

export interface ArquivoListado {
  id: string;
  nome: string;
  url: string;
  pasta: string;
  tamanho: number;
  tipo: string;
  created_at: string;
}

function apiBaseUrl() {
  return import.meta.env.VITE_API_URL || "/api";
}

function apiPublicLabel() {
  const base = apiBaseUrl();
  return base === "/api" ? `${window.location.origin}/api` : base;
}

function normalizarUploadResponse(data: UploadResponse): UploadResponse {
  const localApi = /^https?:\/\/(localhost|127\.0\.0\.1):3001\/uploads\//i;
  return {
    ...data,
    url: data.url?.replace(localApi, "/uploads/") || data.url,
  };
}

function uploadErrorMessage(error: unknown) {
  if (error instanceof TypeError) {
    return `Backend de uploads indisponível em ${apiPublicLabel()}. Inicie a API local e tente novamente.`;
  }
  return error instanceof Error ? error.message : "Erro no upload";
}

export const uploadService = {
  async ensureToken(): Promise<string | null> {
    const token = getToken();
    if (token) return token;

    const session = localStorage.getItem("inprec_admin_session");
    if (!session?.includes('"mock":true')) return null;

    const API_URL = apiBaseUrl();
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@inprec.com", senha: "admin123" }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      const dados = data?.dados ?? data;
      if (dados?.token) {
        setToken(dados.token);
        if (dados.refreshToken) setRefreshToken(dados.refreshToken);
        return dados.token as string;
      }
    } catch {
      return null;
    }

    return null;
  },

  async upload(file: File, pasta: string): Promise<UploadResponse> {
    const token = await this.ensureToken();
    const formData = new FormData();
    formData.append("arquivo", file);

    const API_URL = apiBaseUrl();
    let response: Response;
    try {
      response = await fetch(`${API_URL}/upload?pasta=${encodeURIComponent(pasta)}`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });
    } catch (err) {
      throw new Error(uploadErrorMessage(err));
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ mensagem: "Erro no upload" }));
      const message = error.mensagem || error.message || "Erro no upload";
      throw new Error(response.status === 502 ? `Backend de uploads indisponível em ${apiPublicLabel()}. Inicie a API local e tente novamente.` : message);
    }

    const data = await response.json();
    return normalizarUploadResponse((data?.dados ?? data) as UploadResponse);
  },

  async uploadMultiplo(files: File[], pasta: string): Promise<UploadResponse[]> {
    const token = await this.ensureToken();
    const formData = new FormData();
    files.forEach((file) => formData.append("arquivos", file));

    const API_URL = apiBaseUrl();
    let response: Response;
    try {
      response = await fetch(`${API_URL}/upload/multiplo?pasta=${encodeURIComponent(pasta)}`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });
    } catch (err) {
      throw new Error(uploadErrorMessage(err));
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ mensagem: "Erro no upload" }));
      const message = error.mensagem || error.message || "Erro no upload";
      throw new Error(response.status === 502 ? `Backend de uploads indisponível em ${apiPublicLabel()}. Inicie a API local e tente novamente.` : message);
    }

    const data = await response.json();
    return ((data?.dados ?? data) as UploadResponse[]).map(normalizarUploadResponse);
  },

  async listar(pasta?: string): Promise<ArquivoListado[]> {
    const token = getToken();
    const query = pasta ? `?pasta=${encodeURIComponent(pasta)}` : "";
    return apiFetch<ArquivoListado[]>(`/upload${query}`, { token });
  },

  async deletar(id: string): Promise<void> {
    const token = getToken();
    return apiFetch<void>(`/upload/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
