import { useState, useEffect, useRef } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { painelTransparenciaDefault, painelTransparenciaConfigDefault, PainelSlide } from "@/mocks/painel-transparencia";
import { transparenciaService } from "@/services/transparencia.service";

// ── DYNAMIC PDF.JS PAGE RENDER COMPONENT ──────────────────────────────────────────
interface PDFCanvasViewerProps {
  pdfUrl: string;
  currentPage: number; // 0-indexed page number
  onLoadSuccess?: (numPages: number) => void;
  className?: string;
}

export function PDFCanvasViewer({ pdfUrl, currentPage, onLoadSuccess, className }: PDFCanvasViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const pdfRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    let active = true;

    const initPdfJs = async () => {
      try {
        setLoading(true);
        setError(false);

        if (!(window as any).pdfjsLib) {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
          script.async = true;
          document.head.appendChild(script);

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });

          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
        }

        if (!active) return;
        const pdfjsLib = (window as any).pdfjsLib;

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        pdfRef.current = pdf;

        if (active) {
          setLoading(false);
          if (onLoadSuccess) {
            onLoadSuccess(pdf.numPages);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar PDF:", err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    };

    initPdfJs();

    return () => {
      active = false;
      if (pdfRef.current) {
        pdfRef.current.destroy();
      }
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdfRef.current || loading || error) return;

    let active = true;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const pageNumber = currentPage + 1;
        if (pageNumber < 1 || pageNumber > pdfRef.current.numPages) return;

        const page = await pdfRef.current.getPage(pageNumber);
        if (!active || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        // Render at high resolution (1.5x)
        const viewport = page.getViewport({ scale: 1.5 });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err: any) {
        if (err.name !== "RenderingCancelledException") {
          console.error("Erro ao renderizar página do PDF:", err);
        }
      }
    };

    renderPage();

    return () => {
      active = false;
    };
  }, [currentPage, loading, error]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 text-gray-400 p-4">
        <i className="ri-loader-4-line text-2xl animate-spin mb-2" style={{ color: "#2E7D32" }}></i>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Renderizando slide...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-red-50 text-red-500 p-6 text-center">
        <i className="ri-error-warning-line text-2xl mb-2"></i>
        <span className="text-xs font-bold">Falha ao carregar apresentação</span>
        <span className="text-[9px] text-red-400 mt-1">Verifique o arquivo ou recarregue a página</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100/50 p-2.5 overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`max-w-full max-h-full object-contain shadow-sm rounded border border-gray-200 bg-white transition-opacity duration-300 ${className || ""}`}
      />
    </div>
  );
}

// Helper to normalize Google Slides share/edit links into clean embed links
function normalizeGoogleSlidesUrl(url: string): string {
  if (!url) return "";
  if (url.includes("/embed")) return url;
  const match = url.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const presentationId = match[1];
    return `https://docs.google.com/presentation/d/${presentationId}/embed?start=true&loop=true&delayms=5000`;
  }
  return url;
}

// ── MAIN SECTION COMPONENT ────────────────────────────────────────────────────────
export default function PainelTransparenciaSection() {
  const { config } = useSiteConfig();
  const [slides, setSlides] = useState<PainelSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [painelConfig, setPainelConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("inprec_painel_transparencia_config");
      if (!saved) return painelTransparenciaConfigDefault;
      const parsed = JSON.parse(saved);
      return parsed.layoutVersion === painelTransparenciaConfigDefault.layoutVersion
        ? { ...painelTransparenciaConfigDefault, ...parsed }
        : painelTransparenciaConfigDefault;
    } catch {
      return painelTransparenciaConfigDefault;
    }
  });

  const [fullscreenSlide, setFullscreenSlide] = useState<PainelSlide | null>(null);

  // Load from backend, fallback to localStorage/mock
  const fetchSlides = async () => {
    try {
      const data = await transparenciaService.listarPainel();
      if (data && data.length > 0) {
        setSlides(data);
      } else {
        setSlides(painelTransparenciaDefault);
      }
    } catch (err) {
      console.error("Erro ao listar slides de transparência do banco:", err);
      try {
        const saved = localStorage.getItem("inprec_painel_transparencia");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.length > 0) {
            setSlides(parsed);
            return;
          }
        }
        setSlides(painelTransparenciaDefault);
      } catch {
        setSlides(painelTransparenciaDefault);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();

    const handleStorage = () => {
      try {
        const savedConfig = localStorage.getItem("inprec_painel_transparencia_config");
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          setPainelConfig(prev => parsed.layoutVersion === painelTransparenciaConfigDefault.layoutVersion ? ({ ...prev, ...parsed }) : painelTransparenciaConfigDefault);
        }
        fetchSlides();
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener("storage", handleStorage);
    const interval = setInterval(handleStorage, 4000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const sortedSlides = [...slides]
    .filter((slide) => painelConfig.showFixedSix ? slide.id <= 6 || slide.ativo : slide.ativo)
    .sort((a, b) => a.ordem - b.ordem || a.id - b.id);

  const gridClasses = () => {
    const layout = String(painelConfig.columnsLayout);
    if (layout === "1") return "grid-cols-1 max-w-3xl mx-auto";
    if (layout === "2") return "grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto";
    if (layout === "5") return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 max-w-[1600px] mx-auto gap-5";
    if (layout === "auto") return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 max-w-[1600px] mx-auto";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto";
  };

  const gridStyle = (): React.CSSProperties | undefined => {
    if (String(painelConfig.columnsLayout) !== "auto") return undefined;
    return { gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" };
  };

  const cardHeightPx = Number(painelConfig.cardHeight) || 320;
  const autoSlideDelay = Number(painelConfig.autoSlideDelay) || 5000;

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: "#F4FBF7" }} id="painel-transparencia">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-extrabold tracking-wider uppercase mb-4 shadow-3xs"
            style={{ borderColor: `${config.primaryColor}30`, color: config.primaryColor, backgroundColor: `${config.primaryColor}08` }}
          >
            <i className="ri-bar-chart-box-line text-xs"></i>
            Transparência Atuarial
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Poppins', sans-serif", color: "#1B5E20" }}
          >
            {painelConfig.titulo}
          </h2>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed">
            {painelConfig.subtitulo}
          </p>
        </div>

        {/* Dynamic Presentation Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-700 animate-spin mb-4"></div>
            <p className="text-sm font-semibold text-gray-500">Buscando apresentações do painel...</p>
          </div>
        ) : (
          <div className={`grid gap-8 transition-all duration-500 ${gridClasses()}`} style={gridStyle()}>
            {sortedSlides.map((slide) => (
              <TransparencyCard
                key={slide.id}
                slide={slide}
                primaryColor={config.primaryColor}
                cardHeight={cardHeightPx}
                autoSlideDelay={autoSlideDelay}
                onExpand={() => setFullscreenSlide(slide)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Extended Fullscreen Slide Overlay */}
      {fullscreenSlide && (
        <FullscreenDocumentViewer
          slide={fullscreenSlide}
          primaryColor={config.primaryColor}
          onClose={() => setFullscreenSlide(null)}
        />
      )}
    </section>
  );
}

// ── HIGH FIDELITY TRANSPARENCY CARD COMPONENT ─────────────────────────────────────
function TransparencyCard({
  slide,
  primaryColor,
  cardHeight,
  autoSlideDelay,
  onExpand
}: {
  slide: PainelSlide;
  primaryColor: string;
  cardHeight: number;
  autoSlideDelay: number;
  onExpand: () => void;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasFile = !!slide.sourceUrl;
  const isGoogleSlides = !!(slide.sourceUrl && slide.sourceUrl.includes("docs.google.com/presentation"));
  const googleSlidesEmbedUrl = isGoogleSlides ? normalizeGoogleSlidesUrl(slide.sourceUrl!) : "";
  const isPdf = !isGoogleSlides && (slide.tipo === "PDF" || (slide.sourceUrl && slide.sourceUrl.toLowerCase().endsWith(".pdf")));
  const hasSlideImages = !isGoogleSlides && Array.isArray(slide.slidesImg) && slide.slidesImg.length > 0;

  // Determine slide count
  const totalSlides = isGoogleSlides ? 1 : (isPdf && numPages > 0 ? numPages : (hasSlideImages ? slide.slidesImg!.length : (hasFile ? 3 : 1)));

  // Auto progression every 5 seconds, pauses on hover
  useEffect(() => {
    if (isHovered || totalSlides <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, autoSlideDelay);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, totalSlides, autoSlideDelay]);

  // Reset to first slide if total changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [totalSlides]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalSlides > 1) {
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalSlides > 1) {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }
  };

  const renderSlideContent = () => {
    if (!hasFile) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full p-5 bg-gray-50/50">
          <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-3 border border-amber-100">
            <i className="ri-file-warning-line text-2xl"></i>
          </div>
          <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Aguardando Envio</h4>
          <p className="text-[10px] text-gray-400 mt-1 max-w-[180px] leading-relaxed">
            Este relatório ainda não foi anexado pela administração do instituto.
          </p>
        </div>
      );
    }

    if (isGoogleSlides) {
      return (
        <iframe
          src={googleSlidesEmbedUrl}
          className="w-full h-full border-0 bg-white"
          allowFullScreen
          title={slide.titulo}
        />
      );
    }

    if (isPdf) {
      return (
        <PDFCanvasViewer
          pdfUrl={slide.sourceUrl!}
          currentPage={currentSlide}
          onLoadSuccess={(pages) => setNumPages(pages)}
        />
      );
    }

    if (hasSlideImages && slide.slidesImg) {
      const imgUrl = slide.slidesImg[currentSlide];
      return (
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-gray-900">
          <img
            src={imgUrl}
            alt={`Página ${currentSlide + 1}`}
            className="max-w-full max-h-full object-contain"
            loading="lazy"
          />
        </div>
      );
    }

    // PPTX Presentation Mock Deck
    if (currentSlide === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full p-4 bg-white">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl mb-3 bg-amber-50 text-[#E65100] shadow-3xs border border-orange-100">
            <i className="ri-slideshow-2-line text-3xl"></i>
          </div>
          <h3 className="text-xs font-extrabold text-gray-800 px-4 mb-1 line-clamp-2">{slide.titulo}</h3>
          <span className="text-[9px] px-2.5 py-0.5 rounded-full font-extrabold bg-orange-50 text-[#E65100] border border-orange-100 uppercase tracking-wider">
            Apresentação PPTX
          </span>
        </div>
      );
    }
    if (currentSlide === 1) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full p-5 bg-gradient-to-b from-transparent to-gray-50/20">
          <div className="w-8 h-8 flex items-center justify-center rounded-full mb-2 bg-gray-100 text-gray-500">
            <i className="ri-information-line text-sm"></i>
          </div>
          <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Informações</h4>
          <p className="text-[11px] text-gray-600 leading-relaxed max-w-[200px] line-clamp-4">
            {slide.descricao || "Apresentação oficial de prestação de contas de investimentos previdenciários e balanço do INPREC."}
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center text-center h-full p-4 bg-white">
        <div className="w-10 h-10 flex items-center justify-center rounded-full mb-2 bg-green-50 text-green-500">
          <i className="ri-download-cloud-2-line text-lg"></i>
        </div>
        <p className="text-xs font-extrabold text-gray-700 mb-3">Pronto para download</p>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onExpand(); }}
            className="px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold bg-[#2E7D32] text-white shadow-3xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            Visualizar
          </button>
          <a
            href={slide.sourceUrl}
            download
            onClick={(e) => e.stopPropagation()}
            className="px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold border border-[#2E7D32] text-[#2E7D32] hover:bg-green-50 transition-colors bg-white"
          >
            Baixar
          </a>
        </div>
      </div>
    );
  };

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden relative flex flex-col shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300"
      style={{ height: `${cardHeight}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. TOP HEADER: Premium institutional green bar */}
      <div className="px-4 py-3 bg-[#E8F5E9] border-b border-[#C8E6C9] flex items-center justify-between z-10">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0 animate-pulse" />
          <h3 className="text-[11px] font-extrabold text-[#1B5E20] uppercase tracking-wider line-clamp-1">
            {slide.titulo}
          </h3>
        </div>
        {hasFile && (
          <span className="text-[9px] font-extrabold text-[#1B5E20] bg-white px-2 py-0.5 rounded-full border border-green-200 shadow-3xs uppercase flex-shrink-0">
            {slide.tipo}
          </span>
        )}
      </div>

      {/* 2. BODY CONTENT AREA */}
      <div className="flex-1 w-full relative overflow-hidden bg-gray-50/50 flex items-center justify-center p-3">
        <div className="w-full h-full bg-white rounded-xl border border-gray-200/90 shadow-3xs overflow-hidden flex items-center justify-center">
          {renderSlideContent()}
        </div>
      </div>

      {/* 3. FOOTER MANUAL CONTROLS & NAV */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between z-10 select-none">
        {/* Navigation arrows and indicator */}
        {isGoogleSlides ? (
          <span className="text-[9px] font-extrabold text-[#1B5E20] bg-green-50 px-2.5 py-1 rounded-lg border border-green-100 uppercase tracking-wider flex items-center gap-1 shadow-3xs">
            <i className="ri-slideshow-2-line text-[10px]"></i> Slide Integrado
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              disabled={totalSlides <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-500 disabled:opacity-35 disabled:hover:bg-white active:scale-90 transition-all cursor-pointer text-xs font-bold shadow-3xs"
              title="Slide Anterior"
            >
              ←
            </button>
            <span className="text-[10px] font-extrabold text-gray-600 bg-white px-2.5 py-1 rounded-lg border border-gray-200 min-w-[58px] text-center shadow-3xs">
              {totalSlides > 0 ? `${currentSlide + 1} / ${totalSlides}` : "0 / 0"}
            </span>
            <button
              onClick={handleNext}
              disabled={totalSlides <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-500 disabled:opacity-35 disabled:hover:bg-white active:scale-90 transition-all cursor-pointer text-xs font-bold shadow-3xs"
              title="Próximo Slide"
            >
              →
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {hasFile && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onExpand(); }}
                className="px-3 py-1.5 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-[9px] font-extrabold shadow-3xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                title="Ampliar Modo Cheio"
              >
                <i className="ri-fullscreen-line text-[10px]"></i> Ver
              </button>
              {isGoogleSlides ? (
                <a
                  href={slide.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-lg border border-[#2E7D32] text-[#2E7D32] hover:bg-green-50 text-[9px] font-extrabold active:scale-95 transition-all cursor-pointer flex items-center gap-1 bg-white"
                  title="Abrir no Google Slides"
                >
                  <i className="ri-external-link-line text-[10px]"></i> Abrir
                </a>
              ) : (
                <a
                  href={slide.sourceUrl}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-lg border border-[#2E7D32] text-[#2E7D32] hover:bg-green-50 text-[9px] font-extrabold active:scale-95 transition-all cursor-pointer flex items-center gap-1 bg-white"
                  title="Fazer Download"
                >
                  <i className="ri-download-line text-[10px]"></i> Baixar
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── FULLSCREEN EXTENDED VIEW OVERLAY ──────────────────────────────────────────────
function FullscreenDocumentViewer({
  slide,
  primaryColor,
  onClose
}: {
  slide: PainelSlide;
  primaryColor: string;
  onClose: () => void;
}) {
  const hasFile = !!slide.sourceUrl;
  const isGoogleSlides = !!(slide.sourceUrl && slide.sourceUrl.includes("docs.google.com/presentation"));
  const googleSlidesEmbedUrl = isGoogleSlides ? normalizeGoogleSlidesUrl(slide.sourceUrl!) : "";
  const isPdf = !isGoogleSlides && (slide.tipo === "PDF" || (slide.sourceUrl && slide.sourceUrl.toLowerCase().endsWith(".pdf")));
  const hasSlideImages = !isGoogleSlides && Array.isArray(slide.slidesImg) && slide.slidesImg.length > 0;

  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);

  const totalSlides = isGoogleSlides ? 1 : (isPdf && numPages > 0 ? numPages : (hasSlideImages ? slide.slidesImg!.length : (hasFile ? 3 : 1)));

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handlePrev = () => {
    if (totalSlides > 1) {
      setCurrentPage((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  const handleNext = () => {
    if (totalSlides > 1) {
      setCurrentPage((prev) => (prev + 1) % totalSlides);
    }
  };

  const renderFullscreenContent = () => {
    if (!hasFile) {
      return (
        <div className="text-center text-gray-500 py-20">
          <i className="ri-lock-line text-4xl mb-3 text-gray-700"></i>
          <p className="text-sm font-semibold">Nenhum documento anexado a este painel ainda.</p>
        </div>
      );
    }

    if (isGoogleSlides) {
      return (
        <div className="w-full h-full p-2 bg-gray-900">
          <iframe
            src={googleSlidesEmbedUrl}
            className="w-full h-full border-0 rounded-2xl shadow-2xl bg-white"
            allowFullScreen
            title={slide.titulo}
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <PDFCanvasViewer
          pdfUrl={slide.sourceUrl!}
          currentPage={currentPage}
          onLoadSuccess={(pages) => setNumPages(pages)}
        />
      );
    }

    if (hasSlideImages && slide.slidesImg) {
      return (
        <div className="w-full h-full flex items-center justify-center p-4 bg-gray-900">
          <img
            src={slide.slidesImg[currentPage]}
            alt={`Página ${currentPage + 1}`}
            className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      );
    }

    // Default iframe PDF fallback
    return (
      <div className="w-full h-full p-2 bg-gray-800">
        <iframe
          src={`${slide.sourceUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          className="w-full h-full border-0 rounded-2xl bg-white shadow-2xl"
          title={slide.titulo}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col z-[9999] p-4 md:p-6 animate-fade-in">
      {/* Header Overlay */}
      <div className="flex items-center justify-between bg-gray-900/90 rounded-2xl px-6 py-4 mb-4 border border-white/10 shadow-2xl">
        <div className="min-w-0 pr-4">
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-widest">
            Visualização de Apresentações
          </span>
          <h2 className="text-white text-base md:text-lg font-bold truncate mt-1 leading-tight">
            {slide.titulo}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {slide.sourceUrl && (
            isGoogleSlides ? (
              <a
                href={slide.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-white text-gray-900 hover:bg-gray-100 transition-all shadow-md active:scale-95"
              >
                <i className="ri-external-link-line text-sm"></i> Abrir no Google
              </a>
            ) : (
              <a
                href={slide.sourceUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-white text-gray-900 hover:bg-gray-100 transition-all shadow-md active:scale-95"
              >
                <i className="ri-download-line text-sm"></i> Baixar Completo
              </a>
            )
          )}
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            title="Fechar Visualização"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
      </div>

      {/* Main Body Stage */}
      <div className="flex-1 w-full bg-gray-900 rounded-3xl overflow-hidden relative border border-white/5 shadow-inner flex items-center justify-center">
        {renderFullscreenContent()}

        {/* Setas gigantes laterais de navegação */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-6 w-12 h-12 rounded-full bg-black/60 hover:bg-black/85 border border-white/10 flex items-center justify-center text-white text-xl hover:scale-105 active:scale-90 transition-all cursor-pointer shadow-lg z-30"
              title="Slide Anterior"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              className="absolute right-6 w-12 h-12 rounded-full bg-black/60 hover:bg-black/85 border border-white/10 flex items-center justify-center text-white text-xl hover:scale-105 active:scale-90 transition-all cursor-pointer shadow-lg z-30"
              title="Próximo Slide"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Footer Indicator in Fullscreen */}
      {totalSlides > 1 && (
        <div className="mt-4 flex justify-center">
          <div className="bg-gray-900/90 border border-white/15 px-6 py-2 rounded-2xl flex items-center gap-3 shadow-xl">
            <span className="text-xs font-bold text-white/80 tracking-wider">
              SLIDE {currentPage + 1} DE {totalSlides}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
