import { useEffect, useState } from "react";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";

export default function PesquisaPage() {
  const { config } = useSiteConfig();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const [submitted, setSubmitted] = useState(false);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [charCount, setCharCount] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const criterios = [
    { key: "atendimento", label: "Qualidade do Atendimento", desc: "Cordialidade, clareza e acolhimento." },
    { key: "servicos", label: "Qualidade dos Serviços", desc: "Eficiência e solução da demanda." },
    { key: "transparencia", label: "Transparência", desc: "Facilidade para encontrar informações." },
    { key: "comunicacao", label: "Comunicação", desc: "Canais, linguagem e retorno ao segurado." },
    { key: "geral", label: "Avaliação Geral", desc: "Sua percepção geral sobre o INPREC." },
  ];

  useEffect(() => {
    if (window.location.hash === "#participar") {
      setShowResults(false);
      setTimeout(() => document.getElementById("participar")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new URLSearchParams();
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input,select,textarea").forEach((el) => {
      if (el.name) data.append(el.name, el.value);
    });
    Object.entries(ratings).forEach(([k, v]) => data.append(k, String(v)));
    await fetch("https://readdy.ai/api/form/d7ehg1l37cef9t402f40", { method: "POST", body: data });
    setSubmitted(true);
  };

  return (
    <PageLayout>
      <section className="pt-32 pb-16 px-4" style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-5">
              <i className="ri-survey-line"></i>
              Transparência & Opinião
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Pesquisa de Satisfação</h1>
            <p className="text-white/75 text-base max-w-2xl mx-auto leading-relaxed">Participe em poucos minutos. Sua avaliação ajuda o INPREC a melhorar o atendimento, os serviços e a transparência para servidores, aposentados e pensionistas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-10 max-w-4xl mx-auto">
            {[
              { icon: "ri-time-line", value: "2 min", label: "tempo médio" },
              { icon: "ri-shield-check-line", value: "LGPD", label: "dados protegidos" },
              { icon: "ri-bar-chart-box-line", value: "5 critérios", label: "avaliação objetiva" },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 border border-white/15 rounded-2xl p-4 text-center backdrop-blur-sm">
                <i className={`${item.icon} text-white/80 text-xl`}></i>
                <p className="text-white text-lg font-bold mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{item.value}</p>
                <p className="text-white/55 text-xs uppercase tracking-wider">{item.label}</p>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-8">
            <button 
              onClick={() => setShowResults(false)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${!showResults ? "bg-white text-green-700 shadow-lg" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              <i className="ri-edit-line mr-2"></i>Participar agora
            </button>
            <button 
              onClick={() => setShowResults(true)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${showResults ? "bg-white text-green-700 shadow-lg" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              <i className="ri-bar-chart-line mr-2"></i>Resultados
            </button>
          </div>
        </div>
      </section>

      <section id="participar" ref={ref as React.RefObject<HTMLElement>} className="py-16 px-4 bg-gray-50/50 scroll-mt-24">
        <div className="max-w-4xl mx-auto">
          {showResults ? (
            <div className={`space-y-8 ${animClass(isVisible, "slide-up", 0)}`}>
              {/* Header de Resultados */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Relatório de Transparência</h2>
                    <p className="text-sm text-gray-500">Consolidado das avaliações realizadas no último trimestre. Dados protegidos conforme a LGPD.</p>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-4xl font-black" style={{ color: config.primaryColor }}>4.8</div>
                    <div className="flex items-center gap-1 text-amber-400 mb-1 justify-center md:justify-end">
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-half-fill"></i>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Média Geral</p>
                  </div>
                </div>
              </div>

              {/* Grid de Gráficos Principais */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gauge Circular */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col items-center justify-center text-center">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">Índice de Recomendação</h3>
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                      <circle 
                        cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={364.4}
                        strokeDashoffset={364.4 * (1 - 0.94)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 delay-500"
                        style={{ color: config.primaryColor }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-gray-900">94%</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Excelente</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-4 leading-relaxed">
                    Dos usuários recomendariam os serviços do INPREC para outros servidores.
                  </p>
                </div>

                {/* Distribuição de Estrelas */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm col-span-1 lg:col-span-2">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">Distribuição de Avaliações</h3>
                  <div className="space-y-2.5">
                    {[
                      { stars: 5, percent: 85, color: config.primaryColor },
                      { stars: 4, percent: 10, color: "#4ade80" },
                      { stars: 3, percent: 3, color: "#f59e0b" },
                      { stars: 2, percent: 1, color: "#fb7185" },
                      { stars: 1, percent: 1, color: "#ef4444" },
                    ].map((row) => (
                      <div key={row.stars} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-12 shrink-0">
                          <span className="text-xs font-bold text-gray-600">{row.stars}</span>
                          <i className="ri-star-fill text-[10px] text-amber-400"></i>
                        </div>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-1000"
                            style={{ width: isVisible ? `${row.percent}%` : "0%", backgroundColor: row.color }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 w-8 text-right">{row.percent}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400">
                    <span>Baseado em 1.240 avaliações recentes</span>
                    <span className="flex items-center gap-1"><i className="ri-checkbox-circle-line text-green-500"></i> Dados Auditados</span>
                  </div>
                </div>
              </div>

              {/* Grid de Barras por Categoria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Qualidade do Atendimento", value: 92, count: 124, color: config.primaryColor },
                  { label: "Transparência de Dados", value: 96, count: 124, color: "#0ea5e9" },
                  { label: "Agilidade nos Processos", value: 88, count: 124, color: "#8b5cf6" },
                  { label: "Canais de Comunicação", value: 85, count: 124, color: "#f59e0b" },
                ].map((item, idx) => (
                  <div key={item.label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-gray-700">{item.label}</span>
                      <span className="text-sm font-black" style={{ color: item.color }}>{item.value}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full transition-all duration-1000 delay-300"
                        style={{ width: isVisible ? `${item.value}%` : "0%", backgroundColor: item.color }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                      <span>{item.count} respostas analisadas</span>
                      <span>Excelente</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Informativo LGPD */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                  <i className="ri-shield-check-line text-xl"></i>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900 mb-1">Privacidade & LGPD</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Em conformidade com a Lei Geral de Proteção de Dados (LGPD), todos os resultados exibidos são agregados e anonimizados. Nenhuma informação pessoal (nome, e-mail ou IP) é vinculada publicamente às avaliações individuais. A transparência é feita de forma ética e segura.
                  </p>
                </div>
              </div>

              <div className="text-center pt-4">
                <button 
                  onClick={() => setShowResults(false)}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 cursor-pointer shadow-lg"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <i className="ri-edit-line"></i> Quero avaliar também
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              {submitted ? (
                <div className={`text-center py-20 ${animClass(isVisible, "scale", 0)}`}>
                  <div className="w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-5" style={{ backgroundColor: `${config.primaryColor}15` }}>
                    <i className="ri-star-smile-line text-4xl" style={{ color: config.primaryColor }}></i>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>Obrigado pela avaliação!</h2>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">Sua opinião é fundamental para continuarmos melhorando nossos serviços. Agradecemos sua participação!</p>
                  <button 
                    onClick={() => setShowResults(true)}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 cursor-pointer shadow-lg"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    <i className="ri-bar-chart-line"></i> Ver Resultados Gerais
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} data-readdy-form className={`grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 ${animClass(isVisible, "slide-up", 0)}`}>
                  <div className="flex flex-col gap-6">
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>
                        <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Dados do participante</h3>
                        <p className="text-xs text-gray-500 mt-1">Campos opcionais. Você pode avaliar sem se identificar.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase">Opcional</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome</label>
                        <input name="nome" type="text" placeholder="Seu nome" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail</label>
                        <input name="email" type="email" placeholder="seu@email.com" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Serviço utilizado</label>
                      <select name="servico" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none cursor-pointer">
                        <option value="">Selecione o serviço...</option>
                        <option>Gestão Administrativa</option>
                        <option>Capacitação de Servidores</option>
                        <option>Planejamento Estratégico</option>
                        <option>Controle e Fiscalização</option>
                        <option>Atendimento ao Cidadão</option>
                        <option>Portal de Transparência</option>
                        <option>Previdência</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>
                        <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Avaliação por critério</h3>
                        <p className="text-xs text-gray-500 mt-1">Clique de 1 a 5 estrelas em cada item.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">Obrigatório</span>
                    </div>
                    <div className="flex flex-col gap-5">
                      {criterios.map((c) => (
                        <div key={c.key} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <label className="text-sm font-bold text-gray-800">{c.label}</label>
                              <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                            </div>
                            {ratings[c.key] && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}>
                                {ratings[c.key]}/5
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRatings((prev) => ({ ...prev, [c.key]: star }))}
                                className="h-11 flex items-center justify-center rounded-xl border-2 transition-all cursor-pointer text-base bg-white"
                                style={
                                  (ratings[c.key] ?? 0) >= star
                                    ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }
                                    : { borderColor: "#E5E7EB", color: "#9CA3AF" }
                                }
                              >
                                <i className="ri-star-fill"></i>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>Comentários adicionais</h3>
                    <textarea
                      name="comentarios"
                      rows={4}
                      maxLength={500}
                      placeholder="Conte-nos mais sobre sua experiência e sugestões de melhoria..."
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none resize-none"
                      onChange={(e) => setCharCount(e.target.value.length)}
                    ></textarea>
                    <p className="text-xs text-gray-400 text-right mt-1">{charCount}/500</p>
                  </div>

                  </div>

                  <aside className="lg:sticky lg:top-24 h-fit flex flex-col gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${config.primaryColor}15` }}>
                        <i className="ri-survey-line text-2xl" style={{ color: config.primaryColor }}></i>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Sua opinião importa</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">As respostas ajudam a melhorar processos, atendimento, comunicação e transparência do INPREC.</p>
                      <div className="mt-5 flex flex-col gap-3">
                        {[
                          "Avaliação rápida e objetiva",
                          "Dados tratados conforme LGPD",
                          "Resultado usado para melhoria interna",
                        ].map((item) => (
                          <div key={item} className="flex items-center gap-2 text-xs text-gray-600">
                            <i className="ri-checkbox-circle-line text-green-600"></i>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                      <i className="ri-shield-check-line text-blue-600 mt-0.5"></i>
                      <p className="text-[11px] text-blue-800 leading-relaxed">
                        Seus dados são protegidos e utilizados apenas para fins estatísticos e melhoria interna.
                      </p>
                    </div>

                    <button type="submit" className="py-4 rounded-xl text-sm font-bold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity shadow-lg shadow-green-900/20" style={{ backgroundColor: config.primaryColor }}>
                      <i className="ri-send-plane-line mr-2"></i>
                      Enviar Avaliação
                    </button>
                  </aside>
                </form>
              )}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
