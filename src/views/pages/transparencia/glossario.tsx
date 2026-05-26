import { useMemo, useState } from "react";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

const termos = [
  { termo: "Avaliação Atuarial", significado: "Estudo técnico que analisa receitas, despesas, benefícios e riscos do regime previdenciário para medir seu equilíbrio financeiro e atuarial." },
  { termo: "Balanço Anual", significado: "Demonstração contábil que apresenta a posição patrimonial e financeira ao final do exercício." },
  { termo: "Balancete", significado: "Relatório periódico usado para acompanhar receitas, despesas, saldos e movimentações contábeis." },
  { termo: "DAIR", significado: "Demonstrativo das Aplicações e Investimentos dos Recursos, usado para registrar informações de investimentos do RPPS." },
  { termo: "APR", significado: "Autorização de Aplicação e Resgate, documento relacionado às movimentações de recursos em investimentos." },
  { termo: "Política de Investimentos", significado: "Documento que define diretrizes, limites e estratégias para aplicação dos recursos previdenciários." },
  { termo: "Prestação de Contas", significado: "Conjunto de documentos e demonstrativos usados para comprovar atos de gestão e execução financeira." },
  { termo: "Receita Pública", significado: "Ingresso de recursos financeiros arrecadados ou recebidos pela entidade pública." },
  { termo: "Despesa Pública", significado: "Aplicação de recursos para execução de serviços, obrigações e atividades autorizadas." },
  { termo: "Empenho", significado: "Ato que reserva dotação orçamentária para uma despesa previamente autorizada." },
  { termo: "Liquidação", significado: "Etapa que verifica se o serviço foi prestado, o bem entregue ou a obrigação cumprida antes do pagamento." },
  { termo: "Ordem Bancária", significado: "Instrumento usado para efetivar pagamento ou transferência de recursos." },
  { termo: "Superávit", significado: "Resultado positivo quando as receitas ou disponibilidades superam as despesas ou obrigações." },
  { termo: "Déficit", significado: "Resultado negativo quando despesas ou obrigações superam receitas ou disponibilidades." },
  { termo: "RPPS", significado: "Regime Próprio de Previdência Social, sistema previdenciário dos servidores titulares de cargo efetivo." },
  { termo: "Controle Social", significado: "Participação do cidadão no acompanhamento e fiscalização da gestão pública." },
  { termo: "LAI", significado: "Lei de Acesso à Informação, norma que garante o direito de acesso a dados e documentos públicos." },
  { termo: "Transparência Ativa", significado: "Publicação espontânea de informações públicas, sem necessidade de pedido prévio do cidadão." },
  { termo: "Transparência Passiva", significado: "Fornecimento de informações públicas mediante solicitação formal do cidadão." },
  { termo: "Exercício Financeiro", significado: "Período de execução orçamentária e financeira, normalmente correspondente ao ano civil." },
];

export default function TransparenciaGlossarioPage() {
  const { config } = useSiteConfig();
  const [busca, setBusca] = useState("");
  const [letra, setLetra] = useState("Todas");

  const letras = useMemo(() => ["Todas", ...Array.from(new Set(termos.map((item) => item.termo[0].toUpperCase()))).sort()], []);
  const filtrados = termos.filter((item) => {
    const matchBusca = !busca || `${item.termo} ${item.significado}`.toLowerCase().includes(busca.toLowerCase());
    const matchLetra = letra === "Todas" || item.termo.toUpperCase().startsWith(letra);
    return matchBusca && matchLetra;
  });

  return (
    <PageLayout>
      <section className="pt-28 pb-14 px-4" style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}>
        <div className="max-w-screen-xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-4">
            <i className="ri-book-2-line"></i>Portal da Transparência
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>Glossário</h1>
          <p className="text-white/75 text-sm md:text-lg max-w-3xl mt-4 leading-relaxed">
            Conceitos básicos para facilitar a compreensão dos documentos financeiros, previdenciários e de transparência publicados pelo INPREC.
          </p>
        </div>
      </section>

      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 mb-5">
            <div className="grid md:grid-cols-[minmax(0,1fr)_220px] gap-3">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Buscar termo ou significado..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-300"
                />
              </div>
              <select value={letra} onChange={(event) => setLetra(event.target.value)} className="px-3 py-3 rounded-xl border border-gray-200 text-sm bg-white outline-none">
                {letras.map((item) => <option key={item} value={item}>{item === "Todas" ? "Todas as letras" : `Letra ${item}`}</option>)}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filtrados.map((item) => (
              <article key={item.termo} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${config.primaryColor}12`, color: config.primaryColor }}>
                    <span className="text-sm font-bold">{item.termo[0]}</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">{item.termo}</h2>
                    <p className="text-sm text-gray-600 leading-relaxed mt-2">{item.significado}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtrados.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              <i className="ri-search-eye-line text-4xl block mb-3"></i>
              <p className="text-sm font-semibold">Nenhum termo encontrado</p>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
