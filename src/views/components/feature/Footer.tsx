import { Link } from "react-router-dom";
import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import ProGestaoBadge, { hasProGestaoLocation } from "@/components/feature/ProGestaoBadge";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { config } = useSiteConfig();
  const contrachequeUrl = config.contrachequeUrl || "";

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  return (
    <footer style={{ backgroundColor: "#0F0022" }} className="pt-16 pb-0 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1 */}
          <div>
            <div className="flex items-start gap-2.5 mb-4">
              {/* Logo no footer */}
              {config.logoImageUrl ? (
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                  <img
                    src={config.logoImageUrl}
                    alt={`Logo ${config.siteName}`}
                    className="w-10 h-10 object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: config.primaryColor }}>
                  <i className={`${config.logoIcon} text-white text-sm`}></i>
                </div>
              )}
              <div>
                {/* Slogan como imagem no footer */}
                {config.sloganImageUrl && config.sloganImageVisivel && config.sloganImageLocal?.includes("footer") ? (
                  <img
                    src={config.sloganImageUrl}
                    alt={`Slogan ${config.siteName}`}
                    className="h-8 w-auto object-contain mb-1 brightness-0 invert opacity-90"
                    style={{ maxWidth: "160px" }}
                  />
                ) : (
                  <>
                    <span className="text-white font-bold text-base" style={{ fontFamily: "'Poppins', sans-serif" }}>{config.siteName}</span>
                    <p className="text-white/40 text-[10px]">{config.siteSlogan}</p>
                  </>
                )}
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Instituto dedicado ao fortalecimento da gestão pública com transparência, inovação e excelência no atendimento ao cidadão.
            </p>
            <div className="flex items-center gap-3">
              {["ri-facebook-fill","ri-instagram-line","ri-twitter-x-line","ri-linkedin-fill","ri-youtube-line"].map((ic) => (
                <a key={ic} href="#" rel="nofollow" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all duration-200 cursor-pointer">
                  <i className={`${ic} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <div className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-4">Navegação</div>
            <div className="flex flex-col gap-2">
              {[
                { label: "Quem Somos", href: "/quem-somos" },
                { label: "Serviços", href: "/servicos" },
                { label: "Notícias", href: "/noticias" },
                { label: "Transparência", href: "/transparencia" },
                { label: "LAI", href: "/lai" },
                { label: "Ouvidoria", href: "/ouvidoria" },
                { label: "Perguntas Frequentes", href: "/perguntas-frequentes" },
                { label: "Contato", href: "/contato" },
              ].map((l) => (
                <Link key={l.href} to={l.href} className="text-gray-400 hover:text-white text-sm transition-colors duration-200 cursor-pointer">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Col 3 */}
          <div>
            <div className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-4">Newsletter</div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">Receba notícias e atualizações do {config.siteName} diretamente no seu e-mail.</p>
            {subscribed ? (
              <p className="text-green-400 text-sm font-medium">Inscrito com sucesso!</p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex items-center border-b border-white/20 pb-2 mb-5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
                />
                <button type="submit" className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer">
                  <i className="ri-arrow-right-line"></i>
                </button>
              </form>
            )}
            <div className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-3 mt-2">Transparência</div>
            <div className="flex flex-col gap-2">
              {[
                { label: "Portal da Transparência", href: "/transparencia" },
                { label: "LAI – Acesso à Informação", href: "/lai" },
                { label: "Relatórios Financeiros", href: "/transparencia#relatorios" },
              ].map((l) => (
                <Link key={l.label} to={l.href} className="text-gray-400 hover:text-white text-sm transition-colors duration-200 cursor-pointer">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <div className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-4">Contato</div>
            <div className="flex flex-col gap-3">
              {[
                { ic: "ri-map-pin-line", text: config.endereco },
                { ic: "ri-phone-line", text: config.telefone },
                { ic: "ri-mail-line", text: config.email },
                { ic: "ri-time-line", text: "Seg–Sex: 8h às 17h" },
              ].map((c) => (
                <div key={c.text} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className={`${c.ic} text-sm`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <span className="text-gray-400 text-sm">{c.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/50 text-xs mb-2 font-medium">Acesso Rápido</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Ouvidoria", href: "/ouvidoria" },
                  { label: "Pesquisa", href: "/pesquisa-satisfacao" },
                  { label: "FAQ", href: "/perguntas-frequentes" },
                  { label: "Previdência", href: "/previdencia" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                ))}
                {contrachequeUrl && (
                  <a
                    href={contrachequeUrl}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 hover:text-white hover:bg-green-500/40 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                  >
                    <i className="ri-file-text-line text-[10px]"></i> Contracheque
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selos e certificações */}
        <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-b border-white/10">
          <p className="text-white/40 text-xs font-semibold tracking-widest uppercase">Certificações e Selos</p>
          <div className="flex flex-wrap items-center gap-4">
            {hasProGestaoLocation(config, "footer") && <ProGestaoBadge config={config} variant="footer" />}
            {/* Acesso Gov.br */}
            <a
              href="https://www.gov.br/previdencia"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/8 border border-white/15 hover:bg-white/15 transition-all cursor-pointer group"
              title="Ministério da Previdência Social"
            >
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1A5276] flex-shrink-0">
                <i className="ri-government-line text-white text-lg"></i>
              </div>
              <div>
                <p className="text-white text-xs font-bold leading-tight group-hover:text-white/80 transition-colors">Gov.br / MPS</p>
                <p className="text-white/40 text-[10px]">Ministério da Previdência</p>
              </div>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-5">
          <p className="text-gray-500 text-xs">© 2026 {config.siteName}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-5">
            <Link to="/politica-de-privacidade" className="text-gray-500 hover:text-white text-xs transition-colors cursor-pointer">Política de Privacidade</Link>
            <Link to="/termos-de-uso" className="text-gray-500 hover:text-white text-xs transition-colors cursor-pointer">Termos de Uso</Link>
            <Link to="/admin/login" className="text-gray-500 hover:text-white text-xs transition-colors cursor-pointer">Admin</Link>
          </div>
        </div>

        <div className="text-center overflow-hidden select-none pointer-events-none">
          <span className="text-[8rem] md:text-[12rem] font-extrabold leading-none tracking-tighter block"
            style={{ color: `${config.primaryColor}20`, fontFamily: "'Poppins', sans-serif" }}>
            {config.siteName}
          </span>
        </div>
      </div>
    </footer>
  );
}
