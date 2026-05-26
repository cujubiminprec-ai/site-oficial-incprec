import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { slides as slidesMock } from "@/mocks/slides";
import { slidesAdminDefault, SlideAdmin } from "@/mocks/slides-admin";
import { conteudoService } from "@/services/conteudo.service";

type SlideDisplay = {
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
  use_tint?: boolean;
  show_content?: boolean;
  ordem?: number;
  ativo?: boolean;
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1920&h=900";
function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:");
}

function getSlideAction(slide: SlideDisplay) {
  if (slide.cta_type === "none") return "";
  return (slide.cta_type === "pdf" || slide.cta_type === "ppt") && slide.pdf_url ? slide.pdf_url : slide.cta_url;
}

function SlideActionButton({ slide }: { slide: SlideDisplay }) {
  const actionUrl = getSlideAction(slide);
  if (!actionUrl || slide.cta_type === "none") return null;
  const className = "inline-flex w-full max-w-full sm:w-auto items-center justify-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-[13px] transition-all duration-300 cursor-pointer";
  const content = (
    <>
      {slide.cta_label}
      <i className={slide.cta_type === "pdf" ? "ri-file-pdf-2-line text-xs" : slide.cta_type === "ppt" ? "ri-slideshow-2-line text-xs" : "ri-arrow-right-line text-xs"}></i>
    </>
  );

  if (isExternalUrl(actionUrl) || slide.cta_type === "pdf" || slide.cta_type === "ppt") {
    return (
      <a href={actionUrl} target="_blank" rel="noopener noreferrer" className={className} style={{ boxShadow: "0 4px 24px rgba(22,163,74,0.45)" }}>
        {content}
      </a>
    );
  }

  return (
    <Link to={actionUrl} className={className} style={{ boxShadow: "0 4px 24px rgba(22,163,74,0.45)" }}>
      {content}
    </Link>
  );
}

function normalizeSlide(raw: Partial<SlideAdmin & SlideDisplay>, index: number): SlideDisplay {
  const ctaType = raw.cta_type || (raw.pdf_url ? "pdf" : "link");
  const imageUrl = String(raw.image_url || "").trim() || slidesMock[index % slidesMock.length]?.image_url || FALLBACK_IMAGE;

  return {
    id: Number(raw.id || index + 1) || index + 1,
    tag: raw.tag || "",
    titulo: raw.titulo || `Slide ${index + 1}`,
    subtitulo: raw.subtitulo || "",
    cta_label: raw.cta_label || (ctaType === "pdf" ? "Abrir PDF" : ctaType === "ppt" ? "Abrir apresentação" : "Saiba mais"),
    cta_url: raw.cta_url || "/",
    cta_type: ctaType,
    pdf_url: raw.pdf_url || "",
    pdf_name: raw.pdf_name || "",
    image_url: imageUrl,
    ativo: raw.ativo !== false,
    ordem: Number.isFinite(Number(raw.ordem)) ? Number(raw.ordem) : index + 1,
    use_tint: raw.use_tint === true,
    show_content: raw.show_content === true,
  };
}

function loadSlidesFallback(): SlideDisplay[] {
  return slidesMock.map(normalizeSlide).filter((s) => s.ativo !== false).map((s, i) => ({ ...s, ordem: i + 1 }));
}

function slidesSignature(list: SlideDisplay[]) {
  return list.map((s) => [
    s.id,
    s.ordem,
    s.ativo,
    s.tag,
    s.titulo,
    s.subtitulo,
    s.image_url,
    s.cta_type,
    s.cta_url,
    s.pdf_url,
    s.show_content,
  ].join(":")).join("|");
}

export default function HeroSlider() {
  const [slides, setSlides] = useState<SlideDisplay[]>(() => loadSlidesFallback());
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const INTERVAL = 5000;

  useEffect(() => {
    let alive = true;
    const carregar = () => {
      conteudoService
        .listarSlidesPublicos()
        .then((remote) => {
          if (!alive || !Array.isArray(remote) || remote.length === 0) return;
          const next = remote
            .map(normalizeSlide)
            .filter((s) => s.ativo !== false)
            .sort((a, b) => (a.ordem || 0) - (b.ordem || 0) || a.id - b.id)
            .map((s, i) => ({ ...s, ordem: i + 1 }));
          setSlides((prev) => {
            if (slidesSignature(prev) === slidesSignature(next)) return prev;
            setCurrent(0);
            setProgress(0);
            return next;
          });
        })
        .catch(() => {});
    };
    carregar();
    window.addEventListener("inprec-slides-updated", carregar);
    return () => {
      window.removeEventListener("inprec-slides-updated", carregar);
      alive = false;
    };
  }, []);

  const goTo = (idx: number) => {
    setCurrent(idx);
    setProgress(0);
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
      setProgress(0);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    setProgress(0);
    const tick = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / (INTERVAL / 50), 100));
    }, 50);
    return () => clearInterval(tick);
  }, [current]);

  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [current, slides.length]);

  const slide = slides[current];
  const slideActionUrl = getSlideAction(slide);

  return (
    <section className="relative min-h-[500px] h-[80svh] md:h-[680px] overflow-hidden">
      {/* Background Images */}
      {slides.map((s, i) => (
        <div
          key={`${s.id}-${i}-${s.ordem || i + 1}`}
          className={`absolute inset-0 transition-all duration-1000 ${
            i === current ? "opacity-100 scale-100 z-[1]" : "opacity-0 scale-[1.02] z-0 pointer-events-none"
          }`}
        >
          <img
            src={s.image_url}
            alt={s.titulo}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
          {/* Overlay verde — só aparece quando use_tint=true (imagens padrão) */}
          {s.use_tint !== false && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#052e16]/90 via-[#14532D]/65 to-[#15803d]/25"></div>
          )}
          {/* Quando o usuário faz upload da própria foto (use_tint=false), overlay escuro leve para legibilidade */}
          {s.use_tint === false && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10"></div>
          )}
          {/* Overlay de textura sutil — sempre presente */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/35"></div>
        </div>
      ))}

      {/* Decorative elements */}
      <div className="absolute top-32 right-8 w-64 h-64 rounded-full bg-[#16a34a]/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-24 right-32 w-48 h-48 rounded-full bg-[#4ade80]/8 blur-2xl pointer-events-none"></div>

      {slideActionUrl && (
        isExternalUrl(slideActionUrl) || slide.cta_type === "pdf" || slide.cta_type === "ppt" ? (
          <a href={slideActionUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-[2]" aria-label={slide.cta_label || slide.titulo} />
        ) : (
          <Link to={slideActionUrl} className="absolute inset-0 z-[2]" aria-label={slide.cta_label || slide.titulo} />
        )
      )}

      {/* Content — pt calibrado para barra superior + nav + folga */}
      {slide.show_content === true && (
        <div className="relative z-10 h-full w-full max-w-screen-xl mx-auto px-4 md:px-8 flex items-center pt-[80px] sm:pt-[90px] md:pt-[110px] overflow-hidden pointer-events-none">
          <div className="home-hero-content">
          {/* Tag badge */}
          <div className="mb-5 md:mb-6 flex items-center gap-3">
            <span className={`inline-flex max-w-full items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border text-white text-[11px] md:text-xs font-semibold tracking-wider uppercase ${
              slide.tag.includes("NOTÍCIA") ? "bg-blue-500/30 border-blue-500/50" :
              slide.tag.includes("EVENTO") ? "bg-amber-500/30 border-amber-500/50" :
              slide.tag.includes("AUDIÊNCIA") ? "bg-purple-500/30 border-purple-500/50" :
              slide.tag.includes("CURSO") || slide.tag.includes("CAPACITAÇÃO") ? "bg-emerald-500/30 border-emerald-500/50" :
              "bg-[#16a34a]/30 border-[#16a34a]/50"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse inline-block ${
                slide.tag.includes("NOTÍCIA") ? "bg-blue-400" :
                slide.tag.includes("EVENTO") ? "bg-amber-400" :
                slide.tag.includes("AUDIÊNCIA") ? "bg-purple-400" :
                slide.tag.includes("CURSO") || slide.tag.includes("CAPACITAÇÃO") ? "bg-emerald-400" :
                "bg-[#4ade80]"
              }`}></span>
              <span className="truncate">{slide.tag}</span>
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-[18px] sm:text-3xl md:text-4xl lg:text-[44px] font-bold text-white leading-[1.1] md:leading-tight mb-4 break-words"
            style={{
              fontFamily: "'Poppins', sans-serif",
              textShadow: "0 2px 20px rgba(0,0,0,0.3)",
              overflowWrap: "anywhere",
            }}
          >
            {slide.titulo}
          </h1>

          {/* Divider */}
          <div className="w-16 h-1 rounded-full bg-[#4ade80] mb-5"></div>

          {/* Subtitle */}
          <p className="text-[13px] sm:text-sm md:text-base text-white/85 leading-relaxed mb-5 md:mb-6 max-w-lg break-words">
            {slide.subtitulo}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 md:gap-3 pointer-events-auto">
            <SlideActionButton slide={slide} />
            <Link
              to="/quem-somos"
              className="inline-flex w-full max-w-full sm:w-auto items-center justify-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full border border-white/30 text-white font-semibold text-[13px] hover:bg-white/10 hover:border-white/60 transition-all duration-300 cursor-pointer backdrop-blur-sm"
            >
              <i className="ri-information-line text-xs"></i>
              Quem somos
            </Link>
          </div>

          {/* Stats rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:flex md:items-center md:gap-5 mt-6 md:mt-8 pt-5 md:pt-6 border-t border-white/10">
            <div>
              <p className="text-lg md:text-xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>+15 anos</p>
              <p className="text-[10px] text-white/60">de atuação</p>
            </div>
            <div className="hidden md:block w-px h-8 bg-white/10"></div>
            <div>
              <p className="text-lg md:text-xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>100%</p>
              <p className="text-[10px] text-white/60">transparência</p>
            </div>
            <div className="hidden md:block w-px h-8 bg-white/10"></div>
            <div className="min-w-0">
              <p className="text-lg md:text-xl font-bold text-white truncate" style={{ fontFamily: "'Poppins', sans-serif" }}>Cujubim</p>
              <p className="text-[10px] text-white/60">Rondônia</p>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Slide Indicators — posicionados no canto inferior direito */}
      <div className="absolute bottom-10 right-6 md:right-10 flex items-center gap-2.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="relative cursor-pointer"
            aria-label={`Slide ${i + 1}`}
          >
            {i === current ? (
              <div className="w-12 h-1.5 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-none"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-white/45 hover:bg-white/75 transition-colors duration-200"></div>
            )}
          </button>
        ))}
      </div>

      {/* Contador de slide — inferior esquerdo */}
      <div className="absolute bottom-10 left-6 md:left-10 z-10 hidden md:flex items-center gap-2">
        <span className="text-white font-bold text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {String(current + 1).padStart(2, "0")}
        </span>
        <div className="w-12 h-px bg-white/30"></div>
        <span className="text-white/50 text-sm">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* Arrows — verticais no lado direito */}
      <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col gap-2">
        <button
          onClick={() => goTo((current - 1 + slides.length) % slides.length)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white transition-all duration-200 cursor-pointer backdrop-blur-sm"
          aria-label="Slide anterior"
        >
          <i className="ri-arrow-up-s-line text-lg"></i>
        </button>
        <button
          onClick={() => goTo((current + 1) % slides.length)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white transition-all duration-200 cursor-pointer backdrop-blur-sm"
          aria-label="Próximo slide"
        >
          <i className="ri-arrow-down-s-line text-lg"></i>
        </button>
      </div>

      {/* Arrows mobile — horizontal */}
      <button
        onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all duration-200 cursor-pointer"
        aria-label="Slide anterior"
      >
        <i className="ri-arrow-left-s-line text-lg"></i>
      </button>
      <button
        onClick={() => goTo((current + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all duration-200 cursor-pointer"
        aria-label="Próximo slide"
      >
        <i className="ri-arrow-right-s-line text-lg"></i>
      </button>
    </section>
  );
}
