import { useEffect, useState, useRef } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useSlidesAdmin } from "@/hooks/useSlidesAdmin";
import { cursosAdminDefault, CursoItem } from "@/mocks/cursos-admin";
import { useImageUpload } from "@/hooks/useImageUpload";
import { conteudoService } from "@/services/conteudo.service";

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR");
}

const STATUS_OPTS = [
  { value: "aberto", label: "Aberto – Inscrições Abertas", color: "bg-green-100 text-green-700" },
  { value: "em-breve", label: "Em Breve", color: "bg-amber-100 text-amber-700" },
  { value: "encerrado", label: "Encerrado", color: "bg-gray-100 text-gray-500" },
  { value: "rascunho", label: "Rascunho", color: "bg-gray-100 text-gray-400" },
];

const STATUS_COLORS: Record<string, string> = {
  aberto: "bg-green-100 text-green-700",
  "em-breve": "bg-amber-100 text-amber-700",
  encerrado: "bg-gray-100 text-gray-500",
  rascunho: "bg-gray-100 text-gray-400",
};

// ── Formulário de Curso ──────────────────────────────────────────────────────────
function CursoForm({ curso, onSave, onClose, primaryColor }: {
  curso: CursoItem;
  onSave: (c: CursoItem) => void;
  onClose: () => void;
  primaryColor: string;
}) {
  const [form, setForm] = useState<CursoItem>({ ...curso });
  const upd = <K extends keyof CursoItem>(k: K, v: CursoItem[K]) => setForm(p => ({ ...p, [k]: v }));
  const isNew = curso.id === 0;
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerCarregado, setBannerCarregado] = useState(false);
  const { readFileAsDataURL } = useImageUpload();

  const handleBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      upd("bannerUrl", dataUrl);
      setBannerCarregado(true);
      setTimeout(() => setBannerCarregado(false), 3000);
    } finally {
      setBannerUploading(false);
      if (bannerFileRef.current) bannerFileRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {isNew ? "Novo Curso / Capacitação" : "Editar Curso"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Coluna esquerda */}
          <div className="flex flex-col gap-4">
            {/* Input oculto para upload */}
            <input ref={bannerFileRef} type="file" accept="image/*" className="hidden" onChange={handleBannerFile} />

            {/* Preview banner */}
            <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative">
              {(form.bannerUrl || form.imagem) ? (
                <img src={form.bannerUrl || form.imagem} alt="Banner" className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <i className="ri-image-add-line text-3xl text-gray-300"></i>
                  <p className="text-xs text-gray-400">Banner do curso</p>
                </div>
              )}
              {(form.bannerUrl || form.imagem) && (
                <button
                  type="button"
                  onClick={() => bannerFileRef.current?.click()}
                  className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}>
                  <i className="ri-camera-line text-xs"></i> Trocar
                </button>
              )}
            </div>

            {/* Upload do computador */}
            <div
              className="border-2 border-dashed rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              style={{ borderColor: `${primaryColor}50` }}
              onClick={() => bannerFileRef.current?.click()}>
              <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ backgroundColor: `${primaryColor}15` }}>
                {bannerUploading
                  ? <i className="ri-loader-4-line animate-spin text-lg" style={{ color: primaryColor }}></i>
                  : <i className="ri-upload-2-line text-lg" style={{ color: primaryColor }}></i>}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-700">
                  {bannerUploading ? "Carregando..." : "Escolher banner do computador"}
                </p>
                <p className="text-[10px] text-gray-400">PNG, JPG, WebP · Recomendado: 1200×600px</p>
              </div>
            </div>

            {bannerCarregado && (
              <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: primaryColor }}>
                <i className="ri-checkbox-circle-line"></i> Banner carregado do computador!
              </p>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Ou cole a URL do Banner / Imagem</label>
              <input value={form.bannerUrl} onChange={e => upd("bannerUrl", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="https://... (link de imagem JPG, PNG, WebP)" />
              <p className="text-xs text-gray-400 mt-1">Cole o link de uma imagem. Recomendado: 1200x600px</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Link do PDF / Material</label>
              <div className="flex gap-2">
                <input value={form.pdfUrl} onChange={e => upd("pdfUrl", e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  placeholder="https://drive.google.com/... ou link do PDF" />
                {form.pdfUrl && (
                  <a href={form.pdfUrl} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-red-200 bg-red-50 cursor-pointer flex-shrink-0">
                    <i className="ri-file-pdf-line text-red-500"></i>
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Link do Google Drive, Dropbox ou URL direta do PDF</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Título *</label>
              <input value={form.titulo} onChange={e => upd("titulo", e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Nome do curso ou capacitação" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tipo</label>
                <select value={form.tipo} onChange={e => upd("tipo", e.target.value as CursoItem["tipo"])}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
                  <option value="curso">Curso</option>
                  <option value="capacitacao">Capacitação</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                <select value={form.status} onChange={e => upd("status", e.target.value as CursoItem["status"])}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
                  {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Data de Início *</label>
                <input type="date" value={form.data} onChange={e => upd("data", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Horário *</label>
                <input type="time" value={form.hora} onChange={e => upd("hora", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Local</label>
              <input value={form.local} onChange={e => upd("local", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Ex: Auditório INPREC ou Online – Zoom" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Carga Horária</label>
              <input value={form.cargaHoraria} onChange={e => upd("cargaHoraria", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Ex: 8h" />
            </div>

            {/* Vagas */}
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-bold text-gray-700">Vagas</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Defina o limite de participantes</p>
                </div>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => upd("vagasIlimitadas", !form.vagasIlimitadas)}
                >
                  <span className="text-xs font-semibold text-gray-600">Ilimitado</span>
                  <div
                    className="w-10 h-5 rounded-full relative transition-all flex-shrink-0"
                    style={{ backgroundColor: form.vagasIlimitadas ? primaryColor : "#E5E7EB" }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: form.vagasIlimitadas ? "calc(100% - 18px)" : "2px" }}
                    ></div>
                  </div>
                </div>
              </div>
              {form.vagasIlimitadas ? (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-gray-200">
                  <i className="ri-infinity-line text-gray-400 text-sm"></i>
                  <span className="text-sm text-gray-500">Vagas ilimitadas — sem restrição de participantes</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Total de Vagas</label>
                    <input
                      type="number"
                      min={0}
                      value={form.vagas}
                      onChange={e => {
                        const v = parseInt(e.target.value) || 0;
                        upd("vagas", v);
                        if (form.vagasRestantes > v) upd("vagasRestantes", v);
                      }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
                      placeholder="Ex: 40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Vagas Disponíveis</label>
                    <input
                      type="number"
                      min={0}
                      max={form.vagas}
                      value={form.vagasRestantes}
                      onChange={e => upd("vagasRestantes", Math.min(parseInt(e.target.value) || 0, form.vagas))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
                      placeholder="Ex: 18"
                    />
                  </div>
                  {form.vagas > 0 && (
                    <div className="col-span-2">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(((form.vagas - form.vagasRestantes) / form.vagas) * 100, 100)}%`,
                            backgroundColor: primaryColor,
                          }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {form.vagas - form.vagasRestantes} inscritos · {form.vagasRestantes} vagas restantes
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Instrutor / Palestrante</label>
              <input value={form.palestrante} onChange={e => upd("palestrante", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Nome e cargo do instrutor" />
            </div>
          </div>

          {/* Coluna direita */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Descrição / Sobre o Curso</label>
              <textarea value={form.descricao} onChange={e => upd("descricao", e.target.value)} rows={5}
                maxLength={500}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
                placeholder="Descreva o objetivo e público-alvo do curso..." />
              <p className="text-xs text-gray-400 mt-1">{form.descricao.length}/500 caracteres</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Conteúdo Programático
                <span className="text-gray-400 font-normal ml-1">(um item por linha ou separado por ; )</span>
              </label>
              <textarea value={form.conteudoProgramatico} onChange={e => upd("conteudoProgramatico", e.target.value)} rows={8}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none font-mono"
                placeholder={"Módulo 1: Introdução\nMódulo 2: Legislação\nMódulo 3: Prática\n..."} />
              <p className="text-xs text-gray-400 mt-1">
                <i className="ri-magic-line mr-1"></i>
                Cada linha vira um item numerado automaticamente no site — sem precisar formatar!
              </p>
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-3 pt-1">
              {([
                ["certificado", "Emite Certificado de Conclusão", "ri-award-line"],
                ["online", "Evento Online (transmissão)", "ri-live-line"],
                ["publicado", "Publicado (visível no site)", "ri-eye-line"],
                ["destaque", "Destacado na listagem", "ri-star-line"],
              ] as [keyof CursoItem, string, string][]).map(([k, label, icon]) => (
                <div key={k} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 cursor-pointer"
                  onClick={() => upd(k, !form[k] as CursoItem[typeof k])}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 flex items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${primaryColor}15` }}>
                      <i className={`${icon} text-sm`} style={{ color: primaryColor }}></i>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                  <div className="w-10 h-5 rounded-full relative transition-all flex-shrink-0"
                    style={{ backgroundColor: form[k] ? primaryColor : "#E5E7EB" }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: form[k] ? "calc(100% - 18px)" : "2px" }}></div>
                  </div>
                </div>
              ))}
            </div>

            {form.online && (
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Link da Transmissão Online</label>
                <input value={form.linkOnline || ""} onChange={e => upd("linkOnline", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  placeholder="https://youtube.com/live/... ou https://zoom.us/j/..." />
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={() => onSave(form)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90"
            style={{ backgroundColor: primaryColor }}>
            {isNew ? "Criar Curso" : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────────────────────────
export default function CursosAdminTab() {
  const { config } = useSiteConfig();
  const { promoteToSlide } = useSlidesAdmin();
  const [cursos, setCursos] = useState<CursoItem[]>(cursosAdminDefault);
  const [editando, setEditando] = useState<CursoItem | null>(null);
  const [saved, setSaved] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [busca, setBusca] = useState("");
  const [dbStatus, setDbStatus] = useState<"carregando" | "online" | "fallback">("carregando");

  const persist = (data: CursoItem[]) => {
    setCursos(data);
    conteudoService.salvarCursos(data)
      .then((salvos) => {
        setDbStatus("online");
        if (Array.isArray(salvos)) {
          setCursos(salvos);
        }
      })
      .catch(() => setDbStatus("fallback"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  useEffect(() => {
    let alive = true;
    conteudoService.listarCursosAdmin()
      .then(async (remote) => {
        if (!alive) return;
        if (Array.isArray(remote) && remote.length > 0) {
          setCursos(remote);
          setDbStatus("online");
          return;
        }
        const seeded = await conteudoService.salvarCursos(cursosAdminDefault);
        if (!alive) return;
        setCursos(seeded);
        setDbStatus("online");
      })
      .catch(() => {
        if (alive) setDbStatus("fallback");
      });
    return () => { alive = false; };
  }, []);

  const handleSave = (curso: CursoItem) => {
    if (curso.id === 0) {
      const newId = Math.max(0, ...cursos.map(c => c.id)) + 1;
      persist([...cursos, { ...curso, id: newId, criado: new Date().toISOString().slice(0, 10) }]);
    } else {
      persist(cursos.map(c => c.id === curso.id ? curso : c));
    }
    setEditando(null);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Remover este curso permanentemente?")) return;
    persist(cursos.filter(c => c.id !== id));
  };

  const handleDuplicate = (curso: CursoItem) => {
    const newId = Math.max(0, ...cursos.map(c => c.id)) + 1;
    persist([...cursos, { ...curso, id: newId, titulo: `${curso.titulo} (Cópia)`, publicado: false, status: "rascunho", criado: new Date().toISOString().slice(0, 10) }]);
  };

  const handlePromote = (curso: CursoItem) => {
    const ok = promoteToSlide({
      id: curso.id,
      titulo: curso.titulo,
      resumo: curso.descricao,
      image_url: curso.bannerUrl || curso.imagem,
      tag: curso.tipo === "curso" ? "Curso" : "Capacitação",
      cta_url: `/cursos/${curso.id}`,
      type: "curso",
    });
    if (ok) setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const togglePublicado = (id: number) => persist(cursos.map(c => c.id === id ? { ...c, publicado: !c.publicado } : c));

  const filtrados = cursos.filter(c => {
    const statusOk = filtroStatus === "todos" || c.status === filtroStatus;
    const buscaOk = !busca || c.titulo.toLowerCase().includes(busca.toLowerCase()) || c.palestrante.toLowerCase().includes(busca.toLowerCase());
    return statusOk && buscaOk;
  });

  const blankCurso: CursoItem = {
    id: 0, titulo: "", tipo: "curso", categoria: "Curso", status: "rascunho",
    data: "", dataFim: "", hora: "08:00", local: "", descricao: "", conteudoProgramatico: "",
    palestrante: "", cargaHoraria: "", certificado: false,
    vagasIlimitadas: false, vagas: 30, vagasRestantes: 30,
    online: false, linkOnline: "", bannerUrl: "", pdfUrl: "", imagem: "", publicado: false, destaque: false, criado: "",
  };

  const stats = [
    { label: "Total de Cursos", value: cursos.length, icon: "ri-graduation-cap-line", color: "#6D28D9" },
    { label: "Inscrições Abertas", value: cursos.filter(c => c.status === "aberto").length, icon: "ri-calendar-check-line", color: "#059669" },
    { label: "Publicados", value: cursos.filter(c => c.publicado).length, icon: "ri-eye-line", color: "#0891B2" },
    { label: "Com Certificado", value: cursos.filter(c => c.certificado).length, icon: "ri-award-line", color: "#D97706" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Cursos &amp; Capacitações
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Crie, edite e gerencie todos os cursos e capacitações exibidos no site.
          </p>
        </div>
        <button onClick={() => setEditando(blankCurso)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90"
          style={{ backgroundColor: config.primaryColor }}>
          <i className="ri-add-line"></i> Novo Curso
        </button>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Alterações salvas! Recarregue a página de cursos para ver.
        </div>
      )}

      <div className={`mb-4 px-4 py-3 rounded-xl border text-sm flex items-center gap-2 ${
        dbStatus === "online" ? "bg-green-50 border-green-100 text-green-700" :
        dbStatus === "carregando" ? "bg-blue-50 border-blue-100 text-blue-700" :
        "bg-amber-50 border-amber-100 text-amber-700"
      }`}>
        <i className={dbStatus === "online" ? "ri-database-2-line" : dbStatus === "carregando" ? "ri-loader-4-line animate-spin" : "ri-alert-line"}></i>
        {dbStatus === "online" ? "Cursos conectados ao MySQL." : dbStatus === "carregando" ? "Conectando cursos ao MySQL..." : "API local indisponivel. Os cursos continuam no navegador ate o backend ficar ativo."}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl mb-2" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar curso ou instrutor..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["todos", "aberto", "em-breve", "encerrado", "rascunho"].map(s => (
            <button key={s} onClick={() => setFiltroStatus(s)}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer whitespace-nowrap transition-all capitalize"
              style={filtroStatus === s ? { backgroundColor: config.primaryColor, color: "white", borderColor: config.primaryColor } : { borderColor: "#E5E7EB", color: "#6B7280" }}>
              {s === "todos" ? "Todos" : s === "aberto" ? "Abertos" : s === "em-breve" ? "Em Breve" : s === "encerrado" ? "Encerrados" : "Rascunhos"}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {filtrados.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <i className="ri-graduation-cap-line text-4xl text-gray-200"></i>
            <p className="text-gray-400 text-sm mt-3">Nenhum curso encontrado.</p>
          </div>
        )}
        {filtrados.map(curso => (
          <div key={curso.id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${!curso.publicado ? "opacity-70 border-dashed border-gray-200" : "border-gray-100"}`}>
            <div className="flex items-center gap-4 p-4">
              {/* Banner thumb */}
              <div className="w-28 h-18 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 w-28" style={{ height: "72px" }}>
                {(curso.bannerUrl || curso.imagem) ? (
                  <img src={curso.bannerUrl || curso.imagem} alt={curso.titulo} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="ri-image-line text-gray-300 text-xl"></i>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[curso.status]}`}>
                    {STATUS_OPTS.find(s => s.value === curso.status)?.label || curso.status}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}>
                    {curso.tipo === "curso" ? "Curso" : "Capacitação"}
                  </span>
                  {!curso.publicado && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium">Não publicado</span>}
                  {curso.destaque && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium flex items-center gap-1"><i className="ri-star-line text-[9px]"></i>Destaque</span>}
                  {curso.certificado && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-medium flex items-center gap-1"><i className="ri-award-line text-[9px]"></i>Certificado</span>}
                </div>
                <p className="text-sm font-bold text-gray-900 truncate">{curso.titulo}</p>
                <div className="flex flex-wrap gap-3 mt-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <i className="ri-calendar-line text-xs"></i>{formatDate(curso.data)} às {curso.hora}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <i className="ri-time-line text-xs"></i>{curso.cargaHoraria || "—"}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <i className="ri-team-line text-xs"></i>
                    {curso.vagasIlimitadas
                      ? <span className="flex items-center gap-1"><i className="ri-infinity-line text-xs"></i>Ilimitado</span>
                      : `${curso.vagasRestantes}/${curso.vagas} vagas`}
                  </span>
                  {curso.palestrante && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <i className="ri-user-line text-xs"></i>{curso.palestrante}
                    </span>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => handlePromote(curso)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 text-purple-500 cursor-pointer"
                  title="Promover para Slide da Home">
                  <i className="ri-slideshow-line text-sm"></i>
                </button>
                <button onClick={() => togglePublicado(curso.id)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${curso.publicado ? "hover:bg-amber-50 text-amber-500" : "hover:bg-green-50 text-green-500"}`}
                  title={curso.publicado ? "Despublicar" : "Publicar"}>
                  <i className={`${curso.publicado ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                </button>
                <button onClick={() => handleDuplicate(curso)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
                  title="Duplicar">
                  <i className="ri-file-copy-line text-sm"></i>
                </button>
                {curso.pdfUrl && (
                  <a href={curso.pdfUrl} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
                    title="Ver PDF">
                    <i className="ri-file-pdf-line text-sm"></i>
                  </a>
                )}
                <a href={`/cursos/${curso.id}`} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
                  title="Ver no site">
                  <i className="ri-external-link-line text-sm"></i>
                </a>
                <button onClick={() => setEditando(curso)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
                  title="Editar">
                  <i className="ri-edit-line text-sm"></i>
                </button>
                <button onClick={() => handleDelete(curso.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
                  title="Excluir">
                  <i className="ri-delete-bin-line text-sm"></i>
                </button>
              </div>
            </div>

            {/* Barra de vagas */}
            {!curso.vagasIlimitadas && curso.vagas > 0 && (
              <div className="px-4 pb-3">
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(((curso.vagas - curso.vagasRestantes) / curso.vagas) * 100, 100)}%`, backgroundColor: config.primaryColor }}></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {curso.vagas - curso.vagasRestantes} inscritos de {curso.vagas} vagas
                </p>
              </div>
            )}
            {curso.vagasIlimitadas && (
              <div className="px-4 pb-3">
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <i className="ri-infinity-line text-xs"></i>
                  Vagas ilimitadas
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de edição */}
      {editando && (
        <CursoForm curso={editando} onSave={handleSave} onClose={() => setEditando(null)} primaryColor={config.primaryColor} />
      )}
    </div>
  );
}
