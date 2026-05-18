export interface DocumentoLGPD {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  tipo: string;
  tamanho: string;
  dataPublicacao: string;
  url?: string;
  ativo: boolean;
}

export const categoriaLGPD = [
  { key: "encarregado", icon: "ri-user-star-line", titulo: "Encarregado de Dados Pessoais", descricao: "Conheça o responsável pela proteção de dados pessoais do INPREC e seus contatos." },
  { key: "consentimento", icon: "ri-fingerprint-line", titulo: "Termo de Consentimento do Uso de Dados", descricao: "Acesse o termo de consentimento para o uso e tratamento de seus dados pessoais." },
  { key: "legislacao", icon: "ri-scales-3-line", titulo: "Legislação LGPD", descricao: "Consulte a Lei nº 13.709/2018 e normas complementares sobre proteção de dados." },
  { key: "canais", icon: "ri-chat-3-line", titulo: "Canais de Comunicação", descricao: "Saiba como entrar em contato para exercer seus direitos como titular de dados." },
  { key: "cartilha", icon: "ri-book-open-line", titulo: "Cartilha", descricao: "Material educativo sobre a Lei Geral de Proteção de Dados e seus direitos." },
  { key: "politica", icon: "ri-lock-2-line", titulo: "Política de Privacidade e Proteção de Dados", descricao: "Política completa de privacidade e proteção de dados pessoais do INPREC." },
  { key: "programa", icon: "ri-shield-user-line", titulo: "Programa de Governança em Privacidade", descricao: "Conheça o programa institucional de governança em privacidade e proteção de dados." },
  { key: "perguntas", icon: "ri-question-answer-line", titulo: "Perguntas Frequentes", descricao: "Respostas às dúvidas mais comuns sobre LGPD e o tratamento de dados no INPREC." },
  { key: "aviso", icon: "ri-eye-line", titulo: "Aviso de Privacidade", descricao: "Informações sobre como o INPREC coleta, usa e protege os dados dos titulares." },
];

export const documentosLGPD: DocumentoLGPD[] = [
  { id: 1, titulo: "Lei nº 13.709/2018 — LGPD", descricao: "Lei Geral de Proteção de Dados Pessoais — texto integral", categoria: "legislacao", tipo: "PDF", tamanho: "320 KB", dataPublicacao: "2024-01-10", ativo: true },
  { id: 2, titulo: "Portaria de Nomeação do Encarregado de Dados — DPO", descricao: "Ato de designação do Encarregado de Proteção de Dados do INPREC", categoria: "encarregado", tipo: "PDF", tamanho: "180 KB", dataPublicacao: "2024-02-15", ativo: true },
  { id: 3, titulo: "Política de Privacidade e Proteção de Dados Pessoais do INPREC", descricao: "Documento completo da política institucional de privacidade", categoria: "politica", tipo: "PDF", tamanho: "420 KB", dataPublicacao: "2024-03-01", ativo: true },
  { id: 4, titulo: "Termo de Consentimento para Tratamento de Dados Pessoais", descricao: "Formulário de consentimento do titular de dados", categoria: "consentimento", tipo: "PDF", tamanho: "95 KB", dataPublicacao: "2024-03-01", ativo: true },
  { id: 5, titulo: "Cartilha LGPD — Seus Direitos como Titular de Dados", descricao: "Material educativo sobre direitos dos titulares de dados pessoais", categoria: "cartilha", tipo: "PDF", tamanho: "2.1 MB", dataPublicacao: "2024-04-10", ativo: true },
  { id: 6, titulo: "Aviso de Privacidade — INPREC", descricao: "Aviso informativo sobre coleta e uso de dados", categoria: "aviso", tipo: "PDF", tamanho: "140 KB", dataPublicacao: "2024-04-15", ativo: true },
  { id: 7, titulo: "Programa de Governança em Privacidade 2024", descricao: "Documento do programa institucional de gestão de dados pessoais", categoria: "programa", tipo: "PDF", tamanho: "560 KB", dataPublicacao: "2024-05-01", ativo: true },
  { id: 8, titulo: "Relatório de Impacto à Proteção de Dados — RIPD", descricao: "Relatório anual de avaliação de impacto de dados pessoais", categoria: "programa", tipo: "PDF", tamanho: "380 KB", dataPublicacao: "2024-06-01", ativo: true },
];
