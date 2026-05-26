import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { contatoService } from "@/services/contato.service";

export default function ContatoSection() {
  const { config } = useSiteConfig();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const msg = (form.elements.namedItem("mensagem") as HTMLTextAreaElement).value;
    if (msg.length > 500) return;
    setStatus("sending");
    try {
      const data = new FormData(form);
      await contatoService.enviar({
        nome: String(data.get("nome") || ""),
        email: String(data.get("email") || ""),
        assunto: String(data.get("assunto") || ""),
        mensagem: String(data.get("mensagem") || ""),
      });
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-20 md:py-28 bg-gray-50" id="contato">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="w-full lg:w-[40%]">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-5 border"
              style={{ borderColor: `${config.primaryColor}40`, color: config.primaryColor }}
            >
              Contato / Ouvidoria
            </span>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-5" style={{ fontFamily: "'Poppins', sans-serif", color: config.secondaryColor }}>
              Fale com o<br /><span style={{ color: config.primaryColor }}>INPREC</span>
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-10">
              Entre em contato para dúvidas, sugestões, reclamações ou informações sobre nossos serviços. Nossa equipe responde em até 2 dias úteis.
            </p>
            <div className="flex flex-col gap-5">
              {[
                { icone: "ri-map-pin-line", titulo: "Endereço", valor: config.endereco || "Av. Condor, n° 2588 Centro, CEP: 76.864-000" },
                { icone: "ri-phone-line", titulo: "Telefone", valor: config.telefone || "(69) 99250-9093" },
                { icone: "ri-mail-line", titulo: "E-mail", valor: config.email || "inprec@cujubim.ro.gov.br" },
                { icone: "ri-time-line", titulo: "Atendimento", valor: config.horario || "Segunda a Sexta — 07h30 às 13h30" },
              ].map((item) => (
                <div key={item.titulo} className="flex items-start gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}15` }}>
                    <i className={`${item.icone} text-base`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{item.titulo}</div>
                    <div className="text-sm font-medium text-gray-800">{item.valor}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[60%]">
            <div className="bg-white border border-gray-100 rounded-2xl p-8">
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
                    <i className="ri-check-line text-green-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Mensagem enviada!</h3>
                  <p className="text-sm text-gray-500">Obrigado pelo contato. Responderemos em breve.</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="px-6 py-2.5 rounded-full text-white text-sm font-semibold cursor-pointer whitespace-nowrap hover:opacity-90"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    Enviar nova mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} id="contato-inprec" className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome completo</label>
                      <input name="nome" type="text" required placeholder="Seu nome" className="w-full border-b border-gray-200 bg-transparent py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none transition-colors duration-200" style={{ borderBottomColor: "var(--focus-color, #E5E7EB)" }} onFocus={e => (e.currentTarget.style.borderBottomColor = config.primaryColor)} onBlur={e => (e.currentTarget.style.borderBottomColor = "#E5E7EB")} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">E-mail</label>
                      <input name="email" type="email" required placeholder="seu@email.com" className="w-full border-b border-gray-200 bg-transparent py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none transition-colors duration-200" onFocus={e => (e.currentTarget.style.borderBottomColor = config.primaryColor)} onBlur={e => (e.currentTarget.style.borderBottomColor = "#E5E7EB")} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Assunto</label>
                    <input name="assunto" type="text" required placeholder="Assunto da mensagem" className="w-full border-b border-gray-200 bg-transparent py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none transition-colors duration-200" onFocus={e => (e.currentTarget.style.borderBottomColor = config.primaryColor)} onBlur={e => (e.currentTarget.style.borderBottomColor = "#E5E7EB")} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mensagem ({charCount}/500)</label>
                    <textarea
                      name="mensagem"
                      required
                      rows={5}
                      maxLength={500}
                      placeholder="Escreva sua mensagem..."
                      onChange={(e) => setCharCount(e.target.value.length)}
                      className="w-full border border-gray-100 rounded-xl bg-gray-50 py-3 px-4 text-sm text-gray-800 placeholder-gray-300 focus:outline-none transition-colors duration-200 resize-none"
                    />
                  </div>
                  {status === "error" && <p className="text-sm text-red-500">Erro ao enviar. Tente novamente.</p>}
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full py-3.5 rounded-full text-white font-semibold text-sm transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-60 hover:opacity-90"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    {status === "sending" ? "Enviando..." : "Enviar mensagem"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
