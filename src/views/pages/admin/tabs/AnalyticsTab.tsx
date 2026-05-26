import { useEffect, useMemo, useRef, useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { analyticsService, type AnalyticsMonthStat, type AnalyticsPageStat } from "@/services/analytics.service";

function BarChart({
  data,
  color,
  maxVal,
}: {
  data: { label: string; value: number }[];
  color: string;
  maxVal: number;
}) {
  return (
    <div className="flex h-32 w-full items-end gap-1">
      {data.map((d) => {
        const pct = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
        return (
          <div key={d.label} className="group relative flex flex-1 flex-col items-center gap-1">
            <div className="absolute -top-7 left-1/2 z-10 -translate-x-1/2 rounded bg-gray-900 px-1.5 py-0.5 text-[10px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
              {d.value.toLocaleString("pt-BR")}
            </div>
            <div
              className="w-full cursor-pointer rounded-t-md transition-all duration-500"
              style={{ height: `${Math.max(pct, 3)}%`, backgroundColor: color }}
            />
            <span className="overflow-hidden text-[8px] text-gray-400 whitespace-nowrap" style={{ maxWidth: "100%", textOverflow: "ellipsis" }}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsTab() {
  const { config } = useSiteConfig();
  const [paginas, setPaginas] = useState<AnalyticsPageStat[]>([]);
  const [meses, setMeses] = useState<AnalyticsMonthStat[]>([]);
  const [periodo, setPeriodo] = useState<"6m" | "12m">("12m");
  const [metrica, setMetrica] = useState<"visitas" | "cliques">("visitas");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      setLoading(true);
      setErro("");
      try {
        const dados = await analyticsService.listarAdmin();
        if (!ativo) return;
        setPaginas(dados.paginas || []);
        setMeses(dados.meses || []);
      } catch (err) {
        if (!ativo) return;
        setErro(err instanceof Error ? err.message : "Erro ao carregar analytics.");
        setPaginas([]);
        setMeses([]);
      } finally {
        if (ativo) setLoading(false);
      }
    };

    void carregar();
    return () => {
      ativo = false;
    };
  }, []);

  const mesesExibidos = useMemo(
    () => (periodo === "6m" ? meses.slice(-6) : meses.slice(-12)),
    [meses, periodo]
  );

  const maxBarVal = Math.max(0, ...mesesExibidos.map((m) => (metrica === "visitas" ? m.visitas : m.cliques)));
  const totalVisitas = paginas.reduce((acc, item) => acc + item.visits, 0);
  const totalCliques = paginas.reduce((acc, item) => acc + item.clicks, 0);
  const paginaMaisVisitada = paginas[0];
  const taxaEngajamento = totalVisitas > 0 ? ((totalCliques / totalVisitas) * 100).toFixed(1) : "0";
  const maxPgVisits = Math.max(0, ...paginas.map((p) => p.visits));

  const exportPDF = () => {
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
        <div class="card"><div class="val">${paginaMaisVisitada?.name || "Sem dados"}</div><div class="lbl">Página mais visitada</div></div>
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
        ${mesesExibidos.map((m) => `<tr><td>${m.mes}</td><td>${m.visitas.toLocaleString("pt-BR")}</td><td>${m.cliques.toLocaleString("pt-BR")}</td></tr>`).join("")}
      </table>
      <footer>INPREC · Relatório gerado automaticamente pelo painel administrativo</footer>
      </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  return (
    <div ref={printRef}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Analytics do Site</h1>
          <p className="mt-1 text-sm text-gray-400">Monitore visitantes, cliques e páginas mais acessadas com dados reais do MySQL.</p>
        </div>
        <button
          onClick={exportPDF}
          className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white hover:opacity-90"
          style={{ backgroundColor: config.primaryColor }}
        >
          <i className="ri-file-pdf-line"></i> Exportar PDF
        </button>
      </div>

      {erro && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {erro}
        </div>
      )}

      {loading && (
        <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Carregando analytics reais do MySQL...
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: "ri-user-line", label: "Total de Visitantes", value: totalVisitas.toLocaleString("pt-BR"), sub: "Page views registradas", color: config.primaryColor },
          { icon: "ri-cursor-line", label: "Total de Cliques", value: totalCliques.toLocaleString("pt-BR"), sub: "Interações capturadas", color: "#0891B2" },
          { icon: "ri-bar-chart-line", label: "Taxa de Engajamento", value: `${taxaEngajamento}%`, sub: "Cliques por visita", color: "#D97706" },
          { icon: "ri-trophy-line", label: "Página + Visitada", value: paginaMaisVisitada?.name || "Sem dados", sub: paginaMaisVisitada ? `${paginaMaisVisitada.visits.toLocaleString("pt-BR")} visitas` : "Sem acessos ainda", color: "#059669" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${c.color}15` }}>
              <i className={`${c.icon} text-base`} style={{ color: c.color }}></i>
            </div>
            <p className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{c.value}</p>
            <p className="mt-0.5 text-xs font-semibold text-gray-600">{c.label}</p>
            <p className="mt-0.5 text-[11px] text-gray-400">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Histórico Mensal</h2>
              <p className="text-xs text-gray-400">Visitas e cliques por mês</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg bg-gray-100 p-0.5">
                {(["visitas", "cliques"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetrica(m)}
                    className="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all"
                    style={metrica === m ? { backgroundColor: config.primaryColor, color: "white" } : { color: "#6B7280" }}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="flex rounded-lg bg-gray-100 p-0.5">
                {(["6m", "12m"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriodo(p)}
                    className="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all"
                    style={periodo === p ? { backgroundColor: config.primaryColor, color: "white" } : { color: "#6B7280" }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {mesesExibidos.length > 0 ? (
            <>
              <BarChart
                data={mesesExibidos.map((m) => ({ label: m.mes, value: metrica === "visitas" ? m.visitas : m.cliques }))}
                color={config.primaryColor}
                maxVal={maxBarVal}
              />
              <div className="mt-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: config.primaryColor }}></div>
                <span className="text-xs text-gray-500 capitalize">{metrica} mensais</span>
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-sm text-gray-400">Nenhum evento de analytics foi registrado ainda.</div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-900">Distribuição por Página</h2>
            <p className="text-xs text-gray-400">Proporção de visitas por seção</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {paginas.slice(0, 8).map((p) => {
              const pct = maxPgVisits > 0 ? (p.visits / maxPgVisits) * 100 : 0;
              return (
                <div key={p.path} className="flex items-center gap-3">
                  <span className="w-24 flex-shrink-0 truncate text-xs text-gray-600">{p.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: config.primaryColor }} />
                  </div>
                  <span className="w-12 flex-shrink-0 text-right text-xs font-semibold text-gray-700">
                    {p.visits.toLocaleString("pt-BR")}
                  </span>
                </div>
              );
            })}
            {!loading && paginas.length === 0 && (
              <div className="py-10 text-center text-sm text-gray-400">Nenhuma página pública recebeu visitas ainda.</div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="flex items-center justify-between border-b border-gray-50 p-5">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Páginas Mais Acessadas</h2>
            <p className="mt-0.5 text-xs text-gray-400">Ranking completo com visitantes, cliques e engajamento</p>
          </div>
          <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}>
            {paginas.length} páginas
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-400 uppercase">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-400 uppercase">Página</th>
                <th className="px-5 py-3 text-right text-xs font-semibold tracking-wide text-gray-400 uppercase">Visitantes</th>
                <th className="px-5 py-3 text-right text-xs font-semibold tracking-wide text-gray-400 uppercase">Cliques</th>
                <th className="px-5 py-3 text-right text-xs font-semibold tracking-wide text-gray-400 uppercase">Engajamento</th>
                <th className="px-5 py-3 text-right text-xs font-semibold tracking-wide text-gray-400 uppercase">Barra</th>
              </tr>
            </thead>
            <tbody>
              {paginas.map((p, i) => {
                const eng = p.visits > 0 ? ((p.clicks / p.visits) * 100).toFixed(0) : "0";
                const bar = maxPgVisits > 0 ? (p.visits / maxPgVisits) * 100 : 0;
                return (
                  <tr key={p.path} className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3.5 text-xs font-semibold text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.path}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm font-semibold text-gray-700">{p.visits.toLocaleString("pt-BR")}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-gray-500">{p.clicks.toLocaleString("pt-BR")}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">{eng}%</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-1.5 rounded-full" style={{ width: `${bar}%`, backgroundColor: config.primaryColor }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && paginas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                    Os dados aparecerão aqui assim que o site registrar acessos reais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
