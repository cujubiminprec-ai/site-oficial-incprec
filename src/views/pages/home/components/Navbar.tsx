import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Quem Somos", href: "/quem-somos" },
  { label: "Serviços", href: "/servicos" },
  { label: "Notícias", href: "/noticias" },
  { label: "Transparência", href: "/transparencia" },
  { label: "Contato", href: "/contato" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-500 ${
        scrolled ? "border-gray-100 shadow-[0_4px_18px_rgba(0,0,0,0.08)]" : "border-white/70 shadow-[0_4px_18px_rgba(0,0,0,0.06)]"
      }`}
    >
      <nav className="home-navbar-frame relative mx-auto px-4 md:px-6 flex items-center justify-between h-[60px] md:h-[68px] overflow-hidden">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer min-w-0">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#008542] shadow-sm">
            <i className="ri-government-line text-white text-base"></i>
          </div>
          <span
            className="font-bold text-lg tracking-tight text-[#14532D] transition-colors duration-300"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            INPREC
          </span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className={`relative px-3 py-2 rounded-lg text-[13px] font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  location.pathname === link.href
                    ? "text-[#008542] bg-[#eaf7ef] shadow-sm after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#008542]"
                    : "text-[#243041] hover:text-[#007a3d] hover:bg-[#eaf7ef]"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Admin Button */}
        <Link
          to="/admin/login"
          className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap cursor-pointer transition-all duration-300 border border-[#008542] text-[#008542] bg-white shadow-sm hover:bg-[#008542] hover:text-white"
        >
          <i className="ri-lock-line text-[10px]"></i>
          Admin
        </Link>

        {/* Mobile Hamburger */}
        <button
          className="fixed right-4 top-4 lg:static lg:translate-y-0 lg:hidden w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg text-[#243041] hover:bg-[#eaf7ef] cursor-pointer transition-colors duration-300"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <i className={`text-xl ${menuOpen ? "ri-close-line" : "ri-menu-line"}`}></i>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-[80vh] opacity-100 overflow-y-auto" : "max-h-0 opacity-0"
        } bg-white border-b border-gray-100 shadow-[0_12px_30px_rgba(15,23,42,0.10)]`}
      >
        <div className="px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMenuOpen(false)}
              className={`py-3 px-3 rounded-lg text-sm font-semibold border-b border-gray-50 last:border-0 cursor-pointer ${
                location.pathname === link.href ? "text-[#008542] bg-[#eaf7ef]" : "text-[#243041] hover:bg-[#eaf7ef]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin/login"
            onClick={() => setMenuOpen(false)}
            className="mt-3 py-3 px-5 rounded-full text-sm font-bold text-center bg-[#008542] text-white cursor-pointer whitespace-nowrap"
          >
            Painel Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
