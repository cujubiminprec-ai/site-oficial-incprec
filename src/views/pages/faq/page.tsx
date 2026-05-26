import { useEffect, useState } from "react";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";
import { conteudoService } from "@/services/conteudo.service";

const faqsDefault = [
  { categoria: "Geral", pergunta: "O que é o INPREC?", resposta: "O INPREC é um instituto público dedicado ao fortalecimento da gestão municipal, oferecendo capacitação de servidores, assessoria técnica e modernização administrativa para municípios." },
  { categoria: "Geral", pergunta: "Quem pode utilizar os serviços do INPREC?", resposta: "Os serviços são destinados a municípios, servidores públicos e cidadãos. Cada serviço tem critérios específicos de acesso descritos na nossa seção de Serviços." },
  { categoria: "Capacitação", pergunta: "Como me inscrever nos cursos de capacitação?", resposta: "As inscrições são realizadas pelo Portal do Servidor ou presencialmente na sede do INPREC. Fique atento às datas das turmas publicadas no site." },
  { categoria: "Capacitação", pergunta: "Os cursos são gratuitos?", resposta: "Sim, todos os cursos e programas de capacitação oferecidos pelo INPREC para servidores municipais conveniados são gratuitos." },
  { categoria: "Transparência", pergunta: "Como acesso os relatórios financeiros?", resposta: "Todos os relatórios financeiros estão disponíveis no Portal da Transparência, na seção Transparência do nosso site, sem necessidade de cadastro." },
  { categoria: "Transparência", pergunta: "Como solicitar informações via LAI?", resposta: "Acesse o menu Transparência > LAI e preencha o formulário de Pedido de Informação. Você receberá resposta em até 20 dias úteis." },
  { categoria: "Ouvidoria", pergunta: "Minha manifestação na Ouvidoria é sigilosa?", resposta: "Sim. Todas as manifestações são tratadas com total sigilo. Você também pode registrar anonimamente marcando a opção correspondente no formulário." },
  { categoria: "Ouvidoria", pergunta: "Qual o prazo para receber resposta da Ouvidoria?", resposta: "O prazo legal é de até 20 dias úteis a partir do registro da manifestação. Em casos complexos, o prazo pode ser prorrogado mediante comunicação." },
  { categoria: "Previdência", pergunta: "Como solicitar benefício previdenciário?", resposta: "Dirija-se à sede do INPREC com documentos pessoais, comprovante de tempo de serviço e formulário de requerimento. Também é possível agendar atendimento online." },
  { categoria: "Previdência", pergunta: "Quais documentos são necessários para aposentadoria?", resposta: "São necessários: RG, CPF, comprovante de residência, contracheques dos últimos 3 meses, certidão de tempo de serviço e formulário de requerimento preenchido." },
];

const categFaq = ["Todos", "Geral", "Capacitação", "Transparência", "Ouvidoria", "Previdência"];

export default function FAQPage() {
  const { config } = useSiteConfig();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.05 });
  const [openId, setOpenId] = useState<number | null>(null);
  const [categoria, setCategoria] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [faqs, setFaqs] = useState(faqsDefault);

  useEffect(() => {
    conteudoService.listarFaqPublico()
      .then((remote) => {
        if (Array.isArray(remote) && remote.length > 0) setFaqs(remote);
      })
      .catch(() => undefined);
  }, []);

  const filtered = faqs.filter((f) => {
    const matchCat = categoria === "Todos" || f.categoria === categoria;
    const matchBusca = f.pergunta.toLowerCase().includes(busca.toLowerCase()) || f.resposta.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  return (
    <PageLayout>
      <section className="pt-28 md:pt-32 pb-14 md:pb-20 px-4" style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}>
        <div className="max-w-screen-xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-4 md:mb-5">Central de Ajuda</span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Perguntas Frequentes</h1>
          <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-6 md:mb-8">Encontre respostas para as dúvidas mais comuns sobre nossos serviços e processos.</p>
          <div className="relative max-w-md mx-auto">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar nas perguntas..."
              className="w-full pl-10 pr-4 py-3 rounded-full text-sm focus:outline-none text-gray-700"
            />
          </div>
        </div>
      </section>

      <section ref={ref as React.RefObject<HTMLElement>} className="py-10 md:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className={`flex flex-wrap gap-2 mb-8 justify-center ${animClass(isVisible, "fade", 0)}`}>
            {categFaq.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className="px-4 py-2 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-all"
                style={categoria === cat ? { backgroundColor: config.primaryColor, color: "white" } : { backgroundColor: "#F3F4F6", color: "#6B7280" }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {filtered.map((faq, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${animClass(isVisible, "slide-up", i * 40)}`}
              >
                <button
                  onClick={() => setOpenId(openId === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}>
                      {faq.categoria}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{faq.pergunta}</span>
                  </div>
                  <i className={`ri-arrow-down-s-line text-gray-400 flex-shrink-0 ml-3 transition-transform duration-200 ${openId === i ? "rotate-180" : ""}`}></i>
                </button>
                {openId === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">{faq.resposta}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <i className="ri-question-line text-5xl mb-3 block"></i>
              <p className="text-sm">Nenhuma pergunta encontrada. <a href="/ouvidoria" className="underline cursor-pointer" style={{ color: config.primaryColor }}>Envie sua dúvida</a></p>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
