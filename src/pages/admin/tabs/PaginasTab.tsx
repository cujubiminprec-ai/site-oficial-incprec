import { useState } from "react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import EditorConteudoPagina from "@/pages/admin/tabs/paginas/EditorConteudoPagina";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PageItem {
  id: string;
  nome: string;
  rota: string;
  descricao: string;
  status: "publicada" | "rascunho" | "oculta";
  menuLocal: string; // ex: "Institucional", "Serviços", "", etc
  subMenu: boolean;
  icone: string;
  modelo: string;
  ordem: number;
}

const modelosPadrao = [
  { id: "informativo", label: "Página Informativa", desc: "Hero + conteúdo texto + documentos para download", icone: "ri-file-text-line" },
  { id: "beneficio", label: "Benefício Previdenciário", desc: "Hero + abas de requisitos/documentos + passo a passo", icone: "ri-shield-user-line" },
  { id: "noticias", label: "Lista de Notícias", desc: "Grid de cards com filtros e busca", icone: "ri-newspaper-line" },
  { id: "formulario", label: "Formulários", desc: "Lista de formulários para download ou preenchimento", icone: "ri-file-list-3-line" },
  { id: "transparencia", label: "Transparência / Documentos", desc: "Tabela com filtros por categoria e ano", icone: "ri-folder-open-line" },
  { id: "contato", label: "Página de Contato", desc: "Formulário de contato + mapa + horários", icone: "ri-mail-line" },
  { id: "institucional", label: "Página Institucional", desc: "Hero + missão/visão/valores + equipe + linha do tempo", icone: "ri-building-2-line" },
  { id: "custom", label: "Em branco", desc: "Página em branco para conteúdo customizado", icone: "ri-layout-line" },
];

const menuLocais = [
  "Nenhum (sem menu)",
  "Início",
  "Institucional",
  "Serviços",
  "Finanças e Investimentos",
  "Transparência",
  "Documentos",
  "Notícias & Eventos",
  "Participação",
];

const iconesPagina = [
  "ri-pages-line", "ri-file-text-line", "ri-shield-user-line", "ri-newspaper-line",
  "ri-folder-open-line", "ri-mail-line", "ri-building-2-line", "ri-bar-chart-box-line",
  "ri-map-pin-line", "ri-question-answer-line", "ri-survey-line", "ri-service-line",
  "ri-bank-line", "ri-medal-2-line", "ri-government-line", "ri-group-line",
];

const defaultPages: PageItem[] = [
  { id: "home", nome: "Home", rota: "/", descricao: "Página principal com hero slider, serviços, notícias", status: "publicada", menuLocal: "Início", subMenu: false, icone: "ri-home-line", modelo: "custom", ordem: 1 },
  { id: "quem-somos", nome: "Quem Somos", rota: "/quem-somos", descricao: "História, missão, visão, valores, organograma", status: "publicada", menuLocal: "Institucional", subMenu: true, icone: "ri-building-2-line", modelo: "institucional", ordem: 2 },
  { id: "estrutura", nome: "Estrutura / Organograma", rota: "/estrutura", descricao: "Organograma institucional", status: "publicada", menuLocal: "Institucional", subMenu: true, icone: "ri-organization-chart", modelo: "informativo", ordem: 3 },
  { id: "gestores", nome: "Diretoria Executiva", rota: "/gestores", descricao: "Membros da diretoria e conselhos", status: "publicada", menuLocal: "Institucional", subMenu: true, icone: "ri-government-line", modelo: "institucional", ordem: 4 },
  { id: "codigo-de-etica", nome: "Código de Ética", rota: "/codigo-de-etica", descricao: "Código de ética do INPREC", status: "publicada", menuLocal: "Institucional", subMenu: true, icone: "ri-scales-3-line", modelo: "informativo", ordem: 5 },
  { id: "compromisso-com-servidor", nome: "Compromisso com o Servidor", rota: "/compromisso-com-servidor", descricao: "Compromissos institucionais", status: "publicada", menuLocal: "Institucional", subMenu: true, icone: "ri-heart-line", modelo: "informativo", ordem: 6 },
  { id: "marca", nome: "Marca do INPREC", rota: "/marca", descricao: "Manual de identidade visual", status: "publicada", menuLocal: "Institucional", subMenu: true, icone: "ri-palette-line", modelo: "informativo", ordem: 7 },
  { id: "servicos", nome: "Todos os Serviços", rota: "/servicos", descricao: "Lista completa de serviços", status: "publicada", menuLocal: "Serviços", subMenu: false, icone: "ri-service-line", modelo: "informativo", ordem: 8 },
  { id: "beneficios-aposentadoria-idade", nome: "Aposentadoria por Idade", rota: "/beneficios/aposentadoria-por-idade", descricao: "Benefício de aposentadoria por idade", status: "publicada", menuLocal: "Serviços", subMenu: true, icone: "ri-user-star-line", modelo: "beneficio", ordem: 9 },
  { id: "beneficios-aposentadoria-invalidez", nome: "Aposentadoria por Invalidez", rota: "/beneficios/aposentadoria-por-invalidez", descricao: "Benefício de aposentadoria por invalidez", status: "publicada", menuLocal: "Serviços", subMenu: true, icone: "ri-shield-user-line", modelo: "beneficio", ordem: 10 },
  { id: "beneficios-pensao-morte", nome: "Pensão por Morte", rota: "/beneficios/pensao-por-morte", descricao: "Benefício de pensão por morte", status: "publicada", menuLocal: "Serviços", subMenu: true, icone: "ri-heart-pulse-line", modelo: "beneficio", ordem: 11 },
  { id: "beneficios-auxilio-doenca", nome: "Auxílio-Doença", rota: "/beneficios/auxilio-doenca", descricao: "Benefício de auxílio-doença", status: "publicada", menuLocal: "Serviços", subMenu: true, icone: "ri-hospital-line", modelo: "beneficio", ordem: 12 },
  { id: "beneficios-fundo-previdenciario", nome: "Fundo Previdenciário", rota: "/beneficios/fundo-previdenciario", descricao: "Informações sobre o fundo previdenciário", status: "publicada", menuLocal: "Serviços", subMenu: true, icone: "ri-bank-line", modelo: "beneficio", ordem: 13 },
  { id: "beneficios-atendimento", nome: "Atendimento Personalizado", rota: "/beneficios/atendimento-personalizado", descricao: "Atendimento individualizado", status: "publicada", menuLocal: "Serviços", subMenu: true, icone: "ri-customer-service-2-line", modelo: "beneficio", ordem: 14 },
  { id: "financas-investimentos", nome: "Finanças e Investimentos", rota: "/financas-investimentos", descricao: "Relatórios financeiros e investimentos", status: "publicada", menuLocal: "Finanças e Investimentos", subMenu: false, icone: "ri-funds-line", modelo: "transparencia", ordem: 15 },
  { id: "transparencia", nome: "Portal da Transparência", rota: "/transparencia", descricao: "Documentos, relatórios e licitações", status: "publicada", menuLocal: "Transparência", subMenu: false, icone: "ri-eye-line", modelo: "transparencia", ordem: 16 },
  { id: "lai", nome: "LAI - Acesso à Informação", rota: "/lai", descricao: "Lei de Acesso à Informação", status: "publicada", menuLocal: "Transparência", subMenu: true, icone: "ri-folder-info-line", modelo: "informativo", ordem: 17 },
  { id: "legislacao", nome: "Legislação / Base Legal", rota: "/legislacao", descricao: "Legislação previdenciária", status: "publicada", menuLocal: "Transparência", subMenu: true, icone: "ri-scales-3-line", modelo: "informativo", ordem: 18 },
  { id: "lgpd", nome: "LGPD", rota: "/lgpd", descricao: "Política de Privacidade / LGPD", status: "publicada", menuLocal: "Transparência", subMenu: true, icone: "ri-shield-user-line", modelo: "informativo", ordem: 19 },
  { id: "formularios", nome: "Formulários e Requerimentos", rota: "/formularios", descricao: "Formulários para download", status: "publicada", menuLocal: "Documentos", subMenu: true, icone: "ri-file-list-3-line", modelo: "formulario", ordem: 20 },
  { id: "enderecos", nome: "Endereços", rota: "/enderecos", descricao: "Endereços e filiais", status: "publicada", menuLocal: "Documentos", subMenu: true, icone: "ri-map-pin-line", modelo: "contato", ordem: 21 },
  { id: "noticias", nome: "Notícias", rota: "/noticias", descricao: "Notícias com filtros por categoria", status: "publicada", menuLocal: "Notícias & Eventos", subMenu: true, icone: "ri-newspaper-line", modelo: "noticias", ordem: 22 },
  { id: "eventos", nome: "Eventos e Agenda", rota: "/eventos", descricao: "Eventos e audiências públicas", status: "publicada", menuLocal: "Notícias & Eventos", subMenu: true, icone: "ri-calendar-event-line", modelo: "informativo", ordem: 23 },
  { id: "ouvidoria", nome: "Ouvidoria", rota: "/ouvidoria", descricao: "Formulário de manifestações", status: "publicada", menuLocal: "Participação", subMenu: true, icone: "ri-speak-line", modelo: "contato", ordem: 24 },
  { id: "pesquisa-satisfacao", nome: "Pesquisa de Satisfação", rota: "/pesquisa-satisfacao", descricao: "Avaliação de serviços", status: "publicada", menuLocal: "Participação", subMenu: true, icone: "ri-survey-line", modelo: "formulario", ordem: 25 },
  { id: "perguntas-frequentes", nome: "Perguntas Frequentes", rota: "/perguntas-frequentes", descricao: "FAQ com busca e filtros", status: "publicada", menuLocal: "Participação", subMenu: true, icone: "ri-question-answer-line", modelo: "informativo", ordem: 26 },
  { id: "contato", nome: "Contato", rota: "/contato", descricao: "Formulário de contato e mapa", status: "publicada", menuLocal: "Participação", subMenu: true, icone: "ri-mail-line", modelo: "contato", ordem: 27 },
  { id: "pro-gestao", nome: "Pró-Gestão RPPS", rota: "/pro-gestao", descricao: "Certificação Pró-Gestão Nível II", status: "publicada", menuLocal: "Participação", subMenu: true, icone: "ri-medal-2-line", modelo: "informativo", ordem: 28 },
  { id: "previdencia", nome: "Previdência", rota: "/previdencia", descricao: "Simulador de aposentadoria", status: "publicada", menuLocal: "Serviços", subMenu: true, icone: "ri-calculator-line", modelo: "informativo", ordem: 29 },
];

const STORAGE_KEY = "inprec_paginas_admin";

function loadPages(): PageItem[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : defaultPages;
  } catch {
    return defaultPages;
  }
}

// ── Modal Form ──────────────────────────────────────────────────────────────────
function PageFormModal({
  page,
  onSave,
  onClose,
  primaryColor,
  isDuplicate,
}: {
  page: PageItem;
  onSave: (p: PageItem) => void;
  onClose: () => void;
  primaryColor: string;
  isDuplicate?: boolean;
}) {
  const [form, setForm] = useState<PageItem>({ ...page });
  const isNew = page.id === "" || isDuplicate;
  const upd = (k: keyof PageItem, v: string | boolean | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {isDuplicate ? "Duplicar Página" : isNew ? "Nova Página" : "Editar Página"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {isDuplicate ? "Uma cópia será criada com nova rota" : isNew ? "Configure a nova página" : `Editando: ${page.nome}`}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Modelo */}
          {isNew && (
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Modelo de Página</label>
              <div className="grid grid-cols-2 gap-2">
                {modelosPadrao.map((m) => (
                  <button key={m.id} onClick={() => upd("modelo", m.id)}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all text-left"
                    style={form.modelo === m.id ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` } : { borderColor: "#E5E7EB" }}>
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                      style={{ backgroundColor: form.modelo === m.id ? `${primaryColor}15` : "#F3F4F6" }}>
                      <i className={`${m.icone} text-sm`} style={{ color: form.modelo === m.id ? primaryColor : "#9CA3AF" }}></i>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{m.label}</p>
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nome e Rota */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome da Página</label>
              <input value={form.nome} onChange={(e) => upd("nome", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Ex: Aposentadoria por Idade" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Rota / URL</label>
              <input value={form.rota} onChange={(e) => upd("rota", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none font-mono"
                placeholder="/minha-pagina" />
              <p className="text-[10px] text-gray-400 mt-1">Comece com / e use hífens</p>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Descrição (interna)</label>
            <input value={form.descricao} onChange={(e) => upd("descricao", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              placeholder="Descrição breve da finalidade desta página" />
          </div>

          {/* Ícone */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {iconesPagina.map((ic) => (
                <button key={ic} onClick={() => upd("icone", ic)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all"
                  style={form.icone === ic ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` } : { borderColor: "#E5E7EB" }}>
                  <i className={`${ic} text-base`} style={{ color: form.icone === ic ? primaryColor : "#9CA3AF" }}></i>
                </button>
              ))}
            </div>
          </div>

          {/* Menu + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Localização no Menu</label>
              <select value={form.menuLocal} onChange={(e) => upd("menuLocal", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
                {menuLocais.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
              <select value={form.status} onChange={(e) => upd("status", e.target.value as PageItem["status"])}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
                <option value="publicada">Publicada</option>
                <option value="rascunho">Rascunho</option>
                <option value="oculta">Oculta</option>
              </select>
            </div>
          </div>

          {/* Sub-menu toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer"
            onClick={() => upd("subMenu", !form.subMenu)}>
            <div className="w-11 h-6 rounded-full relative transition-all flex-shrink-0"
              style={{ backgroundColor: form.subMenu ? primaryColor : "#E5E7EB" }}>
              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: form.subMenu ? "calc(100% - 22px)" : "2px" }}></div>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">{form.subMenu ? "Aparece no sub-menu" : "Item direto no menu"}</span>
              <p className="text-xs text-gray-400">
                {form.subMenu ? "Link aparece dentro do dropdown do menu pai" : "Item aparece diretamente na barra de navegação"}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={() => onSave(form)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90"
              style={{ backgroundColor: primaryColor }}>
              {isDuplicate ? "Criar Cópia" : isNew ? "Criar Página" : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────────────────────
export default function PaginasTab() {
  const { config } = useSiteConfig();
  const [lista, setLista] = useState<PageItem[]>(loadPages);
  const [editando, setEditando] = useState<PageItem | null>(null);
  const [duplicando, setDuplicando] = useState<PageItem | null>(null);
  const [criando, setCriando] = useState(false);
  const [filtroMenu, setFiltroMenu] = useState("Todos");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmarExcluir, setConfirmarExcluir] = useState<PageItem | null>(null);
  const [editandoConteudo, setEditandoConteudo] = useState<PageItem | null>(null);

  // Se estiver editando conteúdo, mostrar o editor
  if (editandoConteudo) {
    return (
      <EditorConteudoPagina
        page={editandoConteudo}
        onBack={() => setEditandoConteudo(null)}
      />
    );
  }

  const persist = (updated: PageItem[]) => {
    setLista(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = (p: PageItem) => {
    if (duplicando) {
      const newId = `page-${Date.now()}`;
      const copy: PageItem = { ...p, id: newId, nome: `${p.nome} (cópia)`, ordem: lista.length + 1 };
      persist([...lista, copy]);
      setDuplicando(null);
      return;
    }
    if (!editando || editando.id === "") {
      const newId = `page-${Date.now()}`;
      persist([...lista, { ...p, id: newId, ordem: lista.length + 1 }]);
    } else {
      persist(lista.map((x) => x.id === editando.id ? p : x));
    }
    setEditando(null);
    setCriando(false);
  };

  const handleDelete = (p: PageItem) => {
    persist(lista.filter((x) => x.id !== p.id));
    setConfirmarExcluir(null);
  };

  const handleToggleStatus = (id: string) => {
    persist(lista.map((p) => p.id === id ? { ...p, status: p.status === "publicada" ? "oculta" : "publicada" } : p));
  };

  const filtrados = lista
    .filter((p) => filtroMenu === "Todos" || p.menuLocal === filtroMenu)
    .filter((p) => filtroStatus === "Todos" || p.status === filtroStatus)
    .filter((p) => !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.rota.includes(busca.toLowerCase()));

  const grupos = menuLocais.filter((m) => m !== "Nenhum (sem menu)");
  const statusColors: Record<string, { bg: string; text: string }> = {
    publicada: { bg: "bg-green-50", text: "text-green-600" },
    rascunho: { bg: "bg-amber-50", text: "text-amber-600" },
    oculta: { bg: "bg-gray-100", text: "text-gray-400" },
  };

  const blankPage: PageItem = {
    id: "", nome: "", rota: "/nova-pagina", descricao: "", status: "rascunho",
    menuLocal: "Institucional", subMenu: true, icone: "ri-pages-line", modelo: "informativo", ordem: lista.length + 1,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Páginas do Site</h1>
          <p className="text-sm text-gray-400 mt-1">
            Gerencie todas as páginas, configure onde aparecem no menu e seu status.
          </p>
        </div>
        <button onClick={() => { setCriando(true); setEditando(blankPage); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90"
          style={{ backgroundColor: config.primaryColor }}>
          <i className="ri-add-line"></i> Nova Página
        </button>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Alterações salvas!
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total de Páginas", value: lista.length, icon: "ri-pages-line", color: config.primaryColor },
          { label: "Publicadas", value: lista.filter(p => p.status === "publicada").length, icon: "ri-checkbox-circle-line", color: "#059669" },
          { label: "Rascunho / Ocultas", value: lista.filter(p => p.status !== "publicada").length, icon: "ri-eye-off-line", color: "#9CA3AF" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-base`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input value={busca} onChange={(e) => setBusca(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none"
            placeholder="Buscar página por nome ou rota..." />
        </div>
        <select value={filtroMenu} onChange={(e) => setFiltroMenu(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
          <option value="Todos">Todos os menus</option>
          {grupos.map((m) => <option key={m} value={m}>{m}</option>)}
          <option value="Nenhum (sem menu)">Sem menu</option>
        </select>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
          <option value="Todos">Todos os status</option>
          <option value="publicada">Publicadas</option>
          <option value="rascunho">Rascunho</option>
          <option value="oculta">Ocultas</option>
        </select>
      </div>

      {/* Lista agrupada por menu */}
      {filtroMenu === "Todos" && !busca ? (
        <div className="flex flex-col gap-6">
          {menuLocais.map((menu) => {
            const pagsDeste = filtrados.filter(p => p.menuLocal === menu);
            if (pagsDeste.length === 0) return null;
            return (
              <div key={menu} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{menu}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: `${config.primaryColor}10`, color: config.primaryColor }}>
                      {pagsDeste.length} página{pagsDeste.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                {pagsDeste.map((p, i) => (
                  <PageRow key={p.id} p={p} i={i} total={pagsDeste.length}
                    primaryColor={config.primaryColor}
                    statusColors={statusColors}
                    onEdit={() => { setEditando(p); setCriando(false); }}
                    onDuplicate={() => setDuplicando(p)}
                    onDelete={() => setConfirmarExcluir(p)}
                    onToggle={() => handleToggleStatus(p.id)}
                    onEditConteudo={() => setEditandoConteudo(p)} />
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {filtrados.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Nenhuma página encontrada.</div>
          ) : (
            filtrados.map((p, i) => (
              <PageRow key={p.id} p={p} i={i} total={filtrados.length}
                primaryColor={config.primaryColor}
                statusColors={statusColors}
                onEdit={() => { setEditando(p); setCriando(false); }}
                onDuplicate={() => setDuplicando(p)}
                onDelete={() => setConfirmarExcluir(p)}
                onToggle={() => handleToggleStatus(p.id)}
                onEditConteudo={() => setEditandoConteudo(p)} />
            ))
          )}
        </div>
      )}

      {/* Modal Editar/Criar */}
      {(editando !== null) && (
        <PageFormModal
          page={editando}
          onSave={handleSave}
          onClose={() => { setEditando(null); setCriando(false); }}
          primaryColor={config.primaryColor}
          isDuplicate={false}
        />
      )}

      {/* Modal Duplicar */}
      {duplicando !== null && (
        <PageFormModal
          page={{ ...duplicando, nome: `${duplicando.nome} (cópia)`, id: "" }}
          onSave={handleSave}
          onClose={() => setDuplicando(null)}
          primaryColor={config.primaryColor}
          isDuplicate={true}
        />
      )}

      {/* Modal Confirmar Exclusão */}
      {confirmarExcluir && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setConfirmarExcluir(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 mx-auto mb-4">
              <i className="ri-delete-bin-line text-xl text-red-500"></i>
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Excluir Página?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Tem certeza que deseja excluir <strong>{confirmarExcluir.nome}</strong>? 
              Esta ação remove o registro do painel. O arquivo no site permanece até nova publicação.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarExcluir(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmarExcluir)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-red-500 cursor-pointer hover:bg-red-600">
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page Row Component ─────────────────────────────────────────────────────────
function PageRow({
  p, i, total, primaryColor, statusColors, onEdit, onDuplicate, onDelete, onToggle, onEditConteudo
}: {
  p: PageItem;
  i: number;
  total: number;
  primaryColor: string;
  statusColors: Record<string, { bg: string; text: string }>;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onEditConteudo: () => void;
}) {
  const st = statusColors[p.status] || statusColors.oculta;
  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 ${i < total - 1 ? "border-b border-gray-50" : ""} ${p.status === "oculta" ? "opacity-50" : ""}`}>
      <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
        style={{ backgroundColor: `${primaryColor}10` }}>
        <i className={`${p.icone} text-sm`} style={{ color: primaryColor }}></i>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">{p.nome}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.bg} ${st.text}`}>
            {p.status === "publicada" ? "Publicada" : p.status === "rascunho" ? "Rascunho" : "Oculta"}
          </span>
          {p.subMenu && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
              Sub-menu
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-400 font-mono">{p.rota}</span>
          {p.menuLocal && p.menuLocal !== "Nenhum (sem menu)" && (
            <span className="text-xs text-gray-400">· {p.menuLocal}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Botão Editar Conteúdo — destaque */}
        <button onClick={onEditConteudo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap hover:opacity-90 transition-all"
          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          title="Editar conteúdo da página">
          <i className="ri-edit-box-line text-xs"></i>
          Editar Conteúdo
        </button>
        <Link to={p.rota} target="_blank"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
          title="Ver no site">
          <i className="ri-external-link-line text-sm"></i>
        </Link>
        <button onClick={onToggle}
          className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${p.status === "publicada" ? "hover:bg-amber-50 text-amber-500" : "hover:bg-green-50 text-green-500"}`}
          title={p.status === "publicada" ? "Ocultar" : "Publicar"}>
          <i className={`${p.status === "publicada" ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
        </button>
        <button onClick={onDuplicate}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
          title="Duplicar página">
          <i className="ri-file-copy-line text-sm"></i>
        </button>
        <button onClick={onEdit}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
          title="Editar configurações">
          <i className="ri-settings-3-line text-sm"></i>
        </button>
        <button onClick={onDelete}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
          title="Excluir">
          <i className="ri-delete-bin-line text-sm"></i>
        </button>
      </div>
    </div>
  );
}
