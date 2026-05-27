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
import { HomeSectionConfig, HomeSectionKey, HOME_SECTIONS_UPDATED_EVENT, homeSectionsDefault, normalizeHomeSections } from "@/mocks/home-sections";
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
import AtendimentoAdminTab from "@/pages/admin/tabs/AtendimentoAdminTab";
import ProtocolosAtendimentoTab from "@/pages/admin/tabs/ProtocolosAtendimentoTab";
import ChatAdminTab from "@/pages/admin/tabs/ChatAdminTab";
import NotificacoesDrawer from "@/components/feature/NotificacoesDrawer";
import { useNotificacoes } from "@/contexts/NotificacoesContext";
import { ApiError } from "@/services/api";
import { uploadService } from "@/services/upload.service";
import { transparenciaService } from "@/services/transparencia.service";
import { conteudoService } from "@/services/conteudo.service";
import { configuracoesService } from "@/services/configuracoes.service";
import { getDocumentView, inferDocumentType } from "@/utils/documentViewer";
import { arquivoPermitidoDocumento, pastaPublicaPorArquivo, tipoArquivo, extensaoArquivo } from "@/utils/uploadFolders";
import { gestoresService } from "@/services/gestores.service";

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
  { id: "formularios-admin", icon: "ri-file-list-3-line", label: "Formulários Recebidos", perm: "configuracoes" },
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
  const [sections, setSections] = useState<HomeSectionConfig[]>(() => normalizeHomeSections(homeSectionsDefault));
  const [previewMode, setPreviewMode] = useState<"lista" | "site">("lista");
  const [atalhoUploading, setAtalhoUploading] = useState("");
  const [atalhoUploadMsg, setAtalhoUploadMsg] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      try {
        const remotas = await configuracoesService.listarHomeSections();
        if (!ativo) return;
        setSections(normalizeHomeSections(remotas?.length ? remotas : homeSectionsDefault));
      } catch {
        if (ativo) {
          setSections(normalizeHomeSections(homeSectionsDefault));
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    };

    void carregar();
    return () => {
      ativo = false;
    };
  }, []);

  const persist = async (updated: HomeSectionConfig[]) => {
    const normalized = normalizeHomeSections(updated);
    setSections(normalized);
    setSaving(true);
    try {
      const salvas = await configuracoesService.salvarHomeSections(normalized);
      const next = normalizeHomeSections(salvas);
      setSections(next);
      window.dispatchEvent(new Event(HOME_SECTIONS_UPDATED_EVENT));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSections(sections);
      alert("Nao foi possivel salvar as secoes da home no MySQL.");
    } finally {
      setSaving(false);
    }
  };

  const atualizar = (id: HomeSectionKey, patch: Partial<HomeSectionConfig>) => {
    void persist(sections.map((section) => section.id === id ? { ...section, ...patch } : section));
  };

  const mover = (id: HomeSectionKey, direction: -1 | 1) => {
    const ordered = [...sections].sort((a, b) => a.ordem - b.ordem);
    const index = ordered.findIndex((section) => section.id === id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) return;
    const [item] = ordered.splice(index, 1);
    ordered.splice(targetIndex, 0, item);
    void persist(ordered.map((section, i) => ({ ...section, ordem: i + 1 })));
  };

  const moverPara = (id: HomeSectionKey, position: "top" | "bottom") => {
    const ordered = [...sections].sort((a, b) => a.ordem - b.ordem);
    const index = ordered.findIndex((section) => section.id === id);
    if (index < 0) return;
    const [item] = ordered.splice(index, 1);
    if (position === "top") ordered.unshift(item);
    else ordered.push(item);
    void persist(ordered.map((section, i) => ({ ...section, ordem: i + 1 })));
  };

  const adicionarBloco = () => {
    void persist([
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

  const adicionarBlocoAtalhos = () => {
    void persist([
      ...sections,
      {
        id: `custom-${Date.now()}` as HomeSectionKey,
        kind: "shortcuts",
        titulo: "Atalhos importantes",
        descricao: "Acesse rapidamente os principais serviços e documentos do INPREC.",
        icone: "ri-apps-2-line",
        ativo: true,
        ordem: sections.length + 1,
        cor: "#059669",
        atalhos: [
          { id: `atalho-${Date.now()}-1`, titulo: "Portal da Transparencia", descricao: "Documentos e informações públicas.", icone: "ri-eye-line", cor: "#059669", linkUrl: "/transparencia" },
          { id: `atalho-${Date.now()}-2`, titulo: "Ouvidoria", descricao: "Envie solicitações e manifestações.", icone: "ri-speak-line", cor: "#2563EB", linkUrl: "/ouvidoria" },
          { id: `atalho-${Date.now()}-3`, titulo: "Formularios", descricao: "Requerimentos e documentos.", icone: "ri-file-list-3-line", cor: "#D97706", linkUrl: "/formularios" },
          { id: `atalho-${Date.now()}-4`, titulo: "Gestores", descricao: "Diretoria, comitês e conselhos.", icone: "ri-team-line", cor: "#7C3AED", linkUrl: "/gestores" },
        ],
      },
    ]);
  };

  const adicionarAtalho = (section: HomeSectionConfig) => {
    atualizar(section.id, {
      atalhos: [
        ...(section.atalhos || []),
        { id: `atalho-${Date.now()}`, titulo: "Novo atalho", descricao: "Descrição do atalho.", icone: "ri-arrow-right-line", cor: "#059669", linkUrl: "/" },
      ],
    });
  };

  const atualizarAtalho = (section: HomeSectionConfig, atalhoId: string, patch: Partial<NonNullable<HomeSectionConfig["atalhos"]>[number]>) => {
    atualizar(section.id, {
      atalhos: (section.atalhos || []).map((atalho) => atalho.id === atalhoId ? { ...atalho, ...patch } : atalho),
    });
  };

  const removerAtalho = (section: HomeSectionConfig, atalhoId: string) => {
    atualizar(section.id, {
      atalhos: (section.atalhos || []).filter((atalho) => atalho.id !== atalhoId),
    });
  };

  const enviarArquivoAtalho = async (section: HomeSectionConfig, atalhoId: string, file?: File) => {
    if (!file) return;
    if (!arquivoPermitidoDocumento(file)) {
      setAtalhoUploadMsg((prev) => ({ ...prev, [atalhoId]: "Arquivo nao permitido. Envie PDF, Word, Excel, PowerPoint, CSV ou ZIP." }));
      return;
    }
    setAtalhoUploading(atalhoId);
    setAtalhoUploadMsg((prev) => ({ ...prev, [atalhoId]: "" }));
    try {
      const uploaded = await uploadService.upload(file, "home-atalhos");
      atualizarAtalho(section, atalhoId, {
        tipoDestino: "arquivo",
        linkUrl: uploaded.url,
        arquivoNome: uploaded.nome || file.name,
        arquivoTipo: tipoArquivo(file),
      });
      setAtalhoUploadMsg((prev) => ({ ...prev, [atalhoId]: `Arquivo anexado: ${uploaded.nome || file.name}` }));
    } catch (error) {
      setAtalhoUploadMsg((prev) => ({ ...prev, [atalhoId]: error instanceof Error ? error.message : "Erro no upload" }));
    } finally {
      setAtalhoUploading("");
    }
  };

  const moverAtalho = (section: HomeSectionConfig, atalhoId: string, direction: -1 | 1) => {
    const atalhos = [...(section.atalhos || [])];
    const index = atalhos.findIndex((atalho) => atalho.id === atalhoId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= atalhos.length) return;
    const [item] = atalhos.splice(index, 1);
    atalhos.splice(targetIndex, 0, item);
    atualizar(section.id, { atalhos });
  };

  const excluir = (id: HomeSectionKey) => {
    const section = sections.find((item) => item.id === id);
    if (!section || section.kind !== "custom") return;
    if (!window.confirm("Deseja excluir este bloco personalizado da Home?")) return;
    void persist(sections.filter((item) => item.id !== id));
  };

  const restaurarPadrao = () => {
    if (!window.confirm("Restaurar a ordem e os blocos padrao da Home?")) return;
    void persist(homeSectionsDefault);
  };

  const ordered = [...sections].sort((a, b) => a.ordem - b.ordem);
  const activeCount = ordered.filter((section) => section.ativo).length;

  return (
    <div className="space-y-5">
      {saved && (
        <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Home salva no MySQL com sucesso.
        </div>
      )}

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
          <button onClick={adicionarBlocoAtalhos} className="px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700">
            <i className="ri-apps-2-line mr-2"></i>Bloco de atalhos
          </button>
        </div>
      </div>

      <div className={`px-4 py-3 rounded-xl border text-sm flex items-center gap-2 ${
        loading ? "bg-blue-50 border-blue-100 text-blue-700" :
        saving ? "bg-amber-50 border-amber-100 text-amber-700" :
        "bg-green-50 border-green-100 text-green-700"
      }`}>
        <i className={loading ? "ri-loader-4-line animate-spin" : saving ? "ri-save-line" : "ri-database-2-line"}></i>
        {loading ? "Carregando secoes da home do MySQL..." : saving ? "Salvando alteracoes da home no MySQL..." : "Secoes da home conectadas ao MySQL."}
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
                      {section.kind === "shortcuts" && (
                        <div className="sm:col-span-2 rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div>
                              <p className="text-xs font-bold text-gray-900">Atalhos do bloco</p>
                              <p className="text-[11px] text-gray-500">Cada atalho aparece como um card colorido e moderno na Home.</p>
                            </div>
                            <button onClick={() => adicionarAtalho(section)} className="px-3 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700">
                              <i className="ri-add-line mr-1"></i>Adicionar atalho
                            </button>
                          </div>
                          <div className="grid lg:grid-cols-2 gap-3">
                            {(section.atalhos || []).map((atalho, atalhoIndex) => (
                              <div key={atalho.id} className="bg-white rounded-2xl border border-gray-100 p-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${atalho.cor}16`, color: atalho.cor }}>
                                    <i className={`${atalho.icone} text-xl`}></i>
                                  </div>
                                  <div className="flex-1 grid grid-cols-[1fr_42px] gap-2">
                                    <input value={atalho.icone} onChange={(e) => atualizarAtalho(section, atalho.id, { icone: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none" />
                                    <input type="color" value={atalho.cor} onChange={(e) => atualizarAtalho(section, atalho.id, { cor: e.target.value })} className="w-full h-[34px] rounded-xl border border-gray-200 p-1" />
                                  </div>
                                  <button onClick={() => moverAtalho(section, atalho.id, -1)} disabled={atalhoIndex === 0} className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30" title="Mover atalho para cima">
                                    <i className="ri-arrow-up-s-line"></i>
                                  </button>
                                  <button onClick={() => moverAtalho(section, atalho.id, 1)} disabled={atalhoIndex === (section.atalhos || []).length - 1} className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30" title="Mover atalho para baixo">
                                    <i className="ri-arrow-down-s-line"></i>
                                  </button>
                                  <button onClick={() => removerAtalho(section, atalho.id)} className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50">
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </div>
                                <div className="grid gap-2">
                                  <input value={atalho.titulo} onChange={(e) => atualizarAtalho(section, atalho.id, { titulo: e.target.value })} placeholder="Titulo do atalho" className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none" />
                                  <input value={atalho.descricao} onChange={(e) => atualizarAtalho(section, atalho.id, { descricao: e.target.value })} placeholder="Descricao curta" className="px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none" />
                                  <div className="grid sm:grid-cols-[135px_minmax(0,1fr)] gap-2">
                                    <select
                                      value={atalho.tipoDestino || "link"}
                                      onChange={(e) => atualizarAtalho(section, atalho.id, { tipoDestino: e.target.value as "link" | "arquivo" })}
                                      className="px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none bg-white"
                                    >
                                      <option value="link">Link</option>
                                      <option value="arquivo">PDF/Arquivo</option>
                                    </select>
                                    <input value={atalho.linkUrl} onChange={(e) => atualizarAtalho(section, atalho.id, { linkUrl: e.target.value })} placeholder={atalho.tipoDestino === "arquivo" ? "URL do PDF/arquivo ou envie abaixo" : "Link: /pagina ou https://..."} className="px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none" />
                                  </div>
                                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                                      <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-gray-700">Anexar arquivo do computador</p>
                                        <p className="text-[10px] text-gray-400 truncate">{atalho.arquivoNome || "PDF, Word, Excel, PowerPoint, CSV ou ZIP"}</p>
                                      </div>
                                      <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer">
                                        <i className={atalhoUploading === atalho.id ? "ri-loader-4-line animate-spin" : "ri-upload-cloud-2-line"}></i>
                                        {atalhoUploading === atalho.id ? "Enviando" : "Enviar"}
                                        <input
                                          type="file"
                                          accept=".pdf,.doc,.docx,.odt,.xls,.xlsx,.ods,.csv,.ppt,.pptx,.pps,.ppsx,.zip"
                                          className="hidden"
                                          disabled={atalhoUploading === atalho.id}
                                          onChange={(e) => enviarArquivoAtalho(section, atalho.id, e.target.files?.[0])}
                                        />
                                      </label>
                                    </div>
                                    {atalhoUploadMsg[atalho.id] && (
                                      <p className={`text-[10px] mt-2 ${atalhoUploadMsg[atalho.id].toLowerCase().includes("erro") || atalhoUploadMsg[atalho.id].toLowerCase().includes("indispon") || atalhoUploadMsg[atalho.id].toLowerCase().includes("permitido") ? "text-red-500" : "text-emerald-600"}`}>
                                        {atalhoUploadMsg[atalho.id]}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-center justify-between gap-2 lg:w-44">
                    <button
                      onClick={() => atualizar(section.id, { ativo: !section.ativo })}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold ${section.ativo ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {section.ativo ? "Ativo" : "Inativo"}
                    </button>
                    <div className="grid grid-cols-4 gap-1 w-full">
                      <button onClick={() => moverPara(section.id, "top")} disabled={index === 0} className="h-9 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50" title="Mandar para o topo">
                        <i className="ri-skip-up-line"></i>
                      </button>
                      <button onClick={() => mover(section.id, -1)} disabled={index === 0} className="h-9 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50" title="Subir uma posicao">
                        <i className="ri-arrow-up-s-line"></i>
                      </button>
                      <button onClick={() => mover(section.id, 1)} disabled={index === ordered.length - 1} className="h-9 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50" title="Descer uma posicao">
                        <i className="ri-arrow-down-s-line"></i>
                      </button>
                      <button onClick={() => moverPara(section.id, "bottom")} disabled={index === ordered.length - 1} className="h-9 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50" title="Mandar para o final">
                        <i className="ri-skip-down-line"></i>
                      </button>
                    </div>
                    <div className="flex gap-1 w-full">
                      <button
                        onClick={() => excluir(section.id)}
                        disabled={section.kind !== "custom" && section.kind !== "shortcuts"}
                        className="w-full h-9 rounded-lg border border-red-100 text-red-500 disabled:opacity-30 disabled:text-gray-300 hover:bg-red-50 text-xs font-semibold"
                        title={section.kind === "custom" || section.kind === "shortcuts" ? "Excluir bloco" : "Secao padrao pode ser desativada, mas nao excluida"}
                      >
                        <i className="ri-delete-bin-line mr-1"></i>Excluir
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
                    <p className="text-[11px] text-gray-500 truncate">{section.kind === "shortcuts" ? `${section.atalhos?.length || 0} atalhos cadastrados` : section.descricao}</p>
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

function getSlidesApiMessage(error: unknown, acao: "carregar" | "salvar"): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Sua sessao do admin expirou. Faca login novamente para acessar os slides no MySQL.";
    }
    if (error.status === 403) {
      return "Seu usuario nao tem permissao para gerenciar os slides da home.";
    }
    if (error.status === 404) {
      return "A rota de slides nao foi encontrada no backend. Verifique se a API publicada esta atualizada.";
    }
    if (error.status === 429) {
      return "Muitas requisicoes no backend. Aguarde alguns instantes e tente novamente.";
    }
    if (error.status >= 500) {
      return acao === "carregar"
        ? "O backend respondeu com erro ao consultar os slides no MySQL."
        : "O backend respondeu com erro ao salvar os slides no MySQL.";
    }
    return error.message || "Nao foi possivel processar os slides no MySQL.";
  }

  if (error instanceof TypeError) {
    return "Nao foi possivel conectar ao backend. Confirme se a API local esta ativa e acessivel em /api.";
  }

  return acao === "carregar"
    ? "Nao foi possivel carregar os slides do MySQL."
    : "Nao foi possivel salvar os slides no MySQL.";
}

function SlidesTab() {
  const { config } = useSiteConfig();
  const [slides, setSlides] = useState<SlideAdmin[]>(() => slidesAdminDefault.map(normalizeHomeSlide));
  const [editSlide, setEditSlide] = useState<SlideAdmin | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dbStatus, setDbStatus] = useState<"carregando" | "online" | "fallback">("carregando");
  const [dbMessage, setDbMessage] = useState("");

  const persistSlides = async (updated: SlideAdmin[]) => {
    const normalized = updated
      .map(normalizeHomeSlide)
      .sort((a, b) => a.ordem - b.ordem || a.id - b.id)
      .map((s, i) => ({ ...s, ordem: i + 1 }));

    setSlides(normalized);
    try {
      const salvos = await conteudoService.salvarSlides(normalized);
      const merged = Array.isArray(salvos) && salvos.length > 0 ? salvos.map(normalizeHomeSlide) : normalized;
      setSlides(merged);
      setDbStatus("online");
      setDbMessage("Slides salvos com sucesso no MySQL.");
      window.dispatchEvent(new Event("inprec-slides-updated"));
    } catch (error) {
      setDbStatus("fallback");
      setDbMessage(getSlidesApiMessage(error, "salvar"));
      alert(getSlidesApiMessage(error, "salvar"));
    }
  };

  useEffect(() => {
    let alive = true;

    const carregarDoBanco = async () => {
      try {
        const remote = await conteudoService.listarSlidesAdmin();
        if (!alive) return;

        if (Array.isArray(remote) && remote.length > 0) {
          setSlides(remote.map(normalizeHomeSlide));
          setDbStatus("online");
          setDbMessage("Slides conectados ao MySQL.");
          window.dispatchEvent(new Event("inprec-slides-updated"));
          return;
        }

        setSlides(slidesAdminDefault.map(normalizeHomeSlide));
        setDbStatus("online");
        setDbMessage("Nenhum slide salvo no MySQL ainda. Os modelos exibidos abaixo serao gravados quando voce salvar.");
      } catch (error) {
        if (!alive) return;
        setDbStatus("fallback");
        setDbMessage(getSlidesApiMessage(error, "carregar"));
      }
    };

    void carregarDoBanco();
    return () => {
      alive = false;
    };
  }, []);

  const handleToggle = (id: number) => {
    void persistSlides(slides.map((s) => s.id === id ? { ...s, ativo: !s.ativo } : s));
  };

  const handleDelete = (id: number) => {
    if (confirm("Remover este slide?")) {
      void persistSlides(slides.filter((s) => s.id !== id));
    }
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...slides];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    void persistSlides(arr.map((s, i) => ({ ...s, ordem: i + 1 })));
  };

  const handleMoveDown = (idx: number) => {
    if (idx === slides.length - 1) return;
    const arr = [...slides];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    void persistSlides(arr.map((s, i) => ({ ...s, ordem: i + 1 })));
  };

  const aplicarEmTodos = (changes: Partial<SlideAdmin>) => {
    void persistSlides(slides.map((s) => ({ ...s, ...changes })));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ajustarModoBannerTotal = () => aplicarEmTodos({ ativo: true, show_content: false, use_tint: false });
  const ajustarModoInformativo = () => aplicarEmTodos({ ativo: true, show_content: true, use_tint: true });

  const handleSaveSlide = (slide: SlideAdmin) => {
    const normalizedSlide = normalizeHomeSlide(slide, slides.length);
    if (editSlide && editSlide.id !== 0) {
      void persistSlides(slides.map((s) => s.id === normalizedSlide.id ? normalizedSlide : s));
    } else {
      const newId = Math.max(0, ...slides.map((s) => s.id)) + 1;
      void persistSlides([...slides, { ...normalizedSlide, id: newId, ordem: slides.length + 1, ativo: true }]);
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
          <p className="text-sm text-gray-400 mt-1">Gerencie os slides exibidos no banner principal da pagina inicial.</p>
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
          <i className="ri-check-line"></i> Alteracoes salvas com sucesso!
        </div>
      )}

      <div className={`mb-4 px-4 py-3 rounded-xl border text-sm flex items-center gap-2 ${
        dbStatus === "online" ? "bg-green-50 border-green-100 text-green-700" :
        dbStatus === "carregando" ? "bg-blue-50 border-blue-100 text-blue-700" :
        "bg-amber-50 border-amber-100 text-amber-700"
      }`}>
        <i className={dbStatus === "online" ? "ri-database-2-line" : dbStatus === "carregando" ? "ri-loader-4-line animate-spin" : "ri-alert-line"}></i>
        {dbStatus === "online" ? (dbMessage || "Slides conectados ao MySQL.") : dbStatus === "carregando" ? "Conectando os slides ao MySQL..." : dbMessage}
      </div>

      <div className="mb-5 bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Ajuste rapido dos slides</h2>
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
            <i className="ri-image-line"></i> So banner
          </button>
          <button type="button" onClick={() => aplicarEmTodos({ use_tint: false })} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
            <i className="ri-contrast-drop-line"></i> Sem transparencia
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
              <div className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                {slide.image_url ? (
                  <img src={slide.image_url} alt={slide.titulo} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="ri-image-line text-gray-300 text-xl"></i>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}>{slide.tag}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${slide.ativo ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {slide.ativo ? "Ativo" : "Inativo"}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    (slide.cta_type || "link") === "pdf"
                      ? "bg-red-50 text-red-600"
                      : (slide.cta_type || "link") === "ppt"
                      ? "bg-amber-50 text-amber-600"
                      : (slide.cta_type || "link") === "none"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-blue-50 text-blue-600"
                  }`}>
                    {(slide.cta_type || "link") === "pdf" ? "PDF" : (slide.cta_type || "link") === "ppt" ? "PPT" : (slide.cta_type || "link") === "none" ? "Fixo" : "Link"}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${slide.show_content === true ? "bg-purple-50 text-purple-600" : "bg-gray-100 text-gray-500"}`}>
                    {slide.show_content === true ? "Texto ligado" : "So banner"}
                  </span>
                  <span className="text-xs text-gray-400">#{idx + 1}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{slide.titulo}</p>
                <p className="text-xs text-gray-400 truncate">{slide.subtitulo}</p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  title={slide.show_content === true ? "Deixar somente banner" : "Mostrar textos no slide"}
                  onClick={() => void persistSlides(slides.map((s) => s.id === slide.id ? { ...s, show_content: !(s.show_content === true) } : s))}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${slide.show_content === true ? "hover:bg-purple-50 text-purple-500" : "hover:bg-gray-100 text-gray-400"}`}
                >
                  <i className={slide.show_content === true ? "ri-text" : "ri-image-line"}></i>
                </button>
                <button
                  type="button"
                  title={slide.use_tint === true ? "Tirar transparencia/cor" : "Aplicar cor sobre imagem"}
                  onClick={() => void persistSlides(slides.map((s) => s.id === slide.id ? { ...s, use_tint: !(s.use_tint === true) } : s))}
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
  const [form, setForm] = useState({
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    layoutZoom: config.layoutZoom || 100,
    fontFamily: config.fontFamily || "Poppins",
    borderRadius: config.borderRadius || "lg",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      layoutZoom: config.layoutZoom || 100,
      fontFamily: config.fontFamily || "Poppins",
      borderRadius: config.borderRadius || "lg",
    });
  }, [config]);

  const cores = [
    { label: "Verde Gov", primary: "#059669", secondary: "#064E3B" },
    { label: "Azul Institucional", primary: "#1D4ED8", secondary: "#1E3A8A" },
    { label: "Vermelho", primary: "#DC2626", secondary: "#7F1D1D" },
    { label: "Teal", primary: "#0891B2", secondary: "#164E63" },
    { label: "Laranja", primary: "#EA580C", secondary: "#7C2D12" },
    { label: "Cinza Escuro", primary: "#374151", secondary: "#111827" },
  ];

  const fontes = ["Poppins", "Inter", "Roboto", "Montserrat", "Raleway"];
  const raios = ["none", "sm", "lg", "2xl", "full"];

  const handleSave = async () => {
    await updateConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>Layout & Aparencia</h1>
      {saved && <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm">Aparencia salva no MySQL com sucesso.</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-base font-bold text-gray-900">Paleta de Cores</h2>
          <div className="grid grid-cols-2 gap-3">
            {cores.map((c) => (
              <button key={c.label} onClick={() => setForm((prev) => ({ ...prev, primaryColor: c.primary, secondaryColor: c.secondary }))} className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:border-gray-300" style={form.primaryColor === c.primary ? { borderColor: c.primary } : { borderColor: "#F3F4F6" }}>
                <div className="flex gap-1"><div className="w-5 h-5 rounded-full" style={{ backgroundColor: c.primary }}></div><div className="w-5 h-5 rounded-full" style={{ backgroundColor: c.secondary }}></div></div>
                <span className="text-sm font-medium text-gray-700">{c.label}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="color" value={form.primaryColor} onChange={(e) => setForm((prev) => ({ ...prev, primaryColor: e.target.value }))} className="w-full h-11 rounded-xl border border-gray-200 p-1" />
            <input type="color" value={form.secondaryColor} onChange={(e) => setForm((prev) => ({ ...prev, secondaryColor: e.target.value }))} className="w-full h-11 rounded-xl border border-gray-200 p-1" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-base font-bold text-gray-900">Tipografia e Escala</h2>
          <select value={form.fontFamily} onChange={(e) => setForm((prev) => ({ ...prev, fontFamily: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
            {fontes.map((fonte) => <option key={fonte} value={fonte}>{fonte}</option>)}
          </select>
          <select value={form.borderRadius} onChange={(e) => setForm((prev) => ({ ...prev, borderRadius: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
            {raios.map((raio) => <option key={raio} value={raio}>{raio}</option>)}
          </select>
          <div>
            <div className="flex justify-between items-center mb-2"><label className="text-xs font-semibold text-gray-600">Zoom do Layout</label><span className="text-xs font-semibold text-gray-500">{form.layoutZoom}%</span></div>
            <input type="range" min={90} max={115} step={1} value={form.layoutZoom} onChange={(e) => setForm((prev) => ({ ...prev, layoutZoom: parseInt(e.target.value, 10) }))} className="w-full" />
          </div>
          <div className="rounded-2xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${form.secondaryColor} 0%, ${form.primaryColor} 100%)`, fontFamily: form.fontFamily }}>
            <p className="text-lg font-bold">INPREC</p>
            <p className="text-sm text-white/80">Aparencia aplicada via MySQL</p>
          </div>
        </div>
      </div>
      <button onClick={() => void handleSave()} className="mt-6 w-full max-w-sm py-3.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: form.primaryColor }}>Salvar Aparencia</button>
    </div>
  );
}

function GestoresTab() {
  const { config } = useSiteConfig();
  const [lista, setLista] = useState<Gestor[]>(gestoresMock);
  const [grupoAtivo, setGrupoAtivo] = useState("diretoria");
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Gestor | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    gestoresService.listar({ incluirInativos: true }).then((data) => {
      if (isMounted) {
        setLista(data);
      }
    }).catch(() => {
      setLista(gestoresMock);
    });
    return () => { isMounted = false; };
  }, []);

  const persist = (updated: Gestor[]) => { setLista(updated); };

  const handleDelete = async (id: number) => {
    if (!confirm("Remover este gestor?")) return;
    try {
      await gestoresService.deletar(String(id));
    } catch {
      // fallback: update UI anyway
    }
    persist(lista.filter(g => g.id !== id));
  };

  const blank: Gestor = {
    id: 0, nome: "", cargo: "", grupo: grupoAtivo as Gestor["grupo"], foto: "", email: "", telefone: "", matricula: "",
    bio: "", formacao: "", cursos: [], documentos: [], mandato: "", ativo: true,
  };

  const handleSave = async (g: Gestor) => {
    try {
      if (g.id === 0) {
        const created = await gestoresService.criar(g);
        persist([...lista, created]);
      } else {
        const updated = await gestoresService.atualizar(String(g.id), g);
        persist(lista.map((x) => (x.id === g.id ? updated : x)));
      }
      setShowForm(false);
      setEditando(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Nao foi possivel salvar o gestor. Verifique os dados e tente novamente.");
    }
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
                uploadFolder="avatares"
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
  const [painelConfig, setPainelConfig] = useState(painelTransparenciaConfigDefault);
  const [editSlide, setEditSlide] = useState<PainelSlide | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploadingPainel, setUploadingPainel] = useState(false);
  const [uploadPainelErro, setUploadPainelErro] = useState("");
  const [uploadPainelInfo, setUploadPainelInfo] = useState("");
  const painelFileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingSlides, setUploadingSlides] = useState(false);
  const [uploadSlidesErro, setUploadSlidesErro] = useState("");
  const slidesImagesInputRef = useRef<HTMLInputElement | null>(null);
  const [quickUploadingId, setQuickUploadingId] = useState<number | null>(null);
  const [convertingId, setConvertingId] = useState<number | null>(null);

  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      try {
        const [data, savedConfig] = await Promise.all([
          transparenciaService.listarPainelAdmin(),
          transparenciaService.obterPainelConfig<typeof painelTransparenciaConfigDefault>(),
        ]);
        if (!ativo) return;
        setSlides(data && data.length > 0 ? data : painelTransparenciaDefault);
        setPainelConfig(savedConfig ? { ...painelTransparenciaConfigDefault, ...savedConfig } : painelTransparenciaConfigDefault);
      } catch {
        if (ativo) {
          setSlides(painelTransparenciaDefault);
          setPainelConfig(painelTransparenciaConfigDefault);
        }
      } finally {
        if (ativo) setLoading(false);
      }
    };
    void carregar();
    return () => {
      ativo = false;
    };
  }, []);

  const saveConfig = async () => {
    try {
      const next = { ...painelConfig, layoutVersion: painelTransparenciaConfigDefault.layoutVersion };
      const salvo = await transparenciaService.salvarPainelConfig(next);
      setPainelConfig({ ...painelTransparenciaConfigDefault, ...salvo });
      window.dispatchEvent(new Event("inprec-painel-transparencia-updated"));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Nao foi possivel salvar a configuracao do painel.");
    }
  };

  const saveSlide = async () => {
    if (!editSlide) return;
    try {
      const salvo = await transparenciaService.salvarPainel(editSlide);
      setSlides((prev) => prev.some((item) => item.id === salvo.id) ? prev.map((item) => item.id === salvo.id ? salvo : item) : [...prev, salvo]);
      setEditSlide(null);
      window.dispatchEvent(new Event("inprec-painel-transparencia-updated"));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Nao foi possivel salvar o card.");
    }
  };

  const removeSlide = async (id: number) => {
    if (id >= 1 && id <= 6) {
      alert("Os 6 paineis institucionais nao podem ser excluidos.");
      return;
    }
    if (!confirm("Excluir este card do painel?")) return;
    try {
      await transparenciaService.excluirPainel(id);
      setSlides((prev) => prev.filter((item) => item.id !== id));
      window.dispatchEvent(new Event("inprec-painel-transparencia-updated"));
    } catch {
      alert("Nao foi possivel excluir o card.");
    }
  };

  const toggleSlide = async (slide: PainelSlide) => {
    try {
      const salvo = await transparenciaService.salvarPainel({ ...slide, ativo: !slide.ativo });
      setSlides((prev) => prev.map((item) => item.id === slide.id ? salvo : item));
      window.dispatchEvent(new Event("inprec-painel-transparencia-updated"));
    } catch {
      alert("Nao foi possivel atualizar o card.");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const handlePainelFileUpload = async (file?: File) => {
    if (!file || !editSlide) return;
    setUploadingPainel(true);
    setUploadPainelErro("");
    setUploadPainelInfo("");
    try {
      const pasta = pastaPublicaPorArquivo("painel", file);
      const uploaded = await uploadService.upload(file, pasta);
      setEditSlide((prev) => prev ? { ...prev, sourceUrl: uploaded.url, embedUrl: uploaded.url, tipo: inferDocumentType(uploaded.url) as PainelSlide["tipo"], tamanho: formatFileSize(file.size), dataAtualizacao: new Date().toISOString().split("T")[0], slidesImg: [] } : prev);
      setUploadPainelInfo("Arquivo enviado. Salve para aplicar.");
    } catch (err) {
      setUploadPainelErro(err instanceof Error ? err.message : "Erro no upload.");
    } finally {
      setUploadingPainel(false);
      if (painelFileInputRef.current) painelFileInputRef.current.value = "";
    }
  };

  const handleMultipleSlidesUpload = async (files: FileList | null) => {
    if (!files || !editSlide) return;
    setUploadingSlides(true);
    setUploadSlidesErro("");
    try {
      const novas = [...(editSlide.slidesImg || [])];
      for (const file of Array.from(files)) {
        const uploaded = await uploadService.upload(file, "transparencia");
        novas.push(uploaded.url);
      }
      setEditSlide((prev) => prev ? { ...prev, slidesImg: novas } : prev);
    } catch (err) {
      setUploadSlidesErro(err instanceof Error ? err.message : "Erro ao enviar imagens.");
    } finally {
      setUploadingSlides(false);
      if (slidesImagesInputRef.current) slidesImagesInputRef.current.value = "";
    }
  };

  const handleQuickUpload = async (slideId: number, file?: File) => {
    if (!file) return;
    setQuickUploadingId(slideId);
    try {
      const pasta = pastaPublicaPorArquivo("painel", file);
      const uploaded = await uploadService.upload(file, pasta);
      const alvo = slides.find((s) => s.id === slideId);
      if (!alvo) return;
      const salvo = await transparenciaService.salvarPainel({
        ...alvo,
        sourceUrl: uploaded.url,
        embedUrl: uploaded.url,
        tipo: inferDocumentType(uploaded.url) as PainelSlide["tipo"],
        tamanho: formatFileSize(file.size),
        dataAtualizacao: new Date().toISOString().split("T")[0],
        slidesImg: [],
      });
      setSlides((prev) => prev.map((s) => s.id === salvo.id ? salvo : s));
      window.dispatchEvent(new Event("inprec-painel-transparencia-updated"));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      // Auto-convert if PPTX
      const isPptx = /\.(pptx?|ppsx?|odp)$/i.test(file.name);
      if (isPptx && salvo.id) {
        setConvertingId(salvo.id);
        try {
          const result = await transparenciaService.convertSlides(salvo.id);
          setSlides((prev) => prev.map((s) => s.id === salvo.id ? { ...s, slidesImg: result.slideImages } : s));
          window.dispatchEvent(new Event("inprec-painel-transparencia-updated"));
        } catch {
          // Conversion failed silently — user can retry via "Converter slides" button
        } finally {
          setConvertingId(null);
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro no upload.");
    } finally {
      setQuickUploadingId(null);
    }
  };

  const handleConvertSlides = async (slideId: number) => {
    if (!confirm("Converter o PPTX em imagens de slides? Isso pode levar até 2 minutos.")) return;
    setConvertingId(slideId);
    try {
      const result = await transparenciaService.convertSlides(slideId);
      setSlides((prev) => prev.map((s) => s.id === slideId ? { ...s, slidesImg: result.slideImages } : s));
      window.dispatchEvent(new Event("inprec-painel-transparencia-updated"));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      alert(`${result.slideCount} slides convertidos com sucesso.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro na conversao de slides.");
    } finally {
      setConvertingId(null);
    }
  };

  const blankSlide: PainelSlide = { id: 0, titulo: "", embedUrl: "", sourceUrl: "", tipo: "PDF", tamanho: "", ativo: true, ordem: slides.length + 1, descricao: "", dataAtualizacao: new Date().toISOString().split("T")[0], slidesImg: [] };

  const fileIcon = (tipo?: string) => {
    if (tipo === "PPT") return { icon: "ri-slideshow-2-line", color: "text-orange-500", bg: "bg-orange-50" };
    if (tipo === "PDF") return { icon: "ri-file-pdf-2-line", color: "text-red-500", bg: "bg-red-50" };
    return { icon: "ri-link", color: "text-blue-500", bg: "bg-blue-50" };
  };

  return (
    <div className="space-y-6">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Painel de Transparência
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Gerencie os 6 cards exibidos na página inicial. Alterações são refletidas imediatamente no site.
          </p>
        </div>
        <button
          onClick={() => setEditSlide(blankSlide)}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
          style={{ backgroundColor: config.primaryColor }}
        >
          <i className="ri-add-line text-base"></i> Novo Card
        </button>
      </div>

      {/* ── SAVED TOAST ── */}
      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
          <i className="ri-checkbox-circle-line text-base"></i> Alterações salvas e aplicadas no site com sucesso.
        </div>
      )}

      {/* ── LAYOUT CONFIG ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
          <i className="ri-layout-grid-line text-gray-400"></i>
          <span className="text-sm font-bold text-gray-700">Configuração do Layout</span>
          <span className="ml-auto text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">Salve para aplicar no site</span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Título da Seção</label>
            <input
              value={painelConfig.titulo}
              onChange={(e) => setPainelConfig((prev) => ({ ...prev, titulo: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-300"
              placeholder="Painel de Transparência"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Subtítulo</label>
            <input
              value={painelConfig.subtitulo}
              onChange={(e) => setPainelConfig((prev) => ({ ...prev, subtitulo: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-300"
              placeholder="Relatórios e documentos financeiros..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Colunas</label>
              <select
                value={painelConfig.columnsLayout || "2"}
                onChange={(e) => setPainelConfig((prev) => ({ ...prev, columnsLayout: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-300"
              >
                <option value="1">1 coluna</option>
                <option value="2">2 colunas</option>
                <option value="3">3 colunas</option>
                <option value="5">5 colunas</option>
                <option value="auto">Automático</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Altura (px)</label>
              <input
                type="number"
                value={painelConfig.cardHeight || 320}
                onChange={(e) => setPainelConfig((prev) => ({ ...prev, cardHeight: parseInt(e.target.value || "320", 10) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-300"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => void saveConfig()}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm"
              style={{ backgroundColor: config.primaryColor }}
            >
              <i className="ri-save-line"></i> Salvar Layout
            </button>
          </div>
        </div>
      </div>

      {/* ── CARDS GRID ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-400 font-medium">Carregando painéis...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {slides.map((slide) => {
            const { icon, color, bg } = fileIcon(slide.tipo);
            const hasFile = !!slide.sourceUrl;
            const slideCount = (slide.slidesImg || []).length;
            const previewImg = slide.slidesImg?.[0];
            const isFixedPanel = slide.id >= 1 && slide.id <= 6;
            const isConverting = convertingId === slide.id;
            const isUploading = quickUploadingId === slide.id;

            return (
              <div key={slide.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">

                {/* Card thumbnail / preview */}
                <div className="relative h-32 bg-gray-50 border-b border-gray-100 flex items-center justify-center overflow-hidden">
                  {previewImg ? (
                    <img src={previewImg} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center`}>
                      <i className={`${icon} text-2xl ${color}`}></i>
                    </div>
                  )}
                  {/* Overlay badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    {isFixedPanel && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm">
                        #{slide.id} FIXO
                      </span>
                    )}
                    {slideCount > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm flex items-center gap-0.5">
                        <i className="ri-image-line text-[9px]"></i> {slideCount} slides
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${slide.ativo ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}>
                      {slide.ativo ? "ATIVO" : "INATIVO"}
                    </span>
                  </div>
                  {(isUploading || isConverting) && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-1.5 backdrop-blur-sm">
                      <i className="ri-loader-4-line text-xl text-green-600 animate-spin"></i>
                      <span className="text-[10px] font-bold text-gray-600">{isConverting ? "Convertendo slides..." : "Enviando arquivo..."}</span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">{slide.titulo}</h3>
                      <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${bg} ${color} border border-current/10`}>
                        {slide.tipo || "—"}
                      </span>
                    </div>
                    {slide.descricao && (
                      <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">{slide.descricao}</p>
                    )}
                  </div>

                  {/* File status */}
                  <div className="flex items-center gap-1.5">
                    {hasFile ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                        <i className="ri-checkbox-circle-fill text-[10px]"></i>
                        {slide.sourceUrl?.startsWith("http") ? "Link externo" : slide.sourceUrl?.split("/").pop()?.slice(0, 24) || "Arquivo salvo"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                        <i className="ri-error-warning-line text-[10px]"></i> Sem arquivo
                      </span>
                    )}
                    {slide.dataAtualizacao && (
                      <span className="text-[10px] text-gray-400 ml-auto">{slide.dataAtualizacao}</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-50">
                    <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold cursor-pointer hover:bg-blue-100 transition-colors">
                      {isUploading ? <><i className="ri-loader-4-line animate-spin text-[11px]"></i> Enviando</> : <><i className="ri-upload-cloud-2-line text-[11px]"></i> Enviar arquivo</>}
                      <input type="file" accept=".pdf,.ppt,.pptx,.pps,.ppsx" className="hidden" disabled={quickUploadingId !== null || convertingId !== null} onChange={(e) => { void handleQuickUpload(slide.id, e.target.files?.[0]); e.target.value = ""; }} />
                    </label>

                    {hasFile && slide.tipo === "PPT" && (
                      <button
                        onClick={() => void handleConvertSlides(slide.id)}
                        disabled={convertingId !== null || quickUploadingId !== null}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-semibold hover:bg-purple-100 disabled:opacity-40 transition-colors"
                        title="Extrair imagens dos slides para exibição automática"
                      >
                        {isConverting ? <><i className="ri-loader-4-line animate-spin text-[11px]"></i> Convertendo</> : <><i className="ri-image-2-line text-[11px]"></i> Converter slides</>}
                      </button>
                    )}

                    <button
                      onClick={() => setEditSlide(slide)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-[11px] font-semibold hover:bg-gray-100 transition-colors"
                    >
                      <i className="ri-pencil-line text-[11px]"></i> Editar
                    </button>

                    <button
                      onClick={() => void toggleSlide(slide)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${slide.ativo ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"}`}
                    >
                      <i className={`text-[11px] ${slide.ativo ? "ri-eye-off-line" : "ri-eye-line"}`}></i>
                      {slide.ativo ? "Ocultar" : "Exibir"}
                    </button>

                    {!isFixedPanel && (
                      <button
                        onClick={() => void removeSlide(slide.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-500 text-[11px] font-semibold hover:bg-red-100 transition-colors"
                      >
                        <i className="ri-delete-bin-6-line text-[11px]"></i> Excluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editSlide && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{editSlide.id === 0 ? "Novo Card" : "Editar Card"}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Preencha as informações e envie o arquivo de apresentação.</p>
              </div>
              <button onClick={() => setEditSlide(null)} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">

              {/* Basic info */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Informações do Card</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Título <span className="text-red-400">*</span></label>
                    <input
                      value={editSlide.titulo}
                      onChange={(e) => setEditSlide((prev) => prev ? { ...prev, titulo: e.target.value } : prev)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-300"
                      placeholder="Ex: Avaliação Atuarial 2026"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Descrição</label>
                    <textarea
                      value={editSlide.descricao || ""}
                      onChange={(e) => setEditSlide((prev) => prev ? { ...prev, descricao: e.target.value } : prev)}
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-300"
                      placeholder="Breve descrição do conteúdo..."
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">Tipo</label>
                      <select
                        value={editSlide.tipo || "PDF"}
                        onChange={(e) => setEditSlide((prev) => prev ? { ...prev, tipo: e.target.value as PainelSlide["tipo"] } : prev)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-300"
                      >
                        <option value="PPT">PPTX</option>
                        <option value="PDF">PDF</option>
                        <option value="LINK">Link</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">Ordem</label>
                      <input
                        type="number"
                        value={editSlide.ordem}
                        onChange={(e) => setEditSlide((prev) => prev ? { ...prev, ordem: parseInt(e.target.value || "1", 10) } : prev)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-300"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">Visibilidade</label>
                      <button
                        type="button"
                        onClick={() => setEditSlide((prev) => prev ? { ...prev, ativo: !prev.ativo } : prev)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${editSlide.ativo ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}
                      >
                        <i className={editSlide.ativo ? "ri-eye-line" : "ri-eye-off-line"}></i>
                        {editSlide.ativo ? "Visível" : "Oculto"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* File upload */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Arquivo da Apresentação</p>

                <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/60 to-white p-5 space-y-3">
                  <input ref={painelFileInputRef} type="file" accept=".pptx,.ppt,.ppsx,.pps,.pdf" className="hidden" onChange={(e) => void handlePainelFileUpload(e.target.files?.[0])} />
                  <button
                    onClick={() => painelFileInputRef.current?.click()}
                    disabled={uploadingPainel}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-blue-300 bg-white text-blue-700 text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-50 active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
                  >
                    {uploadingPainel
                      ? <><i className="ri-loader-4-line animate-spin text-base"></i> Enviando arquivo...</>
                      : <><i className="ri-upload-cloud-2-line text-lg"></i> Clique para selecionar PDF ou PPTX</>
                    }
                  </button>
                  <p className="text-center text-[10px] text-blue-400 font-medium">Aceita: .pdf · .pptx · .ppt · .ppsx</p>

                  {editSlide.sourceUrl && !editSlide.sourceUrl.startsWith("http") && (
                    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-green-200">
                      <i className="ri-checkbox-circle-fill text-green-500 text-sm flex-shrink-0"></i>
                      <span className="text-xs text-gray-600 truncate"><strong>Arquivo:</strong> {editSlide.sourceUrl.split("/").pop()}</span>
                    </div>
                  )}
                  {uploadPainelInfo && (
                    <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 rounded-xl px-3 py-2 border border-green-100">
                      <i className="ri-check-line"></i> {uploadPainelInfo}
                    </div>
                  )}
                  {uploadPainelErro && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold bg-red-50 rounded-xl px-3 py-2 border border-red-100">
                      <i className="ri-error-warning-line"></i> {uploadPainelErro}
                    </div>
                  )}
                </div>

                {/* Google Slides alternative */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <i className="ri-google-line text-gray-400 text-sm"></i>
                    <label className="text-xs font-bold text-gray-500">Ou cole um link do Google Slides</label>
                  </div>
                  <input
                    type="url"
                    value={editSlide.sourceUrl?.startsWith("http") ? editSlide.sourceUrl : ""}
                    onChange={(e) => {
                      const url = e.target.value;
                      setEditSlide((prev) => prev ? { ...prev, sourceUrl: url, embedUrl: url, tipo: inferDocumentType(url) as PainelSlide["tipo"], tamanho: url ? "Link externo" : prev.tamanho, dataAtualizacao: new Date().toISOString().split("T")[0] } : prev);
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-300"
                    placeholder="https://docs.google.com/presentation/d/..."
                  />
                  <p className="text-[10px] text-gray-400">Google Slides incorporados ficam integrados no painel. <strong>Para PPTX, use o campo acima.</strong></p>
                </div>
              </div>

              {/* Slide images preview */}
              {(editSlide.slidesImg || []).length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      Slides Convertidos <span className="text-gray-300 font-normal normal-case">({editSlide.slidesImg!.length} imagens)</span>
                    </p>
                    <button
                      onClick={() => setEditSlide((prev) => prev ? { ...prev, slidesImg: [] } : prev)}
                      className="text-[10px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                    >
                      <i className="ri-delete-bin-6-line"></i> Limpar todos
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(editSlide.slidesImg || []).slice(0, 8).map((img, index) => (
                      <div key={img + index} className="relative rounded-xl overflow-hidden border border-gray-100 aspect-video group">
                        <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <button
                            onClick={() => setEditSlide((prev) => prev ? { ...prev, slidesImg: (prev.slidesImg || []).filter((_, idx) => idx !== index) } : prev)}
                            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-white/90 text-red-500 flex items-center justify-center transition-opacity"
                          >
                            <i className="ri-close-line text-xs"></i>
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1 text-[8px] font-bold bg-black/50 text-white px-1 rounded">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                    {(editSlide.slidesImg || []).length > 8 && (
                      <div className="rounded-xl border border-gray-100 aspect-video bg-gray-50 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-400">+{editSlide.slidesImg!.length - 8}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0 bg-gray-50/50">
              <button
                onClick={() => setEditSlide(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => void saveSlide()}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all shadow-sm"
                style={{ backgroundColor: config.primaryColor }}
              >
                <i className="ri-save-line"></i> Salvar e Publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BannerAvisoTab() {
  const { config } = useSiteConfig();
  const [form, setForm] = useState<BannerAvisoConfig>(bannerAvisoDefault);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let ativo = true;
    configuracoesService.obterBanner().then((banner) => {
      if (ativo && banner) setForm({ ...bannerAvisoDefault, ...banner });
    }).catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);

  const handleSave = async () => {
    await configuracoesService.salvarBanner(form);
    window.dispatchEvent(new Event("inprec-banner-aviso-updated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const coresSugeridas = [{ label: "Verde", bg: "#16a34a", text: "#ffffff" }, { label: "Vermelho", bg: "#dc2626", text: "#ffffff" }, { label: "Ambar", bg: "#d97706", text: "#ffffff" }, { label: "Azul Escuro", bg: "#1d4ed8", text: "#ffffff" }, { label: "Cinza", bg: "#374151", text: "#ffffff" }];
  const icones = ["ri-megaphone-line", "ri-information-line", "ri-alert-line", "ri-notification-line", "ri-calendar-event-line", "ri-time-line", "ri-shield-check-line", "ri-star-line"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Banner de Aviso</h1><p className="text-sm text-gray-400 mt-1">Este banner agora e salvo no MySQL e servido pelo backend.</p></div><span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${form.ativo ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>{form.ativo ? "Ativo" : "Inativo"}</span></div>
      {saved && <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm">Banner salvo com sucesso.</div>}
      <div className="mb-6 rounded-xl overflow-hidden border border-gray-200"><div className={`w-full px-4 py-2.5 flex items-center justify-between gap-4 ${!form.ativo ? "opacity-40" : ""}`} style={{ backgroundColor: form.cor, color: form.textoCor }}><div className="flex items-center gap-2.5"><div className="w-5 h-5 flex items-center justify-center flex-shrink-0"><i className={`${form.icone} text-sm`}></i></div><p className="text-sm font-medium">{form.texto || "Texto do comunicado aqui..."}</p>{form.linkTexto && <span className="text-xs font-bold underline underline-offset-2 whitespace-nowrap">{form.linkTexto} -&gt;</span>}</div><div className="w-6 h-6 flex items-center justify-center rounded-full bg-black/10"><i className="ri-close-line text-sm"></i></div></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5"><h2 className="text-sm font-bold text-gray-900">Conteudo do Banner</h2><div className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50" onClick={() => setForm((p) => ({ ...p, ativo: !p.ativo }))}><div className="w-11 h-6 rounded-full relative transition-all duration-200 flex-shrink-0" style={{ backgroundColor: form.ativo ? config.primaryColor : "#E5E7EB" }}><div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200" style={{ left: form.ativo ? "calc(100% - 22px)" : "2px" }}></div></div><div><span className="text-sm font-semibold text-gray-900">{form.ativo ? "Banner ativo" : "Banner desativado"}</span><p className="text-xs text-gray-400">{form.ativo ? "Visivel para todos os visitantes" : "Oculto no site"}</p></div></div><textarea value={form.texto} onChange={(e) => setForm((p) => ({ ...p, texto: e.target.value }))} rows={3} maxLength={200} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" placeholder="Comunicado do banner" /><div className="grid grid-cols-2 gap-4"><input type="text" value={form.linkTexto} onChange={(e) => setForm((p) => ({ ...p, linkTexto: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" placeholder="Texto do link" /><input type="text" value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" placeholder="Destino do link" /></div><div className="flex flex-wrap gap-2">{icones.map((ic) => <button key={ic} type="button" onClick={() => setForm((p) => ({ ...p, icone: ic }))} className="w-9 h-9 flex items-center justify-center rounded-xl border-2" style={form.icone === ic ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}15` } : { borderColor: "#E5E7EB" }}><i className={`${ic} text-base`} style={{ color: form.icone === ic ? config.primaryColor : "#9CA3AF" }}></i></button>)}</div></div><div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5"><h2 className="text-sm font-bold text-gray-900">Aparencia do Banner</h2><div className="grid grid-cols-2 gap-2">{coresSugeridas.map((c) => <button key={c.label} type="button" onClick={() => setForm((p) => ({ ...p, cor: c.bg, textoCor: c.text }))} className="flex items-center gap-2 p-2.5 rounded-xl border-2" style={form.cor === c.bg ? { borderColor: c.bg } : { borderColor: "#F3F4F6" }}><div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: c.bg }}></div><span className="text-xs font-medium text-gray-700">{c.label}</span></button>)}</div><div className="grid grid-cols-2 gap-4"><input type="color" value={form.cor} onChange={(e) => setForm((p) => ({ ...p, cor: e.target.value }))} className="w-full h-10 rounded-lg cursor-pointer border border-gray-200" /><input type="color" value={form.textoCor} onChange={(e) => setForm((p) => ({ ...p, textoCor: e.target.value }))} className="w-full h-10 rounded-lg cursor-pointer border border-gray-200" /></div></div></div>
      <button onClick={() => void handleSave()} className="mt-6 w-full max-w-sm py-3.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: config.primaryColor }}>Salvar Banner</button>
    </div>
  );
}

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
          Esta seção está pronta para integração com o sistema de protocolo do INPREC. As manifestações recebidas pelo portal serão salvas no banco MySQL e poderão ser migradas para MySQL futuramente.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500">
            <i className="ri-information-line text-sm"></i>
            Banco MySQL local disponível
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
    "ouvidoria-admin": <ProtocolosAtendimentoTab tipo="ouvidoria" />,
    "lai-admin": <ProtocolosAtendimentoTab tipo="lai" />,
    "contato-admin": <AtendimentoAdminTab tipo="contato" />,
    "pesquisa-admin": <AtendimentoAdminTab tipo="pesquisa" />,
    "formularios-admin": <AtendimentoAdminTab tipo="formularios" />,
    "chat-admin": <ChatAdminTab />,
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
