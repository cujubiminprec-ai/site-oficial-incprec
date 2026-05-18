export interface Curso {
  id: number;
  titulo: string;
  instituicao: string;
  ano: number;
  cargaHoraria?: string;
  tipo: "Graduação" | "Especialização" | "MBA" | "Mestrado" | "Doutorado" | "Curso" | "Capacitação";
}

export interface Documento {
  id: number;
  titulo: string;
  tipo: string;
  tamanho: string;
  url?: string;
}

export interface Gestor {
  id: number;
  nome: string;
  cargo: string;
  grupo: "diretoria" | "comite" | "fiscal" | "deliberativo";
  foto: string;
  email: string;
  telefone?: string;
  matricula?: string;
  bio: string;
  formacao: string;
  cursos: Curso[];
  documentos: Documento[];
  mandato?: string;
  ativo: boolean;
}

export const grupos = [
  { key: "diretoria", label: "Diretoria Executiva", icon: "ri-government-line" },
  { key: "comite", label: "Comitê de Investimento", icon: "ri-funds-line" },
  { key: "fiscal", label: "Conselho Fiscal", icon: "ri-shield-check-line" },
  { key: "deliberativo", label: "Conselho Deliberativo", icon: "ri-group-line" },
];

const contatoInstitucional = "inprec@cujubim.ro.gov.br";
const avatarWallyson =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' rx='80' fill='%23059669'/%3E%3Ctext x='80' y='92' text-anchor='middle' font-size='44' font-family='Arial,sans-serif' font-weight='700' fill='white'%3EWS%3C/text%3E%3C/svg%3E";

export const gestores: Gestor[] = [
  {
    id: 1,
    nome: "Elias Cruz Santos",
    cargo: "Superintendente do INPREC",
    grupo: "diretoria",
    foto: "/uploads/gestores/elias-cruz-santos.jpg",
    email: contatoInstitucional,
    bio: "Responsável pela superintendência do Instituto de Previdência de Cujubim, conforme composição oficial da Diretoria Executiva do INPREC.",
    formacao: "Informação institucional não informada na composição oficial.",
    cursos: [],
    documentos: [],
    ativo: true,
  },
  {
    id: 2,
    nome: "Ana Maria da Silva",
    cargo: "Diretora Previdenciária",
    grupo: "diretoria",
    foto: "/uploads/gestores/ana-maria-da-silva.jpg",
    email: contatoInstitucional,
    bio: "Integra a Diretoria Executiva do INPREC na função de Diretora Previdenciária, conforme composição oficial do instituto.",
    formacao: "Informação institucional não informada na composição oficial.",
    cursos: [],
    documentos: [],
    ativo: true,
  },
  {
    id: 3,
    nome: "Raidi Vieira da Silva",
    cargo: "Gerente Financeira e Administrativa",
    grupo: "diretoria",
    foto: "/uploads/gestores/raidi-vieira-da-silva.jpg",
    email: contatoInstitucional,
    bio: "Atua como Gerente Financeira e Administrativa do INPREC, conforme composição oficial da Diretoria Executiva.",
    formacao: "Informação institucional não informada na composição oficial.",
    cursos: [],
    documentos: [],
    ativo: true,
  },
  {
    id: 4,
    nome: "Jansen de Lima Rodrigues",
    cargo: "Controlador do INPREC",
    grupo: "diretoria",
    foto: "/uploads/gestores/jansen-de-lima-rodrigues.jpeg",
    email: contatoInstitucional,
    bio: "Integra a composição oficial do INPREC como Controlador do Instituto.",
    formacao: "Informação institucional não informada na composição oficial.",
    cursos: [],
    documentos: [],
    ativo: true,
  },
  {
    id: 5,
    nome: "Wallyson Souza Guedes",
    cargo: "Contador do INPREC",
    grupo: "diretoria",
    foto: avatarWallyson,
    email: contatoInstitucional,
    bio: "Integra a composição oficial do INPREC como Contador do Instituto.",
    formacao: "Informação institucional não informada na composição oficial.",
    cursos: [],
    documentos: [],
    ativo: true,
  },
];
