import { Link } from "react-router-dom";
import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

export default function Footer() {
  const { config } = useSiteConfig();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  return (
    <footer className="pt-10 pb-0 overflow-hidden" style={{ backgroundColor: config.secondaryColor }}>
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          {/* Col 1 */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="https://static.readdy.ai/image/98faa14093f63576e4d8e45c39fe43a1/863ae8a17b884627cb5c23d8e0f4e88d.png"
                alt="Logo INPREC"
                className="w-8 h-8 object-contain brightness-0 invert"
              />
              <span className="text-white font-bold text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>{config.siteName}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-2">
              {config.sloganLogo || "Cuidando do Futuro de Quem Cuida da Cidade"}
            </p>
            <p className="text-gray-500 text-xs leading-relaxed mb-5">
              Instituto de Previdência Social dos Servidores Públicos Municipais de Cujubim — RO
            </p>
            <div className="flex items-center gap-3">
              {["ri-facebook-fill","ri-instagram-line","ri-twitter-x-line","ri-linkedin-fill"].map((ic) => (
                <a key={ic} href="#" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white transition-all duration-200 cursor-pointer" style={{ }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = config.primaryColor)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}>
                  <i className={`${ic} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Newsletter */}
          <div>
            <div className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-4">Newsletter</div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">Receba notícias e atualizações do INPREC diretamente no seu e-mail.</p>
            {subscribed ? (
              <p className="text-sm font-medium" style={{ color: config.primaryColor }}>Inscrito com sucesso!</p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex items-center border-b border-white/20 pb-2">
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
          </div>

          {/* Col 3: Links */}
          <div>
            <div className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-4">Links Rápidos</div>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "Quem Somos", href: "/quem-somos" },
                { label: "Serviços", href: "/servicos" },
                { label: "Notícias", href: "/noticias" },
                { label: "Transparência", href: "/transparencia" },
                { label: "Pró-Gestão RPPS", href: "/pro-gestao" },
                { label: "Contato", href: "/contato" },
              ].map((l) => (
                <Link key={l.href} to={l.href} className="text-gray-400 hover:text-white text-sm transition-colors duration-200 cursor-pointer">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Col 4: Contact */}
          <div>
            <div className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-4">Contato</div>
            <div className="flex flex-col gap-3">
              {[
                { ic: "ri-map-pin-line", text: config.endereco || "Av. Condor, n° 2588 Centro, CEP: 76.864-000" },
                { ic: "ri-phone-line", text: config.telefone || "(69) 99250-9093" },
                { ic: "ri-mail-line", text: config.email || "inprec@cujubim.ro.gov.br" },
                { ic: "ri-time-line", text: config.horario || "De Segunda a Sexta, das 07:30h às 13:30h" },
              ].map((c) => (
                <div key={c.text} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className={`${c.ic} text-sm`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <span className="text-gray-400 text-sm">{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-5">
          <p className="text-gray-500 text-xs">© 2026 {config.siteName}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-5">
            <Link to="/lgpd" className="text-gray-500 hover:text-white text-xs transition-colors cursor-pointer">LGPD / Privacidade</Link>
            <a href="#" className="text-gray-500 hover:text-white text-xs transition-colors cursor-pointer">Termos de Uso</a>
          </div>
        </div>

        <div className="text-center overflow-hidden select-none pointer-events-none">
          <span
            className="text-[8rem] md:text-[10rem] font-extrabold leading-none tracking-tighter block"
            style={{ fontFamily: "'Poppins', sans-serif", color: `${config.primaryColor}20` }}
          >
            INPREC
          </span>
        </div>
      </div>
    </footer>
  );
}
