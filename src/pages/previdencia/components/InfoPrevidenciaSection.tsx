import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

const faqPrevidencia = [
  { q: "Qual é a idade mínima para aposentadoria?", a: "Para servidores do sexo masculino, a idade mínima é de 65 anos. Para o sexo feminino, 62 anos. Em ambos os casos, exige-se ao menos 25 anos de contribuição ao regime próprio." },
  { q: "Como calcular meu benefício de aposentadoria?", a: "O benefício é calculado com base na média dos salários de contribuição, aplicando-se o percentual correspondente ao tempo de contribuição. Use nosso simulador para uma estimativa." },
  { q: "Quais documentos são necessários para dar entrada na aposentadoria?", a: "RG, CPF, comprovante de residência, carteira de trabalho, declaração de vínculos empregatícios e certidão de tempo de contribuição do INSS (se aplicável)." },
  { q: "Quanto tempo leva para o benefício ser concedido?", a: "Em média, 30 a 90 dias após o protocolo completo dos documentos, dependendo da complexidade do caso e da demanda no período." },
  { q: "Posso me aposentar por invalidez?", a: "Sim. O servidor que for considerado permanentemente inválido para o exercício de suas funções tem direito à aposentadoria por invalidez, com benefício integral ou proporcional dependendo da causa." },
  { q: "Como faço para consultar meu extrato de contribuição?", a: "Você pode consultar diretamente no setor de Previdência do INPREC, presencialmente ou por solicitação formal, mediante apresentação de identificação." },
];

const beneficios = [
  { icon: "ri-user-star-line", titulo: "Aposentadoria por Idade", descricao: "Garantia de renda após a carreira de serviço público", cor: "" },
  { icon: "ri-heart-line", titulo: "Pensão por Morte", descricao: "Proteção para seus dependentes em caso de falecimento", cor: "#DC2626" },
  { icon: "ri-hospital-line", titulo: "Auxílio-Doença", descricao: "Benefício por incapacidade temporária para o trabalho", cor: "#0891B2" },
  { icon: "ri-shield-check-line", titulo: "Aposentadoria por Invalidez", descricao: "Proteção em caso de incapacidade permanente", cor: "#059669" },
  { icon: "ri-funds-line", titulo: "Fundo Previdenciário", descricao: "Gestão responsável dos recursos para garantia futura", cor: "#D97706" },
  { icon: "ri-customer-service-2-line", titulo: "Atendimento Personalizado", descricao: "Equipe especializada para orientação previdenciária", cor: "" },
];

export default function InfoPrevidenciaSection() {
  const { config } = useSiteConfig();
  const beneficiosComCor = beneficios.map(b => ({ ...b, cor: b.cor || config.primaryColor }));
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-12">
      {/* Benefícios */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Benefícios Previdenciários</h2>
        <p className="text-gray-500 text-sm mb-6">Conheça todos os benefícios oferecidos pelo Regime Próprio de Previdência Social (RPPS).</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {beneficiosComCor.map((b) => (
            <div key={b.titulo} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-all">
              <div className="w-11 h-11 flex items-center justify-center rounded-xl mb-3" style={{ backgroundColor: `${b.cor}15` }}>
                <i className={`${b.icon} text-xl`} style={{ color: b.cor }}></i>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{b.titulo}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{b.descricao}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Legislação */}
      <div className="rounded-2xl p-8" style={{ background: `linear-gradient(135deg, ${config.secondaryColor}15, ${config.primaryColor}15)` }}>
        <h2 className="text-xl font-bold text-gray-900 mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
          <i className="ri-scales-line mr-2" style={{ color: config.primaryColor }}></i>
          Base Legal
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { titulo: "Emenda Constitucional nº 103/2019", descricao: "Reforma Previdenciária – Regras gerais dos RPPS" },
            { titulo: "Lei Federal nº 9.717/1998", descricao: "Regras gerais para os RPPS dos servidores públicos" },
            { titulo: "Lei Municipal nº 1.234/2010", descricao: "Estatuto do INPREC – Criação e regulamentação" },
            { titulo: "Portaria MTP nº 1.467/2022", descricao: "Diretrizes atuariais para RPPS" },
            { titulo: "Resolução CMN nº 4.963/2021", descricao: "Aplicação dos recursos dos RPPS" },
            { titulo: "Lei Complementar nº 101/2000", descricao: "Lei de Responsabilidade Fiscal" },
          ].map((l) => (
            <div key={l.titulo} className="bg-white rounded-xl p-4 border border-white">
              <p className="text-xs font-bold text-gray-900 mb-1">{l.titulo}</p>
              <p className="text-xs text-gray-500">{l.descricao}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Dúvidas Frequentes</h2>
        <p className="text-gray-500 text-sm mb-6">Respostas para as principais perguntas sobre previdência municipal.</p>
        <div className="flex flex-col gap-3">
          {faqPrevidencia.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900 pr-4">{item.q}</span>
                {openFaq === i ? <i className="ri-arrow-up-s-line text-gray-400 flex-shrink-0"></i> : <i className="ri-arrow-down-s-line text-gray-400 flex-shrink-0"></i>}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Contato */}
      <div className="rounded-2xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${config.secondaryColor}, ${config.primaryColor})` }}>
        <i className="ri-customer-service-2-line text-4xl text-white/80 mb-4 block"></i>
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Precisa de Ajuda?
        </h3>
        <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
          Nossa equipe de especialistas em previdência está pronta para tirar suas dúvidas e orientar sobre seus direitos.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="tel:+550030000000"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-sm font-semibold cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
            style={{ color: config.primaryColor }}
          >
            <i className="ri-phone-line"></i> Ligar Agora
          </a>
          <a
            href="/contato"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/40 text-white text-sm font-semibold cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            <i className="ri-mail-line"></i> Enviar Mensagem
          </a>
        </div>
      </div>
    </div>
  );
}
