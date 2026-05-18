const API_URL = import.meta.env.VITE_API_URL || "/api";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, token } = options;

  const url = `${API_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: unknown;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "mensagem" in data
        ? String((data as { mensagem: string }).mensagem)
        : typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: string }).message)
        : `Erro ${response.status}`;
    throw new ApiError(message, response.status, data);
  }

  // Backend retorna { sucesso: true, dados: T } — extrai .dados automaticamente
  if (
    typeof data === "object" &&
    data !== null &&
    "sucesso" in data &&
    "dados" in data
  ) {
    return (data as { sucesso: boolean; dados: T }).dados;
  }

  return data as T;
}

export function getToken(): string | null {
  return localStorage.getItem("inprec_api_token");
}

export function setToken(token: string): void {
  localStorage.setItem("inprec_api_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("inprec_api_token");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("inprec_api_refresh_token");
}

export function setRefreshToken(token: string): void {
  localStorage.setItem("inprec_api_refresh_token", token);
}

export function removeRefreshToken(): void {
  localStorage.removeItem("inprec_api_refresh_token");
}
