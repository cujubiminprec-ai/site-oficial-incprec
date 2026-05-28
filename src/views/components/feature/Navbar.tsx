import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { MenuItem, defaultMenuItems } from "@/pages/admin/tabs/MenuNavegacaoTab";
import { menuService } from "@/services/menu.service";
import ProGestaoBadge, { hasProGestaoLocation } from "@/components/feature/ProGestaoBadge";
import SearchOverlay from "@/components/feature/SearchOverlay";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [navItems, setNavItems] = useState<MenuItem[]>(() => defaultMenuItems.filter((m) => m.ativo));
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { config } = useSiteConfig();
  const contrachequeUrl = config.contrachequeUrl || "";
  const redes = {
    facebook: config.redeFacebook || "",
    instagram: config.redeInstagram || "",
    youtube: config.redeYoutube || "",
    linkedin: config.redeLinkedin || "",
  };
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [megaOpen, setMegaOpen] = useState(false);

  useEffect(() => {
    menuService
      .listarPublico()
      .then((loaded) => {
        const filtered = loaded.filter((m) => m.ativo);
        setNavItems(filtered.length > 0 ? filtered : defaultMenuItems.filter((m) => m.ativo));
      })
      .catch(() => {
        setNavItems(defaultMenuItems.filter((m) => m.ativo));
      });
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setActiveDropdown(null);
    setMegaOpen(false);
  }, [location]);

  // Ctrl+K / Cmd+K abre a busca
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 180);
  };

  const isActive = (item: MenuItem): boolean => {
    if (item.href) return location.pathname === item.href;
    if (item.children)
      return item.children.some((c) =>
        location.pathname.startsWith(c.href.split("#")[0].split("?")[0])
      );
    return false;
  };

  const textColor = "text-[#243041]";
  const activeTextColor = "";

  // Menus com sub-itens (para o mega menu)
  const allMenusWithChildren = navItems.filter((m) => m.children && m.children.length > 0);
  // Menus sem sub-itens (links diretos)
  const directLinks = navItems.filter((m) => m.href && !m.children);

  const renderChildLink = (
    child: MenuItem["children"] extends (infer T)[] ? T : never,
    menuId: string
  ) => {
    if (!child || child.ativo === false) return null;
    const isContracheque = child.href === "#contracheque";
    if (isContracheque) {
      return contrachequeUrl ? (
        <a
          key={child.id}
          href={contrachequeUrl}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[#243041] hover:text-[#007a3d] hover:bg-[#eaf7ef] transition-colors cursor-pointer group/item"
        >
          {child.icon && (
            <div
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 flex-shrink-0 group-hover/item:bg-white"
              style={{ backgroundColor: `${config.primaryColor}15` }}
            >
              <i className={`${child.icon} text-xs`} style={{ color: config.primaryColor }}></i>
            </div>
          )}
          <span className="text-xs font-semibold leading-tight whitespace-normal">{child.label}</span>
        </a>
      ) : null;
    }
    return (
      <Link
        key={child.id}
        to={child.href}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[#243041] hover:text-[#007a3d] hover:bg-[#eaf7ef] transition-colors cursor-pointer group/item"
      >
        {child.icon && (
          <div
            className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 group-hover/item:bg-white"
            style={{ backgroundColor: `${config.primaryColor}15` }}
          >
            <i className={`${child.icon} text-xs`} style={{ color: config.primaryColor }}></i>
          </div>
        )}
        <span className="text-xs font-semibold leading-tight whitespace-normal">{child.label}</span>
      </Link>
    );
  };

  const hasRedes =
    config.topbarRedesVisivel && (redes.facebook || redes.instagram || redes.youtube || redes.linkedin);
  const showTopbar =
    config.topbarVisivel &&
    ((config.topbarEmailVisivel && config.email) ||
      (config.topbarTelefoneVisivel && config.telefone) ||
      hasRedes ||
      config.topbarMapaSiteVisivel);

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-500 ${
        scrolled ? "border-gray-100 shadow-[0_4px_18px_rgba(0,0,0,0.08)]" : "border-white/70 shadow-[0_4px_18px_rgba(0,0,0,0.06)]"
      }`}
    >
      {/* Barra Superior */}
      {showTopbar && !scrolled && (
        <div
          className="w-full hidden md:flex items-center justify-between px-6 py-1.5 text-xs"
          style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        >
          {/* Esquerda: email e telefone */}
          <div className="flex items-center gap-4">
            {config.topbarEmailVisivel && config.email && (
              <a
                href={`mailto:${config.email}`}
                className="flex items-center gap-1.5 text-white/85 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-mail-line text-xs"></i>
                </div>
                <span>{config.email}</span>
              </a>
            )}
            {config.topbarTelefoneVisivel && config.telefone && (
              <a
                href={`tel:${config.telefone}`}
                className="flex items-center gap-1.5 text-white/85 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-phone-line text-xs"></i>
                </div>
                <span>{config.telefone}</span>
              </a>
            )}
          </div>

          {/* Direita: redes sociais + mapa do site */}
          <div className="flex items-center gap-3">
            {hasRedes && (
              <div className="flex items-center gap-2">
                {redes.facebook && (
                  <a
                    href={redes.facebook}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="w-6 h-6 flex items-center justify-center rounded text-white/75 hover:text-white transition-colors cursor-pointer"
                  >
                    <i className="ri-facebook-fill text-sm"></i>
                  </a>
                )}
                {redes.instagram && (
                  <a
                    href={redes.instagram}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="w-6 h-6 flex items-center justify-center rounded text-white/75 hover:text-white transition-colors cursor-pointer"
                  >
                    <i className="ri-instagram-line text-sm"></i>
                  </a>
                )}
                {redes.youtube && (
                  <a
                    href={redes.youtube}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="w-6 h-6 flex items-center justify-center rounded text-white/75 hover:text-white transition-colors cursor-pointer"
                  >
                    <i className="ri-youtube-fill text-sm"></i>
                  </a>
                )}
                {redes.linkedin && (
                  <a
                    href={redes.linkedin}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="w-6 h-6 flex items-center justify-center rounded text-white/75 hover:text-white transition-colors cursor-pointer"
                  >
                    <i className="ri-linkedin-fill text-sm"></i>
                  </a>
                )}
              </div>
            )}
            {hasRedes && config.topbarMapaSiteVisivel && <div className="w-px h-3 bg-white/30"></div>}
            {config.topbarMapaSiteVisivel && (
              <Link
                to="/mapa-do-site"
                className="flex items-center gap-1.5 text-white/75 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-map-2-line text-xs"></i>
                </div>
                <span>Mapa do Site</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Topbar scrolled (fundo branco) */}
      {showTopbar && scrolled && (
        <div
          className="w-full hidden md:flex items-center justify-between px-6 py-1.5 text-xs border-b"
          style={{ backgroundColor: "#f9fafb", borderColor: "#f0f0f0" }}
        >
          <div className="flex items-center gap-4">
            {config.topbarEmailVisivel && config.email && (
              <a
                href={`mailto:${config.email}`}
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-mail-line text-xs" style={{ color: config.primaryColor }}></i>
                </div>
                <span>{config.email}</span>
              </a>
            )}
            {config.topbarTelefoneVisivel && config.telefone && (
              <a
                href={`tel:${config.telefone}`}
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-phone-line text-xs" style={{ color: config.primaryColor }}></i>
                </div>
                <span>{config.telefone}</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            {hasRedes && (
              <div className="flex items-center gap-1.5">
                {redes.facebook && (
                  <a
                    href={redes.facebook}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    <i className="ri-facebook-fill text-sm"></i>
                  </a>
                )}
                {redes.instagram && (
                  <a
                    href={redes.instagram}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    <i className="ri-instagram-line text-sm"></i>
                  </a>
                )}
                {redes.youtube && (
                  <a
                    href={redes.youtube}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    <i className="ri-youtube-fill text-sm"></i>
                  </a>
                )}
                {redes.linkedin && (
                  <a
                    href={redes.linkedin}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    <i className="ri-linkedin-fill text-sm"></i>
                  </a>
                )}
              </div>
            )}
            {hasRedes && config.topbarMapaSiteVisivel && <div className="w-px h-3 bg-gray-200"></div>}
            {config.topbarMapaSiteVisivel && (
              <Link
                to="/mapa-do-site"
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-map-2-line text-xs" style={{ color: config.primaryColor }}></i>
                </div>
                <span>Mapa do Site</span>
              </Link>
            )}
          </div>
        </div>
      )}

      <nav className="w-full px-4 md:px-6 flex items-center justify-between h-[72px] md:h-[84px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer flex-shrink-0">
          {/* Logo image (custom ou padrão) */}
          {config.logoImageUrl && (
            <div className="h-8 md:h-10 flex items-center flex-shrink-0">
              <img
                src={config.logoImageUrl}
                alt={`Logo ${config.siteName}`}
                className="h-8 md:h-10 w-auto object-contain transition-all duration-300"
              />
            </div>
          )}

          <div className="flex flex-col leading-none">
            {/* Slogan como imagem (se configurado e visível na navbar) */}
            {config.sloganImageUrl && config.sloganImageVisivel && config.sloganImageLocal?.includes("navbar") ? (
              <img
                src={config.sloganImageUrl}
                alt={`Slogan ${config.siteName}`}
                className="h-6 md:h-8 w-auto object-contain transition-all duration-300"
                style={{ maxWidth: "200px" }}
              />
            ) : (
              <>
                <span
                  className="hidden sm:block text-[7px] md:text-[8px] font-semibold tracking-wide text-gray-500 transition-colors duration-300 leading-tight mb-0.5"
                  style={{ maxWidth: "180px" }}
                >
                  Instituto de Previdência Social dos Servidores Públicos Municipais de Cujubim
                </span>
                <span
                  className="font-extrabold text-sm md:text-base tracking-tight text-[#14532D] transition-colors duration-300 leading-none"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {config.siteName}
                </span>
                {config.sloganLogo && (
                  <span
                    className="hidden sm:block text-[7px] md:text-[8px] italic font-semibold mt-0.5 text-green-700 transition-colors duration-300"
                    style={{ maxWidth: "180px" }}
                  >
                    {config.sloganLogo}
                  </span>
                )}
              </>
            )}
          </div>
        </Link>

        {hasProGestaoLocation(config, "navbar") && (
          <div className="hidden md:flex ml-2 flex-shrink-0 group">
            <ProGestaoBadge config={config} variant="navbar" />
          </div>
        )}

        {/* Desktop Nav — links diretos */}
        <div className="hidden xl:flex items-center gap-1.5 2xl:gap-2 flex-1 justify-center" ref={dropdownRef}>
          {/* Links diretos (sem dropdown) */}
          {directLinks.map((item) => (
            <Link
              key={item.id}
              to={item.href!}
              className={`relative flex items-center gap-1 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                isActive(item)
                  ? `${activeTextColor} bg-[#eaf7ef] shadow-sm after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-[#008542]`
                  : `${textColor} hover:bg-[#eaf7ef] hover:text-[#007a3d]`
              }`}
              style={isActive(item) ? { color: config.primaryColor } : {}}
            >
              {item.label}
            </Link>
          ))}

          {/* Menus com dropdown normal (individual) */}
          {allMenusWithChildren.map((item) => (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => handleMouseEnter(item.id)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`relative flex items-center gap-1 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive(item)
                    ? `${activeTextColor} bg-[#eaf7ef] shadow-sm after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-[#008542]`
                    : `${textColor} hover:bg-[#eaf7ef] hover:text-[#007a3d]`
                }`}
                style={isActive(item) ? { color: config.primaryColor } : {}}
              >
                {item.label}
                <i
                  className={`ri-arrow-down-s-line text-xs transition-transform duration-200 ${
                    activeDropdown === item.id ? "rotate-180" : ""
                  }`}
                ></i>
              </button>

              {activeDropdown === item.id && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-xl border border-gray-100 py-2.5 z-50"
                  style={{
                    boxShadow: "0 16px 40px rgba(15,23,42,0.14)",
                    minWidth: "260px",
                    width: item.children && item.children.length > 6 ? "320px" : "260px",
                    maxWidth: "calc(100vw - 32px)",
                  }}
                  onMouseEnter={() => handleMouseEnter(item.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Header do dropdown */}
                  <div className="px-4 py-2 mb-1 border-b border-gray-50">
                    <p
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: config.primaryColor }}
                    >
                      {item.label}
                    </p>
                  </div>
                  <div className="px-2 flex flex-col gap-0.5">
                    {item.children?.filter((c) => c.ativo).map((child) => renderChildLink(child, item.id))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Botão "Todos os Menus" — mega menu */}
          <div
            className="relative"
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setMegaOpen(true);
            }}
            onMouseLeave={() => {
              timeoutRef.current = setTimeout(() => setMegaOpen(false), 180);
            }}
          >
            <button
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-[13px] font-bold text-[#243041] transition-all duration-200 whitespace-nowrap cursor-pointer hover:bg-[#eaf7ef] hover:text-[#007a3d]"
            >
              <i className="ri-apps-2-line text-xs"></i>
              Todos
              <i
                className={`ri-arrow-down-s-line text-xs transition-transform duration-200 ${
                  megaOpen ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            {megaOpen && (
              <div
                className="absolute top-full right-0 mt-3 bg-white rounded-xl border border-gray-100 z-50 py-4"
                style={{
                  boxShadow: "0 18px 50px rgba(15,23,42,0.16)",
                  width: "820px",
                  maxWidth: "calc(100vw - 32px)",
                  maxHeight: "80vh",
                  overflowY: "auto",
                }}
                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  setMegaOpen(true);
                }}
                onMouseLeave={() => {
                  timeoutRef.current = setTimeout(() => setMegaOpen(false), 180);
                }}
              >
                <div className="px-5 pb-3 border-b border-gray-100 mb-3">
                  <p className="text-xs font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Navegação Completa
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Acesse todos os menus e seções do site
                  </p>
                </div>

                <div className="px-4 grid grid-cols-3 gap-5">
                  {navItems.map((item) => (
                    <div key={item.id}>
                      {item.href && !item.children ? (
                        <Link
                          to={item.href}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-[#eaf7ef] transition-colors cursor-pointer"
                        >
                          <div
                            className="w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0"
                            style={{ backgroundColor: `${config.primaryColor}15` }}
                          >
                            <i className="ri-home-4-line text-xs" style={{ color: config.primaryColor }}></i>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: config.secondaryColor }}>
                            {item.label}
                          </span>
                        </Link>
                      ) : (
                        <div>
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider px-3 mb-1.5"
                            style={{ color: config.primaryColor }}
                          >
                            {item.label}
                          </p>
                          <div className="flex flex-col gap-0.5">
                            {item.children?.filter((c) => c.ativo).map((child) => renderChildLink(child, item.id))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="px-5 pt-3 mt-2 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-[10px] text-gray-400">
                    {navItems.reduce(
                      (acc, m) => acc + (m.children?.filter((c) => c.ativo).length || 0),
                      0
                    )}{" "}
                    links disponíveis
                  </p>
                  <Link
                    to="/admin/login"
                    className="text-[10px] font-medium cursor-pointer transition-colors"
                    style={{ color: config.primaryColor }}
                  >
                    Área Admin <i className="ri-arrow-right-line text-[10px]"></i>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botões direita desktop */}
        <div className="hidden xl:flex items-center gap-2 flex-shrink-0">
          {/* Botão Pesquisar */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200 cursor-pointer border"
            style={{ borderColor: "#E5E7EB", color: "#6B7280", backgroundColor: "white" }}
            title="Pesquisar (Ctrl+K)"
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = config.primaryColor; (e.currentTarget as HTMLButtonElement).style.color = config.primaryColor; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLButtonElement).style.color = "#6B7280"; }}
          >
            <i className="ri-search-line text-sm"></i>
            <span className="hidden 2xl:inline">Pesquisar</span>
            <kbd className="hidden 2xl:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-400 text-[10px] font-mono ml-1">
              Ctrl K
            </kbd>
          </button>

          <Link
            to="/admin/login"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-300 border shadow-sm"
            style={
              { borderColor: config.primaryColor, color: config.primaryColor, backgroundColor: "white" }
            }
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = config.primaryColor;
              (e.currentTarget as HTMLAnchorElement).style.color = "white";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "white";
              (e.currentTarget as HTMLAnchorElement).style.color = config.primaryColor;
            }}
          >
            <i className="ri-lock-line text-xs"></i>
            <span className="hidden xl:inline">Área Admin</span>
          </Link>
        </div>

        {/* Mobile: Busca + Hamburger */}
        <div className="xl:hidden flex items-center gap-1">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
            style={{ color: config.primaryColor }}
            onClick={() => setSearchOpen(true)}
            aria-label="Pesquisar"
          >
            <i className="ri-search-line text-xl"></i>
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[#243041] hover:bg-[#eaf7ef] cursor-pointer transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <i className={`text-xl ${menuOpen ? "ri-close-line" : "ri-menu-line"}`}></i>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`xl:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-[85vh] opacity-100 overflow-y-auto" : "max-h-0 opacity-0"
        } bg-white border-b border-gray-100 shadow-[0_12px_30px_rgba(15,23,42,0.10)]`}
      >
        <div className="px-4 py-3 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <div key={item.id}>
              {item.href && !item.children ? (
                <Link
                  to={item.href}
                  className="flex items-center py-3 px-3 rounded-lg text-sm font-semibold text-[#243041] hover:bg-[#eaf7ef] cursor-pointer"
                  style={location.pathname === item.href ? { color: config.primaryColor } : {}}
                >
                  {item.label}
                </Link>
              ) : (
                <>
                  <button
                    className="w-full flex items-center justify-between py-3 px-3 rounded-lg text-sm font-semibold text-[#243041] hover:bg-[#eaf7ef] cursor-pointer"
                    onClick={() => setMobileExpanded(mobileExpanded === item.id ? null : item.id)}
                  >
                    {item.label}
                    <i
                      className={`ri-arrow-down-s-line transition-transform duration-200 ${
                        mobileExpanded === item.id ? "rotate-180" : ""
                      }`}
                    ></i>
                  </button>
                  {mobileExpanded === item.id && item.children && (
                    <div className="ml-4 flex flex-col border-l border-gray-100 mb-2">
                      {item.children
                        .filter((c) => c.ativo)
                        .map((child) => {
                          const isContracheque = child.href === "#contracheque";
                          const ccUrl = contrachequeUrl;
                          if (isContracheque) {
                            return ccUrl ? (
                              <a
                                key={child.id}
                                href={ccUrl}
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                                className="flex items-center gap-2 py-2.5 pl-4 pr-3 rounded-r-lg text-sm font-medium text-gray-600 hover:text-[#007a3d] hover:bg-[#eaf7ef] cursor-pointer"
                              >
                                {child.icon && (
                                  <i
                                    className={`${child.icon} text-sm flex-shrink-0`}
                                    style={{ color: config.primaryColor }}
                                  ></i>
                                )}
                                <span className="whitespace-normal">{child.label}</span>
                              </a>
                            ) : null;
                          }
                          return (
                            <Link
                              key={child.id}
                              to={child.href}
                              className="flex items-center gap-2 py-2.5 pl-4 pr-3 rounded-r-lg text-sm font-medium text-gray-600 hover:text-[#007a3d] hover:bg-[#eaf7ef] cursor-pointer"
                            >
                              {child.icon && (
                                <i
                                  className={`${child.icon} text-sm flex-shrink-0`}
                                  style={{ color: config.primaryColor }}
                                ></i>
                              )}
                              <span className="whitespace-normal">{child.label}</span>
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          <div className="flex gap-2 mt-2 px-3 pb-2">
            <Link
              to="/admin/login"
              className="flex-1 py-2.5 px-4 rounded-full text-sm font-semibold text-center text-white cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: config.primaryColor }}
            >
              Área Admin
            </Link>
          </div>
        </div>
      </div>
    </header>

    <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
