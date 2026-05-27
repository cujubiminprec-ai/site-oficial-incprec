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

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("inprec_api_refresh_token");
  if (!refreshToken) return null;

  try {
    const response = await fetch(API_URL + "/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const dados = data?.dados ?? data;
    if (!dados?.token) return null;

    setToken(dados.token);
    if (dados.refreshToken) setRefreshToken(dados.refreshToken);
    return dados.token as string;
  } catch {
    return null;
  }
}

async function executeFetch(endpoint: string, options: ApiOptions, overrideToken?: string | null): Promise<Response> {
  const { method = "GET", body, headers = {}, token } = options;
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    ...headers,
  };

  const authToken = overrideToken !== undefined ? overrideToken : token;
  if (authToken) {
    defaultHeaders["Authorization"] = "Bearer " + authToken;
  }

  return fetch(API_URL + endpoint, {
    method,
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
}

async function parseResponse<T>(response: Response): Promise<T> {
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
        : "Erro " + response.status;
    throw new ApiError(message, response.status, data);
  }

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

export async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  let response = await executeFetch(endpoint, options);

  if (response.status === 401 && options.token && endpoint !== "/auth/refresh") {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await executeFetch(endpoint, options, newToken);
    }
  }

  return parseResponse<T>(response);
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
