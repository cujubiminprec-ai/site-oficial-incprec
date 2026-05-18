import { useState, useEffect, useRef } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

const STORAGE_KEY = "inprec_analytics";

type PageStat = { path: string; name: string; visits: number; clicks: number };

const paginasDefault: PageStat[] = [
  { path: "/", name: "Home", visits: 1842, clicks: 3210 },
  { path: "/previdencia", name: "Previdência", visits: 923, clicks: 1540 },
  { path: "/transparencia", name: "Transparência", visits: 781, clicks: 1120 },
  { path: "/noticias", name: "Notícias", visits: 654, clicks: 890 },
  { path: "/servicos", name: "Serviços", visits: 512, clicks: 760 },
  { path: "/quem-somos", name: "Quem Somos", visits: 398, clicks: 520 },
  { path: "/pro-gestao", name: "Pró-Gestão", visits: 341, clicks: 480 },
  { path: "/contato", name: "Contato", visits: 289, clicks: 410 },
  { path: "/gestores", name: "Gestores", visits: 234, clicks: 310 },
  { path: "/legislacao", name: "Legislação", visits: 198, clicks: 260 },
  { path: "/perguntas-frequentes", name: "FAQ", visits: 167, clicks: 230 },
  { path: "/lgpd", name: "LGPD", visits: 98, clicks: 130 },
];

const mesesDefault = [
  { mes: "Out/24", visitas: 2100, cliques: 3800 },
  { mes: "Nov/24", visitas: 2340, cliques: 4100 },
  { mes: "Dez/24", visitas: 1980, cliques: 3500 },
  { mes: "Jan/25", visitas: 2650, cliques: 4600 },
  { mes: "Fev/25", visitas: 2820, cliques: 4900 },
  { mes: "Mar/25", visitas: 3100, cliques: 5400 },
  { mes: "Abr/25", visitas: 2940, cliques: 5100 },
  { mes: "Mai/25", visitas: 3250, cliques: 5700 },
  { mes: "Jun/25", visitas: 3480, cliques: 6100 },
  { mes: "Jul/25", visitas: 3120, cliques: 5500 },
  { mes: "Ago/25", visitas: 3700, cliques: 6400 },
  { mes: "Set/25", visitas: 3950, cliques: 6900 },
];

function BarChart({ data, color, maxVal }: { data: { label: string; value: number }[]; color: string; maxVal: number }) {
  return (
    <div className="flex items-end gap-1 h-32 w-full">
      {data.map((d) => {
        const pct = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {d.value.toLocaleString("pt-BR")}
            </div>
            <div
              className="w-full rounded-t-md transition-all duration-500 cursor-pointer"
              style={{ height: `${Math.max(pct, 3)}%`, backgroundColor: color }}
            ></div>
            <span className="text-[8px] text-gray-400 rotate-0 whitespace-nowrap overflow-hidden" style={{ maxWidth: "100%", textOverflow: "ellipsis" }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsTab() {
  const { config } = useSiteConfig();
  const [paginas] = useState<PageStat[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : paginasDefault; } catch { return paginasDefault; }
  });
  const [periodo, setPeriodo] = useState<"6m" | "12m">("12m");
  const [metrica, setMetrica] = useState<"visitas" | "cliques">("visitas");
  const printRef = useRef<HTMLDivElement>(null);

  const mesesExibidos = periodo === "6m" ? mesesDefault.slice(-6) : mesesDefault;
  const maxBarVal = Math.max(...mesesExibidos.map(m => metrica === "visitas" ? m.visitas : m.cliques));

  const totalVisitas = paginas.reduce((a, p) => a + p.visits, 0);
  const totalCliques = paginas.reduce((a, p) => a + p.clicks, 0);
  const paginaMaisVisitada = [...paginas].sort((a, b) => b.visits - a.visits)[0];
  const taxaEngajamento = totalVisitas > 0 ? ((totalCliques / totalVisitas) * 100).toFixed(1) : "0";

  const exportPDF = () => {
    const el = printRef.current;
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Relatório Analytics INPREC</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
        h1 { color: #111; font-size: 22px; margin-bottom: 4px; }
        h2 { color: #444; font-size: 15px; margin: 20px 0 8px; }
        .grid { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
        .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; min-width: 160px; }
        .card .val { font-size: 28px; font-weight: bold; }
        .card .lbl { font-size: 12px; color: #6b7280; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #f9fafb; text-align: left; padding: 8px 12px; font-size: 12px; color: #374151; }
        td { padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
        .badge { background: #f0fdf4; color: #16a34a; padding: 2px 8px; border-radius: 20px; font-size: 11px; }
        footer { margin-top: 32px; font-size: 11px; color: #9ca3af; text-align: center; }
      </style></head><body>
      <h1>Relatório de Analytics — INPREC</h1>
      <p style="font-size:12px;color:#9ca3af">Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
      <h2>Resumo Geral</h2>
      <div class="grid">
        <div class="card"><div class="val">${totalVisitas.toLocaleString("pt-BR")}</div><div class="lbl">Total de Visitantes</div></div>
        <div class="card"><div class="val">${totalCliques.toLocaleString("pt-BR")}</div><div class="lbl">Total de Cliques</div></div>
        <div class="card"><div class="val">${taxaEngajamento}%</div><div class="lbl">Taxa de Engajamento</div></div>
        <div class="card"><div class="val">${paginaMaisVisitada.name}</div><div class="lbl">Página mais visitada</div></div>
      </div>
      <h2>Páginas Mais Acessadas</h2>
      <table>
        <tr><th>#</th><th>Página</th><th>Visitantes</th><th>Cliques</th><th>Engajamento</th></tr>
        ${paginas.map((p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${p.name} <span style="color:#9ca3af;font-size:11px">${p.path}</span></td>
            <td>${p.visits.toLocaleString("pt-BR")}</td>
            <td>${p.clicks.toLocaleString("pt-BR")}</td>
            <td><span class="badge">${p.visits > 0 ? ((p.clicks / p.visits) * 100).toFixed(0) : 0}%</span></td>
          </tr>`).join("")}
      </table>
      <h2>Histórico Mensal (${periodo === "6m" ? "Últimos 6 meses" : "Últimos 12 meses"})</h2>
      <table>
        <tr><th>Mês</th><th>Visitas</th><th>Cliques</th></tr>
        ${mesesExibidos.map(m => `<tr><td>${m.mes}</td><td>${m.visitas.toLocaleString("pt-BR")}</td><td>${m.cliques.toLocaleString("pt-BR")}</td></tr>`).join("")}
      </table>
      <footer>INPREC — Instituto de Previdência Municipal · Relatório gerado automaticamente pelo painel administrativo</footer>
      </body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); }, 400);
  };

  const maxPgVisits = Math.max(...paginas.map(p => p.visits));

  return (
    <div ref={printRef}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Analytics do Site</h1>
          <p className="text-sm text-gray-400 mt-1">Monitore visitantes, cliques e páginas mais acessadas.</p>
        </div>
        <button
          onClick={exportPDF}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90"
          style={{ backgroundColor: config.primaryColor }}
        >
          <i className="ri-file-pdf-line"></i> Exportar PDF
        </button>
      </div>

      {/* Cards KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: "ri-user-line", label: "Total de Visitantes", value: totalVisitas.toLocaleString("pt-BR"), sub: "Todas as páginas", color: config.primaryColor },
          { icon: "ri-cursor-line", label: "Total de Cliques", value: totalCliques.toLocaleString("pt-BR"), sub: "Interações registradas", color: "#0891B2" },
          { icon: "ri-bar-chart-line", label: "Taxa de Engajamento", value: `${taxaEngajamento}%`, sub: "Cliques por visita", color: "#D97706" },
          { icon: "ri-trophy-line", label: "Página + Visitada", value: paginaMaisVisitada.name, sub: `${paginaMaisVisitada.visits.toLocaleString("pt-BR")} visitas`, color: "#059669" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl mb-3" style={{ backgroundColor: `${c.color}15` }}>
              <i className={`${c.icon} text-base`} style={{ color: c.color }}></i>
            </div>
            <p className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{c.value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">{c.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico 1 — Histórico mensal */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Histórico Mensal</h2>
              <p className="text-xs text-gray-400">Visitas e cliques por mês</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {(["visitas", "cliques"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetrica(m)}
                    className="px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all capitalize"
                    style={metrica === m ? { backgroundColor: config.primaryColor, color: "white" } : { color: "#6B7280" }}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {(["6m", "12m"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriodo(p)}
                    className="px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all"
                    style={periodo === p ? { backgroundColor: config.primaryColor, color: "white" } : { color: "#6B7280" }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <BarChart
            data={mesesExibidos.map(m => ({ label: m.mes, value: metrica === "visitas" ? m.visitas : m.cliques }))}
            color={config.primaryColor}
            maxVal={maxBarVal}
          />
          <div className="flex items-center gap-2 mt-3">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: config.primaryColor }}></div>
            <span className="text-xs text-gray-500 capitalize">{metrica} mensais</span>
          </div>
        </div>

        {/* Gráfico 2 — Distribuição por página */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-900">Distribuição por Página</h2>
            <p className="text-xs text-gray-400">Proporção de visitas por seção</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {paginas.slice(0, 8).map((p) => {
              const pct = maxPgVisits > 0 ? (p.visits / maxPgVisits) * 100 : 0;
              return (
                <div key={p.path} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-24 flex-shrink-0 truncate">{p.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: config.primaryColor }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-12 text-right flex-shrink-0">
                    {p.visits.toLocaleString("pt-BR")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabela completa */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Páginas Mais Acessadas</h2>
            <p className="text-xs text-gray-400 mt-0.5">Ranking completo com visitantes, cliques e engajamento</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}>
            {paginas.length} páginas
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">#</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Página</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Visitantes</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cliques</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Engajamento</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Barra</th>
              </tr>
            </thead>
            <tbody>
              {paginas.map((p, i) => {
                const eng = p.visits > 0 ? ((p.clicks / p.visits) * 100).toFixed(0) : "0";
                const bar = maxPgVisits > 0 ? (p.visits / maxPgVisits) * 100 : 0;
                return (
                  <tr key={p.path} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-gray-400 font-semibold">{i + 1}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.path}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm font-semibold text-gray-700">{p.visits.toLocaleString("pt-BR")}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-gray-500">{p.clicks.toLocaleString("pt-BR")}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-50 text-green-600">{eng}%</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-1.5 rounded-full" style={{ width: `${bar}%`, backgroundColor: config.primaryColor }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
        <p className="text-xs text-amber-700 flex items-start gap-2">
          <i className="ri-information-line mt-0.5 flex-shrink-0"></i>
          <span>Os dados exibidos são estimativas baseadas em métricas simuladas para demonstração. Para monitoramento em tempo real, conecte o site ao Google Analytics ou similar.</span>
        </p>
      </div>
    </div>
  );
}
