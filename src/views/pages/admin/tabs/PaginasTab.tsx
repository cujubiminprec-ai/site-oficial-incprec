import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import EditorConteudoPagina from "@/pages/admin/tabs/paginas/EditorConteudoPagina";
import { paginasService } from "@/services/paginas.service";

export interface PageItem {
  dbId?: number;
  id: string;
  nome: string;
  rota: string;
  descricao: string;
  status: "publicada" | "rascunho" | "oculta";
  menuLocal: string;
  subMenu: boolean;
  icone: string;
  modelo: string;
  ordem: number;
  tituloSeo?: string;
  descricaoSeo?: string;
  keywordsSeo?: string;
  ultimaEdicao?: string | null;
  atualizadoEm?: string;
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
  const upd = (k: keyof PageItem, v: string | boolean | number) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-6">
          <div>
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {isDuplicate ? "Duplicar Página" : isNew ? "Nova Página" : "Editar Página"}
            </h3>
            <p className="mt-0.5 text-xs text-gray-400">
              {isDuplicate ? "Uma cópia será criada com nova rota" : isNew ? "Configure a nova página" : `Editando: ${page.nome}`}
            </p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-gray-100">
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6">
          {isNew && (
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-600">Modelo de Página</label>
              <div className="grid grid-cols-2 gap-2">
                {modelosPadrao.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => upd("modelo", m.id)}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 text-left transition-all"
                    style={form.modelo === m.id ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` } : { borderColor: "#E5E7EB" }}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: form.modelo === m.id ? `${primaryColor}15` : "#F3F4F6" }}>
                      <i className={`${m.icone} text-sm`} style={{ color: form.modelo === m.id ? primaryColor : "#9CA3AF" }}></i>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{m.label}</p>
                      <p className="mt-0.5 text-[10px] leading-tight text-gray-400">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Nome da Página</label>
              <input value={form.nome} onChange={(e) => upd("nome", e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" placeholder="Ex: Aposentadoria por Idade" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Rota / URL</label>
              <input value={form.rota} onChange={(e) => upd("rota", e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 font-mono text-sm focus:outline-none" placeholder="/minha-pagina" />
              <p className="mt-1 text-[10px] text-gray-400">Comece com / e use hífens</p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Descrição interna</label>
            <input value={form.descricao} onChange={(e) => upd("descricao", e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" placeholder="Descrição breve da finalidade desta página" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Título SEO</label>
              <input value={form.tituloSeo || ""} onChange={(e) => upd("tituloSeo", e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" placeholder="Título exibido em buscadores" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Keywords SEO</label>
              <input value={form.keywordsSeo || ""} onChange={(e) => upd("keywordsSeo", e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" placeholder="previdência, INPREC, aposentadoria" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Descrição SEO</label>
            <textarea value={form.descricaoSeo || ""} onChange={(e) => upd("descricaoSeo", e.target.value)} className="min-h-[96px] w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" placeholder="Resumo para Google e compartilhamentos" />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {iconesPagina.map((ic) => (
                <button
                  key={ic}
                  onClick={() => upd("icone", ic)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-2 transition-all"
                  style={form.icone === ic ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` } : { borderColor: "#E5E7EB" }}
                >
                  <i className={`${ic} text-base`} style={{ color: form.icone === ic ? primaryColor : "#9CA3AF" }}></i>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Localização no Menu</label>
              <select value={form.menuLocal} onChange={(e) => upd("menuLocal", e.target.value)} className="w-full cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none">
                {menuLocais.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Status</label>
              <select value={form.status} onChange={(e) => upd("status", e.target.value as PageItem["status"])} className="w-full cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none">
                <option value="publicada">Publicada</option>
                <option value="rascunho">Rascunho</option>
                <option value="oculta">Oculta</option>
              </select>
            </div>
          </div>

          <div className="cursor-pointer rounded-xl bg-gray-50 p-3" onClick={() => upd("subMenu", !form.subMenu)}>
            <div className="flex items-center gap-3">
              <div className="relative flex h-6 w-11 flex-shrink-0 rounded-full transition-all" style={{ backgroundColor: form.subMenu ? primaryColor : "#E5E7EB" }}>
                <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: form.subMenu ? "calc(100% - 22px)" : "2px" }}></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900">{form.subMenu ? "Aparece no sub-menu" : "Item direto no menu"}</span>
                <p className="text-xs text-gray-400">{form.subMenu ? "Link aparece dentro do dropdown do menu pai" : "Item aparece diretamente na barra de navegação"}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={() => onSave(form)} className="flex-1 cursor-pointer rounded-xl py-3 text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: primaryColor }}>
              {isDuplicate ? "Criar Cópia" : isNew ? "Criar Página" : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaginasTab() {
  const { config } = useSiteConfig();
  const [lista, setLista] = useState<PageItem[]>([]);
  const [editando, setEditando] = useState<PageItem | null>(null);
  const [duplicando, setDuplicando] = useState<PageItem | null>(null);
  const [criando, setCriando] = useState(false);
  const [filtroMenu, setFiltroMenu] = useState("Todos");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [saved, setSaved] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [confirmarExcluir, setConfirmarExcluir] = useState<PageItem | null>(null);
  const [editandoConteudo, setEditandoConteudo] = useState<PageItem | null>(null);

  const recarregarPaginas = async () => {
    setCarregando(true);
    setErro("");
    try {
      const paginas = await paginasService.listarAdmin();
      setLista(paginas);
    } catch (err) {
      setLista([]);
      setErro(err instanceof Error ? err.message : "Erro ao carregar páginas.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void recarregarPaginas();
  }, []);

  const marcarSalvo = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = async (p: PageItem) => {
    setErro("");
    if (duplicando) {
      const copy: PageItem = {
        ...p,
        id: `${p.id || "page"}-${Date.now()}`,
        nome: `${p.nome} (cópia)`,
        ordem: (Math.max(0, ...lista.map((item) => item.ordem)) || 0) + 1,
      };
      try {
        const criado = await paginasService.criar(copy);
        setLista((prev) => [...prev, criado].sort((a, b) => a.ordem - b.ordem));
        marcarSalvo();
        setDuplicando(null);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao duplicar página.");
      }
      return;
    }

    try {
      if (!editando || editando.id === "") {
        const criado = await paginasService.criar({
          ...p,
          ordem: (Math.max(0, ...lista.map((item) => item.ordem)) || 0) + 1,
        });
        setLista((prev) => [...prev, criado].sort((a, b) => a.ordem - b.ordem));
      } else {
        const atualizado = await paginasService.atualizar(editando.id, {
          ...p,
          titulo_seo: p.tituloSeo,
          descricao_seo: p.descricaoSeo,
          keywords_seo: p.keywordsSeo,
        } as never);
        setLista((prev) => prev.map((item) => item.id === editando.id ? atualizado : item));
      }
      marcarSalvo();
      setEditando(null);
      setCriando(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar página.");
    }
  };

  const handleDelete = async (p: PageItem) => {
    setErro("");
    try {
      await paginasService.deletar(p.id);
      setLista((prev) => prev.filter((item) => item.id !== p.id));
      marcarSalvo();
      setConfirmarExcluir(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao excluir página.");
    }
  };

  const handleToggleStatus = async (id: string) => {
    const pagina = lista.find((item) => item.id === id);
    if (!pagina) return;
    setErro("");
    try {
      const atualizado = await paginasService.atualizar(id, {
        status: pagina.status === "publicada" ? "oculta" : "publicada",
      });
      setLista((prev) => prev.map((item) => item.id === id ? atualizado : item));
      marcarSalvo();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao atualizar status da página.");
    }
  };

  const filtrados = useMemo(() => {
    return lista
      .filter((p) => filtroMenu === "Todos" || p.menuLocal === filtroMenu)
      .filter((p) => filtroStatus === "Todos" || p.status === filtroStatus)
      .filter((p) => !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.rota.toLowerCase().includes(busca.toLowerCase()));
  }, [lista, filtroMenu, filtroStatus, busca]);

  const grupos = menuLocais.filter((m) => m !== "Nenhum (sem menu)");
  const statusColors: Record<string, { bg: string; text: string }> = {
    publicada: { bg: "bg-green-50", text: "text-green-600" },
    rascunho: { bg: "bg-amber-50", text: "text-amber-600" },
    oculta: { bg: "bg-gray-100", text: "text-gray-400" },
  };

  const blankPage: PageItem = {
    id: "",
    nome: "",
    rota: "/nova-pagina",
    descricao: "",
    status: "rascunho",
    menuLocal: "Institucional",
    subMenu: true,
    icone: "ri-pages-line",
    modelo: "informativo",
    ordem: (Math.max(0, ...lista.map((item) => item.ordem)) || 0) + 1,
    tituloSeo: "",
    descricaoSeo: "",
    keywordsSeo: "",
  };

  if (editandoConteudo) {
    return (
      <EditorConteudoPagina
        page={editandoConteudo}
        onPageUpdated={(page) => {
          setLista((prev) => prev.map((item) => item.id === page.id ? page : item));
          setEditandoConteudo(page);
        }}
        onBack={() => {
          setEditandoConteudo(null);
          void recarregarPaginas();
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Páginas do Site</h1>
          <p className="mt-1 text-sm text-gray-400">Gerencie todas as páginas com dados reais do MySQL, menu, status e SEO em tempo real.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void recarregarPaginas()}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <i className="ri-refresh-line"></i> Atualizar
          </button>
          <button
            onClick={() => { setCriando(true); setEditando(blankPage); }}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white hover:opacity-90"
            style={{ backgroundColor: config.primaryColor }}
          >
            <i className="ri-add-line"></i> Nova Página
          </button>
        </div>
      </div>

      {saved && <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700"><i className="ri-check-line"></i> Alterações salvas!</div>}
      {erro && <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"><i className="ri-error-warning-line"></i> {erro}</div>}
      {carregando && <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700"><i className="ri-loader-4-line animate-spin"></i> Carregando páginas do MySQL...</div>}

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "Total de Páginas", value: lista.length, icon: "ri-pages-line", color: config.primaryColor },
          { label: "Publicadas", value: lista.filter((p) => p.status === "publicada").length, icon: "ri-checkbox-circle-line", color: "#059669" },
          { label: "Rascunho / Ocultas", value: lista.filter((p) => p.status !== "publicada").length, icon: "ri-eye-off-line", color: "#9CA3AF" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-base`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
        <div className="relative min-w-[200px] flex-1">
          <i className="ri-search-line absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-400"></i>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full rounded-xl border border-gray-200 py-2.5 pr-3 pl-9 text-sm focus:outline-none" placeholder="Buscar página por nome ou rota..." />
        </div>
        <select value={filtroMenu} onChange={(e) => setFiltroMenu(e.target.value)} className="cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none">
          <option value="Todos">Todos os menus</option>
          {grupos.map((m) => <option key={m} value={m}>{m}</option>)}
          <option value="Nenhum (sem menu)">Sem menu</option>
        </select>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none">
          <option value="Todos">Todos os status</option>
          <option value="publicada">Publicadas</option>
          <option value="rascunho">Rascunho</option>
          <option value="oculta">Ocultas</option>
        </select>
      </div>

      {filtroMenu === "Todos" && !busca ? (
        <div className="flex flex-col gap-6">
          {menuLocais.map((menu) => {
            const pagsDeste = filtrados.filter((p) => p.menuLocal === menu);
            if (pagsDeste.length === 0) return null;
            return (
              <div key={menu} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <div className="flex items-center justify-between border-b border-gray-50 px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{menu}</span>
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${config.primaryColor}10`, color: config.primaryColor }}>
                      {pagsDeste.length} página{pagsDeste.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                {pagsDeste.map((p, i) => (
                  <PageRow
                    key={p.id}
                    p={p}
                    i={i}
                    total={pagsDeste.length}
                    primaryColor={config.primaryColor}
                    statusColors={statusColors}
                    onEdit={() => { setEditando(p); setCriando(false); }}
                    onDuplicate={() => setDuplicando(p)}
                    onDelete={() => setConfirmarExcluir(p)}
                    onToggle={() => void handleToggleStatus(p.id)}
                    onEditConteudo={() => setEditandoConteudo(p)}
                  />
                ))}
              </div>
            );
          })}
          {!carregando && filtrados.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center text-sm text-gray-400">
              Nenhuma página encontrada no banco.
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {filtrados.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">Nenhuma página encontrada.</div>
          ) : (
            filtrados.map((p, i) => (
              <PageRow
                key={p.id}
                p={p}
                i={i}
                total={filtrados.length}
                primaryColor={config.primaryColor}
                statusColors={statusColors}
                onEdit={() => { setEditando(p); setCriando(false); }}
                onDuplicate={() => setDuplicando(p)}
                onDelete={() => setConfirmarExcluir(p)}
                onToggle={() => void handleToggleStatus(p.id)}
                onEditConteudo={() => setEditandoConteudo(p)}
              />
            ))
          )}
        </div>
      )}

      {editando !== null && (
        <PageFormModal
          page={editando}
          onSave={handleSave}
          onClose={() => { setEditando(null); setCriando(false); }}
          primaryColor={config.primaryColor}
          isDuplicate={false}
        />
      )}

      {duplicando !== null && (
        <PageFormModal
          page={{ ...duplicando, nome: `${duplicando.nome} (cópia)`, id: "" }}
          onSave={handleSave}
          onClose={() => setDuplicando(null)}
          primaryColor={config.primaryColor}
          isDuplicate
        />
      )}

      {confirmarExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && setConfirmarExcluir(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <i className="ri-delete-bin-line text-xl text-red-500"></i>
            </div>
            <h3 className="mb-2 text-center text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Excluir Página?</h3>
            <p className="mb-6 text-center text-sm text-gray-500">
              Tem certeza que deseja excluir <strong>{confirmarExcluir.nome}</strong>? Esta ação remove o registro do painel e o conteúdo salvo dessa página.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarExcluir(null)} className="flex-1 cursor-pointer rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => void handleDelete(confirmarExcluir)} className="flex-1 cursor-pointer rounded-xl bg-red-500 py-3 text-sm font-semibold text-white hover:bg-red-600">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PageRow({
  p,
  i,
  total,
  primaryColor,
  statusColors,
  onEdit,
  onDuplicate,
  onDelete,
  onToggle,
  onEditConteudo,
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
    <div className={`flex items-center gap-4 px-5 py-3.5 ${i < total - 1 ? "border-b border-gray-50" : ""} ${p.status === "oculta" ? "opacity-60" : ""}`}>
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${primaryColor}10` }}>
        <i className={`${p.icone} text-sm`} style={{ color: primaryColor }}></i>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">{p.nome}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${st.bg} ${st.text}`}>
            {p.status === "publicada" ? "Publicada" : p.status === "rascunho" ? "Rascunho" : "Oculta"}
          </span>
          {p.subMenu && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">Sub-menu</span>}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs text-gray-400">{p.rota}</span>
          {p.menuLocal && p.menuLocal !== "Nenhum (sem menu)" && <span className="text-xs text-gray-400">· {p.menuLocal}</span>}
          {p.tituloSeo && <span className="text-xs text-emerald-600">SEO configurado</span>}
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1">
        <button onClick={onEditConteudo} className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all hover:opacity-90" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }} title="Editar conteúdo da página">
          <i className="ri-edit-box-line text-xs"></i> Editar Conteúdo
        </button>
        <Link to={p.rota} target="_blank" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100" title="Ver no site">
          <i className="ri-external-link-line text-sm"></i>
        </Link>
        <button onClick={onToggle} className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors ${p.status === "publicada" ? "text-amber-500 hover:bg-amber-50" : "text-green-500 hover:bg-green-50"}`} title={p.status === "publicada" ? "Ocultar" : "Publicar"}>
          <i className={`${p.status === "publicada" ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
        </button>
        <button onClick={onDuplicate} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100" title="Duplicar página">
          <i className="ri-file-copy-line text-sm"></i>
        </button>
        <button onClick={onEdit} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100" title="Editar configurações">
          <i className="ri-settings-3-line text-sm"></i>
        </button>
        <button onClick={onDelete} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500" title="Excluir">
          <i className="ri-delete-bin-line text-sm"></i>
        </button>
      </div>
    </div>
  );
}
