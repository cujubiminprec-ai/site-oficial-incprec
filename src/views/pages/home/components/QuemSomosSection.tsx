import { useEffect, useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { grupos, Gestor, Curso, Documento, gestores as gestoresMock } from "@/mocks/gestores";
import { gestoresService } from "@/services/gestores.service";

const valores = [
  { icone: "ri-focus-3-line", titulo: "Missão", texto: "Promover a excelência na gestão pública, capacitando servidores e modernizando processos para melhor servir ao cidadão." },
  { icone: "ri-eye-line", titulo: "Visão", texto: "Ser referência nacional em inovação institucional, reconhecido pela transparência, eficiência e impacto positivo na sociedade." },
  { icone: "ri-heart-line", titulo: "Valores", texto: "Ética, transparência, inovação, respeito ao cidadão e compromisso com o desenvolvimento sustentável da gestão pública." },
];

const stats = [
  { valor: "2003", label: "Ano de fundação" },
  { valor: "856", label: "Servidores vinculados" },
  { valor: "142", label: "Benefícios ativos" },
  { valor: "20+", label: "Anos de história" },
];

function PerfilGestorModal({ gestor, onClose, primaryColor }: { gestor: Gestor; onClose: () => void; primaryColor: string }) {
  const [abaAtiva, setAbaAtiva] = useState<"dados" | "cursos" | "documentos">("dados");
  const grupo = grupos.find((item) => item.key === gestor.grupo);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-[1180px] h-[94vh] md:h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="relative h-36 flex-shrink-0" style={{ background: `linear-gradient(135deg, #14532D 0%, ${primaryColor} 100%)` }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Fechar perfil"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
              <img src={gestor.foto} alt={gestor.nome} className="w-full h-full object-cover object-top" />
            </div>
          </div>
        </div>

        <div className="pt-14 px-6 md:px-10 pb-4 text-center flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{gestor.nome}</h2>
          <p className="text-sm font-semibold mt-0.5" style={{ color: primaryColor }}>{gestor.cargo}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            {grupo && (
              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                {grupo.label}
              </span>
            )}
            {gestor.mandato && (
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                <i className="ri-time-line mr-1"></i>{gestor.mandato}
              </span>
            )}
            {gestor.matricula && (
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-500">
                Matr. {gestor.matricula}
              </span>
            )}
          </div>
        </div>

        <div className="flex border-b border-gray-100 px-6 md:px-10 flex-shrink-0 overflow-x-auto">
          {(["dados", "cursos", "documentos"] as const).map((aba) => {
            const labels = { dados: "Dados", cursos: `Cursos (${gestor.cursos.length})`, documentos: `Documentos (${gestor.documentos.length})` };
            return (
              <button
                key={aba}
                onClick={() => setAbaAtiva(aba)}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${abaAtiva === aba ? "border-current" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                style={abaAtiva === aba ? { color: primaryColor, borderColor: primaryColor } : {}}
              >
                {labels[aba]}
              </button>
            );
          })}
        </div>

        <div className="overflow-y-auto flex-1 px-6 md:px-10 lg:px-12 py-6">
          {abaAtiva === "dados" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Sobre</p>
                <p className="text-sm text-gray-600 leading-relaxed">{gestor.bio || "Perfil institucional cadastrado no INPREC."}</p>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Formacao Principal", value: gestor.formacao, icon: "ri-graduation-cap-line" },
                  { label: "E-mail Institucional", value: gestor.email, icon: "ri-mail-line" },
                  { label: "Telefone", value: gestor.telefone, icon: "ri-phone-line" },
                ].filter((item) => item.value).map((item) => (
                  <div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                      <i className={`${item.icon} text-sm`} style={{ color: primaryColor }}></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{item.label}</p>
                      <p className="text-xs text-gray-700 font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {abaAtiva === "cursos" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {gestor.cursos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nenhum curso cadastrado</p>
              ) : (
                gestor.cursos.map((curso: Curso) => (
                  <div key={curso.id} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5" style={{ backgroundColor: `${primaryColor}15` }}>
                      <i className="ri-book-open-line text-sm" style={{ color: primaryColor }}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900 leading-snug">{curso.titulo}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{curso.instituicao}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {abaAtiva === "documentos" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {gestor.documentos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nenhum documento cadastrado</p>
              ) : (
                gestor.documentos.map((doc: Documento) => (
                  <a key={doc.id} href={doc.url || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                      <i className="ri-file-pdf-2-line text-sm" style={{ color: primaryColor }}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900 leading-snug">{doc.titulo}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{doc.tipo} - {doc.tamanho}</p>
                    </div>
                    <i className="ri-external-link-line text-sm text-gray-400"></i>
                  </a>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuemSomosSection() {
  const { config } = useSiteConfig();
  const [gestorSelecionado, setGestorSelecionado] = useState<Gestor | null>(null);
  const [listaGestores, setListaGestores] = useState<Gestor[]>(gestoresMock);

  useEffect(() => {
    let isMounted = true;
    gestoresService.listar().then((data) => {
      if (isMounted) {
        setListaGestores(data);
      }
    }).catch(() => {
      setListaGestores(gestoresMock);
    });
    return () => { isMounted = false; };
  }, []);

  const diretoria = listaGestores.filter((gestor) => gestor.grupo === "diretoria" && gestor.ativo !== false).slice(0, 5);

  return (
    <section className="py-12 md:py-16 bg-gray-50" id="quem-somos">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          <div className="w-full lg:w-[45%] relative">
            <div className="relative rounded-2xl overflow-hidden h-[360px] md:h-[420px]">
              <img
                src="https://readdy.ai/api/search-image?query=modern%20public%20institution%20building%20interior%20lobby%20elegant%20atrium%20professional%20governance%20architecture%20clean%20bright%20minimalist%20green&width=900&height=700&seq=about1&orientation=portrait"
                alt="INPREC"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <div className="absolute -bottom-6 -right-4 md:-right-8 bg-white rounded-2xl p-6 grid grid-cols-2 gap-4 w-56 md:w-64 border border-gray-100">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-lg font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: config.primaryColor }}>{s.valor}</div>
                  <div className="text-xs text-gray-500 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[55%] pt-4 lg:pt-0">
            <span
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase mb-3 border"
              style={{ borderColor: `${config.primaryColor}40`, color: config.primaryColor }}
            >
              Quem Somos
            </span>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4" style={{ fontFamily: "'Poppins', sans-serif", color: config.secondaryColor }}>
              Instituto referência em<br />
              <span style={{ color: config.primaryColor }}>previdência municipal</span> de qualidade
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              O INPREC é o Instituto de Previdência Social dos Servidores Públicos Municipais de Cujubim, dedicado a garantir com transparência, responsabilidade e excelência a previdência dos servidores municipais.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {valores.map((v, i) => (
                <div
                  key={v.titulo}
                  className="p-5 rounded-xl"
                  style={i === 0 ? { backgroundColor: config.primaryColor } : { backgroundColor: "white", border: "1px solid #F3F4F6" }}
                >
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded-lg mb-3"
                    style={i === 0 ? { backgroundColor: "rgba(255,255,255,0.2)" } : { backgroundColor: `${config.primaryColor}15` }}
                  >
                    <i className={`${v.icone} text-base`} style={{ color: i === 0 ? "white" : config.primaryColor }}></i>
                  </div>
                  <div className="text-sm font-bold mb-1.5" style={{ fontFamily: "'Poppins', sans-serif", color: i === 0 ? "white" : config.secondaryColor }}>
                    {v.titulo}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: i === 0 ? "rgba(255,255,255,0.8)" : "#6B7280" }}>
                    {v.texto}
                  </p>
                </div>
              ))}
            </div>

            {diretoria.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Diretoria Executiva</h3>
                    <p className="text-xs text-gray-500 mt-1">Clique na foto para ver o perfil completo.</p>
                  </div>
                  <a href="/gestores" className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold" style={{ color: config.primaryColor }}>
                    Ver todos <i className="ri-arrow-right-line"></i>
                  </a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {diretoria.map((gestor) => (
                    <button
                      key={gestor.id}
                      onClick={() => setGestorSelecionado(gestor)}
                      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden text-left hover:-translate-y-1 hover:border-gray-200 transition-all"
                    >
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        <img src={gestor.foto} alt={gestor.nome} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-end justify-center pb-2">
                          <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-semibold bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full transition-opacity">
                            <i className="ri-eye-line mr-1"></i>Ver perfil
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">{gestor.nome}</p>
                        <p className="text-[10px] text-gray-500 mt-1 leading-snug line-clamp-2">{gestor.cargo}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {gestorSelecionado && (
        <PerfilGestorModal gestor={gestorSelecionado} onClose={() => setGestorSelecionado(null)} primaryColor={config.primaryColor} />
      )}
    </section>
  );
}
