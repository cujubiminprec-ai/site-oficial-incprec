import { useState, useEffect, ReactNode, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import SingleImageUploader from "@/components/base/SingleImageUploader";
import { useImageUpload } from "@/hooks/useImageUpload";
import UsuariosTab from "@/pages/admin/tabs/UsuariosTab";
import { todasNoticias } from "@/mocks/noticias-extra";
import { servicos } from "@/mocks/servicos";
import { documentos } from "@/mocks/transparencia-docs";
import { slidesAdminDefault, SlideAdmin } from "@/mocks/slides-admin";
import { gestores as gestoresMock, grupos, Gestor, Curso } from "@/mocks/gestores";
import { painelTransparenciaDefault, painelTransparenciaConfigDefault, PainelSlide } from "@/mocks/painel-transparencia";
import { HomeSectionConfig, HomeSectionKey, homeSectionsDefault, loadHomeSections, saveHomeSections } from "@/mocks/home-sections";
import { bannerAvisoDefault, BannerAvisoConfig } from "@/components/feature/BannerAviso";
import NoticiasTab from "@/pages/admin/tabs/NoticiasTab";
import ServicosTab from "@/pages/admin/tabs/ServicosTab";
import TransparenciaTab from "@/pages/admin/tabs/TransparenciaTab";
import FAQTab from "@/pages/admin/tabs/FAQTab";
import ConfiguracoesTab from "@/pages/admin/tabs/ConfiguracoesTab";
import AnalyticsTab from "@/pages/admin/tabs/AnalyticsTab";
import FinancasTab from "@/pages/admin/tabs/FinancasTab";
import PaginasTab from "@/pages/admin/tabs/PaginasTab";
import FloatingButtonsTab from "@/pages/admin/tabs/FloatingButtonsTab";
import MenuNavegacaoTab from "@/pages/admin/tabs/MenuNavegacaoTab";
import AuditoriaTab from "@/pages/admin/tabs/AuditoriaTab";
import EventosInscritosTab from "@/pages/admin/tabs/EventosInscritosTab";
import EventosAdminTab from "@/pages/admin/tabs/EventosAdminTab";
import CursosAdminTab from "@/pages/admin/tabs/CursosAdminTab";
import EleicaoAdminTab from "@/pages/admin/tabs/EleicaoAdminTab";
import VotacaoAdminTab from "@/pages/admin/tabs/VotacaoAdminTab";
import PerfilTab from "@/pages/admin/tabs/PerfilTab";
import GerenciadorArquivosTab from "@/pages/admin/tabs/GerenciadorArquivosTab";
import NotificacoesDrawer from "@/components/feature/NotificacoesDrawer";
import { useNotificacoes } from "@/contexts/NotificacoesContext";
import { uploadService } from "@/services/upload.service";
import { transparenciaService } from "@/services/transparencia.service";
import { conteudoService } from "@/services/conteudo.service";
import { getDocumentView, inferDocumentType } from "@/utils/documentViewer";
import { arquivoPermitidoDocumento, pastaPublicaPorArquivo, tipoArquivo, extensaoArquivo } from "@/utils/uploadFolders";
import { carregarGestoresAtualizados, salvarGestoresAtualizados } from "@/utils/gestoresData";

const ALL_MENU_ITEMS = [
  { id: "dashboard", icon: "ri-dashboard-line", label: "Dashboard", perm: "dashboard" },
  { id: "banner", icon: "ri-megaphone-line", label: "Banner de Aviso", perm: "banner" },
  { id: "floating", icon: "ri-layout-bottom-2-line", label: "Botões Flutuantes", perm: "floating" },
  { id: "home", icon: "ri-home-4-line", label: "Home / Inicio", perm: "paginas" },
  { id: "slides", icon: "ri-slideshow-line", label: "Slides da Home", perm: "slides" },
  { id: "painel", icon: "ri-bar-chart-box-line", label: "Painel Transparência", perm: "painel" },
  { id: "aparencia", icon: "ri-palette-line", label: "Layout & Cores", perm: "aparencia" },
  { id: "paginas", icon: "ri-pages-line", label: "Páginas", perm: "paginas" },
  { id: "menu", icon: "ri-menu-2-line", label: "Navegação / Menus", perm: "menu" },
  { id: "cursos", icon: "ri-graduation-cap-line", label: "Cursos & Capacitações", perm: "cursos" },
  { id: "eventos", icon: "ri-calendar-event-line", label: "Eventos & Audiências", perm: "eventos" },
  { id: "eleicao", icon: "ri-checkbox-circle-line", label: "Eleição / Conselhos", perm: "eleicao" },
  { id: "votacao", icon: "ri-user-star-line", label: "Candidatos / Votação", perm: "votacao" },
  { id: "eventos-inscritos", icon: "ri-team-line", label: "Inscritos em Eventos", perm: "eventos-inscritos" },
  { id: "noticias", icon: "ri-newspaper-line", label: "Notícias", perm: "noticias" },
  { id: "servicos", icon: "ri-service-line", label: "Serviços", perm: "servicos" },
  { id: "gestores", icon: "ri-group-line", label: "Gestores", perm: "gestores" },
  { id: "transparencia", icon: "ri-file-chart-line", label: "Transparência", perm: "transparencia" },
  { id: "faq", icon: "ri-question-answer-line", label: "Perguntas Frequentes", perm: "faq" },
  { id: "financas", icon: "ri-funds-line", label: "Finanças e Invest.", perm: "financas" },
  { id: "ouvidoria-admin", icon: "ri-speak-line", label: "Ouvidoria", perm: "ouvidoria-admin" },
  { id: "lai-admin", icon: "ri-file-info-line", label: "LAI", perm: "lai-admin" },
  { id: "contato-admin", icon: "ri-mail-line", label: "Contato & Mensagens", perm: "contato-admin" },
  { id: "pesquisa-admin", icon: "ri-survey-line", label: "Pesquisa de Satisfação", perm: "pesquisa-admin" },
  { id: "chat-admin", icon: "ri-chat-3-line", label: "Chat Online", perm: "chat-admin" },
  { id: "analytics", icon: "ri-line-chart-line", label: "Analytics", perm: "analytics" },
  { id: "configuracoes", icon: "ri-settings-3-line", label: "Configurações", perm: "configuracoes" },
  { id: "usuarios", icon: "ri-user-settings-line", label: "Gerenciar Usuários", perm: "usuarios" },
  { id: "auditoria", icon: "ri-history-line", label: "Registro de Atividades", perm: "auditoria" },
  { id: "arquivos", icon: "ri-folder-open-line", label: "Gerenciador de Arquivos", perm: "configuracoes" },
] as const;

function AdminLayout({ children, activeTab, setActiveTab }: { children: ReactNode; activeTab: string; setActiveTab: (t: string) => void }) {
  const navigate = useNavigate();
  const { config } = useSiteConfig();
  const { usuarioLogado, logout, temPermissao } = useAdminAuth();
  const { naoLidas, naoLidasPorTipo } = useNotificacoes();
  const [showPerfil, setShowPerfil] = useState(false);
  const [showPerfilMenu, setShowPerfilMenu] = useState(false);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuFiltrado = ALL_MENU_ITEMS.filter(item => temPermissao(item.perm as Parameters<typeof temPermissao>[0]));

  const handleLogout = () => { logout(); navigate("/admin/login"); };

  const nivelBadge = usuarioLogado?.nivelAcesso === "superadmin"
    ? { label: "Super Admin", color: "bg-red-100 text-red-600" }
    : usuarioLogado?.nivelAcesso === "admin"
    ? { label: "Admin", color: "bg-amber-100 text-amber-700" }
    : { label: "Operador", color: "bg-green-100 text-green-700" };

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900/35 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] bg-white border-r border-gray-100 flex flex-col min-h-screen transition-transform duration-300 lg:static lg:z-auto lg:w-60 lg:max-w-none lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: config.primaryColor }}>
              <i className={`${config.logoIcon} text-white text-sm`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate" style={{ fontFamily: "'Poppins', sans-serif" }}>{config.siteName}</p>
              <p className="text-xs text-gray-400">Painel Admin</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Fechar menu"
            >
              <i className="ri-close-line text-gray-500 text-lg"></i>
            </button>
            {/* Sino de notificações */}
            <button
              type="button"
              onClick={() => setDrawerAberto(true)}
              className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
              title="Notificações"
            >
              <i className="ri-notification-3-line text-gray-500 text-base"></i>
              {naoLidas > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white text-[9px] font-bold px-1"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {naoLidas > 9 ? "9+" : naoLidas}
                </span>
              )}
            </button>
          </div>
        {/* Perfil do usuário logado */}
        </div>
        {usuarioLogado && (
          <div className="px-3 py-2 border-b border-gray-100">
            <button
              onClick={() => setShowPerfilMenu(v => !v)}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-left">
              <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: `${config.primaryColor}20`, color: config.primaryColor }}>
                {usuarioLogado.avatar
                  ? <img src={usuarioLogado.avatar} alt="" className="w-full h-full object-cover" />
                  : usuarioLogado.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{usuarioLogado.nome}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${nivelBadge.color}`}>
                  {nivelBadge.label}
                </span>
              </div>
              {showPerfilMenu
                ? <i className="ri-arrow-up-s-line text-gray-400 text-sm flex-shrink-0"></i>
                : <i className="ri-arrow-down-s-line text-gray-400 text-sm flex-shrink-0"></i>
              }
            </button>

            {showPerfilMenu && (
              <div className="mt-1 flex flex-col gap-0.5">
                <p className="text-[11px] text-gray-400 truncate px-3 pb-1">
                  <i className="ri-mail-line mr-1"></i>{usuarioLogado.email}
                </p>
                <button
                  onClick={() => { setActiveTab("perfil"); setShowPerfilMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors hover:bg-gray-50 text-left w-full"
                  style={activeTab === "perfil" ? { color: config.primaryColor, backgroundColor: `${config.primaryColor}10` } : { color: "#6B7280" }}
                >
                  <i className="ri-user-settings-line text-sm"></i>
                  Meu Perfil
                </button>
                <button
                  onClick={() => { setShowPerfil(v => !v); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors hover:bg-gray-50 text-left w-full text-gray-500"
                >
                  <i className="ri-information-line text-sm"></i>
                  {showPerfil ? "Ocultar detalhes" : "Ver detalhes"}
                </button>
                {showPerfil && usuarioLogado.ultimoAcesso && (
                  <p className="text-[11px] text-gray-400 px-3 py-1">
                    <i className="ri-time-line mr-1"></i>
                    Último acesso: {new Date(usuarioLogado.ultimoAcesso + "T12:00:00").toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
          {menuFiltrado.map((item) => {
            const notifCount =
              item.id === "ouvidoria-admin" ? naoLidasPorTipo("ouvidoria")
              : item.id === "lai-admin" ? naoLidasPorTipo("lai")
              : item.id === "contato-admin" ? naoLidasPorTipo("contato")
              : item.id === "pesquisa-admin" ? naoLidasPorTipo("pesquisa")
              : 0;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium w-full text-left cursor-pointer transition-all"
                style={activeTab === item.id
                  ? { backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }
                  : { color: "#6B7280" }}>
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <i className={`${item.icon} text-base`}></i>
                </div>
                <span className="flex-1 truncate">{item.label}</span>
                {notifCount > 0 && (
                  <span
                    className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-white text-[9px] font-bold px-1 flex-shrink-0"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    {notifCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 flex flex-col gap-1">
          <Link to="/" target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer">
            <i className="ri-external-link-line text-sm"></i> Ver site
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-red-500 hover:bg-red-50 transition-all cursor-pointer w-full text-left">
            <i className="ri-logout-box-line text-sm"></i> Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="sticky top-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Abrir menu"
          >
            <i className="ri-menu-line text-xl"></i>
          </button>
          <div className="min-w-0 text-center">
            <p className="text-sm font-bold text-gray-900 truncate" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Painel Admin
            </p>
            <p className="text-[11px] text-gray-400 truncate">{config.siteName}</p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerAberto(true)}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Notificacoes"
          >
            <i className="ri-notification-3-line text-xl"></i>
            {naoLidas > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white text-[9px] font-bold px-1"
                style={{ backgroundColor: config.primaryColor }}
              >
                {naoLidas > 9 ? "9+" : naoLidas}
              </span>
            )}
          </button>
        </div>
        <div className="p-4 sm:p-5 md:p-6 max-w-full overflow-x-hidden">{children}</div>
      </main>

      {/* Drawer de Notificações */}
      <NotificacoesDrawer
        open={drawerAberto}
        onClose={() => setDrawerAberto(false)}
        onNavigate={(tab) => { setActiveTab(tab); }}
        primaryColor={config.primaryColor}
      />
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────────
function DashboardTab({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const { config } = useSiteConfig();
  const cards = [
    { icon: "ri-newspaper-line", label: "Notícias", value: todasNoticias.length, color: "#6D28D9", tab: "noticias" },
    { icon: "ri-service-line", label: "Serviços", value: servicos.length, color: "#0891B2", tab: "servicos" },
    { icon: "ri-file-chart-line", label: "Documentos", value: documentos.length, color: "#059669", tab: "transparencia" },
    { icon: "ri-slideshow-line", label: "Slides", value: 6, color: "#D97706", tab: "slides" },
  ];
  const pages = [
    { name: "Home", path: "/" },
    { name: "Quem Somos", path: "/quem-somos" },
    { name: "Serviços", path: "/servicos" },
    { name: "Previdência", path: "/previdencia" },
    { name: "Notícias", path: "/noticias" },
    { name: "Transparência", path: "/transparencia" },
    { name: "Ouvidoria", path: "/ouvidoria" },
    { name: "LAI", path: "/lai" },
    { name: "Perguntas Frequentes", path: "/perguntas-frequentes" },
    { name: "Pesquisa de Satisfação", path: "/pesquisa-satisfacao" },
    { name: "Contato", path: "/contato" },
  ];
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cards.map((c) => (
          <button key={c.label} onClick={() => setActiveTab(c.tab)} className="bg-white rounded-2xl p-4 border border-gray-100 text-left cursor-pointer hover:border-gray-200 transition-all">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg mb-2" style={{ backgroundColor: `${c.color}15` }}>
              <i className={`${c.icon} text-base`} style={{ color: c.color }}></i>
            </div>
            <div className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{c.value}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{c.label}</div>
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>Páginas do Site</h2>
        <div className="flex flex-col gap-1">
          {pages.map((p) => (
            <div key={p.path} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <i className="ri-pages-line text-gray-300 text-xs"></i>
                <span className="text-[13px] text-gray-700 font-medium">{p.name}</span>
                <span className="text-[11px] text-gray-400">{p.path}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">Publicada</span>
                <Link to={p.path} target="_blank" className="text-xs text-gray-400 hover:text-gray-700 cursor-pointer">
                  <i className="ri-external-link-line"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SLIDES ──────────────────────────────────────────────────────────────────────
function HomeInicioTab() {
  const [sections, setSections] = useState<HomeSectionConfig[]>(() => loadHomeSections());
  const [previewMode, setPreviewMode] = useState<"lista" | "site">("lista");

  const persist = (updated: HomeSectionConfig[]) => {
    const savedSections = saveHomeSections(updated);
    setSections(savedSections);
  };

  const atualizar = (id: HomeSectionKey, patch: Partial<HomeSectionConfig>) => {
    persist(sections.map((section) => section.id === id ? { ...section, ...patch } : section));
  };

  const mover = (id: HomeSectionKey, direction: -1 | 1) => {
    const ordered = [...sections].sort((a, b) => a.ordem - b.ordem);
    const index = ordered.findIndex((section) => section.id === id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) return;
    const [item] = ordered.splice(index, 1);
    ordered.splice(targetIndex, 0, item);
    persist(ordered.map((section, i) => ({ ...section, ordem: i + 1 })));
  };

  const adicionarBloco = () => {
    persist([
      ...sections,
      {
        id: `custom-${Date.now()}` as HomeSectionKey,
        kind: "custom",
        titulo: "Novo bloco da Home",
        descricao: "Edite este texto para publicar uma chamada personalizada na pagina inicial.",
        icone: "ri-layout-row-line",
        ativo: true,
        ordem: sections.length + 1,
        cor: "#059669",
        linkLabel: "Acessar",
        linkUrl: "",
      },
    ]);
  };

  const excluir = (id: HomeSectionKey) => {
    const section = sections.find((item) => item.id === id);
    if (!section || section.kind !== "custom") return;
    if (!window.confirm("Deseja excluir este bloco personalizado da Home?")) return;
    persist(sections.filter((item) => item.id !== id));
  };

  const restaurarPadrao = () => {
    if (!window.confirm("Restaurar a ordem e os blocos padrao da Home?")) return;
    persist(homeSectionsDefault);
  };

  const ordered = [...sections].sort((a, b) => a.ordem - b.ordem);
  const activeCount = ordered.filter((section) => section.ativo).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Home / Inicio</h1>
          <p className="text-sm text-gray-500 mt-1">Controle o que aparece na pagina inicial, a ordem das secoes e blocos personalizados.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={restaurarPadrao} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50">
            <i className="ri-refresh-line mr-2"></i>Restaurar padrao
          </button>
          <Link to="/" target="_blank" className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
            <i className="ri-external-link-line mr-2"></i>Abrir Home
          </Link>
          <button onClick={adicionarBloco} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
            <i className="ri-add-line mr-2"></i>Novo bloco
          </button>
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)] gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-gray-900">Secoes da pagina inicial</h2>
              <p className="text-xs text-gray-500 mt-1">{activeCount} secoes ativas de {ordered.length} cadastradas</p>
            </div>
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              {(["lista", "site"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPreviewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${previewMode === mode ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500"}`}
                >
                  {mode === "lista" ? "Previa rapida" : "Previa real"}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {ordered.map((section, index) => (
              <div key={section.id} className={`p-4 ${section.ativo ? "bg-white" : "bg-gray-50"}`}>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${section.cor || "#059669"}18`, color: section.cor || "#059669" }}
                    >
                      <i className={`${section.icone || "ri-layout-row-line"} text-xl`}></i>
                    </div>
                    <div className="min-w-0 flex-1 grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-gray-500">Titulo</label>
                        <input
                          value={section.titulo}
                          onChange={(e) => atualizar(section.id, { titulo: e.target.value })}
                          className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-gray-500">Icone e cor</label>
                        <div className="mt-1 grid grid-cols-[1fr_46px] gap-2">
                          <input
                            value={section.icone}
                            onChange={(e) => atualizar(section.id, { icone: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none"
                          />
                          <input
                            type="color"
                            value={section.cor || "#059669"}
                            onChange={(e) => atualizar(section.id, { cor: e.target.value })}
                            className="w-full h-[38px] rounded-xl border border-gray-200 p-1"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-gray-500">Descricao</label>
                        <textarea
                          value={section.descricao}
                          onChange={(e) => atualizar(section.id, { descricao: e.target.value })}
                          rows={2}
                          className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none resize-none"
                        />
                      </div>
                      {section.kind === "custom" && (
                        <>
                          <div>
                            <label className="text-[11px] font-semibold text-gray-500">Texto do botao</label>
                            <input
                              value={section.linkLabel || ""}
                              onChange={(e) => atualizar(section.id, { linkLabel: e.target.value })}
                              className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-gray-500">Link do botao</label>
                            <input
                              value={section.linkUrl || ""}
                              onChange={(e) => atualizar(section.id, { linkUrl: e.target.value })}
                              placeholder="https:// ou /pagina"
                              className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-center justify-between gap-2 lg:w-28">
                    <button
                      onClick={() => atualizar(section.id, { ativo: !section.ativo })}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold ${section.ativo ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {section.ativo ? "Ativo" : "Inativo"}
                    </button>
                    <div className="flex gap-1">
                      <button onClick={() => mover(section.id, -1)} disabled={index === 0} className="w-9 h-9 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50">
                        <i className="ri-arrow-up-s-line"></i>
                      </button>
                      <button onClick={() => mover(section.id, 1)} disabled={index === ordered.length - 1} className="w-9 h-9 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50">
                        <i className="ri-arrow-down-s-line"></i>
                      </button>
                      <button
                        onClick={() => excluir(section.id)}
                        disabled={section.kind !== "custom"}
                        className="w-9 h-9 rounded-lg border border-red-100 text-red-500 disabled:opacity-30 disabled:text-gray-300 hover:bg-red-50"
                        title={section.kind === "custom" ? "Excluir bloco" : "Secao padrao pode ser desativada, mas nao excluida"}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-400">#{section.ordem}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 h-fit sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">Preview da Home</h2>
              <p className="text-xs text-gray-500 mt-1">Mostra apenas o que esta ativo.</p>
            </div>
            <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">{activeCount} ativos</span>
          </div>

          {previewMode === "lista" ? (
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-3">
              {ordered.filter((section) => section.ativo).map((section) => (
                <div key={section.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 shadow-sm">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${section.cor || "#059669"}18`, color: section.cor || "#059669" }}>
                    <i className={section.icone}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{section.titulo}</p>
                    <p className="text-[11px] text-gray-500 truncate">{section.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
              <iframe title="Previa da Home" src="/" className="w-full h-[560px] bg-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function corrigirTextoSlides(texto?: string): string {
  if (!texto) return "";
  return texto
    .replace(/ÃƒÂ³/g, "ó")
    .replace(/ÃƒÂª/g, "ê")
    .replace(/ÃƒÂ§/g, "ç")
    .replace(/ÃƒÂ£/g, "ã")
    .replace(/ÃƒÂ¡/g, "á")
    .replace(/ÃƒÂ©/g, "é")
    .replace(/ÃƒÂ­/g, "í")
    .replace(/ÃƒÂº/g, "ú")
    .replace(/Ã³/g, "ó")
    .replace(/Ãª/g, "ê")
    .replace(/Ã§/g, "ç")
    .replace(/Ã£/g, "ã")
    .replace(/Ã¡/g, "á")
    .replace(/Ã©/g, "é")
    .replace(/Ã­/g, "í")
    .replace(/Ãº/g, "ú")
    .replace(/Â·/g, "·")
    .replace(/Ã—/g, "×");
}

function normalizeHomeSlide(slide: Partial<SlideAdmin>, index: number): SlideAdmin {
  const ctaType = slide.cta_type || (slide.pdf_url ? "pdf" : "link");
  return {
    id: Number(slide.id || index + 1),
    tag: corrigirTextoSlides(slide.tag),
    titulo: corrigirTextoSlides(slide.titulo) || `Slide ${index + 1}`,
    subtitulo: corrigirTextoSlides(slide.subtitulo),
    cta_label: corrigirTextoSlides(slide.cta_label) || (ctaType === "pdf" ? "Abrir PDF" : "Saiba mais"),
    cta_url: slide.cta_url || "/",
    cta_type: ctaType,
    pdf_url: slide.pdf_url || "",
    pdf_name: slide.pdf_name || "",
    image_url: slide.image_url || "",
    ativo: slide.ativo !== false,
    ordem: Number.isFinite(Number(slide.ordem)) ? Number(slide.ordem) : index + 1,
    use_tint: slide.use_tint === true,
    show_content: slide.show_content === true,
  };
}

function SlidesTab() {
  const { config } = useSiteConfig();
  const [slides, setSlides] = useState<SlideAdmin[]>(() => {
    try {
      const saved = localStorage.getItem("inprec_slides");
      const source = saved ? JSON.parse(saved) : slidesAdminDefault;
      return source.map(normalizeHomeSlide).sort((a: SlideAdmin, b: SlideAdmin) => a.ordem - b.ordem || a.id - b.id);
    } catch { return slidesAdminDefault.map(normalizeHomeSlide); }
  });
  const [editSlide, setEditSlide] = useState<SlideAdmin | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dbStatus, setDbStatus] = useState<"carregando" | "online" | "fallback">("carregando");
  const [dbMessage, setDbMessage] = useState("");

  const persistSlides = (updated: SlideAdmin[], syncDb = true) => {
    const normalized = updated
      .map(normalizeHomeSlide)
      .sort((a, b) => a.ordem - b.ordem || a.id - b.id)
      .map((s, i) => ({ ...s, ordem: i + 1 }));
    try {
      localStorage.setItem("inprec_slides", JSON.stringify(normalized));
      setSlides(normalized);
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("inprec-slides-updated"));
    } catch {
      alert("Não foi possível salvar os slides. O arquivo anexado pode estar muito grande. Envie o arquivo para o servidor ou use um link público.");
    }
    if (syncDb) {
      conteudoService.salvarSlides(normalized)
        .then((salvos) => {
          setDbStatus("online");
          setDbMessage("");
          if (Array.isArray(salvos) && salvos.length > 0) {
            const merged = salvos.map(normalizeHomeSlide);
            localStorage.setItem("inprec_slides", JSON.stringify(merged));
            setSlides(merged);
            window.dispatchEvent(new Event("inprec-slides-updated"));
          }
        })
        .catch(() => {
          setDbStatus("fallback");
          setDbMessage("API local indisponível. Os slides foram mantidos temporariamente no navegador e serão migrados quando o backend estiver ativo.");
        });
    }
  };

  useEffect(() => {
    let alive = true;
    const carregarDoBanco = async () => {
      try {
        const localRaw = localStorage.getItem("inprec_slides");
        if (localRaw && !localStorage.getItem("inprec_slides_sqlite_migrated")) {
          const localSlides = JSON.parse(localRaw);
          const local = Array.isArray(localSlides) ? localSlides.map(normalizeHomeSlide) : [];
          if (local.length > 0) {
            const migrated = await conteudoService.salvarSlides(local);
            if (!alive) return;
            const normalized = migrated.length > 0 ? migrated.map(normalizeHomeSlide) : local;
            setSlides(normalized);
            localStorage.setItem("inprec_slides", JSON.stringify(normalized));
            localStorage.setItem("inprec_slides_sqlite_migrated", "true");
            setDbStatus("online");
            setDbMessage("Slides migrados do navegador para o SQLite com sucesso.");
            window.dispatchEvent(new Event("inprec-slides-updated"));
            return;
          }
        }
        const remote = await conteudoService.listarSlidesAdmin();
        if (!alive) return;
        if (Array.isArray(remote) && remote.length > 0) {
          const normalized = remote.map(normalizeHomeSlide);
          setSlides(normalized);
          localStorage.setItem("inprec_slides", JSON.stringify(normalized));
          setDbStatus("online");
          setDbMessage("");
          window.dispatchEvent(new Event("inprec-slides-updated"));
          return;
        }
        const local = slides.length > 0 ? slides : slidesAdminDefault.map(normalizeHomeSlide);
        const migrated = await conteudoService.salvarSlides(local);
        if (!alive) return;
        const normalized = migrated.length > 0 ? migrated.map(normalizeHomeSlide) : local;
        setSlides(normalized);
        localStorage.setItem("inprec_slides", JSON.stringify(normalized));
        localStorage.setItem("inprec_slides_sqlite_migrated", "true");
        setDbStatus("online");
        setDbMessage("Slides migrados do navegador para o SQLite com sucesso.");
        window.dispatchEvent(new Event("inprec-slides-updated"));
      } catch {
        if (!alive) return;
        setDbStatus("fallback");
        setDbMessage("API local indisponível. Ative o backend para salvar os slides no SQLite.");
      }
    };
    carregarDoBanco();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = (id: number) => {
    persistSlides(slides.map((s) => s.id === id ? { ...s, ativo: !s.ativo } : s));
  };

  const handleDelete = (id: number) => {
    if (confirm("Remover este slide?")) {
      persistSlides(slides.filter((s) => s.id !== id));
    }
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...slides];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    persistSlides(arr.map((s, i) => ({ ...s, ordem: i + 1 })));
  };

  const handleMoveDown = (idx: number) => {
    if (idx === slides.length - 1) return;
    const arr = [...slides];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    persistSlides(arr.map((s, i) => ({ ...s, ordem: i + 1 })));
  };

  const aplicarEmTodos = (changes: Partial<SlideAdmin>) => {
    persistSlides(slides.map((s) => ({ ...s, ...changes })));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ajustarModoBannerTotal = () => aplicarEmTodos({ ativo: true, show_content: false, use_tint: false });
  const ajustarModoInformativo = () => aplicarEmTodos({ ativo: true, show_content: true, use_tint: true });

  const handleSaveSlide = (slide: SlideAdmin) => {
    const normalizedSlide = normalizeHomeSlide(slide, slides.length);
    if (editSlide && editSlide.id !== 0) {
      persistSlides(slides.map((s) => s.id === normalizedSlide.id ? normalizedSlide : s));
    } else {
      const newId = Math.max(0, ...slides.map((s) => s.id)) + 1;
      persistSlides([...slides, { ...normalizedSlide, id: newId, ordem: slides.length + 1, ativo: true }]);
    }
    setEditSlide(null);
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const blankSlide: SlideAdmin = {
    id: 0, tag: "", titulo: "", subtitulo: "", cta_label: "", cta_url: "/",
    cta_type: "link", pdf_url: "", pdf_name: "",
    image_url: "", ativo: true, ordem: slides.length + 1, use_tint: false, show_content: false,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Slides da Home</h1>
          <p className="text-sm text-gray-400 mt-1">Gerencie os slides exibidos no banner principal da página inicial.</p>
        </div>
        <button
          onClick={() => { setEditSlide(blankSlide); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity"
          style={{ backgroundColor: config.primaryColor }}
        >
          <i className="ri-add-line"></i> Novo Slide
        </button>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Alterações salvas com sucesso!
        </div>
      )}

      <div className={`mb-4 px-4 py-3 rounded-xl border text-sm flex items-center gap-2 ${
        dbStatus === "online" ? "bg-green-50 border-green-100 text-green-700" :
        dbStatus === "carregando" ? "bg-blue-50 border-blue-100 text-blue-700" :
        "bg-amber-50 border-amber-100 text-amber-700"
      }`}>
        <i className={dbStatus === "online" ? "ri-database-2-line" : dbStatus === "carregando" ? "ri-loader-4-line animate-spin" : "ri-alert-line"}></i>
        {dbStatus === "online" ? (dbMessage || "Slides conectados ao SQLite.") : dbStatus === "carregando" ? "Conectando os slides ao SQLite..." : dbMessage}
      </div>

      <div className="mb-5 bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Ajuste rápido dos slides</h2>
            <p className="text-xs text-gray-400 mt-1">Aplique com um clique o modo visual em todos os slides da home.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 font-semibold">{slides.filter((s) => s.ativo).length} ativos</span>
            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-semibold">{slides.length} cadastrados</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
          <button type="button" onClick={ajustarModoBannerTotal} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: config.primaryColor }}>
            <i className="ri-fullscreen-line"></i> Banner total
          </button>
          <button type="button" onClick={ajustarModoInformativo} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
            <i className="ri-text"></i> Mostrar tudo
          </button>
          <button type="button" onClick={() => aplicarEmTodos({ show_content: false })} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
            <i className="ri-image-line"></i> Só banner
          </button>
          <button type="button" onClick={() => aplicarEmTodos({ use_tint: false })} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
            <i className="ri-contrast-drop-line"></i> Sem transparência
          </button>
          <button type="button" onClick={() => aplicarEmTodos({ use_tint: true })} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
            <i className="ri-contrast-line"></i> Com cor
          </button>
          <button type="button" onClick={() => aplicarEmTodos({ ativo: true })} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
            <i className="ri-eye-line"></i> Ativar todos
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {slides.map((slide, idx) => (
          <div key={slide.id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${slide.ativo ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
            <div className="flex items-center gap-4 p-4">
              {/* Thumb */}
              <div className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                {slide.image_url ? (
                  <img src={slide.image_url} alt={slide.titulo} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="ri-image-line text-gray-300 text-xl"></i>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}>{slide.tag}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${slide.ativo ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {slide.ativo ? "Ativo" : "Inativo"}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      (slide.cta_type || "link") === "pdf"
                        ? "bg-red-50 text-red-600"
                        : (slide.cta_type || "link") === "ppt"
                        ? "bg-amber-50 text-amber-600"
                        : (slide.cta_type || "link") === "none"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {(slide.cta_type || "link") === "pdf" ? "PDF" : (slide.cta_type || "link") === "ppt" ? "PPT" : (slide.cta_type || "link") === "none" ? "Fixo" : "Link"}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${slide.show_content === true ? "bg-purple-50 text-purple-600" : "bg-gray-100 text-gray-500"}`}>
                    {slide.show_content === true ? "Texto ligado" : "Só banner"}
                  </span>
                  <span className="text-xs text-gray-400">#{idx + 1}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{slide.titulo}</p>
                <p className="text-xs text-gray-400 truncate">{slide.subtitulo}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  title={slide.show_content === true ? "Deixar somente banner" : "Mostrar textos no slide"}
                  onClick={() => persistSlides(slides.map((s) => s.id === slide.id ? { ...s, show_content: !(s.show_content === true) } : s))}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${slide.show_content === true ? "hover:bg-purple-50 text-purple-500" : "hover:bg-gray-100 text-gray-400"}`}
                >
                  <i className={slide.show_content === true ? "ri-text" : "ri-image-line"}></i>
                </button>
                <button
                  type="button"
                  title={slide.use_tint === true ? "Tirar transparência/cor" : "Aplicar cor sobre imagem"}
                  onClick={() => persistSlides(slides.map((s) => s.id === slide.id ? { ...s, use_tint: !(s.use_tint === true) } : s))}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${slide.use_tint === true ? "hover:bg-emerald-50 text-emerald-500" : "hover:bg-gray-100 text-gray-400"}`}
                >
                  <i className={slide.use_tint === true ? "ri-contrast-line" : "ri-contrast-drop-line"}></i>
                </button>
                <button onClick={() => handleMoveUp(idx)} disabled={idx === 0} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer disabled:opacity-30">
                  <i className="ri-arrow-up-s-line text-sm"></i>
                </button>
                <button onClick={() => handleMoveDown(idx)} disabled={idx === slides.length - 1} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer disabled:opacity-30">
                  <i className="ri-arrow-down-s-line text-sm"></i>
                </button>
                <button onClick={() => handleToggle(slide.id)} className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${slide.ativo ? "hover:bg-amber-50 text-amber-500" : "hover:bg-green-50 text-green-500"}`}>
                  <i className={slide.ativo ? "ri-eye-off-line text-sm" : "ri-eye-line text-sm"}></i>
                </button>
                <button onClick={() => { setEditSlide(slide); setShowForm(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 cursor-pointer">
                  <i className="ri-edit-line text-sm"></i>
                </button>
                <button onClick={() => handleDelete(slide.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer">
                  <i className="ri-delete-bin-line text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showForm && editSlide && (
        <SlideFormModal
          slide={editSlide}
          onSave={handleSaveSlide}
          onClose={() => { setShowForm(false); setEditSlide(null); }}
          primaryColor={config.primaryColor}
        />
      )}
    </div>
  );
}

function SlideFormModal({ slide, onSave, onClose, primaryColor }: {
  slide: SlideAdmin; onSave: (s: SlideAdmin) => void; onClose: () => void; primaryColor: string;
}) {
  const [form, setForm] = useState<SlideAdmin>({ ...slide });
  const isNew = slide.id === 0;
  const slideFileRef = useRef<HTMLInputElement>(null);
  const pdfFileRef = useRef<HTMLInputElement>(null);
  const [slideUploading, setSlideUploading] = useState(false);
  const [slideUploadOk, setSlideUploadOk] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfUploadOk, setPdfUploadOk] = useState(false);
  const [pdfUploadError, setPdfUploadError] = useState("");
  const { readFileAsDataURL } = useImageUpload();

  const update = (key: keyof SlideAdmin, value: string | boolean) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSlideFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlideUploading(true);
    try {
      let imageUrl = "";
      try {
        const uploaded = await uploadService.upload(file, "slides");
        imageUrl = uploaded.url;
      } catch {
        imageUrl = await readFileAsDataURL(file);
      }
      update("image_url", imageUrl);
      setSlideUploadOk(true);
      setTimeout(() => setSlideUploadOk(false), 3000);
    } finally {
      setSlideUploading(false);
      if (slideFileRef.current) slideFileRef.current.value = "";
    }
  };

  const handlePdfFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!arquivoPermitidoDocumento(file) || !["PDF", "PPT", "PPTX", "PPS", "PPSX", "ODP"].includes(tipoArquivo(file))) {
      setPdfUploadError("Selecione um arquivo PDF, PPT ou PPTX.");
      if (pdfFileRef.current) pdfFileRef.current.value = "";
      return;
    }

    setPdfUploading(true);
    setPdfUploadError("");
    try {
      const uploaded = await uploadService.upload(file, pastaPublicaPorArquivo("slides", file));
      const arquivoTipo = tipoArquivo(file);

      setForm((p) => ({
        ...p,
        cta_type: arquivoTipo === "PDF" ? "pdf" : "ppt",
        cta_label: p.cta_label || (arquivoTipo === "PDF" ? "Abrir PDF" : "Abrir apresentação"),
        pdf_url: uploaded.url,
        pdf_name: file.name,
      }));
      setPdfUploadOk(true);
      setTimeout(() => setPdfUploadOk(false), 3000);
    } catch {
      setPdfUploadError("Não foi possível enviar o arquivo para a pasta pública. Verifique se o backend está ativo.");
    } finally {
      setPdfUploading(false);
      if (pdfFileRef.current) pdfFileRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {isNew ? "Novo Slide" : "Editar Slide"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {/* Input oculto */}
          <input ref={slideFileRef} type="file" accept="image/*" className="hidden" onChange={handleSlideFile} />
          <input ref={pdfFileRef} type="file" accept=".pdf,.ppt,.pptx,.pps,.ppsx,.odp,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.oasis.opendocument.presentation" className="hidden" onChange={handlePdfFile} />

          {/* Preview */}
          <div className="w-full aspect-[16/7] min-h-[220px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 relative">
            {form.image_url ? (
              <img src={form.image_url} alt="Preview" className="w-full h-full object-cover object-top" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <i className="ri-image-add-line text-3xl text-gray-300"></i>
                <p className="text-xs text-gray-400">Imagem do slide aparecerá aqui</p>
              </div>
            )}
            {form.image_url && form.use_tint === true && (
              <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${primaryColor}cc 0%, ${primaryColor}88 45%, transparent 100%)` }} />
            )}
            {form.image_url && form.use_tint !== true && (
              <div className="absolute inset-0 bg-black/10" />
            )}
            {form.image_url && form.show_content === true && (
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-xl px-8 md:px-12 text-white">
                  {form.tag && <span className="inline-flex mb-3 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm">{form.tag}</span>}
                  <h4 className="text-2xl md:text-4xl font-bold leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{form.titulo || "Título do slide"}</h4>
                  {form.subtitulo && <p className="text-sm md:text-base mt-3 text-white/90 line-clamp-2">{form.subtitulo}</p>}
                  {(form.cta_type || "link") !== "none" && (form.cta_label || form.pdf_name) && (
                    <span className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-gray-900">
                      {form.cta_label || form.pdf_name}
                      <i className="ri-arrow-right-line"></i>
                    </span>
                  )}
                </div>
              </div>
            )}
            {form.image_url && form.show_content !== true && (
              <div className="absolute left-4 bottom-4 px-3 py-1.5 rounded-full bg-white/90 text-xs font-bold text-gray-700 shadow-sm">
                Modo só banner: imagem limpa na home
              </div>
            )}
            {form.image_url && (
              <button
                type="button"
                onClick={() => slideFileRef.current?.click()}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer hover:opacity-90"
                style={{ backgroundColor: primaryColor }}>
                <i className="ri-camera-line text-xs"></i> Trocar
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, ativo: true, show_content: false, use_tint: false }))}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              <i className="ri-fullscreen-line"></i> Banner total
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, ativo: true, show_content: true, use_tint: true }))}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <i className="ri-text"></i> Mostrar tudo
            </button>
            <button
              type="button"
              onClick={() => update("use_tint", false)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <i className="ri-contrast-drop-line"></i> Sem transparência
            </button>
            <button
              type="button"
              onClick={() => update("show_content", false)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <i className="ri-image-line"></i> Só banner
            </button>
          </div>

          {/* Upload do computador */}
          <div
            className="border-2 border-dashed rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ borderColor: `${primaryColor}50` }}
            onClick={() => slideFileRef.current?.click()}>
            <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ backgroundColor: `${primaryColor}15` }}>
              {slideUploading
                ? <i className="ri-loader-4-line animate-spin text-lg" style={{ color: primaryColor }}></i>
                : slideUploadOk
                ? <i className="ri-checkbox-circle-line text-lg" style={{ color: primaryColor }}></i>
                : <i className="ri-upload-2-line text-lg" style={{ color: primaryColor }}></i>}
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: slideUploadOk ? primaryColor : "#374151" }}>
                {slideUploading ? "Carregando imagem..." : slideUploadOk ? "Imagem carregada do computador!" : "Escolher imagem do computador"}
              </p>
              <p className="text-[10px] text-gray-400">PNG, JPG, WebP · Recomendado: 1920×900px</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Ou cole a URL da Imagem</label>
            <input
              type="text"
              value={form.image_url.startsWith("data:") ? "" : form.image_url}
              onChange={(e) => update("image_url", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              placeholder="https://... (cole um link de imagem)"
            />
            <p className="text-xs text-gray-400 mt-1">Cole o link de uma imagem (JPG, PNG, WebP). Recomendado: 1920x900px.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tag / Categoria</label>
              <input value={form.tag} onChange={(e) => update("tag", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="Ex: Gestão Pública" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
              <select value={form.ativo ? "ativo" : "inativo"} onChange={(e) => update("ativo", e.target.value === "ativo")} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Título Principal</label>
            <input value={form.titulo} onChange={(e) => update("titulo", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="Título do slide" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Subtítulo / Descrição</label>
            <textarea value={form.subtitulo} onChange={(e) => update("subtitulo", e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" placeholder="Texto descritivo do slide"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Texto do Botão</label>
              <input value={form.cta_label} onChange={(e) => update("cta_label", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="Ex: Saiba mais" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Link do Botão</label>
              <input value={form.cta_url} onChange={(e) => update("cta_url", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="/servicos" />
            </div>
          </div>
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Destino ao clicar no slide</label>
                <select
                  value={form.cta_type || "link"}
                  onChange={(e) => update("cta_type", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer bg-white"
                >
                  <option value="link">Abrir link / página</option>
                  <option value="pdf">Abrir PDF anexado</option>
                  <option value="ppt">Abrir PPT/PPTX anexado</option>
                  <option value="none">Fixo, sem clique</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => pdfFileRef.current?.click()}
                  disabled={!["pdf", "ppt"].includes(form.cta_type || "link") || pdfUploading}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#DC2626" }}
                >
                  {pdfUploading ? <i className="ri-loader-4-line animate-spin"></i> : pdfUploadOk ? <i className="ri-checkbox-circle-line"></i> : <i className="ri-file-upload-line"></i>}
                  {pdfUploading ? "Enviando arquivo..." : form.pdf_url ? "Trocar arquivo" : "Anexar PDF/PPTX"}
                </button>
              </div>
            </div>
            {["pdf", "ppt"].includes(form.cta_type || "link") && (
              <div className="mt-3">
                <p className="text-[11px] text-gray-500 truncate">
                  {form.pdf_name ? `Arquivo anexado: ${form.pdf_name}` : "Anexe um PDF, PPT ou PPTX do computador para abrir quando o visitante clicar no slide."}
                </p>
                {pdfUploadError && <p className="text-[11px] text-red-500 mt-1">{pdfUploadError}</p>}
                {form.pdf_url && (
                  <a href={form.pdf_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-red-600 hover:underline">
                    <i className={(form.cta_type || "link") === "ppt" ? "ri-slideshow-2-line" : "ri-file-pdf-2-line"}></i>
                    Abrir arquivo anexado
                  </a>
                )}
              </div>
            )}
            {(form.cta_type || "link") === "none" && (
              <p className="mt-3 text-[11px] text-gray-500">
                Neste modo o slide aparece normalmente na home, mas clicar nele não abre link nem PDF.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-700">Mostrar textos e botões sobre o banner</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Desative para exibir somente a imagem do slide na home.</p>
            </div>
            <button
              type="button"
              onClick={() => update("show_content", !(form.show_content === true))}
              className={`relative w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${form.show_content === true ? "" : "bg-gray-200"}`}
              style={form.show_content === true ? { backgroundColor: primaryColor } : {}}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${form.show_content === true ? "translate-x-4" : "translate-x-0.5"}`}></span>
            </button>
          </div>

          {/* Toggle overlay verde */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-700">Aplicar cor verde sobre a imagem</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Ative para imagens sem cor definida. Desative para fotos do computador com cor própria.</p>
            </div>
            <button
              type="button"
              onClick={() => update("use_tint", !(form.use_tint === true))}
              className={`relative w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${form.use_tint === true ? "" : "bg-gray-200"}`}
              style={form.use_tint === true ? { backgroundColor: primaryColor } : {}}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${form.use_tint === true ? "translate-x-4" : "translate-x-0.5"}`}></span>
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={() => onSave(form)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: primaryColor }}>
              {isNew ? "Adicionar Slide" : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── APARÊNCIA / LAYOUT ──────────────────────────────────────────────────────────
function AparenciaTab() {
  const { config, updateConfig } = useSiteConfig();
  const [form, setForm] = useState({ primaryColor: config.primaryColor, secondaryColor: config.secondaryColor, layoutZoom: config.layoutZoom || 100 });
  const [fontFamily, setFontFamily] = useState<string>(() => localStorage.getItem("inprec_font") || "Poppins");
  const [borderRadius, setBorderRadius] = useState<string>(() => localStorage.getItem("inprec_radius") || "lg");
  const [saved, setSaved] = useState(false);

  const cores = [
    { label: "Roxo Padrão", primary: "#6D28D9", secondary: "#1A0533" },
    { label: "Azul Institucional", primary: "#1D4ED8", secondary: "#1E3A8A" },
    { label: "Verde Gov", primary: "#059669", secondary: "#064E3B" },
    { label: "Vermelho", primary: "#DC2626", secondary: "#7F1D1D" },
    { label: "Teal", primary: "#0891B2", secondary: "#164E63" },
    { label: "Laranja", primary: "#EA580C", secondary: "#7C2D12" },
    { label: "Rosa", primary: "#DB2777", secondary: "#831843" },
    { label: "Cinza Escuro", primary: "#374151", secondary: "#111827" },
  ];

  const fontes = [
    { value: "Poppins", label: "Poppins", preview: "Moderna e institucional" },
    { value: "Inter", label: "Inter", preview: "Limpa e legível" },
    { value: "Roboto", label: "Roboto", preview: "Clássica e neutra" },
    { value: "Montserrat", label: "Montserrat", preview: "Elegante e geométrica" },
    { value: "Raleway", label: "Raleway", preview: "Refinada e sofisticada" },
  ];

  const raios = [
    { value: "none", label: "Reto", class: "rounded-none" },
    { value: "sm", label: "Suave", class: "rounded-sm" },
    { value: "lg", label: "Médio", class: "rounded-lg" },
    { value: "2xl", label: "Arredondado", class: "rounded-2xl" },
    { value: "full", label: "Pílula", class: "rounded-full" },
  ];

  const handleSave = () => {
    updateConfig(form);
    localStorage.setItem("inprec_font", fontFamily);
    localStorage.setItem("inprec_radius", borderRadius);
    document.documentElement.style.setProperty("--font-heading", fontFamily);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>Layout &amp; Aparência</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temas */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Paleta de Cores</h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {cores.map((c) => (
              <button
                key={c.label}
                onClick={() => { setForm((prev) => ({ ...prev, primaryColor: c.primary, secondaryColor: c.secondary })); updateConfig({ primaryColor: c.primary, secondaryColor: c.secondary }); }}
                className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:border-gray-300"
                style={form.primaryColor === c.primary ? { borderColor: c.primary } : { borderColor: "#F3F4F6" }}
              >
                <div className="flex gap-1">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: c.primary }}></div>
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: c.secondary }}></div>
                </div>
                <span className="text-xs font-medium text-gray-700">{c.label}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Cor Principal Personalizada</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.primaryColor} onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
                <input type="text" value={form.primaryColor} onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))} className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none font-mono" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Cor Secundária (escura)</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.secondaryColor} onChange={(e) => setForm((p) => ({ ...p, secondaryColor: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
                <input type="text" value={form.secondaryColor} onChange={(e) => setForm((p) => ({ ...p, secondaryColor: e.target.value }))} className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none font-mono" />
              </div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: `linear-gradient(135deg, ${form.secondaryColor}, ${form.primaryColor})` }}>
              <p className="text-white text-sm font-semibold">Pré-visualização do gradiente</p>
              <p className="text-white/60 text-xs">Este será aplicado nos cabeçalhos e destaques</p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Zoom do Layout (Densidade)</label>
              <select
                value={form.layoutZoom}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setForm(p => ({ ...p, layoutZoom: val }));
                  // Opcional: Aplicar preview instantâneo
                  // @ts-ignore
                  document.documentElement.style.zoom = (val / 100).toString();
                }}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
              >
                <option value={70}>70% (Muito Compacto)</option>
                <option value={80}>80% (Compacto - Recomendado)</option>
                <option value={85}>85% (Equilibrado)</option>
                <option value={90}>90% (Quase Padrão)</option>
                <option value={100}>100% (Padrão)</option>
                <option value={110}>110% (Ampliado)</option>
                <option value={120}>120% (Acessibilidade)</option>
              </select>
              <p className="text-[10px] text-gray-400 mt-1.5">
                Ajusta a escala visual de todo o site. Útil para melhorar a densidade de informações em telas grandes.
              </p>
            </div>
          </div>
        </div>

        {/* Tipografia e Bordas */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Tipografia</h2>
            <div className="flex flex-col gap-2">
              {fontes.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFontFamily(f.value)}
                  className="flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all hover:border-gray-300"
                  style={fontFamily === f.value ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}05` } : { borderColor: "#F3F4F6" }}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: `'${f.value}', sans-serif` }}>{f.label}</p>
                    <p className="text-xs text-gray-400">{f.preview}</p>
                  </div>
                  {fontFamily === f.value && (
                    <div className="w-5 h-5 flex items-center justify-center rounded-full" style={{ backgroundColor: config.primaryColor }}>
                      <i className="ri-check-line text-white text-xs"></i>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Estilo de Bordas / Botões</h2>
            <div className="flex gap-2 flex-wrap">
              {raios.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setBorderRadius(r.value)}
                  className={`flex flex-col items-center gap-2 p-3 border-2 cursor-pointer transition-all ${r.class}`}
                  style={borderRadius === r.value ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}05` } : { borderColor: "#F3F4F6" }}
                >
                  <div className={`w-12 h-7 ${r.class}`} style={{ backgroundColor: borderRadius === r.value ? config.primaryColor : "#E5E7EB" }}></div>
                  <span className="text-xs text-gray-600">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSave} className="py-3.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90" style={{ backgroundColor: form.primaryColor }}>
            {saved ? "Alterações salvas!" : "Aplicar Layout"}
          </button>
        </div>
      </div>
    </div>
  );
}





// ── PÁGINAS ───────────────────────────────────────────────────────────────────────
// PaginasTab is imported from @/pages/admin/tabs/PaginasTab

// ── GESTORES ──────────────────────────────────────────────────────────────────────
function GestoresTab() {
  const { config } = useSiteConfig();
  const [lista, setLista] = useState<Gestor[]>(() => {
    try {
      const s = localStorage.getItem("inprec_gestores");
      if (!s) return gestoresMock;
      const parsed = JSON.parse(s) as Gestor[];
      const temBaseAntiga = parsed.some((g) =>
        ["Dr. Carlos Eduardo Mendes", "Dra. Fernanda Lima", "Dr. Ricardo Souza", "Dra. Patrícia Alves"].includes(g.nome)
      );
      const temComposicaoAtual = parsed.some((g) => g.nome === "Elias Cruz Santos");
      return temBaseAntiga || !temComposicaoAtual ? gestoresMock : parsed;
    } catch { return gestoresMock; }
  });
  const [grupoAtivo, setGrupoAtivo] = useState("diretoria");
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Gestor | null>(null);
  const [saved, setSaved] = useState(false);

  const persist = (updated: Gestor[]) => { setLista(salvarGestoresAtualizados(updated)); };

  const handleDelete = (id: number) => {
    if (!confirm("Remover este gestor?")) return;
    persist(lista.filter(g => g.id !== id));
  };

  const blank: Gestor = {
    id: 0, nome: "", cargo: "", grupo: grupoAtivo as Gestor["grupo"], foto: "", email: "", telefone: "", matricula: "",
    bio: "", formacao: "", cursos: [], documentos: [], mandato: "", ativo: true,
  };

  const handleSave = (g: Gestor) => {
    if (g.id === 0) {
      const newId = Math.max(0, ...lista.map(x => x.id)) + 1;
      persist([...lista, { ...g, id: newId }]);
    } else {
      persist(lista.map(x => x.id === g.id ? g : x));
    }
    setShowForm(false); setEditando(null); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const filtrados = lista.filter(g => g.grupo === grupoAtivo);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Gestores</h1>
          <p className="text-sm text-gray-400 mt-1">Gerencie Diretoria, Comitê e Conselhos do INPREC.</p>
        </div>
        <button onClick={() => { setEditando(blank); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90" style={{ backgroundColor: config.primaryColor }}>
          <i className="ri-add-line"></i> Novo Gestor
        </button>
      </div>
      {saved && <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2"><i className="ri-check-line"></i> Salvo com sucesso!</div>}
      {/* Tabs grupos */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {grupos.map(g => (
          <button key={g.key} onClick={() => setGrupoAtivo(g.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
            style={grupoAtivo === g.key ? { backgroundColor: config.primaryColor, color: "white" } : { color: "#6B7280" }}>
            <i className={`${g.icon} text-xs`}></i>{g.label}
            <span className="ml-1 text-[10px] font-bold">{lista.filter(x => x.grupo === g.key).length}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {filtrados.map(g => (
          <div key={g.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              {g.foto ? <img src={g.foto} alt={g.nome} className="w-full h-full object-cover object-top" /> : <div className="w-full h-full flex items-center justify-center"><i className="ri-user-line text-gray-300 text-xl"></i></div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${g.ativo ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>{g.ativo ? "Ativo" : "Inativo"}</span>
                {g.matricula && <span className="text-xs text-gray-400">Matr. {g.matricula}</span>}
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">{g.nome}</p>
              <p className="text-xs text-gray-400 truncate">{g.cargo}</p>
              <p className="text-xs text-gray-300 mt-0.5">{g.email}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => { setEditando(g); setShowForm(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"><i className="ri-edit-line text-sm"></i></button>
              <button onClick={() => handleDelete(g.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"><i className="ri-delete-bin-line text-sm"></i></button>
            </div>
          </div>
        ))}
        {filtrados.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">Nenhum gestor neste grupo.</div>}
      </div>
      {showForm && editando && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-2 md:p-4" onClick={e => e.target === e.currentTarget && (setShowForm(false), setEditando(null))}>
          <div className="bg-white rounded-2xl w-[98vw] max-w-[1680px] h-[96vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-shrink-0">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{editando.id === 0 ? "Novo Gestor" : "Editar Gestor"}</h3>
                <p className="text-xs text-gray-400 mt-0.5 truncate">Preencha os dados da Diretoria, Comitê de Investimento e Conselhos do INPREC.</p>
              </div>
              <button onClick={() => { setShowForm(false); setEditando(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><i className="ri-close-line text-gray-400"></i></button>
            </div>
            <GestorForm gestor={editando} onSave={handleSave} onClose={() => { setShowForm(false); setEditando(null); }} primaryColor={config.primaryColor} />
          </div>
        </div>
      )}
    </div>
  );
}

type GestorFormTab = "dados" | "cursos" | "documentos";

function GestorForm({ gestor, onSave, onClose, primaryColor }: { gestor: Gestor; onSave: (g: Gestor) => void; onClose: () => void; primaryColor: string }) {
  const [form, setForm] = useState<Gestor>({ ...gestor, cursos: gestor.cursos ?? [], documentos: gestor.documentos ?? [] });
  const [activeTab, setActiveTab] = useState<GestorFormTab>("dados");
  const docFileRef = useRef<HTMLInputElement>(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docUploadMsg, setDocUploadMsg] = useState("");
  const { readFileAsDataURL } = useImageUpload();
  const upd = (k: keyof Gestor, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  // ── Cursos ──
  const [novoCurso, setNovoCurso] = useState({ titulo: "", instituicao: "", ano: new Date().getFullYear(), cargaHoraria: "", tipo: "Curso" as Curso["tipo"] });
  const tiposCurso: Curso["tipo"][] = ["Graduação", "Especialização", "MBA", "Mestrado", "Doutorado", "Curso", "Capacitação"];

  const addCurso = () => {
    if (!novoCurso.titulo.trim() || !novoCurso.instituicao.trim()) return;
    const id = Math.max(0, ...(form.cursos ?? []).map(c => c.id)) + 1;
    setForm(p => ({ ...p, cursos: [...(p.cursos ?? []), { ...novoCurso, id }] }));
    setNovoCurso({ titulo: "", instituicao: "", ano: new Date().getFullYear(), cargaHoraria: "", tipo: "Curso" });
  };

  const removeCurso = (id: number) => setForm(p => ({ ...p, cursos: (p.cursos ?? []).filter(c => c.id !== id) }));

  // ── Documentos ──
  const [novoDoc, setNovoDoc] = useState({ titulo: "", tipo: "PDF", tamanho: "", url: "" });

  const formatFileSize = (size: number) => {
    if (!size) return "";
    if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDocFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploading(true);
    setDocUploadMsg("");
    try {
      let url = "";
      try {
        const uploaded = await uploadService.upload(file, "gestores-documentos");
        url = uploaded.url;
      } catch {
        setDocUploadMsg("Não foi possível anexar o arquivo. Verifique se o backend está ativo.");
        return;
      }
      const ext = file.name.split(".").pop()?.toUpperCase() || "PDF";
      setNovoDoc((p) => ({
        ...p,
        titulo: p.titulo || file.name.replace(/\.[^.]+$/, ""),
        tipo: ext,
        tamanho: formatFileSize(file.size),
        url,
      }));
      setDocUploadMsg(`Arquivo anexado: ${file.name}`);
    } catch {
      setDocUploadMsg("Não foi possível anexar o arquivo.");
    } finally {
      setDocUploading(false);
      if (docFileRef.current) docFileRef.current.value = "";
    }
  };

  const addDoc = () => {
    if (!novoDoc.titulo.trim()) return;
    const id = Math.max(0, ...(form.documentos ?? []).map(d => d.id)) + 1;
    setForm(p => ({ ...p, documentos: [...(p.documentos ?? []), { ...novoDoc, id }] }));
    setNovoDoc({ titulo: "", tipo: "PDF", tamanho: "", url: "" });
    setDocUploadMsg("");
  };

  const removeDoc = (id: number) => setForm(p => ({ ...p, documentos: (p.documentos ?? []).filter(d => d.id !== id) }));

  const formTabs: { key: GestorFormTab; label: string; icon: string }[] = [
    { key: "dados", label: "Dados", icon: "ri-user-line" },
    { key: "cursos", label: "Cursos", icon: "ri-graduation-cap-line" },
    { key: "documentos", label: "Documentos", icon: "ri-file-list-line" },
  ];

  const textFields: [keyof Gestor, string][] = [
    ["nome", "Nome Completo"],
    ["cargo", "Cargo"],
    ["email", "E-mail"],
    ["telefone", "Telefone"],
    ["matricula", "Matrícula"],
    ["formacao", "Formação Principal"],
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.55fr)_minmax(420px,0.85fr)] gap-6 lg:gap-10 min-h-full">
          {/* COLUNA ESQUERDA: DADOS */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <h4 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Dados do Gestor</h4>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 font-semibold">Informações principais</span>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
            <div className="col-span-1 md:col-span-2">
              <SingleImageUploader
                value={form.foto}
                onChange={(url) => upd("foto", url)}
                primaryColor={primaryColor}
                label="Foto do Gestor"
                hint="Escolha do computador ou cole a URL da foto. Recomendado: foto quadrada."
                previewShape="circle"
                previewSize="lg"
                placeholder="https://... (link da foto)"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Grupo</label>
              <select value={form.grupo} onChange={e => upd("grupo", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
                {grupos.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
              </select>
            </div>

            {textFields.map(([k, l]) => (
              <div key={k}>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{l}</label>
                <input type="text" value={(form[k] as string) ?? ""} onChange={e => upd(k, e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
              </div>
            ))}

            <div className="col-span-1 md:col-span-2 2xl:col-span-3">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Biografia</label>
              <textarea value={form.bio} onChange={e => upd("bio", e.target.value)} rows={5} maxLength={500} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" />
              <p className="text-[10px] text-gray-400 mt-1">{form.bio.length}/500</p>
            </div>

            <div className="flex items-center gap-3 col-span-1 md:col-span-2 2xl:col-span-3">
              <button onClick={() => upd("ativo", !form.ativo)} className="flex items-center gap-2 cursor-pointer">
                <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${form.ativo ? "text-white" : "border border-gray-200"}`} style={form.ativo ? { backgroundColor: primaryColor } : {}}>
                  {form.ativo && <i className="ri-check-line text-xs"></i>}
                </div>
                <span className="text-xs font-medium text-gray-700">Ativo</span>
              </button>
            </div>
          </div>
          </div>

          {/* COLUNA DIREITA: CURSOS E DOCUMENTOS */}
          <div className="flex flex-col gap-8 xl:border-l xl:border-gray-100 xl:pl-8">
            
            {/* SESSÃO CURSOS */}
            <div className="flex flex-col gap-4">
              <h4 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Cursos e Formações</h4>
            <p className="text-xs text-gray-500">Cursos, especializações e capacitações do gestor, visíveis no perfil público.</p>

            {/* Formulário de adição */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-700">Adicionar curso</p>
              <input
                type="text"
                value={novoCurso.titulo}
                onChange={e => setNovoCurso(p => ({ ...p, titulo: e.target.value }))}
                placeholder="Título do curso *"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
              />
              <input
                type="text"
                value={novoCurso.instituicao}
                onChange={e => setNovoCurso(p => ({ ...p, instituicao: e.target.value }))}
                placeholder="Instituição *"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={novoCurso.tipo}
                  onChange={e => setNovoCurso(p => ({ ...p, tipo: e.target.value as Curso["tipo"] }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer bg-white"
                >
                  {tiposCurso.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                  type="number"
                  value={novoCurso.ano}
                  onChange={e => setNovoCurso(p => ({ ...p, ano: parseInt(e.target.value) || new Date().getFullYear() }))}
                  placeholder="Ano"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
                />
              </div>
              <input
                type="text"
                value={novoCurso.cargaHoraria}
                onChange={e => setNovoCurso(p => ({ ...p, cargaHoraria: e.target.value }))}
                placeholder="Carga horária (ex: 80h) — opcional"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
              />
              <button
                onClick={addCurso}
                disabled={!novoCurso.titulo.trim() || !novoCurso.instituicao.trim()}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: primaryColor }}
              >
                <i className="ri-add-line"></i> Adicionar Curso
              </button>
            </div>

            {/* Lista de cursos */}
            {form.cursos && form.cursos.length > 0 ? (
              <div className="flex flex-col gap-2">
                {form.cursos.map(c => (
                  <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{c.titulo}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{c.instituicao} · {c.ano}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>{c.tipo}</span>
                        {c.cargaHoraria && <span className="text-[10px] text-gray-400">{c.cargaHoraria}</span>}
                      </div>
                    </div>
                    <button onClick={() => removeCurso(c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 cursor-pointer flex-shrink-0">
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-xs">
                <i className="ri-graduation-cap-line text-3xl block mb-2"></i>
                Nenhum curso adicionado ainda
              </div>
            )}
            </div>

            {/* SESSÃO DOCUMENTOS */}
            <div className="flex flex-col gap-4">
              <h4 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Documentos e Anexos</h4>
            <p className="text-xs text-gray-500">Documentos vinculados ao gestor (portarias, certificados, declarações, etc.).</p>

            {/* Formulário de adição */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-700">Adicionar documento</p>
              <input
                ref={docFileRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleDocFile}
              />
              <button
                type="button"
                onClick={() => docFileRef.current?.click()}
                disabled={docUploading}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed bg-white text-left cursor-pointer hover:bg-gray-50 disabled:opacity-60 disabled:cursor-wait transition-all"
                style={{ borderColor: `${primaryColor}45` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primaryColor}12` }}>
                  <i className={`${docUploading ? "ri-loader-4-line animate-spin" : novoDoc.url ? "ri-checkbox-circle-line" : "ri-upload-cloud-2-line"} text-xl`} style={{ color: primaryColor }}></i>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800">{docUploading ? "Anexando documento..." : novoDoc.url ? "Documento pronto para adicionar" : "Anexar documento do computador"}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">PDF, DOC, DOCX, XLS, XLSX, JPG ou PNG. Depois clique em Adicionar Documento.</p>
                  {docUploadMsg && <p className="text-[10px] mt-1 truncate" style={{ color: docUploadMsg.includes("Não") ? "#DC2626" : primaryColor }}>{docUploadMsg}</p>}
                </div>
              </button>
              <input
                type="text"
                value={novoDoc.titulo}
                onChange={e => setNovoDoc(p => ({ ...p, titulo: e.target.value }))}
                placeholder="Título do documento *"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={novoDoc.tipo}
                  onChange={e => setNovoDoc(p => ({ ...p, tipo: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer bg-white"
                >
                  {["PDF", "DOCX", "XLSX", "JPG", "PNG"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                  type="text"
                  value={novoDoc.tamanho}
                  onChange={e => setNovoDoc(p => ({ ...p, tamanho: e.target.value }))}
                  placeholder="Tamanho (ex: 180 KB)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
                />
              </div>
              <input
                type="text"
                value={novoDoc.url}
                onChange={e => setNovoDoc(p => ({ ...p, url: e.target.value }))}
                placeholder="URL do arquivo (opcional)"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
              />
              <button
                onClick={addDoc}
                disabled={!novoDoc.titulo.trim()}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: primaryColor }}
              >
                <i className="ri-add-line"></i> Adicionar Documento
              </button>
            </div>

            {/* Lista de documentos */}
            {form.documentos && form.documentos.length > 0 ? (
              <div className="flex flex-col gap-2">
                {form.documentos.map(d => (
                  <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${primaryColor}10` }}>
                      <i className="ri-file-pdf-2-line text-sm" style={{ color: primaryColor }}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{d.titulo}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{d.tipo} · {d.tamanho || "Tamanho não informado"}</p>
                    </div>
                    <button onClick={() => removeDoc(d.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 cursor-pointer flex-shrink-0">
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-xs">
                <i className="ri-file-list-line text-3xl block mb-2"></i>
                Nenhum documento adicionado ainda
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0 bg-white">
        <p className="text-xs text-gray-400">Confira os dados, cursos e documentos antes de salvar.</p>
        <div className="flex gap-3 sm:min-w-[360px]">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">Cancelar</button>
          <button onClick={() => onSave(form)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90" style={{ backgroundColor: primaryColor }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ── PAINEL TRANSPARÊNCIA ─────────────────────────────────────────────────────────
function PainelTransparenciaTab() {
  const { config } = useSiteConfig();
  
  const [slides, setSlides] = useState<PainelSlide[]>([]);
  const [loading, setLoading] = useState(true);

  const [painelConfig, setPainelConfig] = useState(() => {
    try {
      const s = localStorage.getItem("inprec_painel_transparencia_config");
      if (!s) return painelTransparenciaConfigDefault;
      const parsed = JSON.parse(s);
      return parsed.layoutVersion === painelTransparenciaConfigDefault.layoutVersion
        ? { ...painelTransparenciaConfigDefault, ...parsed }
        : painelTransparenciaConfigDefault;
    } catch {
      return painelTransparenciaConfigDefault;
    }
  });

  const [editSlide, setEditSlide] = useState<PainelSlide | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploadingPainel, setUploadingPainel] = useState(false);
  const [uploadPainelErro, setUploadPainelErro] = useState("");
  const [uploadPainelInfo, setUploadPainelInfo] = useState("");
  const painelFileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadingSlides, setUploadingSlides] = useState(false);
  const [uploadSlidesErro, setUploadSlidesErro] = useState("");
  const slidesImagesInputRef = useRef<HTMLInputElement | null>(null);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const data = await transparenciaService.listarPainelAdmin();
      setSlides(data);
    } catch (err) {
      console.error("Erro ao carregar slides do banco:", err);
      // Fallback
      try {
        const s = localStorage.getItem("inprec_painel_transparencia");
        if (s) {
          setSlides(JSON.parse(s));
        } else {
          setSlides(painelTransparenciaDefault);
        }
      } catch {
        setSlides(painelTransparenciaDefault);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const saveConfig = (c: typeof painelConfig) => {
    const next = { ...c, layoutVersion: painelTransparenciaConfigDefault.layoutVersion };
    setPainelConfig(next);
    localStorage.setItem("inprec_painel_transparencia_config", JSON.stringify(next));
    window.dispatchEvent(new Event("storage"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggle = async (id: number) => {
    const target = slides.find(s => s.id === id);
    if (!target) return;
    const updatedSlide = { ...target, ativo: !target.ativo };
    try {
      const savedSlide = await transparenciaService.salvarPainel(updatedSlide);
      setSlides(slides.map(s => s.id === id ? savedSlide : s));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Erro ao alternar status do painel:", err);
      alert("Erro ao salvar alterações no banco de dados.");
    }
  };

  const handleDelete = async (id: number) => {
    if (id >= 1 && id <= 6) {
      alert("Este painel é institucional e obrigatório do INPREC. Ele não pode ser excluído, apenas ativado/desativado ou modificado.");
      return;
    }
    if (confirm("Remover este painel definitivamente?")) {
      try {
        await transparenciaService.excluirPainel(id);
        setSlides(slides.filter(s => s.id !== id));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error("Erro ao excluir painel:", err);
        alert("Erro ao excluir painel do banco de dados.");
      }
    }
  };

  const handleSave = async (slide: PainelSlide) => {
    if (!slide.titulo.trim()) {
      alert("O título do painel é obrigatório.");
      return;
    }

    try {
      const savedSlide = await transparenciaService.salvarPainel(slide);
      if (slide.id === 0) {
        setSlides([...slides, savedSlide]);
      } else {
        setSlides(slides.map(s => s.id === slide.id ? savedSlide : s));
      }
      setEditSlide(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Erro ao salvar card:", err);
      alert("Erro ao salvar alterações no banco de dados.");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const handlePainelFileUpload = async (file?: File) => {
    if (!file || !editSlide) return;

    const ext = extensaoArquivo(file);
    const isPDF = ext === ".pdf";
    const isPPT = [".ppt", ".pptx", ".pps", ".ppsx"].includes(ext);

    if (!isPDF && !isPPT) {
      setUploadPainelErro("Formato de arquivo inválido. Apenas arquivos .pdf ou .pptx/.ppt são permitidos.");
      return;
    }

    const limit = isPDF ? 50 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > limit) {
      setUploadPainelErro(`Arquivo muito grande! O limite para arquivos ${isPDF ? "PDF é de 50MB" : "PPTX é de 100MB"}.`);
      return;
    }

    setUploadingPainel(true);
    setUploadPainelErro("");
    setUploadPainelInfo("");

    try {
      const uploaded = await uploadService.upload(file, "transparencia");
      
      setEditSlide(p => p ? {
        ...p,
        sourceUrl: uploaded.url,
        embedUrl: uploaded.url,
        tipo: isPDF ? "PDF" : "PPT",
        tamanho: formatFileSize(file.size),
        dataAtualizacao: new Date().toISOString().split("T")[0]
      } : p);

      setUploadPainelInfo("Arquivo local enviado com sucesso para o servidor e pronto para exibição!");
    } catch (err) {
      setUploadPainelErro(err instanceof Error ? err.message : "Não foi possível enviar o arquivo para o servidor.");
    } finally {
      setUploadingPainel(false);
      if (painelFileInputRef.current) painelFileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = () => {
    if (confirm("Remover o arquivo anexado? O painel voltará a exibir o placeholder institucional amigável de 'Arquivo ainda não enviado'.")) {
      setEditSlide(p => p ? {
        ...p,
        sourceUrl: "",
        embedUrl: "",
        tamanho: "",
      } : p);
      setUploadPainelInfo("Arquivo anexado removido. Lembre-se de salvar.");
    }
  };

  const handleMultipleSlidesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editSlide) return;

    setUploadingSlides(true);
    setUploadSlidesErro("");

    const currentImg = editSlide.slidesImg || [];
    const newImgUrls = [...currentImg];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          setUploadSlidesErro("Apenas imagens (PNG, JPG, JPEG, WEBP) são permitidas nos slides do carrossel.");
          continue;
        }
        const uploaded = await uploadService.upload(file, "transparencia");
        newImgUrls.push(uploaded.url);
      }
      setEditSlide(p => p ? { ...p, slidesImg: newImgUrls } : p);
    } catch (err) {
      setUploadSlidesErro(err instanceof Error ? err.message : "Erro ao enviar slides de imagem.");
    } finally {
      setUploadingSlides(false);
      if (slidesImagesInputRef.current) slidesImagesInputRef.current.value = "";
    }
  };

  const handleRemoveSlideImage = (idxToRemove: number) => {
    if (confirm("Remover esta imagem de slide do carrossel?")) {
      setEditSlide(p => p ? {
        ...p,
        slidesImg: (p.slidesImg || []).filter((_, idx) => idx !== idxToRemove)
      } : p);
    }
  };

  const blank: PainelSlide = {
    id: 0,
    titulo: "",
    embedUrl: "",
    sourceUrl: "",
    tipo: "PDF",
    tamanho: "",
    ativo: true,
    ordem: slides.length + 1,
    descricao: "",
    dataAtualizacao: new Date().toISOString().split("T")[0],
    slidesImg: []
  };

  const isProtected = (id: number) => id >= 1 && id <= 6;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Painel de Transparência</h1>
          <p className="text-sm text-gray-400 mt-1">Gerencie os relatórios institucionais exibidos na página de transparência.</p>
        </div>
        <button onClick={() => setEditSlide(blank)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-all animate-scale-up" style={{ backgroundColor: config.primaryColor }}>
          <i className="ri-add-line"></i> Novo Card de Transparência
        </button>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2 animate-fade-in">
          <i className="ri-check-line"></i> Alterações salvas com sucesso!
        </div>
      )}

      {/* Configuração de Título / Subtítulo e Altura / Colunas */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Layout e Cabeçalho Público</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block">Título da Seção</label>
            <input value={painelConfig.titulo} onChange={e => setPainelConfig(p => ({ ...p, titulo: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-300 transition-colors" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block">Subtítulo</label>
            <input value={painelConfig.subtitulo} onChange={e => setPainelConfig(p => ({ ...p, subtitulo: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-300 transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2 border-t border-gray-50 mt-4 mb-4">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block">Distribuição do Grid (Colunas)</label>
            <select
              value={painelConfig.columnsLayout || "2"}
              onChange={e => setPainelConfig(p => ({ ...p, columnsLayout: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none bg-white shadow-sm"
            >
              <option value="2">2 Colunas (2 + 2 + 2)</option>
              <option value="auto">Auto Ajuste (responsivo)</option>
              <option value="3">3 Colunas (Grid Compacto)</option>
              <option value="5">5 Colunas (telas grandes)</option>
              <option value="1">1 Coluna (Lista Estendida / Completo)</option>
            </select>
            <div className="mt-2 grid grid-cols-5 gap-1">
              {["auto", "2", "3", "5", "1"].map((layout) => (
                <button
                  key={layout}
                  type="button"
                  onClick={() => setPainelConfig(p => ({ ...p, columnsLayout: layout }))}
                  className={`h-8 rounded-lg text-[10px] font-black border cursor-pointer transition-all ${String(painelConfig.columnsLayout || "2") === layout ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"}`}
                >
                  {layout === "auto" ? "Auto" : layout}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Auto ajusta sozinho; 5 colunas funciona melhor em telas grandes.</p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-600">Altura dos Cards na Home</label>
              <span className="text-xs font-semibold text-gray-500 font-mono">{painelConfig.cardHeight || 320}px</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={280}
                max={500}
                step={10}
                value={painelConfig.cardHeight || 320}
                onChange={e => setPainelConfig(p => ({ ...p, cardHeight: parseInt(e.target.value) }))}
                className="flex-1 cursor-pointer accent-current"
                style={{ accentColor: config.primaryColor }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Controle vertical dos cards públicos para dar mais espaço de visualização.</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-600">Tempo dos Slides</label>
              <span className="text-xs font-semibold text-gray-500 font-mono">{Math.round((painelConfig.autoSlideDelay || 5000) / 1000)}s</span>
            </div>
            <input
              type="range"
              min={3000}
              max={10000}
              step={1000}
              value={painelConfig.autoSlideDelay || 5000}
              onChange={e => setPainelConfig(p => ({ ...p, autoSlideDelay: parseInt(e.target.value) }))}
              className="w-full cursor-pointer accent-current"
              style={{ accentColor: config.primaryColor }}
            />
            <p className="text-[10px] text-gray-400 mt-1">Padrao: 5 segundos para o cidadao acompanhar automaticamente.</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block">Paineis Institucionais</label>
            <button
              type="button"
              onClick={() => setPainelConfig(p => ({ ...p, showFixedSix: !(p.showFixedSix !== false) }))}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${painelConfig.showFixedSix !== false ? "bg-green-50 border-green-100 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}
            >
              <span>{painelConfig.showFixedSix !== false ? "6 fixos visiveis" : "Somente ativos"}</span>
              <i className={painelConfig.showFixedSix !== false ? "ri-lock-line" : "ri-eye-line"}></i>
            </button>
            <p className="text-[10px] text-gray-400 mt-1">Mantem os 6 paineis principais aparecendo na home.</p>
          </div>
        </div>

        <button onClick={() => saveConfig(painelConfig)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-95 transition-all" style={{ backgroundColor: config.primaryColor }}>
          Salvar Cabeçalho e Layout
        </button>
      </div>

      {/* Grid de Cards Administrativos */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 bg-white border rounded-2xl p-6">
          <div className="w-10 h-10 border-4 border-green-100 border-t-green-700 rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-gray-500 font-semibold">Carregando painéis de transparência...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {slides.map((slide) => (
            <div key={slide.id} className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all ${!slide.ativo ? "opacity-60 bg-gray-50/50" : "hover:shadow-md"}`} style={{ borderColor: slide.sourceUrl ? "#D1FAE5" : "#F3F4F6" }}>
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-100 text-gray-500">
                    Card #{slide.ordem} {isProtected(slide.id) && "• Institucional"}
                  </span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${slide.ativo ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {slide.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-800 leading-snug mb-2 line-clamp-2">{slide.titulo}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-4 h-8">{slide.descricao || "Nenhuma descrição fornecida."}</p>

                {/* Status do Arquivo / Slides de Imagem */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-100 flex-shrink-0">
                      <i className={slide.sourceUrl ? (slide.tipo === "PPT" ? "ri-presentation-line text-amber-500" : "ri-file-pdf-2-line text-red-500") : "ri-file-warning-line text-gray-400"}></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-600 truncate">
                        {slide.sourceUrl ? (slide.tipo || "PDF") : "Nenhum arquivo"}
                      </p>
                      <p className="text-[9px] text-gray-400 truncate">
                        {Array.isArray(slide.slidesImg) && slide.slidesImg.length > 0 ? `${slide.slidesImg.length} Slide(s) de imagem` : "Sem imagens anexadas"}
                      </p>
                    </div>
                  </div>
                  {slide.sourceUrl && (
                    <a href={slide.sourceUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border hover:bg-gray-50 text-gray-500 cursor-pointer" title="Visualizar arquivo atual">
                      <i className="ri-external-link-line text-xs"></i>
                    </a>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <button onClick={() => handleToggle(slide.id)} className="text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer flex items-center gap-1">
                  <i className={slide.ativo ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  {slide.ativo ? "Desativar" : "Ativar"}
                </button>
                <div className="flex gap-1.5">
                  <button onClick={() => setEditSlide(slide)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-1 transition-colors">
                    <i className="ri-edit-line"></i> Editar
                  </button>
                  {!isProtected(slide.id) && (
                    <button onClick={() => handleDelete(slide.id)} className="px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-xs font-semibold text-red-500 cursor-pointer transition-colors flex items-center gap-1">
                      <i className="ri-delete-bin-line"></i> Excluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      {editSlide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setEditSlide(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-900">{editSlide.id === 0 ? "Novo Card de Transparência" : "Editar Card de Transparência"}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{isProtected(editSlide.id) ? "Card institucional de preenchimento obrigatório" : "Card personalizado do usuário"}</p>
              </div>
              <button onClick={() => setEditSlide(null)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 cursor-pointer transition-colors"><i className="ri-close-line text-lg"></i></button>
            </div>
            
            <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              {/* Título do Card */}
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Título do Painel <span className="text-red-500">*</span></label>
                <input value={editSlide.titulo} onChange={e => setEditSlide(p => p ? { ...p, titulo: e.target.value } : p)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-300 transition-colors" placeholder="Ex: Relatório Financeiro Fevereiro/2026" />
              </div>

              {/* Descrição */}
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Descrição Opcional</label>
                <textarea rows={3} value={editSlide.descricao || ""} onChange={e => setEditSlide(p => p ? { ...p, descricao: e.target.value } : p)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-300 transition-colors resize-none" placeholder="Forneça uma breve descrição sobre a importância ou contexto deste relatório para o cidadão." />
              </div>

              {/* Tipo, Ordem e Data */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Tipo de Arquivo</label>
                  <select value={editSlide.tipo || "PDF"} onChange={e => setEditSlide(p => p ? { ...p, tipo: e.target.value as "PDF" | "PPT" } : p)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white">
                    <option value="PDF">PDF</option>
                    <option value="PPT">PPTX</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Ordem Exibição</label>
                  <input type="number" min={1} value={editSlide.ordem} onChange={e => setEditSlide(p => p ? { ...p, ordem: parseInt(e.target.value) || 1 } : p)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Data Atualização</label>
                  <input type="date" value={editSlide.dataAtualizacao || ""} onChange={e => setEditSlide(p => p ? { ...p, dataAtualizacao: e.target.value } : p)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
                </div>
              </div>

              {/* Google Slides Link Input */}
              <div className="border-t border-gray-100 pt-3">
                <label className="text-xs font-bold text-gray-700 mb-2 block flex items-center gap-1.5">
                  <i className="ri-slideshow-2-line text-amber-500"></i>
                  Ou cole o Link do Google Slides
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editSlide.sourceUrl && editSlide.sourceUrl.includes("docs.google.com/presentation") ? editSlide.sourceUrl : ""}
                    onChange={e => {
                      const url = e.target.value.trim();
                      if (!url) return;
                      setEditSlide(p => p ? {
                        ...p,
                        sourceUrl: url,
                        embedUrl: url,
                        tipo: "PPT",
                        tamanho: "Google Slides",
                        slidesImg: []
                      } : p);
                      setUploadPainelInfo("Link do Google Slides salvo! Clique em 'Salvar Card' para confirmar.");
                      setUploadPainelErro("");
                    }}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-300 transition-colors bg-white"
                    placeholder="https://docs.google.com/presentation/d/..."
                  />
                  {editSlide.sourceUrl && editSlide.sourceUrl.includes("docs.google.com/presentation") && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 cursor-pointer flex items-center gap-1 flex-shrink-0"
                    >
                      <i className="ri-close-line"></i> Limpar
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Cole o link de edição, compartilhamento ou publicação da apresentação do Google Slides. A apresentação será incorporada automaticamente.
                </p>
              </div>

              {/* File Upload Zone */}
              <div className="border-t border-gray-100 pt-3">
                <label className="text-xs font-bold text-gray-700 mb-2 block">Upload do Arquivo PDF/PPTX (do Computador)</label>
                <input
                  ref={painelFileInputRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  className="hidden"
                  onChange={e => handlePainelFileUpload(e.target.files?.[0])}
                />

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  {editSlide.sourceUrl && !editSlide.sourceUrl.includes("docs.google.com/presentation") ? (
                    <div className="w-full text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-50 border border-green-100 text-green-600 mb-3">
                        <i className={editSlide.tipo === "PPT" ? "ri-presentation-line text-2xl" : "ri-file-pdf-2-line text-2xl"}></i>
                      </div>
                      <p className="text-xs font-bold text-gray-800 mb-1">Arquivo Anexado</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[300px] mx-auto mb-4">{editSlide.sourceUrl.split("/").pop()}</p>
                      
                      <div className="flex gap-2 justify-center">
                        <button type="button" onClick={() => painelFileInputRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border hover:bg-gray-50 text-gray-700 cursor-pointer shadow-sm">
                          <i className="ri-refresh-line"></i> Substituir
                        </button>
                        <button type="button" onClick={handleRemoveFile} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-red-100 hover:bg-red-50 text-red-500 cursor-pointer shadow-sm">
                          <i className="ri-delete-bin-line"></i> Remover
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center cursor-pointer animate-pulse" onClick={() => painelFileInputRef.current?.click()}>
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mb-3">
                        <i className="ri-upload-cloud-2-line text-2xl"></i>
                      </div>
                      <p className="text-xs font-bold text-gray-800 mb-1">Clique para selecionar PDF ou PPTX</p>
                      <p className="text-[10px] text-gray-400">PDF de até 50MB ou PPTX de até 100MB</p>
                    </div>
                  )}
                </div>

                {uploadingPainel && (
                  <div className="mt-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 animate-pulse">
                    <i className="ri-loader-4-line animate-spin"></i> Enviando arquivo para o servidor de forma segura...
                  </div>
                )}
                {uploadPainelErro && (
                  <div className="mt-2.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 leading-relaxed">
                    <i className="ri-error-warning-line mr-1"></i> {uploadPainelErro}
                  </div>
                )}
                {uploadPainelInfo && (
                  <div className="mt-2.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                    <i className="ri-check-line mr-1"></i> {uploadPainelInfo}
                  </div>
                )}
              </div>

              {/* Upload Múltiplo de Slides do Relatório */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-700">Imagens dos Slides Reais (Carrossel Paginado)</label>
                  <button
                    type="button"
                    onClick={() => slidesImagesInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-colors"
                  >
                    <i className="ri-image-add-line"></i> Adicionar Páginas/Slides
                  </button>
                </div>
                
                <input
                  ref={slidesImagesInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleMultipleSlidesUpload(e.target.files)}
                />

                {/* Grid de miniaturas dos slides atuais */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 min-h-[80px]">
                  {Array.isArray(editSlide.slidesImg) && editSlide.slidesImg.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {editSlide.slidesImg.map((imgUrl, imgIdx) => (
                        <div key={imgIdx} className="aspect-video bg-gray-900 border rounded-xl overflow-hidden relative group/thumb">
                          <img src={imgUrl} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleRemoveSlideImage(imgIdx)}
                              className="w-6 h-6 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                              title="Remover Slide"
                            >
                              <i className="ri-delete-bin-line text-xs"></i>
                            </button>
                          </div>
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1 py-0.5 rounded leading-none font-mono">
                            #{imgIdx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 text-xs py-4">
                      Nenhuma imagem de slide carregada ainda.
                      <p className="text-[9px] text-gray-400/80 mt-0.5">Seu documento usará a apresentação institucional atômica automática.</p>
                    </div>
                  )}
                </div>

                {uploadingSlides && (
                  <div className="mt-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 animate-pulse">
                    <i className="ri-loader-4-line animate-spin"></i> Enviando imagens dos slides...
                  </div>
                )}
                {uploadSlidesErro && (
                  <div className="mt-2.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                    <i className="ri-error-warning-line mr-1"></i> {uploadSlidesErro}
                  </div>
                )}
              </div>

              {/* Status Ativo/Inativo */}
              <div className="flex items-center gap-2 cursor-pointer mt-2" onClick={() => setEditSlide(p => p ? { ...p, ativo: !p.ativo } : p)}>
                <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${editSlide.ativo ? "text-white animate-scale-up" : "border border-gray-300"}`} style={editSlide.ativo ? { backgroundColor: config.primaryColor } : {}}>
                  {editSlide.ativo && <i className="ri-check-line text-xs"></i>}
                </div>
                <span className="text-xs font-semibold text-gray-700 select-none">Exibir na página pública</span>
              </div>
            </div>

            {/* Ações Inferiores */}
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex gap-3">
              <button onClick={() => setEditSlide(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={() => handleSave(editSlide)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-95 transition-all" style={{ backgroundColor: config.primaryColor }}>Salvar Card</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ── BANNER AVISO ──────────────────────────────────────────────────────────────────
function BannerAvisoTab() {
  const { config } = useSiteConfig();
  const [form, setForm] = useState<BannerAvisoConfig>(() => {
    try {
      const saved = localStorage.getItem("inprec_banner_aviso");
      return saved ? { ...bannerAvisoDefault, ...JSON.parse(saved) } : bannerAvisoDefault;
    } catch {
      return bannerAvisoDefault;
    }
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("inprec_banner_aviso", JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const coresSugeridas = [
    { label: "Verde", bg: "#16a34a", text: "#ffffff" },
    { label: "Vermelho", bg: "#dc2626", text: "#ffffff" },
    { label: "Âmbar", bg: "#d97706", text: "#ffffff" },
    { label: "Azul Escuro", bg: "#1d4ed8", text: "#ffffff" },
    { label: "Cinza", bg: "#374151", text: "#ffffff" },
    { label: "Verde Claro", bg: "#dcfce7", text: "#166534" },
    { label: "Amarelo Claro", bg: "#fef9c3", text: "#854d0e" },
    { label: "Vermelho Claro", bg: "#fee2e2", text: "#991b1b" },
  ];

  const icones = [
    "ri-megaphone-line", "ri-information-line", "ri-alert-line",
    "ri-notification-line", "ri-calendar-event-line", "ri-time-line",
    "ri-shield-check-line", "ri-star-line",
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Banner de Aviso</h1>
          <p className="text-sm text-gray-400 mt-1">Exibe uma faixa no topo de todas as páginas do site. Ideal para comunicados urgentes.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${form.ativo ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
            {form.ativo ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Banner salvo com sucesso! Recarregue o site para ver.
        </div>
      )}

      {/* Pré-visualização */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Pré-visualização</p>
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <div
            className={`w-full px-4 py-2.5 flex items-center justify-between gap-4 ${!form.ativo ? "opacity-40" : ""}`}
            style={{ backgroundColor: form.cor, color: form.textoCor }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className={`${form.icone} text-sm`}></i>
              </div>
              <p className="text-sm font-medium">{form.texto || "Texto do comunicado aqui..."}</p>
              {form.linkTexto && (
                <span className="text-xs font-bold underline underline-offset-2 whitespace-nowrap">
                  {form.linkTexto} →
                </span>
              )}
            </div>
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-black/10">
              <i className="ri-close-line text-sm"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações do conteúdo */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5">
          <h2 className="text-sm font-bold text-gray-900">Conteúdo do Banner</h2>

          {/* Ativar/Desativar */}
          <div
            className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50"
            onClick={() => setForm(p => ({ ...p, ativo: !p.ativo }))}
          >
            <div
              className="w-11 h-6 rounded-full relative transition-all duration-200 flex-shrink-0"
              style={{ backgroundColor: form.ativo ? config.primaryColor : "#E5E7EB" }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
                style={{ left: form.ativo ? "calc(100% - 22px)" : "2px" }}
              ></div>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">{form.ativo ? "Banner ativo" : "Banner desativado"}</span>
              <p className="text-xs text-gray-400">{form.ativo ? "Visível para todos os visitantes" : "Oculto no site"}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Texto do Comunicado</label>
            <textarea
              value={form.texto}
              onChange={e => setForm(p => ({ ...p, texto: e.target.value }))}
              rows={3}
              maxLength={200}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
              placeholder="Ex: Recadastramento Obrigatório 2026 — Prazo até 31 de julho!"
            />
            <p className="text-xs text-gray-400 mt-1">{form.texto.length}/200 caracteres</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Texto do Link (opcional)</label>
              <input
                type="text"
                value={form.linkTexto}
                onChange={e => setForm(p => ({ ...p, linkTexto: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Saiba mais"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Destino do Link</label>
              <input
                type="text"
                value={form.link}
                onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="/noticias ou https://..."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {icones.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, icone: ic }))}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all"
                  style={form.icone === ic ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}15` } : { borderColor: "#E5E7EB" }}
                >
                  <i className={`${ic} text-base`} style={{ color: form.icone === ic ? config.primaryColor : "#9CA3AF" }}></i>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Configurações visuais */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5">
          <h2 className="text-sm font-bold text-gray-900">Aparência do Banner</h2>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-3 block">Cores Pré-definidas</label>
            <div className="grid grid-cols-2 gap-2">
              {coresSugeridas.map(c => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, cor: c.bg, textoCor: c.text }))}
                  className="flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all hover:border-gray-300"
                  style={form.cor === c.bg ? { borderColor: c.bg } : { borderColor: "#F3F4F6" }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 border border-gray-200"
                    style={{ backgroundColor: c.bg }}
                  ></div>
                  <span className="text-xs font-medium text-gray-700">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Cor de Fundo</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.cor}
                  onChange={e => setForm(p => ({ ...p, cor: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={form.cor}
                  onChange={e => setForm(p => ({ ...p, cor: e.target.value }))}
                  className="flex-1 text-xs border border-gray-200 rounded-xl px-2 py-2 focus:outline-none font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Cor do Texto</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.textoCor}
                  onChange={e => setForm(p => ({ ...p, textoCor: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={form.textoCor}
                  onChange={e => setForm(p => ({ ...p, textoCor: e.target.value }))}
                  className="flex-1 text-xs border border-gray-200 rounded-xl px-2 py-2 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-6 w-full max-w-sm py-3.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
        style={{ backgroundColor: config.primaryColor }}
      >
        {saved ? "Salvo com sucesso!" : "Salvar Banner"}
      </button>
    </div>
  );
}

// ── ATENDIMENTO TABS (Ouvidoria, LAI, Contato, Pesquisa, Chat) ───────────────────
function AtendimentoTab({ tipo }: { tipo: "ouvidoria" | "lai" | "contato" | "pesquisa" | "chat" }) {
  const { config } = useSiteConfig();

  const info = {
    ouvidoria: { titulo: "Ouvidoria", icon: "ri-speak-line", color: "#7C3AED", desc: "Gerencie as manifestações recebidas pela Ouvidoria do INPREC.", linkPublico: "/ouvidoria" },
    lai: { titulo: "LAI — Acesso à Informação", icon: "ri-file-info-line", color: "#0891B2", desc: "Gerencie os pedidos de acesso à informação conforme a Lei nº 12.527/2011.", linkPublico: "/lai" },
    contato: { titulo: "Contato & Mensagens", icon: "ri-mail-line", color: "#059669", desc: "Visualize e responda as mensagens enviadas pelo formulário de contato.", linkPublico: "/contato" },
    pesquisa: { titulo: "Pesquisa de Satisfação", icon: "ri-survey-line", color: "#D97706", desc: "Veja os resultados da pesquisa de satisfação respondida pelos servidores.", linkPublico: "/pesquisa-satisfacao" },
    chat: { titulo: "Chat Online", icon: "ri-chat-3-line", color: "#DC2626", desc: "Gerencie o atendimento online em tempo real com os servidores.", linkPublico: "/" },
  }[tipo];

  const stats = [
    { label: "Recebidos", value: Math.floor(Math.random() * 40) + 5, icon: "ri-inbox-line" },
    { label: "Em Andamento", value: Math.floor(Math.random() * 10) + 1, icon: "ri-loader-line" },
    { label: "Respondidos", value: Math.floor(Math.random() * 30) + 10, icon: "ri-check-double-line" },
    { label: "Prazo Vencido", value: Math.floor(Math.random() * 3), icon: "ri-alarm-warning-line" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {info.titulo}
          </h1>
          <p className="text-sm text-gray-400 mt-1">{info.desc}</p>
        </div>
        <Link to={info.linkPublico} target="_blank"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer whitespace-nowrap hover:bg-gray-50"
          style={{ borderColor: info.color, color: info.color }}>
          <i className="ri-external-link-line text-sm"></i> Ver página
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl mb-2" style={{ backgroundColor: `${info.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: info.color }}></i>
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-4"
          style={{ backgroundColor: `${info.color}15` }}>
          <i className={`${info.icon} text-3xl`} style={{ color: info.color }}></i>
        </div>
        <h2 className="text-base font-bold text-gray-800 mb-2">{info.titulo}</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto mb-5">
          Esta seção está pronta para integração com o sistema de protocolo do INPREC. As manifestações recebidas pelo portal serão salvas no banco SQLite e poderão ser migradas para MySQL futuramente.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500">
            <i className="ri-information-line text-sm"></i>
            Banco SQLite local disponível
          </div>
          <Link to={info.linkPublico} target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90"
            style={{ backgroundColor: info.color }}>
            <i className="ri-external-link-line text-sm"></i> Acessar página pública
          </Link>
        </div>
        <div className="mt-6 p-4 rounded-xl text-left flex flex-col gap-2" style={{ backgroundColor: `${config.primaryColor}06`, border: `1px solid ${config.primaryColor}20` }}>
          <p className="text-xs font-bold" style={{ color: config.primaryColor }}>Funcionalidades previstas neste módulo:</p>
          {tipo === "ouvidoria" && ["Listar manifestações (denúncia, reclamação, sugestão, elogio)", "Protocolar e acompanhar prazos legais (30 dias)", "Responder e encaminhar para setores responsáveis", "Exportar relatório de ouvidoria em CSV/PDF"].map(f => (
            <p key={f} className="text-xs text-gray-500 flex items-center gap-1.5"><i className="ri-checkbox-circle-line text-xs" style={{ color: config.primaryColor }}></i>{f}</p>
          ))}
          {tipo === "lai" && ["Receber e protocolar pedidos LAI com número único", "Controlar prazo de 20 dias prorrogável por mais 10", "Registrar resposta e enviar por e-mail ao solicitante", "Relatório estatístico de transparência ativa"].map(f => (
            <p key={f} className="text-xs text-gray-500 flex items-center gap-1.5"><i className="ri-checkbox-circle-line text-xs" style={{ color: config.primaryColor }}></i>{f}</p>
          ))}
          {tipo === "contato" && ["Listar mensagens do formulário de contato", "Responder diretamente por e-mail", "Marcar como lida / respondida / arquivada", "Filtrar por assunto e data"].map(f => (
            <p key={f} className="text-xs text-gray-500 flex items-center gap-1.5"><i className="ri-checkbox-circle-line text-xs" style={{ color: config.primaryColor }}></i>{f}</p>
          ))}
          {tipo === "pesquisa" && ["Visualizar respostas da pesquisa de satisfação", "Gráficos de NPS e índices por categoria", "Exportar dados em CSV", "Filtrar por período e secretaria"].map(f => (
            <p key={f} className="text-xs text-gray-500 flex items-center gap-1.5"><i className="ri-checkbox-circle-line text-xs" style={{ color: config.primaryColor }}></i>{f}</p>
          ))}
          {tipo === "chat" && ["Atendimento em tempo real com servidores", "Fila de atendimento e distribuição por operador", "Histórico de conversas", "Horário de atendimento configurável"].map(f => (
            <p key={f} className="text-xs text-gray-500 flex items-center gap-1.5"><i className="ri-checkbox-circle-line text-xs" style={{ color: config.primaryColor }}></i>{f}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { usuarioLogado, temPermissao, carregando } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Só redireciona após confirmar que não há sessão (aguarda carregamento)
  useEffect(() => {
    if (!carregando && !usuarioLogado) {
      navigate("/admin/login");
    }
  }, [usuarioLogado, navigate, carregando]);

  // Redireciona para primeira aba permitida se a atual não tiver permissão
  useEffect(() => {
    if (usuarioLogado && activeTab !== "dashboard" && !temPermissao(activeTab as Parameters<typeof temPermissao>[0])) {
      setActiveTab("dashboard");
    }
  }, [usuarioLogado, activeTab, temPermissao]);

  // Tela de carregamento enquanto verifica sessão
  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl" style={{ backgroundColor: "#16a34a15" }}>
            <i className="ri-loader-4-line animate-spin text-2xl" style={{ color: "#16a34a" }}></i>
          </div>
          <p className="text-sm font-medium text-gray-500" style={{ fontFamily: "'Poppins', sans-serif" }}>Verificando sessão...</p>
          <p className="text-xs text-gray-400">Aguarde um instante</p>
        </div>
      </div>
    );
  }

  const tabMap: { [key: string]: React.ReactNode } = {
    dashboard: <DashboardTab setActiveTab={setActiveTab} />,
    banner: <BannerAvisoTab />,
    home: <HomeInicioTab />,
    slides: <SlidesTab />,
    painel: <PainelTransparenciaTab />,
    aparencia: <AparenciaTab />,
    paginas: <PaginasTab />,

    noticias: <NoticiasTab />,
    servicos: <ServicosTab />,
    gestores: <GestoresTab />,
    transparencia: <TransparenciaTab />,
    faq: <FAQTab />,
    financas: <FinancasTab />,
    floating: <FloatingButtonsTab />,
    menu: <MenuNavegacaoTab />,
    cursos: <CursosAdminTab />,
    eventos: <EventosAdminTab />,
    eleicao: <EleicaoAdminTab />,
    votacao: <VotacaoAdminTab />,
    "eventos-inscritos": <EventosInscritosTab />,
    "ouvidoria-admin": <AtendimentoTab tipo="ouvidoria" />,
    "lai-admin": <AtendimentoTab tipo="lai" />,
    "contato-admin": <AtendimentoTab tipo="contato" />,
    "pesquisa-admin": <AtendimentoTab tipo="pesquisa" />,
    "chat-admin": <AtendimentoTab tipo="chat" />,
    analytics: <AnalyticsTab />,
    configuracoes: <ConfiguracoesTab />,
    usuarios: <UsuariosTab />,
    auditoria: <AuditoriaTab />,
    perfil: <PerfilTab />,
    arquivos: <GerenciadorArquivosTab />,
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {tabMap[activeTab]}
    </AdminLayout>
  );
}
