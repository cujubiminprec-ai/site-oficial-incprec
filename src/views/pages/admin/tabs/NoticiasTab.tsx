import { useEffect, useState, useRef } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useSlidesAdmin } from "@/hooks/useSlidesAdmin";
import ImageGalleryUploader, { GalleryImage } from "@/components/base/ImageGalleryUploader";
import TextoMagico, { MagicFields } from "@/components/base/TextoMagico";
import { noticiasService } from "@/services/noticias.service";

type Noticia = {
  id: number;
  categoria: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  image_url: string;
  images: GalleryImage[];
  criado_em: string;
  autor: string;
  tempoLeitura: string;
  tags: string[];
  publicada?: boolean;
};

const categoriasOpcoes = ["Institucional", "Capacitação", "Parceria", "Evento", "Transparência", "Serviço", "Previdência", "Comunicado"];

function normalizarImagensNoticia(images: unknown, imageUrl?: string): GalleryImage[] {
  const galeria = Array.isArray(images)
    ? images
        .filter((img): img is Partial<GalleryImage> => Boolean(img && typeof img === "object" && "url" in img && String((img as Partial<GalleryImage>).url || "").trim()))
        .map((img, index) => ({
          id: String(img.id || "noticia_img_" + index),
          url: String(img.url || "").trim(),
          isCover: img.isCover === true,
          ativo: img.ativo !== false,
        }))
    : [];

  if (galeria.length === 0 && imageUrl) {
    galeria.push({ id: "noticia_cover", url: imageUrl, isCover: true, ativo: true });
  }

  if (galeria.length > 0 && !galeria.some((img) => img.isCover && img.ativo)) {
    galeria[0].isCover = true;
  }

  return galeria;
}

function NoticiaFormModal({
  noticia,
  onSave,
  onClose,
  primaryColor,
}: {
  noticia: Noticia;
  onSave: (n: Noticia) => void | Promise<void>;
  onClose: () => void;
  primaryColor: string;
}) {
  const [form, setForm] = useState<Noticia>({ ...noticia });
  const [tagInput, setTagInput] = useState("");
  const [activeSection, setActiveSection] = useState<"magic" | "manual">("magic");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const isNew = noticia.id === 0;

  const upd = (k: keyof Noticia, v: string | boolean | string[] | GalleryImage[]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) upd("tags", [...form.tags, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => upd("tags", form.tags.filter((t) => t !== tag));

  const handleMagic = (fields: MagicFields) => {
    setForm((p) => ({
      ...p,
      titulo: fields.titulo,
      resumo: fields.resumo,
      conteudo: fields.conteudo,
      tags: [...new Set([...p.tags, ...fields.tags])],
      tempoLeitura: fields.tempoLeitura,
    }));
    setActiveSection("manual");
  };

  const handleImagesChange = (imgs: GalleryImage[]) => {
    const cover = imgs.find((img) => img.isCover && img.ativo);
    upd("images", imgs);
    upd("image_url", cover?.url || "");
  };

  const coverUrl = form.images?.find((img) => img.isCover && img.ativo)?.url || form.image_url;

  const handleSubmit = async () => {
    const faltando: string[] = [];
    if (!coverUrl.trim()) faltando.push("foto");
    if (!form.categoria.trim()) faltando.push("categoria");
    if (!form.titulo.trim()) faltando.push("titulo da noticia");
    if (typeof form.publicada !== "boolean") faltando.push("status");

    if (faltando.length > 0) {
      setErro("Preencha os campos obrigatorios: " + faltando.join(", ") + ".");
      return;
    }

    setErro("");
    setSalvando(true);
    try {
      await onSave({ ...form, image_url: coverUrl.trim(), titulo: form.titulo.trim(), categoria: form.categoria.trim(), publicada: form.publicada !== false });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar a notícia.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[94vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {isNew ? "Nova Notícia" : "Editar Notícia"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {form.titulo || "Preencha os campos abaixo"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* Texto Mágico */}
          <TextoMagico onGenerate={handleMagic} primaryColor={primaryColor} tipo="noticia" />

          {/* Tabs manual/preview */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            {[
              { key: "manual", label: "Editar Campos", icon: "ri-edit-line" },
              { key: "magic", label: "Texto Mágico", icon: "ri-magic-line" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveSection(t.key as "magic" | "manual")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
                style={activeSection === t.key ? { backgroundColor: primaryColor, color: "white" } : { color: "#6B7280" }}
              >
                <i className={`${t.icon} text-xs`}></i> {t.label}
              </button>
            ))}
          </div>

          {/* Imagens */}
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5 block">
              <i className="ri-image-2-line" style={{ color: primaryColor }}></i>
              Imagens da Notícia
              <span className="text-red-500 font-normal ml-1">*</span>
              <span className="text-gray-400 font-normal ml-1">— Escolha várias fotos e defina a capa</span>
            </label>
            <ImageGalleryUploader
              images={form.images || []}
              onChange={handleImagesChange}
              primaryColor={primaryColor}
              uploadFolder="noticias"
            />
          </div>

          {/* Categoria + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Categoria <span className="text-red-500">*</span></label>
              <select
                value={form.categoria}
                onChange={(e) => upd("categoria", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
              >
                {categoriasOpcoes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status <span className="text-red-500">*</span></label>
              <select
                value={form.publicada === false ? "rascunho" : "publicada"}
                onChange={(e) => upd("publicada", e.target.value === "publicada")}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
              >
                <option value="publicada">Publicada</option>
                <option value="rascunho">Rascunho</option>
              </select>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Título da Notícia
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              value={form.titulo}
              onChange={(e) => upd("titulo", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              placeholder="Título chamativo e objetivo"
            />
          </div>

          {/* Resumo */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Resumo / Chamada
              <span className="text-gray-400 font-normal ml-1">— Aparece nos cards (máx. 200 caracteres)</span>
            </label>
            <textarea
              value={form.resumo}
              onChange={(e) => upd("resumo", e.target.value)}
              rows={2}
              maxLength={200}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
              placeholder="Breve descrição..."
            />
            <p className="text-xs text-gray-400 text-right">{form.resumo.length}/200</p>
          </div>

          {/* Conteúdo */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Conteúdo Completo
            </label>
            <textarea
              value={form.conteudo}
              onChange={(e) => upd("conteudo", e.target.value)}
              rows={12}
              maxLength={5000}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-y"
              placeholder="Texto completo da notícia..."
            />
            <p className="text-xs text-gray-400 text-right">{form.conteudo.length}/5000</p>
          </div>

          {/* Autor + Data + Leitura */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Autor</label>
              <input
                value={form.autor}
                onChange={(e) => upd("autor", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Assessoria"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Data de Publicação</label>
              <input
                type="date"
                value={form.criado_em?.split("T")[0] || ""}
                onChange={(e) => upd("criado_em", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Leitura</label>
              <input
                value={form.tempoLeitura}
                onChange={(e) => upd("tempoLeitura", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="3 min"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-black/10 cursor-pointer"
                  >
                    <i className="ri-close-line text-[10px]"></i>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                placeholder="Tag e Enter..."
              />
              <button type="button" onClick={addTag} className="px-3 py-2 rounded-xl text-sm font-medium text-white cursor-pointer" style={{ backgroundColor: primaryColor }}>
                +
              </button>
            </div>
          </div>

          {/* Preview capa */}
          {coverUrl && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[11px] font-semibold text-gray-500 mb-2 flex items-center gap-1">
                <i className="ri-image-line" style={{ color: primaryColor }}></i>
                Preview do card da notícia:
              </p>
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <img src={coverUrl} alt="Capa" className="w-full h-full object-cover object-top" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 line-clamp-1">{form.titulo || "Sem título"}</p>
                  <p className="text-[11px] text-gray-400 line-clamp-1">{form.resumo || "Sem resumo"}</p>
                </div>
              </div>
            </div>
          )}

          {erro && (
            <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold">
              {erro}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50 whitespace-nowrap"
            >
              Cancelar
            </button>
            <button
              onClick={() => void handleSubmit()}
              disabled={salvando}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 whitespace-nowrap disabled:opacity-60"
              style={{ backgroundColor: primaryColor }}
            >
              {salvando ? "Salvando..." : isNew ? "Publicar Notícia" : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NoticiasTab() {
  const { config } = useSiteConfig();
  const { promoteToSlide } = useSlidesAdmin();
  const [lista, setLista] = useState<Noticia[]>([]);
  const [editando, setEditando] = useState<Noticia | null>(null);
  const [busca, setBusca] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let ativo = true;
    noticiasService.listarAdmin()
      .then((listaApi) => {
        if (!ativo) return;
        setLista(listaApi.map((n: any) => ({
            id: Number(n.id),
            categoria: n.categoria || "Institucional",
            titulo: n.titulo || "",
            resumo: n.resumo || "",
            conteudo: n.conteudo || "",
            image_url: n.image_url || n.imagem || "",
            images: normalizarImagensNoticia(n.images, n.image_url || n.imagem || ""),
            criado_em: n.publicado_em || n.criado_em || new Date().toISOString().split("T")[0],
            autor: n.autor || "INPREC",
            tempoLeitura: "3 min",
            tags: Array.isArray(n.tags) ? n.tags : [],
            publicada: n.publicado !== false,
          })));
      })
      .catch(() => setLista([]));
    return () => { ativo = false; };
  }, []);

  const persist = (updated: Noticia[]) => {
    setLista(updated);
    window.dispatchEvent(new Event("inprec-noticias-updated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTogglePublicada = async (id: number) => {
    const atual = lista.find((n) => n.id === id);
    if (!atual) return;
    await noticiasService.atualizar(String(id), { publicado: !atual.publicada });
    persist(lista.map((n) => (n.id === id ? { ...n, publicada: !n.publicada } : n)));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta notícia permanentemente?")) return;
    await noticiasService.deletar(String(id));
    persist(lista.filter((n) => n.id !== id));
  };

  const handleSave = async (n: Noticia) => {
    const publicadoEm = n.criado_em ? n.criado_em.split("T")[0] : undefined;
    if (n.id === 0) {
      const criada = await noticiasService.criar({
        titulo: n.titulo,
        resumo: n.resumo,
        conteudo: n.conteudo,
        image_url: n.image_url,
        images: n.images,
        categoria: n.categoria,
        autor: n.autor,
        destaque: false,
        tags: n.tags,
        publicado: n.publicada !== false,
        publicado_em: publicadoEm,
      } as any);
      persist([{ ...n, id: Number(criada.id) }, ...lista]);
    } else {
      await noticiasService.atualizar(String(n.id), {
        titulo: n.titulo,
        resumo: n.resumo,
        conteudo: n.conteudo,
        image_url: n.image_url,
        images: n.images,
        categoria: n.categoria,
        autor: n.autor,
        tags: n.tags,
        publicado: n.publicada !== false,
        publicado_em: publicadoEm,
      } as any);
      persist(lista.map((x) => (x.id === n.id ? n : x)));
    }
    setEditando(null);
  };

  const handlePromote = (n: Noticia) => {
    const coverUrl = n.images?.find((img) => img.isCover && img.ativo)?.url || n.image_url;
    const ok = promoteToSlide({
      id: n.id,
      titulo: n.titulo,
      resumo: n.resumo,
      image_url: coverUrl,
      tag: n.categoria,
      cta_url: `/noticias/${n.id}`,
      type: n.categoria === "Audiência Pública" ? "audiencia" : "noticia",
    });
    if (ok) setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const blank: Noticia = {
    id: 0,
    categoria: "Institucional",
    titulo: "",
    resumo: "",
    conteudo: "",
    image_url: "",
    images: [],
    criado_em: new Date().toISOString().split("T")[0],
    autor: "",
    tempoLeitura: "3 min",
    tags: [],
    publicada: true,
  };

  const filtradas = lista.filter(
    (n) =>
      n.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      n.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Notícias
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gerencie as notícias exibidas na página <strong>/noticias</strong> e nos destaques da home.
          </p>
        </div>
        <button
          onClick={() => setEditando(blank)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90"
          style={{ backgroundColor: config.primaryColor }}
        >
          <i className="ri-add-line"></i> Nova Notícia
        </button>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Salvo com sucesso!
        </div>
      )}

      <div className="relative mb-5">
        <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por título ou categoria..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><i className="ri-magic-line" style={{ color: config.primaryColor }}></i> Texto Mágico disponível no editor</span>
        <span className="flex items-center gap-1"><i className="ri-image-add-line text-amber-400"></i> Upload múltiplas fotos</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filtradas.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">Nenhuma notícia encontrada.</div>
        )}
        {filtradas.map((n, i) => {
          const coverUrl = n.images?.find((img) => img.isCover && img.ativo)?.url || n.image_url;
          const activeImages = n.images?.filter((img) => img.ativo).length || 0;
          return (
            <div
              key={n.id}
              className={`flex items-center gap-4 p-4 ${i < filtradas.length - 1 ? "border-b border-gray-50" : ""} ${n.publicada === false ? "opacity-50" : ""}`}
            >
              <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
                {coverUrl ? (
                  <img src={coverUrl} alt={n.titulo} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="ri-image-line text-gray-300"></i>
                  </div>
                )}
                {activeImages > 1 && (
                  <div className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[9px] px-1 rounded font-bold">
                    +{activeImages - 1}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}
                  >
                    {n.categoria}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${n.publicada === false ? "bg-gray-100 text-gray-400" : "bg-green-50 text-green-600"}`}
                  >
                    {n.publicada === false ? "Rascunho" : "Publicada"}
                  </span>
                  {activeImages > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 flex items-center gap-0.5">
                      <i className="ri-image-line text-[9px]"></i> {activeImages} foto{activeImages !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{n.titulo}</p>
                <p className="text-xs text-gray-400">
                  {n.autor} · {new Date(n.criado_em).toLocaleDateString("pt-BR")} · {n.tempoLeitura}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handlePromote(n)}
                  title="Promover para Slide da Home"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 text-purple-500 cursor-pointer"
                >
                  <i className="ri-slideshow-line text-sm"></i>
                </button>
                <button
                  onClick={() => handleTogglePublicada(n.id)}
                  title={n.publicada === false ? "Publicar" : "Ocultar"}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${n.publicada === false ? "hover:bg-green-50 text-green-500" : "hover:bg-amber-50 text-amber-500"}`}
                >
                  <i className={n.publicada === false ? "ri-eye-line text-sm" : "ri-eye-off-line text-sm"}></i>
                </button>
                <button
                  onClick={() => setEditando(n)}
                  title="Editar"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-edit-line text-sm"></i>
                </button>
                <button
                  onClick={() => handleDelete(n.id)}
                  title="Excluir"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
                >
                  <i className="ri-delete-bin-line text-sm"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editando && (
        <NoticiaFormModal
          noticia={editando}
          onSave={handleSave}
          onClose={() => setEditando(null)}
          primaryColor={config.primaryColor}
        />
      )}
    </div>
  );
}
