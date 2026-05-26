import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { SortableMenuRow } from "@/pages/admin/tabs/menu/SortableMenuItem";
import MenuPreview from "@/pages/admin/tabs/menu/MenuPreview";
import { menuService } from "@/services/menu.service";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SubMenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  ativo: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  ativo: boolean;
  ordem: number;
  children?: SubMenuItem[];
}

const iconesOpcoes = [
  "ri-home-line", "ri-building-2-line", "ri-government-line", "ri-service-line",
  "ri-newspaper-line", "ri-eye-line", "ri-file-list-3-line", "ri-funds-line",
  "ri-shield-user-line", "ri-question-answer-line", "ri-speak-line", "ri-mail-line",
  "ri-calendar-event-line", "ri-map-pin-line", "ri-group-line", "ri-medal-2-line",
  "ri-scales-3-line", "ri-heart-line", "ri-palette-line", "ri-bar-chart-box-line",
  "ri-bank-line", "ri-user-star-line", "ri-hospital-line", "ri-survey-line",
  "ri-folder-info-line", "ri-auction-line", "ri-organization-chart", "ri-megaphone-line",
  "ri-file-text-line", "ri-pages-line", "ri-external-link-line", "ri-star-line",
];

export const defaultMenuItems: MenuItem[] = [
  { id: "inicio", label: "Início", href: "/", ativo: true, ordem: 1 },
  {
    id: "institucional", label: "Institucional", ativo: true, ordem: 2,
    children: [
      { id: "quem-somos", label: "Quem Somos", href: "/quem-somos", icon: "ri-building-2-line", ativo: true },
      { id: "estrutura", label: "Estrutura / Organograma", href: "/estrutura", icon: "ri-organization-chart", ativo: true },
      { id: "diretoria", label: "Diretoria Executiva", href: "/gestores", icon: "ri-government-line", ativo: true },
      { id: "comite", label: "Comitê de Investimento", href: "/gestores", icon: "ri-funds-line", ativo: true },
      { id: "conselho-fiscal", label: "Conselho Fiscal", href: "/gestores", icon: "ri-shield-check-line", ativo: true },
      { id: "conselho-delib", label: "Conselho Deliberativo", href: "/gestores", icon: "ri-group-line", ativo: true },
      { id: "etica", label: "Código de Ética", href: "/codigo-de-etica", icon: "ri-scales-3-line", ativo: true },
      { id: "compromisso", label: "Compromisso com o Servidor", href: "/compromisso-com-servidor", icon: "ri-heart-line", ativo: true },
      { id: "marca", label: "Marca do INPREC", href: "/marca", icon: "ri-palette-line", ativo: true },
    ],
  },
  {
    id: "servicos", label: "Serviços", ativo: true, ordem: 3,
    children: [
      { id: "todos-servicos", label: "Todos os Serviços", href: "/servicos", icon: "ri-service-line", ativo: true },
      { id: "contracheque", label: "Contracheque", href: "#contracheque", icon: "ri-file-text-line", ativo: true },
      { id: "apos-idade", label: "Aposentadoria por Idade", href: "/beneficios/aposentadoria-por-idade", icon: "ri-user-star-line", ativo: true },
      { id: "apos-invalidez", label: "Aposentadoria por Invalidez", href: "/beneficios/aposentadoria-por-invalidez", icon: "ri-shield-user-line", ativo: true },
      { id: "pensao-morte", label: "Pensão por Morte", href: "/beneficios/pensao-por-morte", icon: "ri-heart-pulse-line", ativo: true },
      { id: "auxilio-doenca", label: "Auxílio-Doença", href: "/beneficios/auxilio-doenca", icon: "ri-hospital-line", ativo: true },
      { id: "fundo-prev", label: "Fundo Previdenciário", href: "/beneficios/fundo-previdenciario", icon: "ri-bank-line", ativo: true },
      { id: "atendimento", label: "Atendimento Personalizado", href: "/beneficios/atendimento-personalizado", icon: "ri-customer-service-2-line", ativo: true },
    ],
  },
  {
    id: "financas", label: "Finanças e Investimentos", ativo: true, ordem: 4,
    children: [
      { id: "financas-geral", label: "Visão Geral", href: "/financas-investimentos", icon: "ri-line-chart-line", ativo: true },
      { id: "prestacao", label: "Prestação de Contas", href: "/financas-investimentos?secao=prestacao-contas", icon: "ri-file-list-3-line", ativo: true },
      { id: "atuarial", label: "Avaliação Atuarial", href: "/financas-investimentos?secao=avaliacao-atuarial", icon: "ri-survey-line", ativo: true },
      { id: "balanco", label: "Balanço Anual", href: "/financas-investimentos?secao=balanco-anual", icon: "ri-bar-chart-box-line", ativo: true },
      { id: "balancetes", label: "Balancetes de Receitas e Despesas", href: "/financas-investimentos?secao=balancetes", icon: "ri-file-chart-line", ativo: true },
      { id: "credenciamento", label: "Credenciamento de Inst. Financeiras", href: "/financas-investimentos?secao=credenciamento", icon: "ri-bank-line", ativo: true },
      { id: "investimentos-dair", label: "Investimentos (DAIR / APR)", href: "/financas-investimentos?secao=investimentos", icon: "ri-funds-line", ativo: true },
      { id: "rel-completo", label: "Relatório Completo", href: "/financas-investimentos?secao=relatorio-completo", icon: "ri-file-paper-2-line", ativo: true },
      { id: "rel-consolidado", label: "Relatório Consolidado", href: "/financas-investimentos?secao=relatorio-consolidado", icon: "ri-file-copy-2-line", ativo: true },
      { id: "politica-inv", label: "Política de Investimentos", href: "/financas-investimentos?secao=politica-investimentos", icon: "ri-file-shield-2-line", ativo: true },
    ],
  },
  {
    id: "transparencia", label: "Transparência", ativo: true, ordem: 5,
    children: [
      { id: "portal", label: "Portal da Transparência", href: "/transparencia", icon: "ri-eye-line", ativo: true },
      { id: "lai", label: "LAI - Acesso à Informação", href: "/lai", icon: "ri-folder-info-line", ativo: true },
      { id: "relatorios", label: "Relatórios e Balanços", href: "/transparencia#relatorios", icon: "ri-bar-chart-box-line", ativo: true },
      { id: "licitacoes", label: "Licitações", href: "/transparencia#licitacoes", icon: "ri-auction-line", ativo: true },
      { id: "legislacao", label: "Legislação / Base Legal", href: "/legislacao", icon: "ri-scales-3-line", ativo: true },
      { id: "lgpd", label: "LGPD", href: "/lgpd", icon: "ri-shield-user-line", ativo: true },
    ],
  },
  {
    id: "documentos", label: "Documentos", ativo: true, ordem: 6,
    children: [
      { id: "formularios", label: "Formulários e Requerimentos", href: "/formularios", icon: "ri-file-list-3-line", ativo: true },
      { id: "enderecos", label: "Endereços", href: "/enderecos", icon: "ri-map-pin-line", ativo: true },
      { id: "mapa-do-site", label: "Mapa do Site", href: "/mapa-do-site", icon: "ri-map-2-line", ativo: true },
    ],
  },
  {
    id: "noticias-eventos", label: "Central de Informações", ativo: true, ordem: 7,
    children: [
      { id: "noticias", label: "Notícias", href: "/noticias", icon: "ri-newspaper-line", ativo: true },
      { id: "eventos", label: "Eventos e Agenda", href: "/eventos", icon: "ri-calendar-event-line", ativo: true },
      { id: "audiencias", label: "Audiências Públicas", href: "/eventos", icon: "ri-megaphone-line", ativo: true },
      { id: "cursos", label: "Cursos & Capacitações", href: "/cursos", icon: "ri-graduation-cap-line", ativo: true },
    ],
  },
  {
    id: "participacao", label: "Participação", ativo: true, ordem: 8,
    children: [
      { id: "ouvidoria", label: "Ouvidoria", href: "/ouvidoria", icon: "ri-speak-line", ativo: true },
      { id: "pesquisa", label: "Pesquisa de Satisfação", href: "/pesquisa-satisfacao", icon: "ri-survey-line", ativo: true },
      { id: "faq", label: "Perguntas Frequentes", href: "/perguntas-frequentes", icon: "ri-question-answer-line", ativo: true },
      { id: "contato", label: "Contato", href: "/contato", icon: "ri-mail-line", ativo: true },
      { id: "pro-gestao", label: "Pró-Gestão RPPS", href: "/pro-gestao", icon: "ri-medal-2-line", ativo: true },
    ],
  },
];

// ── SubItem Form Modal ────────────────────────────────────────────────────────
function SubItemForm({
  sub,
  onSave,
  onClose,
  primaryColor,
}: {
  sub: SubMenuItem;
  onSave: (s: SubMenuItem) => void;
  onClose: () => void;
  primaryColor: string;
}) {
  const [form, setForm] = useState<SubMenuItem>({ ...sub });
  const upd = (k: keyof SubMenuItem, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">
            {sub.label === "Novo item" ? "Novo sub-item" : `Editar: ${sub.label}`}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <i className="ri-close-line text-gray-400 text-sm"></i>
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Nome (exibido no menu)
            </label>
            <input
              value={form.label}
              onChange={(e) => upd("label", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
              placeholder="Nome do item"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Link / Rota
            </label>
            <input
              value={form.href}
              onChange={(e) => upd("href", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400 font-mono"
              placeholder="/pagina ou https://..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Ícone</label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
              {iconesOpcoes.map((ic) => (
                <button
                  key={ic}
                  onClick={() => upd("icon", ic)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border-2 cursor-pointer transition-all"
                  style={
                    form.icon === ic
                      ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                      : { borderColor: "#E5E7EB" }
                  }
                  title={ic}
                >
                  <i
                    className={`${ic} text-sm`}
                    style={{ color: form.icon === ic ? primaryColor : "#9CA3AF" }}
                  ></i>
                </button>
              ))}
            </div>
          </div>
          <div
            className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50"
            onClick={() => upd("ativo", !form.ativo)}
          >
            <div
              className="w-10 h-5 rounded-full relative transition-all flex-shrink-0"
              style={{ backgroundColor: form.ativo ? primaryColor : "#E5E7EB" }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: form.ativo ? "calc(100% - 18px)" : "2px" }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {form.ativo ? "Visível no menu" : "Oculto"}
            </span>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(form)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MenuItem Form Modal ───────────────────────────────────────────────────────
function MenuItemForm({
  item,
  onSave,
  onClose,
  primaryColor,
}: {
  item: MenuItem;
  onSave: (m: MenuItem) => void;
  onClose: () => void;
  primaryColor: string;
}) {
  const [form, setForm] = useState<MenuItem>({ ...item });
  const isNew = item.id === "";
  const upd = (k: keyof MenuItem, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">
            {isNew ? "Novo menu principal" : `Editar: ${item.label}`}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <i className="ri-close-line text-gray-400 text-sm"></i>
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Nome do Menu
            </label>
            <input
              value={form.label}
              onChange={(e) => upd("label", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
              placeholder="Ex: Serviços, Institucional..."
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Link direto{" "}
              <span className="font-normal text-gray-400">(deixe vazio se tiver sub-menu)</span>
            </label>
            <input
              value={form.href || ""}
              onChange={(e) => upd("href", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400 font-mono"
              placeholder="/ ou /pagina"
            />
          </div>
          <div
            className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50"
            onClick={() => upd("ativo", !form.ativo)}
          >
            <div
              className="w-10 h-5 rounded-full relative transition-all flex-shrink-0"
              style={{ backgroundColor: form.ativo ? primaryColor : "#E5E7EB" }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: form.ativo ? "calc(100% - 18px)" : "2px" }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {form.ativo ? "Visível no menu" : "Oculto"}
            </span>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(form)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {isNew ? "Criar Menu" : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────────────────────
export default function MenuNavegacaoTab() {
  const { config } = useSiteConfig();
  const [menus, setMenus] = useState<MenuItem[]>(defaultMenuItems);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editMenu, setEditMenu] = useState<MenuItem | null>(null);
  const [editSub, setEditSub] = useState<{ menuId: string; sub: SubMenuItem } | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    menuService.listar().then((loaded) => {
      if (isMounted && Array.isArray(loaded) && loaded.length > 0) {
        setMenus(loaded);
      }
    }).catch(() => {
      setMenus(defaultMenuItems);
    });
    return () => { isMounted = false; };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const persist = (updated: MenuItem[]) => {
    setMenus(updated);
  };

  const saveMenuToServer = async () => {
    try {
      const savedMenus = await menuService.salvarBulk(menus);
      setMenus(savedMenus);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(false);
    }
  };

  // Drag end for main menus
  const handleMainDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = menus.findIndex((m) => m.id === active.id);
    const newIndex = menus.findIndex((m) => m.id === over.id);
    persist(arrayMove(menus, oldIndex, newIndex).map((m, i) => ({ ...m, ordem: i + 1 })));
  };

  const handleReorderSubs = (menuId: string, newOrder: SubMenuItem[]) => {
    persist(menus.map((m) => (m.id === menuId ? { ...m, children: newOrder } : m)));
  };

  const toggleMenuAtivo = (id: string) =>
    persist(menus.map((m) => (m.id === id ? { ...m, ativo: !m.ativo } : m)));

  const toggleSubAtivo = (menuId: string, subId: string) =>
    persist(
      menus.map((m) =>
        m.id === menuId
          ? { ...m, children: m.children?.map((s) => (s.id === subId ? { ...s, ativo: !s.ativo } : s)) }
          : m
      )
    );

  const saveMenu = (updated: MenuItem) => {
    if (!editMenu || editMenu.id === "") {
      const newId = `menu-${Date.now()}`;
      persist([...menus, { ...updated, id: newId, ordem: menus.length + 1, children: [] }]);
    } else {
      persist(menus.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
    }
    setEditMenu(null);
  };

  const saveSub = (sub: SubMenuItem) => {
    if (!editSub) return;
    persist(
      menus.map((m) =>
        m.id === editSub.menuId
          ? { ...m, children: m.children?.map((s) => (s.id === sub.id ? sub : s)) }
          : m
      )
    );
    setEditSub(null);
  };

  const addSubItem = (menuId: string) => {
    const newSub: SubMenuItem = {
      id: `sub-${Date.now()}`,
      label: "Novo item",
      href: "/",
      icon: "ri-pages-line",
      ativo: true,
    };
    persist(
      menus.map((m) =>
        m.id === menuId ? { ...m, children: [...(m.children || []), newSub] } : m
      )
    );
    setEditSub({ menuId, sub: newSub });
  };

  const deleteSub = (menuId: string, subId: string) => {
    if (!confirm("Remover este sub-item?")) return;
    persist(
      menus.map((m) =>
        m.id === menuId ? { ...m, children: m.children?.filter((s) => s.id !== subId) } : m
      )
    );
  };

  const deleteMenu = (id: string) => {
    if (!confirm("Remover este menu e todos os seus sub-itens?")) return;
    persist(menus.filter((m) => m.id !== id));
  };

  const resetDefault = () => {
    if (!confirm("Restaurar o menu padrão? Suas alterações serão perdidas.")) return;
    persist(defaultMenuItems);
  };

  const blankMenu: MenuItem = { id: "", label: "", href: "", ativo: true, ordem: menus.length + 1 };

  return (
    <div className="flex gap-6 items-start">
      {/* ── Editor (col esquerda) ── */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Navegação / Menus
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Arraste para reordenar &bull; Clique na seta para ver sub-itens
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetDefault}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-500 cursor-pointer hover:bg-gray-50 whitespace-nowrap"
            >
              <i className="ri-refresh-line text-sm"></i> Restaurar
            </button>
            <button
              onClick={saveMenuToServer}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border border-transparent text-white cursor-pointer hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: config.secondaryColor }}
            >
              <i className="ri-save-line"></i> Salvar menu
            </button>
            <button
              onClick={() => setEditMenu(blankMenu)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90"
              style={{ backgroundColor: config.primaryColor }}
            >
              <i className="ri-add-line"></i> Novo Menu
            </button>
          </div>
        </div>

        {/* Saved toast */}
        {saved && (
          <div className="mb-3 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2 animate-pulse">
            <i className="ri-check-double-line"></i> Salvo! A prévia ao lado já foi atualizada.
          </div>
        )}

        {/* Dica drag */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5 mb-5 flex items-start gap-3">
          <i className="ri-draggable text-amber-500 text-base flex-shrink-0 mt-0.5"></i>
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Drag &amp; Drop:</strong> Segure o ícone{" "}
            <i className="ri-draggable text-amber-500"></i> e arraste qualquer menu ou sub-item para reordenar.
            As mudanças refletem na prévia ao vivo imediatamente.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            {
              label: "Menus",
              value: menus.length,
              sub: `${menus.filter((m) => m.ativo).length} visíveis`,
              icon: "ri-menu-2-line",
            },
            {
              label: "Sub-itens",
              value: menus.reduce((a, m) => a + (m.children?.length || 0), 0),
              sub: `${menus.reduce((a, m) => a + (m.children?.filter((s) => s.ativo).length || 0), 0)} ativos`,
              icon: "ri-list-check-2",
            },
            {
              label: "Ocultos",
              value: menus.filter((m) => !m.ativo).length,
              sub: "menus escondidos",
              icon: "ri-eye-off-line",
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
              <div
                className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ backgroundColor: `${config.primaryColor}12` }}
              >
                <i className={`${s.icon} text-sm`} style={{ color: config.primaryColor }}></i>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {s.value}
                </p>
                <p className="text-[10px] text-gray-400">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sortable menu list */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleMainDragEnd}
        >
          <SortableContext
            items={menus.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2.5">
              {menus.map((menu) => (
                <SortableMenuRow
                  key={menu.id}
                  menu={menu}
                  isExpanded={expanded === menu.id}
                  primaryColor={config.primaryColor}
                  onToggleExpand={(id) => setExpanded(expanded === id ? null : id)}
                  onToggleAtivo={toggleMenuAtivo}
                  onEdit={setEditMenu}
                  onDelete={deleteMenu}
                  onReorderSubs={handleReorderSubs}
                  onToggleSub={toggleSubAtivo}
                  onEditSub={(menuId, sub) => setEditSub({ menuId, sub })}
                  onDeleteSub={deleteSub}
                  onAddSub={addSubItem}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* ── Prévia ao vivo (col direita) ── */}
      <div className="w-72 flex-shrink-0 hidden xl:block">
        <MenuPreview menus={menus} primaryColor={config.primaryColor} />
      </div>

      {/* Modals */}
      {editMenu && (
        <MenuItemForm
          item={editMenu}
          onSave={saveMenu}
          onClose={() => setEditMenu(null)}
          primaryColor={config.primaryColor}
        />
      )}
      {editSub && (
        <SubItemForm
          sub={editSub.sub}
          onSave={saveSub}
          onClose={() => setEditSub(null)}
          primaryColor={config.primaryColor}
        />
      )}
    </div>
  );
}
