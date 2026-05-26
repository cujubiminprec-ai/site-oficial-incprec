import { useState } from "react";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";

const unidades = [
  {
    id: 1,
    nome: "Sede Principal — INPREC",
    tipo: "Sede",
    endereco: "Av. Condor, n 2588",
    bairro: "Centro",
    cidade: "Cujubim",
    estado: "RO",
    cep: "76.864-000",
    telefone: "(69) 99250-9093",
    email: "inprec@cujubim.ro.gov.br",
    horario: "Segunda a Sexta — 07h30 às 13h30",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31634.54!2d-63.0266!3d-9.3613!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93a9dd3e4b5f6c1b%3A0x8b2c7e1d6f3a4e5!2sCujubim%2C%20RO%2C%2076864-000!5e0!3m2!1spt-BR!2sbr!4v1710000000000!5m2!1spt-BR!2sbr",
    servicos: ["Aposentadoria", "Pensão por Morte", "Auxílio-Doença", "Atendimento Geral", "Ouvidoria"],
    destaque: true,
  }
];

export default function EnderecosPage() {
  const { config } = useSiteConfig();
  const [selecionada, setSelecionada] = useState(unidades[0]);
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.05 });

  return (
    <PageLayout>
      {/* Hero */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        className={`pt-32 pb-20 px-4 relative overflow-hidden transition-all duration-700 ${heroVisible ? "opacity-100" : "opacity-0"}`}
        style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-16 w-72 h-72 rounded-full border border-white/10"></div>
        </div>
        <div className="max-w-screen-xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-5">
            <i className="ri-map-pin-line"></i>Contatos
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Endereços
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Encontre a unidade do INPREC mais próxima de você.
          </p>
        </div>
      </section>

      {/* Conteúdo principal */}
      <section
        ref={contentRef as React.RefObject<HTMLElement>}
        className={`py-16 px-4 transition-all duration-700 ${contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de unidades */}
            <aside className="lg:col-span-1">
              <div className="flex flex-col gap-3">
                {unidades.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setSelecionada(u)}
                    className={`text-left p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${selecionada.id === u.id ? "" : "border-gray-100 bg-white hover:border-gray-200"}`}
                    style={selecionada.id === u.id ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}08` } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 mt-0.5" style={{ backgroundColor: selecionada.id === u.id ? config.primaryColor : `${config.primaryColor}12` }}>
                        <i className="ri-building-2-line text-sm" style={{ color: selecionada.id === u.id ? "white" : config.primaryColor }}></i>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{u.nome}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{u.endereco}, {u.bairro}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{u.cidade} — {u.estado}</p>
                        {u.destaque && <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}>Sede Principal</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Info de contato da selecionada */}
              <div className="mt-5 bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-bold text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{selecionada.nome}</p>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: "ri-map-pin-line", label: "Endereço", val: `${selecionada.endereco}, ${selecionada.bairro}, ${selecionada.cidade} — ${selecionada.estado}, CEP ${selecionada.cep}` },
                    { icon: "ri-phone-line", label: "Telefone", val: selecionada.telefone },
                    { icon: "ri-mail-line", label: "E-mail", val: selecionada.email },
                    { icon: "ri-time-line", label: "Horário", val: selecionada.horario },
                  ].map(c => (
                    <div key={c.label} className="flex items-start gap-3">
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}12` }}>
                        <i className={`${c.icon} text-xs`} style={{ color: config.primaryColor }}></i>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{c.label}</p>
                        <p className="text-xs text-gray-700 mt-0.5 leading-snug">{c.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Serviços disponíveis</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selecionada.servicos.map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${config.primaryColor}10`, color: config.primaryColor }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Mapa */}
            <div className="lg:col-span-2">
              <div className="w-full h-96 lg:h-full min-h-96 rounded-2xl overflow-hidden border border-gray-100">
                <iframe
                  src={selecionada.mapUrl}
                  title={`Mapa — ${selecionada.nome}`}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ border: 0 }}
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Horários gerais */}
      <section className="py-12 px-4" style={{ backgroundColor: `${config.primaryColor}06` }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>Informações de Atendimento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "ri-time-line", titulo: "Horário de Atendimento", desc: "Segunda a Sexta\n07h30 às 13h30" },
              { icon: "ri-phone-line", titulo: "Central de Atendimento", desc: "(69) 99250-9093\ninprec@cujubim.ro.gov.br" },
              { icon: "ri-calendar-line", titulo: "Agendamento Online", desc: "Agende seu atendimento\npelo site ou telefone" },
            ].map(i => (
              <div key={i.titulo} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto mb-3" style={{ backgroundColor: `${config.primaryColor}12` }}>
                  <i className={`${i.icon} text-base`} style={{ color: config.primaryColor }}></i>
                </div>
                <p className="text-xs font-bold text-gray-900 mb-1">{i.titulo}</p>
                <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">{i.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
