export type FloatBtnType = "whatsapp" | "chat" | "link" | "phone" | "contracheque" | "accessibility";

export interface FloatingButtonConfig {
  id: string;
  label: string;
  tipo: FloatBtnType;
  icone: string;
  cor: string;
  url: string;
  lado: "direito" | "esquerdo";
  ativo: boolean;
  ordem: number;
  mostrarLabel: boolean;
}

export const floatingButtonsDefault: FloatingButtonConfig[] = [
  {
    id: "pesquisa-satisfacao",
    label: "Pesquisa de Satisfação",
    tipo: "link",
    icone: "ri-survey-line",
    cor: "#2563EB",
    url: "/pesquisa-satisfacao#participar",
    lado: "esquerdo",
    ativo: true,
    ordem: 1,
    mostrarLabel: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    tipo: "whatsapp",
    icone: "ri-whatsapp-line",
    cor: "#25D366",
    url: "",
    lado: "direito",
    ativo: true,
    ordem: 2,
    mostrarLabel: false,
  },
  {
    id: "chat",
    label: "Assistente Virtual",
    tipo: "chat",
    icone: "ri-robot-2-line",
    cor: "#16a34a",
    url: "",
    lado: "direito",
    ativo: true,
    ordem: 3,
    mostrarLabel: false,
  },
  {
    id: "contracheque",
    label: "Contracheque",
    tipo: "contracheque",
    icone: "ri-file-text-line",
    cor: "#059669",
    url: "",
    lado: "esquerdo",
    ativo: false,
    ordem: 4,
    mostrarLabel: true,
  },
  {
    id: "accessibility",
    label: "Acessibilidade",
    tipo: "accessibility",
    icone: "ri-hand-heart-line",
    cor: "#1A56DB",
    url: "",
    lado: "esquerdo",
    ativo: false,
    ordem: 5,
    mostrarLabel: false,
  },
];
