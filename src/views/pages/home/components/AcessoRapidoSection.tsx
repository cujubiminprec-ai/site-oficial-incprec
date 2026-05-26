import { Link } from "react-router-dom";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

const acessos = [
  {
    id: "contracheque",
    icon: "ri-file-text-line",
    label: "Contracheque",
    desc: "Acesse seu demonstrativo",
    href: "#contracheque",
    externo: true,
    destaque: true,
  },
  {
    id: "beneficios",
    icon: "ri-shield-user-line",
    label: "Benefícios",
    desc: "Aposentadoria e pensões",
    href: "/servicos",
    externo: false,
    destaque: false,
  },
  {
    id: "transparencia",
    icon: "ri-eye-line",
    label: "Transparência",
    desc: "Portal da transparência",
    href: "/transparencia",
    externo: false,
    destaque: false,
  },
  {
    id: "formularios",
    icon: "ri-file-list-3-line",
    label: "Formulários",
    desc: "Requerimentos e documentos",
    href: "/formularios",
    externo: false,
    destaque: false,
  },
  {
    id: "noticias",
    icon: "ri-newspaper-line",
    label: "Notícias",
    desc: "Fique por dentro",
    href: "/noticias",
    externo: false,
    destaque: false,
  },
  {
    id: "contato",
    icon: "ri-customer-service-2-line",
    label: "Atendimento",
    desc: "Fale com o INPREC",
    href: "/contato",
    externo: false,
    destaque: false,
  },
];

export default function AcessoRapidoSection() {
  const { config } = useSiteConfig();
  const contrachequeUrl = config.contrachequeUrl || "#";

  return (
    <section className="relative z-20 -mt-6 pb-2 px-4 md:px-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>

          {/* Header strip */}
          <div
            className="hidden md:flex items-center justify-between px-5 py-2"
            style={{ background: `linear-gradient(135deg, ${config.secondaryColor}, ${config.primaryColor})` }}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-flashlight-line text-xs text-white/80"></i>
              </div>
              <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">Acesso Rápido</span>
            </div>
            <Link
              to="/servicos"
              className="text-[11px] font-medium text-white/75 hover:text-white transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
            >
              Ver todos os serviços
              <i className="ri-arrow-right-line text-xs"></i>
            </Link>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-gray-100">
            {acessos.map((item) => {
              const isContracheque = item.id === "contracheque";
              const href = isContracheque ? contrachequeUrl : item.href;
              const isExterno = isContracheque && !!contrachequeUrl && contrachequeUrl !== "#";

              const inner = (
                <div
                  className={`flex flex-col items-center gap-1.5 py-4 px-2 cursor-pointer transition-all duration-300 group relative ${
                    item.destaque ? "hover:bg-green-50" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Barra colorida no hover */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: config.primaryColor }}
                  ></div>

                  {/* Ícone */}
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: item.destaque
                        ? `${config.primaryColor}18`
                        : `${config.primaryColor}0f`,
                    }}
                  >
                    <i
                      className={`${item.icon} text-lg transition-colors duration-300`}
                      style={{ color: config.primaryColor }}
                    ></i>
                  </div>

                  {/* Texto */}
                  <div className="text-center">
                    <p
                      className="text-xs font-bold leading-tight transition-colors duration-300"
                      style={{ color: config.secondaryColor, fontFamily: "'Poppins', sans-serif" }}
                    >
                      {item.label}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                      {item.desc}
                    </p>
                  </div>

                  {/* Badge externo */}
                  {isExterno && (
                    <div
                      className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: `${config.primaryColor}20` }}
                    >
                      <i className="ri-external-link-line text-[8px]" style={{ color: config.primaryColor }}></i>
                    </div>
                  )}
                </div>
              );

              if (isExterno) {
                return (
                  <a
                    key={item.id}
                    href={href}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                  >
                    {inner}
                  </a>
                );
              }

              return (
                <Link key={item.id} to={href}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
