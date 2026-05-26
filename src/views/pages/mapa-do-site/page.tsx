import { Link } from "react-router-dom";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import PageLayout from "@/components/feature/PageLayout";

interface SitemapSection {
  title: string;
  icon: string;
  links: { label: string; href: string }[];
}

const sections: SitemapSection[] = [
  {
    title: "Página Inicial",
    icon: "ri-home-4-line",
    links: [
      { label: "Início", href: "/" },
    ],
  },
  {
    title: "Quem Somos",
    icon: "ri-government-line",
    links: [
      { label: "Sobre o INPREC", href: "/quem-somos" },
      { label: "Estrutura Organizacional", href: "/estrutura" },
      { label: "Gestores", href: "/gestores" },
      { label: "Pró-Gestão RPPS", href: "/pro-gestao" },
      { label: "Código de Ética", href: "/codigo-de-etica" },
      { label: "Compromisso com o Servidor", href: "/compromisso-com-servidor" },
      { label: "Marca INPREC", href: "/marca" },
    ],
  },
  {
    title: "Previdência & Benefícios",
    icon: "ri-heart-pulse-line",
    links: [
      { label: "Previdência Social", href: "/previdencia" },
      { label: "Aposentadoria por Idade", href: "/beneficios/aposentadoria-por-idade" },
      { label: "Aposentadoria por Invalidez", href: "/beneficios/aposentadoria-por-invalidez" },
      { label: "Pensão por Morte", href: "/beneficios/pensao-por-morte" },
      { label: "Auxílio-Doença", href: "/beneficios/auxilio-doenca" },
      { label: "Fundo Previdenciário", href: "/beneficios/fundo-previdenciario" },
      { label: "Atendimento Personalizado", href: "/beneficios/atendimento-personalizado" },
    ],
  },
  {
    title: "Serviços",
    icon: "ri-service-line",
    links: [
      { label: "Serviços ao Servidor", href: "/servicos" },
      { label: "Formulários", href: "/formularios" },
      { label: "Cursos e Capacitação", href: "/cursos" },
    ],
  },
  {
    title: "Notícias & Eventos",
    icon: "ri-newspaper-line",
    links: [
      { label: "Notícias", href: "/noticias" },
      { label: "Eventos e Audiências", href: "/eventos" },
    ],
  },
  {
    title: "Transparência",
    icon: "ri-eye-line",
    links: [
      { label: "Portal da Transparência", href: "/transparencia" },
      { label: "Finanças e Investimentos", href: "/financas-investimentos" },
      { label: "Legislação", href: "/legislacao" },
      { label: "LAI – Acesso à Informação", href: "/lai" },
      { label: "LGPD", href: "/lgpd" },
    ],
  },
  {
    title: "Participação",
    icon: "ri-team-line",
    links: [
      { label: "Ouvidoria", href: "/ouvidoria" },
      { label: "Pesquisa de Satisfação", href: "/pesquisa-satisfacao" },
      { label: "Eleição do Conselho", href: "/eleicao" },
    ],
  },
  {
    title: "Contato & Localização",
    icon: "ri-map-pin-line",
    links: [
      { label: "Contato", href: "/contato" },
      { label: "Endereços e Unidades", href: "/enderecos" },
      { label: "Perguntas Frequentes (FAQ)", href: "/perguntas-frequentes" },
    ],
  },
];

export default function MapaDoSitePage() {
  const { config } = useSiteConfig();

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div
          className="w-full py-16 md:py-20 flex flex-col items-center justify-center text-center px-4"
          style={{ background: `linear-gradient(135deg, ${config.secondaryColor}, ${config.primaryColor})` }}
        >
          <div
            className="w-14 h-14 flex items-center justify-center rounded-2xl mb-4"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <i className="ri-map-2-line text-2xl text-white"></i>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Mapa do Site
          </h1>
          <p className="text-white/75 text-sm md:text-base max-w-xl">
            Encontre rapidamente qualquer página ou seção do portal {config.siteName}
          </p>

        </div>

        {/* Conteúdo */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sections.map((section) => (
              <div
                key={section.title}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3"
              >
                {/* Título da seção */}
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{ backgroundColor: `${config.primaryColor}15` }}
                  >
                    <i className={`${section.icon} text-sm`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <h2
                    className="text-sm font-bold text-gray-800 leading-tight"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {section.title}
                  </h2>
                </div>

                {/* Links */}
                <div className="flex flex-col gap-0.5">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                        <i
                          className="ri-arrow-right-s-line text-xs text-gray-300 group-hover:text-gray-500 transition-colors"
                        ></i>
                      </div>
                      <span className="text-xs leading-tight">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Rodapé do mapa */}
          <div className="mt-12 text-center">
            <p className="text-xs text-gray-400 mb-3">
              Não encontrou o que procura?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/perguntas-frequentes"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ backgroundColor: config.primaryColor }}
              >
                <i className="ri-question-answer-line text-sm"></i>
                Perguntas Frequentes
              </Link>
              <Link
                to="/contato"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap border border-gray-200 text-gray-700"
              >
                <i className="ri-customer-service-2-line text-sm"></i>
                Fale Conosco
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
