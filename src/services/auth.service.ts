import { apiFetch, getToken, setToken, setRefreshToken, removeToken, removeRefreshToken } from "./api";

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    avatar?: string;
    nivelAcesso: string;
    permissoes: string[];
  };
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const data = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: credentials,
    });
    setToken(data.token);
    setRefreshToken(data.refreshToken);
    return data;
  },

  async refresh(): Promise<RefreshResponse> {
    const refreshToken = localStorage.getItem("inprec_api_refresh_token");
    const data = await apiFetch<RefreshResponse>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
    setToken(data.token);
    setRefreshToken(data.refreshToken);
    return data;
  },

  async me(): Promise<LoginResponse["usuario"]> {
    const token = getToken();
    return apiFetch<LoginResponse["usuario"]>("/auth/me", {
      token,
    });
  },

  async logout(): Promise<void> {
    const token = getToken();
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        token,
      });
    } catch {
      // ignora erro no logout
    }
    removeToken();
    removeRefreshToken();
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },
};