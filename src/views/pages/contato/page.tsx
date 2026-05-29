import { useState } from "react";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";
import { usePageContent } from "@/hooks/usePageContent";
import PaginaBlocosRenderer from "@/components/feature/PaginaBlocosRenderer";
import { contatoService } from "@/services/contato.service";

export default function ContatoPage() {
  const { config } = useSiteConfig();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const [submitted, setSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const blocos = usePageContent("contato");
  const hasHeroBloco = blocos.some(b => b.tipo === "hero");
  const waDigits = (config.whatsapp || "").replace(/\D/g, "");
  const waUrl = `https://wa.me/${waDigits.startsWith("55") && waDigits.length >= 12 ? waDigits : `55${waDigits}`}`;
  const heroBlocos = blocos.filter(b => b.tipo === "hero");
  const blocosNaoHero = blocos.filter(b => b.tipo !== "hero");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await contatoService.enviar({
        nome: String(formData.get("nome") || ""),
        email: String(formData.get("email") || ""),
        telefone: String(formData.get("telefone") || ""),
        assunto: String(formData.get("assunto") || ""),
        mensagem: String(formData.get("mensagem") || ""),
      });
      setSubmitted(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar contato.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <PageLayout>
      {hasHeroBloco ? (
        <PaginaBlocosRenderer blocos={heroBlocos} />
      ) : (
        <section className="pt-28 md:pt-32 pb-14 md:pb-20 px-4" style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}>
          <div className="max-w-screen-xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-4 md:mb-5">Fale Conosco</span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Contato</h1>
            <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto">Estamos à disposição para atender suas dúvidas, solicitações e sugestões.</p>
          </div>
        </section>
      )}

      {blocosNaoHero.length > 0 && (
        <PaginaBlocosRenderer blocos={blocosNaoHero} />
      )}

      <section ref={ref as React.RefObject<HTMLElement>} className="py-10 md:py-16 px-4">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          <aside className={animClass(isVisible, "slide-left", 0)}>
            <h3 className="text-base font-bold text-gray-900 mb-4 md:mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>Informações de Contato</h3>
            <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
              {[
                { icon: "ri-map-pin-line", title: "Endereço", text: config.endereco },
                { icon: "ri-phone-line", title: "Telefone", text: config.telefone },
                { icon: "ri-mail-line", title: "E-mail", text: config.email },
                { icon: "ri-time-line", title: "Horário", text: config.horario || "Segunda a Sexta — 07h30 às 13h30" },
                { icon: "ri-whatsapp-line", title: "WhatsApp", text: `+${config.whatsapp}` },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}15` }}>
                    <i className={`${item.icon} text-base`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">{item.title}</p>
                    <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-line">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity bg-[#25D366]"
            >
              <i className="ri-whatsapp-line"></i> Chamar no WhatsApp
            </a>
          </aside>

          <div className={`lg:col-span-2 ${animClass(isVisible, "slide-right", 100)}`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-5 md:mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>Enviar Mensagem</h2>
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4" style={{ backgroundColor: `${config.primaryColor}15` }}>
                    <i className="ri-check-line text-3xl" style={{ color: config.primaryColor }}></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Mensagem enviada!</h3>
                  <p className="text-gray-500 text-sm">Entraremos em contato em até 2 dias úteis.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome completo</label>
                      <input name="nome" type="text" required className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail</label>
                      <input name="email" type="email" required className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Telefone</label>
                      <input name="telefone" type="tel" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Assunto</label>
                      <select name="assunto" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none cursor-pointer">
                        <option>Informação geral</option>
                        <option>Serviços</option>
                        <option>Capacitação</option>
                        <option>Transparência</option>
                        <option>Parceria</option>
                        <option>Outro</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Mensagem</label>
                    <textarea
                      name="mensagem"
                      rows={5}
                      maxLength={500}
                      required
                      placeholder="Descreva como podemos ajudar..."
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none resize-none"
                      onChange={(e) => setCharCount(e.target.value.length)}
                    ></textarea>
                    <p className="text-xs text-gray-400 text-right mt-1">{charCount}/500</p>
                  </div>
                  {erro && <p className="text-sm text-red-500">{erro}</p>}
                  <button type="submit" disabled={enviando} className="py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity disabled:opacity-60" style={{ backgroundColor: config.primaryColor }}>
                    {enviando ? "Enviando..." : "Enviar Mensagem"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
