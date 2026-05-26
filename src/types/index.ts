import { Request } from "express";

// ============================================================
// Tipos de autenticação
// ============================================================
export interface JwtPayload {
  userId: string;
  email: string;
  nome?: string;
  nivelAcesso: NivelAcesso;
  permissoes: string[];
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export type NivelAcesso = "superadmin" | "admin" | "operador";

// ============================================================
// Tipos de resposta padrão
// ============================================================
export interface ApiResponse<T = unknown> {
  sucesso: boolean;
  dados?: T;
  mensagem?: string;
  erros?: string[];
}

export interface PaginacaoMeta {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface ListaComPaginacao<T> {
  itens: T[];
  meta: PaginacaoMeta;
}

// ============================================================
// Filtros comuns
// ============================================================
export interface FiltroBase {
  pagina?: number;
  limite?: number;
  busca?: string;
  ordenar?: string;
  direcao?: "ASC" | "DESC";
}

// ============================================================
// Entidades do banco
// ============================================================
export interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  nivel_acesso: NivelAcesso;
  permissoes: string[];
  avatar_url: string | null;
  ativo: boolean;
  descricao: string | null;
  criado_em: string;
  ultimo_acesso: string | null;
}

export interface Noticia {
  id: number;
  titulo: string;
  slug: string;
  resumo: string | null;
  conteudo: string | null;
  image_url: string | null;
  image_alt: string | null;
  categoria: string | null;
  autor: string | null;
  destaque: boolean;
  publicado: boolean;
  publicado_em: string | null;
  visualizacoes: number;
  tags: string[];
  criado_em: string;
}

export interface Evento {
  id: number;
  titulo: string;
  tipo: string;
  status: string;
  data_inicio: string;
  hora_inicio: string | null;
  local: string | null;
  descricao: string | null;
  imagem_url: string | null;
  online: boolean;
  link_online: string | null;
  palestrante: string | null;
  vagas: number | null;
  vagas_restantes: number | null;
  certificado: boolean;
  publicado: boolean;
  criado_em: string;
}

export interface Gestor {
  id: number;
  nome: string;
  cargo: string;
  grupo: "diretoria" | "comite" | "fiscal" | "deliberativo";
  foto_url: string | null;
  email: string | null;
  telefone: string | null;
  bio: string | null;
  mandato: string | null;
  ativo: boolean;
}

export interface Protocolo {
  protocolo: string;
  nome: string;
  email: string;
  tipo: string;
  assunto: string;
  status: string;
  criado_em: string;
  prazo_legal?: string;
}

export interface Arquivo {
  id: number;
  nome_original: string;
  caminho: string;
  url_publica: string;
  tipo_mime: string;
  tamanho_bytes: number;
  pasta: string;
  criado_em: string;
}
