import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function FormulariosPage() {
  const { config } = useSiteConfig();
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });
  const whatsappDigits = (config.whatsapp || "").replace(/\D/g, "");
  const whatsappUrl = whatsappDigits ? `https://wa.me/55${whatsappDigits}` : "/contato";

  return (
    <PageLayout>
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        className={`pt-32 pb-20 px-4 relative overflow-hidden transition-all duration-700 ${heroVisible ? "opacity-100" : "opacity-0"}`}
        style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-16 w-72 h-72 rounded-full border border-white/10"></div>
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full border border-white/10"></div>
        </div>
        <div className="max-w-screen-xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-5">
            <i className="ri-file-list-3-line"></i>Documentos &amp; Requerimentos
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Formularios</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Os formularios e requerimentos oficiais do INPREC estarao disponiveis em breve.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: `${config.primaryColor}15` }}>
              <i className="ri-time-line text-3xl" style={{ color: config.primaryColor }}></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Conteudo em breve
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto">
              Esta area esta sendo organizada para receber apenas documentos oficiais e atualizados. Enquanto os formularios nao estiverem publicados, solicite orientacao pelos canais de atendimento do INPREC.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
              <a href="/ouvidoria" className="rounded-2xl border border-gray-100 p-4 hover:border-gray-200 transition-colors">
                <i className="ri-speak-line text-2xl" style={{ color: config.primaryColor }}></i>
                <p className="text-sm font-bold text-gray-900 mt-2">Ouvidoria</p>
                <p className="text-xs text-gray-400 mt-1">Envie sua solicitacao</p>
              </a>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-gray-100 p-4 hover:border-gray-200 transition-colors">
                <i className="ri-whatsapp-line text-2xl" style={{ color: config.primaryColor }}></i>
                <p className="text-sm font-bold text-gray-900 mt-2">WhatsApp</p>
                <p className="text-xs text-gray-400 mt-1">{config.whatsapp}</p>
              </a>
              <a href="/contato" className="rounded-2xl border border-gray-100 p-4 hover:border-gray-200 transition-colors">
                <i className="ri-mail-line text-2xl" style={{ color: config.primaryColor }}></i>
                <p className="text-sm font-bold text-gray-900 mt-2">Contato</p>
                <p className="text-xs text-gray-400 mt-1">{config.email}</p>
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
