import { useRef, useState } from "react";
import { BlocoConteudo, BlocoTipo } from "@/mocks/paginas-conteudo";
import { uploadService } from "@/services/upload.service";

const iconesBlocos: Record<BlocoTipo, string> = {
  hero: "ri-layout-top-2-line",
  texto: "ri-text",
  imagem: "ri-image-line",
  lista: "ri-list-check",
  cta: "ri-cursor-line",
  aviso: "ri-alert-line",
  divisor: "ri-separator",
  colunas: "ri-layout-column-line",
};

const labelsBlocos: Record<BlocoTipo, string> = {
  hero: "Seção Hero / Banner",
  texto: "Bloco de Texto",
  imagem: "Imagem",
  lista: "Lista de Itens",
  cta: "Botão / Chamada para Ação",
  aviso: "Caixa de Aviso",
  divisor: "Divisor",
  colunas: "Colunas (3 colunas)",
};

interface BlocoEditorProps {
  bloco: BlocoConteudo;
  index: number;
  total: number;
  primaryColor: string;
  onChange: (b: BlocoConteudo) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function BlocoEditor({
  bloco, index, total, primaryColor, onChange, onDelete, onDuplicate, onMoveUp, onMoveDown
}: BlocoEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(index === 0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const upd = (k: keyof BlocoConteudo, v: string | string[] | BlocoConteudo["colunas"]) =>
    onChange({ ...bloco, [k]: v });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setUploadError("");
    try {
      const uploaded = await uploadService.upload(file, "fotos");
      onChange({
        ...bloco,
        imageUrl: uploaded.url,
        imageAlt: bloco.imageAlt || uploaded.nome || "Imagem da pagina",
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erro ao enviar imagem.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const corAviso = bloco.cor || primaryColor;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Header do bloco */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(e => !e)}>
        <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ backgroundColor: `${primaryColor}15` }}>
          <i className={`${iconesBlocos[bloco.tipo]} text-sm`} style={{ color: primaryColor }}></i>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-gray-900">{labelsBlocos[bloco.tipo]}</span>
          {bloco.titulo && (
            <span className="ml-2 text-xs text-gray-400 truncate">— {bloco.titulo}</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={onMoveUp} disabled={index === 0}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer disabled:opacity-30"
            title="Mover para cima">
            <i className="ri-arrow-up-s-line text-sm"></i>
          </button>
          <button
            onClick={onMoveDown} disabled={index === total - 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer disabled:opacity-30"
            title="Mover para baixo">
            <i className="ri-arrow-down-s-line text-sm"></i>
          </button>
          <button
            onClick={onDuplicate}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
            title="Duplicar bloco">
            <i className="ri-file-copy-line text-sm"></i>
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 cursor-pointer"
            title="Remover bloco">
            <i className="ri-delete-bin-line text-sm"></i>
          </button>
          <div className="w-7 h-7 flex items-center justify-center text-gray-400">
            <i className={`${expanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-sm`}></i>
          </div>
        </div>
      </div>

      {/* Campos do bloco */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 flex flex-col gap-4 border-t border-gray-50">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void handleImageUpload(event)}
          />

          {/* HERO */}
          {bloco.tipo === "hero" && (
            <>
              <Field label="Título Principal">
                <input value={bloco.titulo || ""} onChange={e => upd("titulo", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-300"
                  placeholder="Título do hero" />
              </Field>
              <Field label="Subtítulo / Descrição">
                <input value={bloco.subtitulo || ""} onChange={e => upd("subtitulo", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-300"
                  placeholder="Texto menor abaixo do título" />
              </Field>
              <Field label="Imagem de Fundo">
                <ImagePicker
                  value={bloco.imageUrl || ""}
                  uploading={uploadingImage}
                  uploadError={uploadError}
                  primaryColor={primaryColor}
                  onUpload={() => fileInputRef.current?.click()}
                  onChange={(value) => upd("imageUrl", value)}
                  onRemove={() => upd("imageUrl", "")}
                />
              </Field>
              {bloco.imageUrl && (
                <div className="w-full h-28 rounded-xl overflow-hidden bg-gray-100">
                  <img src={bloco.imageUrl} alt="preview" className="w-full h-full object-cover object-top" />
                </div>
              )}
              <Field label="Alinhamento">
                <div className="flex gap-2">
                  {(["left", "center", "right"] as const).map(a => (
                    <button key={a} onClick={() => upd("alinhamento", a)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border-2 cursor-pointer transition-all"
                      style={bloco.alinhamento === a ? { borderColor: primaryColor, color: primaryColor, backgroundColor: `${primaryColor}08` } : { borderColor: "#E5E7EB", color: "#9CA3AF" }}>
                      <i className={`${a === "left" ? "ri-align-left" : a === "center" ? "ri-align-center" : "ri-align-right"} text-sm`}></i>
                      {a === "left" ? "Esquerda" : a === "center" ? "Centro" : "Direita"}
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {/* TEXTO */}
          {bloco.tipo === "texto" && (
            <>
              <Field label="Título da Seção">
                <input value={bloco.titulo || ""} onChange={e => upd("titulo", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-300"
                  placeholder="Título (opcional)" />
              </Field>
              <Field label="Conteúdo do Texto" hint="Use quebra de linha para parágrafos separados">
                <textarea value={bloco.texto || ""} onChange={e => upd("texto", e.target.value)}
                  rows={6} maxLength={500}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-300 resize-y"
                  placeholder="Digite o conteúdo aqui..." />
                <p className="text-[10px] text-gray-400 mt-1">{(bloco.texto || "").length}/500</p>
              </Field>
            </>
          )}

          {/* IMAGEM */}
          {bloco.tipo === "imagem" && (
            <>
              <Field label="Imagem">
                <ImagePicker
                  value={bloco.imageUrl || ""}
                  uploading={uploadingImage}
                  uploadError={uploadError}
                  primaryColor={primaryColor}
                  onUpload={() => fileInputRef.current?.click()}
                  onChange={(value) => upd("imageUrl", value)}
                  onRemove={() => upd("imageUrl", "")}
                />
              </Field>
              <Field label="Legenda / Alt text">
                <input value={bloco.imageAlt || ""} onChange={e => upd("imageAlt", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-300"
                  placeholder="Descrição da imagem" />
              </Field>
              {bloco.imageUrl && (
                <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100">
                  <img src={bloco.imageUrl} alt={bloco.imageAlt} className="w-full h-full object-cover object-top" />
                </div>
              )}
            </>
          )}

          {/* LISTA */}
          {bloco.tipo === "lista" && (
            <>
              <Field label="Título da Lista">
                <input value={bloco.titulo || ""} onChange={e => upd("titulo", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-300"
                  placeholder="Título (opcional)" />
              </Field>
              <Field label="Itens da Lista" hint="Um item por linha">
                <textarea
                  value={(bloco.itens || []).join("\n")}
                  onChange={e => upd("itens", e.target.value.split("\n"))}
                  rows={6}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-300 resize-y"
                  placeholder={"Item 1\nItem 2\nItem 3"} />
                <p className="text-[10px] text-gray-400 mt-1">{(bloco.itens || []).length} itens</p>
              </Field>
            </>
          )}

          {/* CTA */}
          {bloco.tipo === "cta" && (
            <>
              <Field label="Título / Chamada">
                <input value={bloco.titulo || ""} onChange={e => upd("titulo", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-300"
                  placeholder="Ex: Ainda tem dúvidas?" />
              </Field>
              <Field label="Texto complementar">
                <input value={bloco.texto || ""} onChange={e => upd("texto", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-300"
                  placeholder="Descrição opcional" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Texto do Botão">
                  <input value={bloco.ctaLabel || ""} onChange={e => upd("ctaLabel", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-300"
                    placeholder="Saiba mais" />
                </Field>
                <Field label="Link do Botão">
                  <input value={bloco.ctaUrl || ""} onChange={e => upd("ctaUrl", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-300 font-mono"
                    placeholder="/contato" />
                </Field>
              </div>
            </>
          )}

          {/* AVISO */}
          {bloco.tipo === "aviso" && (
            <>
              <Field label="Título do Aviso">
                <input value={bloco.titulo || ""} onChange={e => upd("titulo", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-300"
                  placeholder="Ex: Atenção!" />
              </Field>
              <Field label="Texto do Aviso">
                <textarea value={bloco.texto || ""} onChange={e => upd("texto", e.target.value)}
                  rows={3} maxLength={500}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-300 resize-none"
                  placeholder="Mensagem de alerta ou informação importante" />
                <p className="text-[10px] text-gray-400 mt-1">{(bloco.texto || "").length}/500</p>
              </Field>
              <Field label="Cor do Aviso">
                <div className="flex items-center gap-2">
                  <input type="color" value={corAviso}
                    onChange={e => upd("cor", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
                  <input type="text" value={corAviso}
                    onChange={e => upd("cor", e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none font-mono" />
                  {/* Preview */}
                  <div className="flex-1 px-3 py-2 rounded-xl text-xs font-medium" style={{ backgroundColor: `${corAviso}15`, color: corAviso, border: `1px solid ${corAviso}30` }}>
                    Preview do aviso
                  </div>
                </div>
              </Field>
            </>
          )}

          {/* DIVISOR */}
          {bloco.tipo === "divisor" && (
            <p className="text-xs text-gray-400 text-center py-2">
              <i className="ri-separator mr-1"></i>
              Linha divisória entre seções. Sem configurações adicionais.
            </p>
          )}

          {/* COLUNAS */}
          {bloco.tipo === "colunas" && (
            <>
              <Field label="Título da Seção">
                <input value={bloco.titulo || ""} onChange={e => upd("titulo", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-300"
                  placeholder="Título acima das colunas" />
              </Field>
              <div className="flex flex-col gap-4">
                {(bloco.colunas || [{titulo:"", texto:"", icone:""}, {titulo:"", texto:"", icone:""}, {titulo:"", texto:"", icone:""}]).map((col, ci) => (
                  <div key={ci} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-3">
                    <p className="text-xs font-bold text-gray-600">Coluna {ci + 1}</p>
                    <input value={col.titulo} onChange={e => {
                      const cols = [...(bloco.colunas || [{titulo:"",texto:"",icone:""},{titulo:"",texto:"",icone:""},{titulo:"",texto:"",icone:""}])];
                      cols[ci] = { ...cols[ci], titulo: e.target.value };
                      upd("colunas", cols);
                    }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
                      placeholder="Título da coluna" />
                    <textarea value={col.texto} onChange={e => {
                      const cols = [...(bloco.colunas || [{titulo:"",texto:"",icone:""},{titulo:"",texto:"",icone:""},{titulo:"",texto:"",icone:""}])];
                      cols[ci] = { ...cols[ci], texto: e.target.value };
                      upd("colunas", cols);
                    }}
                      rows={3} maxLength={500}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none bg-white"
                      placeholder="Texto da coluna" />
                    <input value={col.icone || ""} onChange={e => {
                      const cols = [...(bloco.colunas || [{titulo:"",texto:"",icone:""},{titulo:"",texto:"",icone:""},{titulo:"",texto:"",icone:""}])];
                      cols[ci] = { ...cols[ci], icone: e.target.value };
                      upd("colunas", cols);
                    }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white font-mono"
                      placeholder="Ícone Remix (ex: ri-star-line)" />
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}

function ImagePicker({
  value,
  uploading,
  uploadError,
  primaryColor,
  onUpload,
  onChange,
  onRemove,
}: {
  value: string;
  uploading: boolean;
  uploadError: string;
  primaryColor: string;
  onUpload: () => void;
  onChange: (value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-2">
        <button
          type="button"
          onClick={onUpload}
          disabled={uploading}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60 cursor-pointer transition-colors"
          style={{ borderColor: `${primaryColor}70` }}
        >
          <i className={`${uploading ? "ri-loader-4-line animate-spin" : "ri-upload-cloud-2-line"} text-sm`} style={{ color: primaryColor }}></i>
          {uploading ? "Enviando..." : "Enviar imagem"}
        </button>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-300 font-mono"
          placeholder="/uploads/fotos/imagem.jpg ou https://..."
        />
      </div>
      {uploadError && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <i className="ri-error-warning-line"></i> {uploadError}
        </p>
      )}
      {value && (
        <button
          type="button"
          onClick={onRemove}
          className="w-fit text-[11px] text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
        >
          <i className="ri-delete-bin-line text-xs"></i> Remover imagem
        </button>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
        {label}
        {hint && <span className="ml-1 text-gray-400 font-normal">· {hint}</span>}
      </label>
      {children}
    </div>
  );
}
