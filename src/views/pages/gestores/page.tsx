import { useState, useEffect } from "react";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { gestores as gestoresMock, grupos, Gestor, Curso, Documento } from "@/mocks/gestores";
import { gestoresService } from "@/services/gestores.service";

function GestorModal({ gestor, onClose, primaryColor }: { gestor: Gestor; onClose: () => void; primaryColor: string }) {
  const [abaAtiva, setAbaAtiva] = useState<"dados" | "cursos" | "documentos">("dados");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-[1180px] h-[94vh] md:h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header com foto */}
        <div
          className="relative h-36 flex-shrink-0"
          style={{ background: `linear-gradient(135deg, #14532D 0%, ${primaryColor} 100%)` }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white cursor-pointer hover:bg-white/30 transition-colors"
          >
            <i className="ri-close-line"></i>
          </button>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden">
              <img src={gestor.foto} alt={gestor.nome} className="w-full h-full object-cover object-top" />
            </div>
          </div>
        </div>

        {/* Info principal */}
        <div className="pt-14 px-6 md:px-10 pb-4 text-center flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{gestor.nome}</h2>
          <p className="text-sm font-semibold mt-0.5" style={{ color: primaryColor }}>{gestor.cargo}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {grupos.find(g => g.key === gestor.grupo) && (
              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                {grupos.find(g => g.key === gestor.grupo)?.label}
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

        {/* Abas */}
        <div className="flex border-b border-gray-100 px-6 md:px-10 flex-shrink-0">
          {(["dados", "cursos", "documentos"] as const).map((aba) => {
            const labels = { dados: "Dados", cursos: `Cursos (${gestor.cursos.length})`, documentos: `Documentos (${gestor.documentos.length})` };
            return (
              <button
                key={aba}
                onClick={() => setAbaAtiva(aba)}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${abaAtiva === aba ? "border-current" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                style={abaAtiva === aba ? { color: primaryColor, borderColor: primaryColor } : {}}
              >
                {labels[aba]}
              </button>
            );
          })}
        </div>

        {/* Conteúdo das abas */}
        <div className="overflow-y-auto flex-1 px-6 md:px-10 lg:px-12 py-6">
          {abaAtiva === "dados" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6">
              {gestor.bio && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Sobre</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{gestor.bio}</p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                {gestor.formacao && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                      <i className="ri-graduation-cap-line text-sm" style={{ color: primaryColor }}></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Formação Principal</p>
                      <p className="text-xs text-gray-700 font-medium">{gestor.formacao}</p>
                    </div>
                  </div>
                )}
                {gestor.email && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                      <i className="ri-mail-line text-sm" style={{ color: primaryColor }}></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">E-mail Institucional</p>
                      <p className="text-xs text-gray-700 font-medium">{gestor.email}</p>
                    </div>
                  </div>
                )}
                {gestor.telefone && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                      <i className="ri-phone-line text-sm" style={{ color: primaryColor }}></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Telefone</p>
                      <p className="text-xs text-gray-700 font-medium">{gestor.telefone}</p>
                    </div>
                  </div>
                )}
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
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500">{curso.tipo}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500">{curso.ano}</span>
                        {curso.cargaHoraria && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500">{curso.cargaHoraria}</span>
                        )}
                      </div>
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
                  <div key={doc.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                      <i className="ri-file-pdf-2-line text-sm" style={{ color: primaryColor }}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900 leading-snug">{doc.titulo}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{doc.tipo} • {doc.tamanho}</p>
                    </div>
                    <i className="ri-download-line text-sm text-gray-400"></i>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="px-6 md:px-10 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: primaryColor }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function GestorCard({ gestor, onClick, primaryColor }: { gestor: Gestor; onClick: () => void; primaryColor: string }) {
  const grupoLabel = grupos.find(g => g.key === gestor.grupo)?.label ?? "";
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer text-left group w-full"
    >
      <div className="relative w-full h-52 overflow-hidden bg-gray-100">
        <img
          src={gestor.foto}
          alt={gestor.nome}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
          <span className="text-white text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <i className="ri-eye-line mr-1"></i>Ver perfil
          </span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm font-bold text-gray-900 leading-snug" style={{ fontFamily: "'Poppins', sans-serif" }}>{gestor.nome}</p>
        <p className="text-xs text-gray-500 mt-1 leading-snug">{gestor.cargo}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
            {grupoLabel}
          </span>
          {gestor.mandato && (
            <span className="text-[10px] text-gray-400">
              <i className="ri-time-line mr-0.5"></i>{gestor.mandato.split("|")[0].trim()}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function GestoresPage() {
  const { config } = useSiteConfig();
  const [grupoAtivo, setGrupoAtivo] = useState("diretoria");
  const [gestorSelecionado, setGestorSelecionado] = useState<Gestor | null>(null);
  const [listaGestores, setListaGestores] = useState<Gestor[]>(gestoresMock);
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.05 });

  const gestoresFiltrados = listaGestores.filter(g => g.grupo === grupoAtivo && g.ativo !== false);
  const grupoInfo = grupos.find(g => g.key === grupoAtivo);

  useEffect(() => {
    let isMounted = true;
    gestoresService.listar().then((loadedGestores) => {
      if (isMounted) {
        setListaGestores(loadedGestores);
      }
    }).catch(() => {
      setListaGestores(gestoresMock);
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <PageLayout>
      {/* Hero */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        className={`pt-28 md:pt-32 pb-14 md:pb-20 px-4 relative overflow-hidden transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full border border-white/10"></div>
          <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full border border-white/10"></div>
        </div>
        <div className="max-w-screen-xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-4 md:mb-5">
            <i className="ri-group-line"></i>
            Gestão Pública
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Gestores do INPREC
          </h1>
          <p className="text-white/70 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Conheça a equipe de gestores que compõem a Diretoria Executiva, Comitê de Investimento e Conselhos do INPREC.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8 md:mt-10">
            {grupos.map((g) => (
              <div key={g.key} className="text-center">
                <p className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {listaGestores.filter(gs => gs.grupo === g.key && gs.ativo !== false).length}
                </p>
                <p className="text-white/60 text-xs mt-0.5">{g.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sub-menu de grupos */}
      <section className="sticky top-16 md:top-20 z-40 bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-2 md:px-4">
          <div className="flex overflow-x-auto gap-0 hide-scrollbar">
            {grupos.map((g) => (
              <button
                key={g.key}
                onClick={() => setGrupoAtivo(g.key)}
                className={`flex items-center gap-1.5 px-3 md:px-5 py-3 md:py-4 text-xs md:text-sm font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all flex-shrink-0 ${
                  grupoAtivo === g.key ? "border-current" : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
                style={grupoAtivo === g.key ? { color: config.primaryColor, borderColor: config.primaryColor } : {}}
              >
                <i className={`${g.icon} text-xs md:text-sm`}></i>
                <span className="hidden sm:inline">{g.label}</span>
                <span className="sm:hidden">{g.label.split(" ")[0]}</span>
                <span
                  className="text-[10px] px-1 md:px-1.5 py-0.5 rounded-full font-bold ml-0.5 md:ml-1"
                  style={grupoAtivo === g.key ? { backgroundColor: config.primaryColor, color: "white" } : { backgroundColor: "#F3F4F6", color: "#9CA3AF" }}>
                  {listaGestores.filter(gs => gs.grupo === g.key && gs.ativo !== false).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section
        ref={contentRef as React.RefObject<HTMLElement>}
        className={`py-10 md:py-16 px-4 transition-all duration-700 ${contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            {grupoInfo && (
              <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}15` }}>
                <i className={`${grupoInfo.icon} text-base`} style={{ color: config.primaryColor }}></i>
              </div>
            )}
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {grupoInfo?.label}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {gestoresFiltrados.length} membro{gestoresFiltrados.length !== 1 ? "s" : ""} · Clique para ver perfil
              </p>
            </div>
          </div>

          {gestoresFiltrados.length === 0 ? (
            <div className="text-center py-16 md:py-20 text-gray-400">
              <i className="ri-user-line text-4xl md:text-5xl mb-4 block"></i>
              <p className="text-sm font-medium">Nenhum gestor cadastrado neste grupo</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
              {gestoresFiltrados.map((gestor) => (
                <GestorCard
                  key={gestor.id}
                  gestor={gestor}
                  onClick={() => setGestorSelecionado(gestor)}
                  primaryColor={config.primaryColor}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {gestorSelecionado && (
        <GestorModal
          gestor={gestorSelecionado}
          onClose={() => setGestorSelecionado(null)}
          primaryColor={config.primaryColor}
        />
      )}
    </PageLayout>
  );
}
