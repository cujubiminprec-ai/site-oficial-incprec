import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { apiFetch } from "@/services/api";

interface ResultItem {
  type: "noticia" | "servico" | "pagina" | "faq";
  titulo: string;
  descricao?: string;
  href: string;
  icon: string;
  tag?: string;
}

const TYPE_LABELS: Record<ResultItem["type"], string> = {
  noticia: "Notícias",
  servico: "Serviços",
  pagina: "Páginas",
  faq: "Perguntas Frequentes",
};

const TYPE_ORDER: ResultItem["type"][] = ["pagina", "noticia", "servico", "faq"];

function highlight(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`(${escaped})`, "gi"), "<mark class=\"bg-yellow-100 text-yellow-800 rounded px-0.5\">$1</mark>");
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const { config } = useSiteConfig();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Foca o input quando abre
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  // Fecha com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Ctrl+K / Cmd+K abre de qualquer lugar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (!open) return; // gerenciado pelo Navbar
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Busca com debounce
  const runSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const [noticias, servicos, paginas, faqs] = await Promise.allSettled([
        apiFetch<{ dados?: unknown[] }>(`/noticias?busca=${encodeURIComponent(q)}&limite=5`),
        apiFetch<{ dados?: unknown[] }>("/servicos"),
        apiFetch<{ dados?: unknown[] }>("/paginas/publicas"),
        apiFetch<{ dados?: unknown[] }>("/faq"),
      ]);

      const items: ResultItem[] = [];
      const lq = q.toLowerCase();

      if (noticias.status === "fulfilled") {
        const lista = (Array.isArray(noticias.value) ? noticias.value : (noticias.value as { dados?: unknown[] }).dados ?? []) as Record<string, unknown>[];
        lista.slice(0, 5).forEach((n) => {
          items.push({
            type: "noticia",
            titulo: String(n.titulo || ""),
            descricao: String(n.resumo || "").slice(0, 90),
            href: `/noticias/${n.slug || n.id}`,
            icon: "ri-newspaper-line",
            tag: String(n.categoria || ""),
          });
        });
      }

      if (servicos.status === "fulfilled") {
        const lista = (Array.isArray(servicos.value) ? servicos.value : (servicos.value as { dados?: unknown[] }).dados ?? []) as Record<string, unknown>[];
        lista.filter((s) => `${s.titulo} ${s.descricao}`.toLowerCase().includes(lq)).slice(0, 4).forEach((s) => {
          items.push({
            type: "servico",
            titulo: String(s.titulo || ""),
            descricao: String(s.descricao || "").slice(0, 80),
            href: "/servicos",
            icon: String(s.icone || "ri-service-line"),
          });
        });
      }

      if (paginas.status === "fulfilled") {
        const lista = (Array.isArray(paginas.value) ? paginas.value : (paginas.value as { dados?: unknown[] }).dados ?? []) as Record<string, unknown>[];
        lista.filter((p) => `${p.nome} ${p.descricao || ""}`.toLowerCase().includes(lq)).slice(0, 4).forEach((p) => {
          items.push({
            type: "pagina",
            titulo: String(p.nome || ""),
            descricao: String(p.descricao || p.descricao_interna || "").slice(0, 80),
            href: String(p.rota || "/"),
            icon: String(p.icone || "ri-pages-line"),
          });
        });
      }

      if (faqs.status === "fulfilled") {
        const lista = (Array.isArray(faqs.value) ? faqs.value : (faqs.value as { dados?: unknown[] }).dados ?? []) as Record<string, unknown>[];
        lista.filter((f) => `${f.pergunta} ${f.resposta}`.toLowerCase().includes(lq)).slice(0, 4).forEach((f) => {
          items.push({
            type: "faq",
            titulo: String(f.pergunta || ""),
            descricao: String(f.resposta || "").slice(0, 80),
            href: "/perguntas-frequentes",
            icon: "ri-question-answer-line",
            tag: String(f.categoria || ""),
          });
        });
      }

      setResults(items);
      setSelected(0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => runSearch(query), 320);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, runSearch]);

  // Navegação por teclado
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter" && results[selected]) {
        navigate(results[selected].href);
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, selected, navigate, onClose]);

  // Agrupar resultados por tipo
  const grouped = TYPE_ORDER.reduce<{ type: ResultItem["type"]; items: ResultItem[] }[]>((acc, type) => {
    const group = results.filter((r) => r.type === type);
    if (group.length > 0) acc.push({ type, items: group });
    return acc;
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.28)" }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <div
            className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ backgroundColor: `${config.primaryColor}15` }}
          >
            {loading
              ? <i className="ri-loader-4-line animate-spin text-base" style={{ color: config.primaryColor }}></i>
              : <i className="ri-search-line text-base" style={{ color: config.primaryColor }}></i>
            }
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar notícias, páginas, serviços, FAQ..."
            className="flex-1 text-base text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery("")} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer flex-shrink-0">
              <i className="ri-close-line text-gray-400"></i>
            </button>
          )}
          <kbd className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-400 text-[11px] font-mono flex-shrink-0">
            Esc
          </kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-[58vh] overflow-y-auto">
          {!query.trim() && (
            <div className="px-5 py-10 text-center">
              <i className="ri-search-2-line text-4xl text-gray-200 block mb-3"></i>
              <p className="text-sm text-gray-400">Digite para pesquisar em todo o site</p>
              <p className="text-xs text-gray-300 mt-1">Notícias, páginas, serviços, perguntas frequentes</p>
              <div className="flex items-center justify-center gap-1.5 mt-5">
                <kbd className="px-2 py-1 rounded-md bg-gray-100 text-gray-400 text-[11px] font-mono">↑↓</kbd>
                <span className="text-xs text-gray-300">navegar</span>
                <kbd className="px-2 py-1 rounded-md bg-gray-100 text-gray-400 text-[11px] font-mono">Enter</kbd>
                <span className="text-xs text-gray-300">abrir</span>
                <kbd className="px-2 py-1 rounded-md bg-gray-100 text-gray-400 text-[11px] font-mono">Esc</kbd>
                <span className="text-xs text-gray-300">fechar</span>
              </div>
            </div>
          )}

          {query.trim() && !loading && results.length === 0 && (
            <div className="px-5 py-12 text-center">
              <i className="ri-file-search-line text-4xl text-gray-200 block mb-3"></i>
              <p className="text-sm text-gray-400">Nenhum resultado para <strong className="text-gray-600">"{query}"</strong></p>
              <p className="text-xs text-gray-300 mt-1">Tente termos diferentes ou mais gerais.</p>
            </div>
          )}

          {grouped.map(({ type, items }) => {
            let globalIdx = results.findIndex((r) => r === items[0]);
            return (
              <div key={type}>
                <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">{TYPE_LABELS[type]}</span>
                  <div className="flex-1 h-px bg-gray-100"></div>
                  <span className="text-[10px] text-gray-300">{items.length}</span>
                </div>
                {items.map((item) => {
                  const idx = globalIdx++;
                  const isSelected = idx === selected;
                  return (
                    <button
                      key={`${item.href}-${item.titulo}`}
                      className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors text-left ${isSelected ? "bg-gray-50" : "hover:bg-gray-50"}`}
                      style={isSelected ? { backgroundColor: `${config.primaryColor}08` } : {}}
                      onClick={() => { navigate(item.href); onClose(); }}
                      onMouseEnter={() => setSelected(idx)}
                    >
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                        style={{ backgroundColor: isSelected ? `${config.primaryColor}15` : "#F3F4F6" }}
                      >
                        <i className={`${item.icon} text-sm`} style={{ color: isSelected ? config.primaryColor : "#9CA3AF" }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold text-gray-900 truncate"
                          dangerouslySetInnerHTML={{ __html: highlight(item.titulo, query) }}
                        />
                        {item.descricao && (
                          <p className="text-xs text-gray-400 truncate mt-0.5"
                            dangerouslySetInnerHTML={{ __html: highlight(item.descricao, query) }}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.tag && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{item.tag}</span>
                        )}
                        {isSelected && <i className="ri-corner-down-left-line text-gray-300 text-xs"></i>}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">{results.length} resultado{results.length !== 1 ? "s" : ""}</span>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 text-[10px] font-mono">↑↓</kbd>
              <span className="text-[10px] text-gray-300">navegar</span>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 text-[10px] font-mono">↵</kbd>
              <span className="text-[10px] text-gray-300">abrir</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
