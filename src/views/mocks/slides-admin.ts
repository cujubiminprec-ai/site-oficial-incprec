export interface SlideAdmin {
  id: number;
  tag: string;
  titulo: string;
  subtitulo: string;
  cta_label: string;
  cta_url: string;
  cta_type?: "link" | "pdf" | "ppt" | "none";
  pdf_url?: string;
  pdf_name?: string;
  image_url: string;
  ativo: boolean;
  ordem: number;
  use_tint?: boolean;
  show_content?: boolean;
}

export const slidesAdminDefault: SlideAdmin[] = [
  {
    id: 1,
    tag: "Gestão Pública",
    titulo: "Inovação e Transparência para o Cidadão",
    subtitulo: "O INPREC atua com excelência na promoção do desenvolvimento institucional, garantindo serviços públicos de qualidade.",
    cta_label: "Conheça nossos serviços",
    cta_url: "/servicos",
    image_url: "https://readdy.ai/api/search-image?query=modern%20government%20building%20exterior%20lush%20green%20trees%20natural%20daylight%20clear%20sky%20civic%20architecture%20brazil%20public%20institution%20elegant%20facade%20stone%20columns&width=1920&height=900&seq=slide1v2&orientation=landscape",
    ativo: true,
    ordem: 1,
    use_tint: false,
  },
  {
    id: 2,
    tag: "Transparência",
    titulo: "Dados Abertos e Acesso à Informação",
    subtitulo: "Consulte relatórios, balanços e documentos públicos do instituto de forma rápida e acessível.",
    cta_label: "Acessar transparência",
    cta_url: "/transparencia",
    image_url: "https://readdy.ai/api/search-image?query=data%20analytics%20dashboard%20office%20modern%20bright%20workspace%20charts%20and%20graphs%20on%20screens%20public%20institution%20transparency%20government%20open%20data%20natural%20daylight&width=1920&height=900&seq=slide3v2&orientation=landscape",
    ativo: true,
    ordem: 2,
    use_tint: false,
  }
];
