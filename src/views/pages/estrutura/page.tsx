import { useEffect, useState } from "react";
import PageLayout from "@/components/feature/PageLayout";
import { gestores as gestoresMock, grupos, Gestor, Curso, Documento } from "@/mocks/gestores";
import { gestoresService } from "@/services/gestores.service";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

function GestorCard({
  gestor,
  isSelected,
  onClick,
  primaryColor,
  compact = false,
}: {
  gestor: Gestor;
  isSelected: boolean;
  onClick: () => void;
  primaryColor: string;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 w-full ${
        isSelected
          ? "shadow-lg scale-105"
          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md"
      }`}
      style={
        isSelected
          ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` }
          : {}
      }
    >
      <div
        className={`relative rounded-full overflow-hidden flex-shrink-0 border-4 ${
          compact ? "w-16 h-16" : "w-20 h-20"
        }`}
        style={
          isSelected
            ? { borderColor: primaryColor }
            : { borderColor: "#f3f4f6" }
        }
      >
        <img
          src={gestor.foto}
          alt={gestor.nome}
          className="w-full h-full object-cover object-top"
          onError={(e) => { e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%239ca3af'/%3E%3Cellipse cx='50' cy='75' rx='28' ry='18' fill='%239ca3af'/%3E%3C/svg%3E"; }}
        />
      </div>
      <p
        className={`font-semibold mt-2 leading-tight ${compact ? "text-xs" : "text-sm"}`}
        style={{ color: isSelected ? primaryColor : "#1f2937" }}
      >
        {gestor.nome}
      </p>
      <p className={`text-gray-500 mt-0.5 ${compact ? "text-[10px]" : "text-xs"}`}>
        {gestor.cargo}
      </p>
    </button>
  );
}

type ModalTab = "dados" | "cursos" | "documentos";

function GestorModal({
  gestor,
  onClose,
  primaryColor,
}: {
  gestor: Gestor;
  onClose: () => void;
  primaryColor: string;
}) {
  const [activeTab, setActiveTab] = useState<ModalTab>("dados");

  const TIPO_COLORS: Record<string, string> = {
    "Graduação": "#0891B2",
    "Especialização": "#7C3AED",
    "MBA": "#D97706",
    "Mestrado": "#059669",
    "Doutorado": "#DC2626",
    "Curso": "#6B7280",
    "Capacitação": "#EA580C",
  };

  const tabs: { key: ModalTab; label: string; icon: string; count?: number }[] = [
    { key: "dados", label: "Dados", icon: "ri-user-line" },
    { key: "cursos", label: "Cursos", icon: "ri-graduation-cap-line", count: gestor.cursos?.length || 0 },
    { key: "documentos", label: "Documentos", icon: "ri-file-list-line", count: gestor.documentos?.length || 0 },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-[1180px] h-[94vh] md:h-[92vh] overflow-hidden animate-fade-in flex flex-col shadow-2xl">
        {/* Header com foto */}
        <div
          className="relative h-28 flex items-end justify-center pb-0 flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)`,
          }}
        >
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden translate-y-12 shadow-lg">
            <img
              src={gestor.foto}
              alt={gestor.nome}
              className="w-full h-full object-cover object-top"
              onError={(e) => { e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%239ca3af'/%3E%3Cellipse cx='50' cy='75' rx='28' ry='18' fill='%239ca3af'/%3E%3C/svg%3E"; }}
            />
          </div>
        </div>

        {/* Nome e cargo */}
        <div className="pt-14 px-6 md:px-10 pb-3 text-center flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">{gestor.nome}</h2>
          <p className="text-sm font-semibold mt-1" style={{ color: primaryColor }}>
            {gestor.cargo}
          </p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {grupos.find(g => g.key === gestor.grupo)?.label ?? gestor.grupo}
          </span>
        </div>

        {/* Abas */}
        <div className="flex border-b border-gray-100 mx-6 md:mx-10 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap -mb-px"
              style={activeTab === tab.key
                ? { color: primaryColor, borderColor: primaryColor }
                : { color: "#9CA3AF", borderColor: "transparent" }}
            >
              <i className={`${tab.icon} text-xs`}></i>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={activeTab === tab.key
                    ? { backgroundColor: primaryColor, color: "white" }
                    : { backgroundColor: "#F3F4F6", color: "#6B7280" }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 lg:px-12 py-6">

          {/* ABA DADOS */}
          {activeTab === "dados" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6">
              {gestor.bio && (
                <p className="text-sm text-gray-600 leading-relaxed text-center">
                  {gestor.bio}
                </p>
              )}
              <div className="flex flex-col gap-2 mt-1">
                {gestor.formacao && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                      <i className="ri-graduation-cap-line text-sm" style={{ color: primaryColor }}></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Formação</p>
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
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">E-mail</p>
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
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Telefone</p>
                      <p className="text-xs text-gray-700 font-medium">{gestor.telefone}</p>
                    </div>
                  </div>
                )}
                {gestor.matricula && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                      <i className="ri-id-card-line text-sm" style={{ color: primaryColor }}></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Matrícula</p>
                      <p className="text-xs text-gray-700 font-medium">{gestor.matricula}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA CURSOS */}
          {activeTab === "cursos" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {(!gestor.cursos || gestor.cursos.length === 0) ? (
                <div className="text-center py-10 text-gray-400">
                  <i className="ri-graduation-cap-line text-4xl mb-3 block"></i>
                  <p className="text-sm">Nenhum curso cadastrado</p>
                </div>
              ) : (
                gestor.cursos.map((curso: Curso) => (
                  <div key={curso.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${TIPO_COLORS[curso.tipo] ?? primaryColor}15` }}
                      >
                        <i
                          className="ri-graduation-cap-line text-sm"
                          style={{ color: TIPO_COLORS[curso.tipo] ?? primaryColor }}
                        ></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{curso.titulo}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{curso.instituicao}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${TIPO_COLORS[curso.tipo] ?? primaryColor}15`, color: TIPO_COLORS[curso.tipo] ?? primaryColor }}
                          >
                            {curso.tipo}
                          </span>
                          <span className="text-[10px] text-gray-400">{curso.ano}</span>
                          {curso.cargaHoraria && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                              <i className="ri-time-line text-[9px]"></i> {curso.cargaHoraria}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ABA DOCUMENTOS */}
          {activeTab === "documentos" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {(!gestor.documentos || gestor.documentos.length === 0) ? (
                <div className="text-center py-10 text-gray-400">
                  <i className="ri-file-list-line text-4xl mb-3 block"></i>
                  <p className="text-sm">Nenhum documento cadastrado</p>
                </div>
              ) : (
                gestor.documentos.map((doc: Documento) => (
                  <div key={doc.id} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                      <i className="ri-file-pdf-2-line text-lg" style={{ color: primaryColor }}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{doc.titulo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{doc.tipo} · {doc.tamanho}</p>
                    </div>
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-400 transition-colors cursor-pointer"
                      >
                        <i className="ri-download-2-line text-sm"></i>
                      </a>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300">
                        <i className="ri-download-2-line text-sm"></i>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer fixo */}
        <div className="px-6 md:px-10 pb-5 pt-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EstruturalPage() {
  const [selectedGestor, setSelectedGestor] = useState<Gestor | null>(null);
  const [viewMode, setViewMode] = useState<"organograma" | "lista">("organograma");
  const [grupoAtivo, setGrupoAtivo] = useState("diretoria");
  const [lista, setLista] = useState<Gestor[]>(gestoresMock);
  const { config } = useSiteConfig();
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();

  useEffect(() => {
    let isMounted = true;
    gestoresService.listar().then((data) => {
      if (isMounted) {
        setLista(data);
      }
    }).catch(() => {
      setLista(gestoresMock);
    });
    return () => { isMounted = false; };
  }, []);

  const gruposFiltro = grupos.map(g => ({
    ...g,
    membros: lista.filter(gs => gs.grupo === g.key && gs.ativo !== false),
  }));

  const grupoAtual = gruposFiltro.find(g => g.key === grupoAtivo);
  const gerarOrganogramaHtml = () => {
    const hoje = new Date().toLocaleDateString("pt-BR");
    const gruposHtml = gruposFiltro.map((grupo) => `
      <section class="grupo">
        <h2>${grupo.label}</h2>
        ${grupo.membros.length === 0 ? "<p class='vazio'>Nenhum membro cadastrado.</p>" : `
          <div class="grid">
            ${grupo.membros.map((gestor) => `
              <article class="card">
                <img src="${gestor.foto}" alt="${gestor.nome}" />
                <div>
                  <strong>${gestor.nome}</strong>
                  <span>${gestor.cargo}</span>
                  ${gestor.email ? `<small>${gestor.email}</small>` : ""}
                  ${gestor.mandato ? `<small>${gestor.mandato}</small>` : ""}
                </div>
              </article>
            `).join("")}
          </div>
        `}
      </section>
    `).join("");

    return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Organograma do INPREC</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #111827; background: #fff; }
    header { border-bottom: 3px solid ${config.primaryColor}; padding-bottom: 18px; margin-bottom: 26px; }
    h1 { margin: 0 0 8px; color: ${config.secondaryColor}; font-size: 28px; }
    p { margin: 0; color: #6b7280; }
    .grupo { margin: 26px 0; break-inside: avoid; }
    h2 { font-size: 18px; color: ${config.primaryColor}; margin: 0 0 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; }
    .card { display: flex; gap: 12px; align-items: center; border: 1px solid #e5e7eb; border-radius: 14px; padding: 12px; }
    img { width: 58px; height: 58px; object-fit: cover; object-position: top; border-radius: 14px; background: #f3f4f6; }
    strong { display: block; font-size: 13px; }
    span { display: block; font-size: 12px; color: #4b5563; margin-top: 3px; }
    small { display: block; font-size: 10px; color: #9ca3af; margin-top: 3px; }
    .vazio { font-size: 12px; color: #9ca3af; padding: 12px; border: 1px dashed #e5e7eb; border-radius: 12px; }
    .actions { margin-top: 20px; }
    button { background: ${config.primaryColor}; color: white; border: 0; padding: 10px 14px; border-radius: 10px; font-weight: 700; cursor: pointer; }
    @media print { .actions { display: none; } body { margin: 18px; } }
  </style>
</head>
<body>
  <header>
    <h1>Organograma do INPREC</h1>
    <p>${config.siteName} - ${config.siteSlogan}</p>
    <p>Atualizado em ${hoje}</p>
  </header>
  ${gruposHtml}
  <div class="actions"><button onclick="window.print()">Imprimir ou salvar em PDF</button></div>
</body>
</html>`;
  };

  const visualizarOrganograma = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.open();
    win.document.write(gerarOrganogramaHtml());
    win.document.close();
  };

  const exportarOrganograma = () => {
    const blob = new Blob([gerarOrganogramaHtml()], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "organograma-inprec.html";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageLayout>
      {/* Hero */}
      <section
        ref={heroRef}
        className={`relative py-20 md:py-28 flex items-center justify-center overflow-hidden transition-all duration-700 ${
          heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ backgroundColor: config.primaryColor }}></div>
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full opacity-10 bg-white"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6 bg-white/15 text-white/90 border border-white/20">
            <i className="ri-organization-chart text-sm"></i>
            Estrutura Organizacional
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Nossa Equipe
          </h1>
          <p className="text-white/75 text-lg max-w-2xl mx-auto">
            Conheça os gestores e membros que trabalham para garantir a segurança previdenciária dos servidores municipais.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
            {gruposFiltro.map(g => (
              <div key={g.key} className="text-center">
                <p className="text-3xl font-bold text-white">{g.membros.length}</p>
                <p className="text-white/60 text-xs mt-0.5">{g.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* View Toggle + Content */}
      <section
        ref={contentRef}
        className={`py-16 px-4 md:px-8 max-w-screen-xl mx-auto transition-all duration-700 delay-100 ${
          contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setViewMode("organograma")}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === "organograma"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="ri-organization-chart text-sm"></i>
              Por Grupo
            </button>
            <button
              onClick={() => setViewMode("lista")}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === "lista"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="ri-grid-line text-sm"></i>
              Todos
            </button>
          </div>
        </div>

        {/* VIEW POR GRUPO */}
        {viewMode === "organograma" && (
          <div>
            {/* Sub-abas de grupo */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {gruposFiltro.map(g => (
                <button
                  key={g.key}
                  onClick={() => setGrupoAtivo(g.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer whitespace-nowrap ${
                    grupoAtivo === g.key ? "text-white" : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"
                  }`}
                  style={
                    grupoAtivo === g.key
                      ? { backgroundColor: config.primaryColor, borderColor: config.primaryColor }
                      : {}
                  }
                >
                  <i className={`${g.icon} text-sm`}></i>
                  {g.label}
                  <span
                    className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                    style={
                      grupoAtivo === g.key
                        ? { backgroundColor: "rgba(255,255,255,0.25)", color: "white" }
                        : { backgroundColor: "#F3F4F6", color: "#9CA3AF" }
                    }
                  >
                    {g.membros.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Grid do grupo ativo */}
            {grupoAtual && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}15` }}>
                    <i className={`${grupoAtual.icon} text-base`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {grupoAtual.label}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {grupoAtual.membros.length} membro{grupoAtual.membros.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {grupoAtual.membros.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <i className="ri-user-line text-5xl mb-4 block"></i>
                    <p className="text-sm">Nenhum membro cadastrado neste grupo</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {grupoAtual.membros.map(g => (
                      <GestorCard
                        key={g.id}
                        gestor={g}
                        isSelected={selectedGestor?.id === g.id}
                        onClick={() => setSelectedGestor(g)}
                        primaryColor={config.primaryColor}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            <p className="text-center text-xs text-gray-400 mt-8">
              <i className="ri-cursor-line mr-1"></i>
              Clique em qualquer perfil para ver detalhes completos
            </p>
          </div>
        )}

        {/* VIEW TODOS */}
        {viewMode === "lista" && (
          <div>
            {gruposFiltro.map(grupo => (
              grupo.membros.length > 0 && (
                <div key={grupo.key} className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${config.primaryColor}15` }}>
                      <i className={`${grupo.icon} text-sm`} style={{ color: config.primaryColor }}></i>
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{grupo.label}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${config.primaryColor}10`, color: config.primaryColor }}>
                      {grupo.membros.length}
                    </span>
                    <div className="flex-1 h-px bg-gray-100"></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {grupo.membros.map(g => (
                      <GestorCard
                        key={g.id}
                        gestor={g}
                        isSelected={selectedGestor?.id === g.id}
                        onClick={() => setSelectedGestor(g)}
                        primaryColor={config.primaryColor}
                      />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </section>

      {/* Documentos Institucionais */}
      <section className="py-16 px-4" style={{ backgroundColor: "#f9f7ff" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "'Poppins', sans-serif", color: "#1A0533" }}
          >
            Documentos Institucionais
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            O organograma e gerado automaticamente com os dados atuais cadastrados no painel de Gestores do INPREC.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={visualizarOrganograma}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer text-left"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}15` }}>
                <i className="ri-eye-line text-lg" style={{ color: config.primaryColor }}></i>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Visualizar Organograma</p>
                <p className="text-xs text-gray-400 mt-0.5">Abre a versao pronta para imprimir ou salvar em PDF</p>
              </div>
              <i className="ri-external-link-line text-gray-400 ml-auto"></i>
            </button>
            <button
              onClick={exportarOrganograma}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer text-left"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}15` }}>
                <i className="ri-download-2-line text-lg" style={{ color: config.primaryColor }}></i>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Exportar Organograma</p>
                <p className="text-xs text-gray-400 mt-0.5">Baixa um arquivo HTML com os dados atuais</p>
              </div>
              <i className="ri-file-download-line text-gray-400 ml-auto"></i>
            </button>
          </div>
        </div>
      </section>
      {false && (
      <>
      {/* Documentos Institucionais antigos */}
      <section className="py-16 px-4" style={{ backgroundColor: "#f9f7ff" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "'Poppins', sans-serif", color: "#1A0533" }}
          >
            Documentos Institucionais
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Acesse o regimento interno, estatuto e outros documentos que regem a estrutura do INPREC.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "ri-file-pdf-2-line", label: "Regimento Interno", size: "245 KB" },
              { icon: "ri-file-pdf-2-line", label: "Estatuto do INPREC", size: "180 KB" },
              { icon: "ri-file-pdf-2-line", label: "Organograma Completo", size: "95 KB" },
            ].map((doc) => (
              <div
                key={doc.label}
                className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}15` }}>
                  <i className={`${doc.icon} text-lg`} style={{ color: config.primaryColor }}></i>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{doc.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">PDF · {doc.size}</p>
                </div>
                <i className="ri-download-2-line text-gray-400 ml-auto"></i>
              </div>
            ))}
          </div>
        </div>
      </section>

      </>
      )}

      {/* Modal */}
      {selectedGestor && (
        <GestorModal
          gestor={selectedGestor}
          onClose={() => setSelectedGestor(null)}
          primaryColor={config.primaryColor}
        />
      )}
    </PageLayout>
  );
}
