import { useSiteConfig } from "@/contexts/SiteConfigContext";

export default function FloatingButtons() {
  const { config } = useSiteConfig();
  return (
    <>
      <div className="fixed bottom-6 right-5 z-50 flex flex-col items-center gap-3">
        <a
          href="https://tawk.to"
          target="_blank"
          rel="nofollow noopener noreferrer"
          title="Chat Online"
          className="w-12 h-12 flex items-center justify-center rounded-full shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer"
          style={{ backgroundColor: config.primaryColor }}
        >
          <i className="ri-message-3-line text-white text-xl"></i>
        </a>
        <a
          href={`https://wa.me/${config.whatsapp || "5500900000000"}`}
          target="_blank"
          rel="nofollow noopener noreferrer"
          title="WhatsApp"
          className="w-14 h-14 flex items-center justify-center rounded-full bg-[#25D366] shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer relative"
        >
          <i className="ri-whatsapp-line text-white text-2xl"></i>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white animate-pulse"></span>
        </a>
      </div>

      <div className="fixed bottom-6 left-5 z-50">
        <button
          title="Pesquisa de Satisfação"
          className="w-12 h-12 flex items-center justify-center rounded-xl shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer group relative"
          style={{ backgroundColor: config.primaryColor }}
        >
          <i className="ri-survey-line text-white text-xl"></i>
          <span className="absolute left-14 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ backgroundColor: config.secondaryColor }}>
            Pesquisa de Satisfação
          </span>
        </button>
      </div>
    </>
  );
}
