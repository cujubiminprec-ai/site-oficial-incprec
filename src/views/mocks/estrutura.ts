export interface Membro {
  id: number;
  nome: string;
  cargo: string;
  setor: string;
  foto: string;
  email?: string;
  nivel: number;
  parentId?: number;
  bio?: string;
  formacao?: string;
  telefone?: string;
}

const contatoInstitucional = "inprec@cujubim.ro.gov.br";
const avatarWallyson =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' rx='80' fill='%23059669'/%3E%3Ctext x='80' y='92' text-anchor='middle' font-size='44' font-family='Arial,sans-serif' font-weight='700' fill='white'%3EWS%3C/text%3E%3C/svg%3E";

export const membros: Membro[] = [
  {
    id: 1,
    nome: "Elias Cruz Santos",
    cargo: "Superintendente do INPREC",
    setor: "Superintendência",
    foto: "/uploads/gestores/elias-cruz-santos.jpg",
    email: contatoInstitucional,
    nivel: 1,
    bio: "Responsável pela superintendência do Instituto de Previdência de Cujubim.",
    formacao: "Informação institucional não informada.",
  },
  {
    id: 2,
    nome: "Ana Maria da Silva",
    cargo: "Diretora Previdenciária",
    setor: "Diretoria Previdenciária",
    foto: "/uploads/gestores/ana-maria-da-silva.jpg",
    email: contatoInstitucional,
    nivel: 2,
    parentId: 1,
    bio: "Responsável pela área previdenciária do INPREC.",
    formacao: "Informação institucional não informada.",
  },
  {
    id: 3,
    nome: "Raidi Vieira da Silva",
    cargo: "Gerente Financeira e Administrativa",
    setor: "Gerência Financeira e Administrativa",
    foto: "/uploads/gestores/raidi-vieira-da-silva.jpg",
    email: contatoInstitucional,
    nivel: 2,
    parentId: 1,
    bio: "Responsável pela gerência financeira e administrativa do instituto.",
    formacao: "Informação institucional não informada.",
  },
  {
    id: 4,
    nome: "Jansen de Lima Rodrigues",
    cargo: "Controlador do INPREC",
    setor: "Controle Interno",
    foto: "/uploads/gestores/jansen-de-lima-rodrigues.jpeg",
    email: contatoInstitucional,
    nivel: 2,
    parentId: 1,
    bio: "Responsável pelo controle do INPREC.",
    formacao: "Informação institucional não informada.",
  },
  {
    id: 5,
    nome: "Wallyson Souza Guedes",
    cargo: "Contador do INPREC",
    setor: "Contabilidade",
    foto: avatarWallyson,
    email: contatoInstitucional,
    nivel: 2,
    parentId: 1,
    bio: "Responsável pela contabilidade do INPREC.",
    formacao: "Informação institucional não informada.",
  },
];
