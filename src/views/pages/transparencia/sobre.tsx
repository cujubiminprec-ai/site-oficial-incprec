import { Link } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

const assuntos = [
  "Relatórios financeiros e contábeis",
  "Avaliações atuariais",
  "Balanços e balancetes",
  "Investimentos, DAIR e APR",
  "Política de investimentos",
  "Documentos institucionais de transparência",
];

const bases = [
  "Constituição Federal",
  "Lei de Responsabilidade Fiscal",
  "Lei de Acesso à Informação",
  "Normas aplicáveis aos Regimes Próprios de Previdência Social",
];

export default function TransparenciaSobrePage() {
  const { config } = useSiteConfig();

  return (
    <PageLayout>
      <section className="pt-28 pb-14 px-4" style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}>
        <div className="max-w-screen-xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-4">
            <i className="ri-information-line"></i>Portal da Transparência
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>Sobre o Portal</h1>
          <p className="text-white/75 text-sm md:text-lg max-w-3xl mt-4 leading-relaxed">
            Esta página apresenta a finalidade do Portal da Transparência do INPREC e orienta o cidadão sobre os tipos de informações disponíveis para acompanhamento público.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
          <div className="space-y-5">
            <article className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>Finalidade</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                O Portal da Transparência reúne informações públicas sobre a gestão previdenciária do INPREC, permitindo que servidores, aposentados, pensionistas e cidadãos acompanhem documentos financeiros, contábeis, atuariais e administrativos.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mt-4">
                O objetivo é fortalecer o controle social, facilitar o acesso à informação e dar mais clareza aos atos relacionados ao regime próprio de previdência municipal.
              </p>
            </article>

            <article className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>Informações disponíveis</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {assuntos.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <i className="ri-checkbox-circle-line" style={{ color: config.primaryColor }}></i>
                    <span className="text-sm font-medium text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>Como usar</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Na área de Finanças e Investimentos, use os filtros por categoria, ano, tipo de arquivo e palavra-chave para localizar documentos. Ao encontrar o item desejado, clique em “Abrir documento” para visualizar ou baixar o arquivo publicado.
              </p>
            </article>
          </div>

          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-3">Base de referência</h3>
              <div className="space-y-2">
                {bases.map((item) => (
                  <div key={item} className="text-xs text-gray-600 rounded-xl bg-gray-50 p-3">{item}</div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-2">Acesso rápido</h3>
              <div className="space-y-2">
                <Link to="/financas-investimentos" className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Finanças e Investimentos <i className="ri-arrow-right-line"></i>
                </Link>
                <Link to="/transparencia/glossario" className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Glossário <i className="ri-arrow-right-line"></i>
                </Link>
                <Link to="/lai" className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Lei de Acesso à Informação <i className="ri-arrow-right-line"></i>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PageLayout>
  );
}
