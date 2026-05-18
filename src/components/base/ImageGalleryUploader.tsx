import { useRef, useState } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";

export interface GalleryImage {
  id: string;
  url: string;
  isCover: boolean;
  ativo: boolean;
}

interface Props {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  primaryColor: string;
  maxImages?: number;
}

export default function ImageGalleryUploader({ images, onChange, primaryColor, maxImages = 10 }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const { readFilesAsDataURLs } = useImageUpload();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = maxImages - images.length;
    if (remaining <= 0) return;
    setUploading(true);
    try {
      const limited = Array.from(files).slice(0, remaining);
      const urls = await readFilesAsDataURLs(limited);
      const newImgs: GalleryImage[] = urls.map((url, i) => ({
        id: `img_${Date.now()}_${i}`,
        url,
        isCover: images.length === 0 && i === 0,
        ativo: true,
      }));
      onChange([...images, ...newImgs]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddUrl = () => {
    const u = urlInput.trim();
    if (!u) return;
    const newImg: GalleryImage = {
      id: `img_${Date.now()}`,
      url: u,
      isCover: images.length === 0,
      ativo: true,
    };
    onChange([...images, newImg]);
    setUrlInput("");
  };

  const setCover = (id: string) => {
    onChange(images.map((img) => ({ ...img, isCover: img.id === id })));
  };

  const toggleAtivo = (id: string) => {
    onChange(images.map((img) => (img.id === id ? { ...img, ativo: !img.ativo } : img)));
  };

  const removeImg = (id: string) => {
    const filtered = images.filter((img) => img.id !== id);
    // Se removeu a capa, define a primeira como capa
    if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
      filtered[0].isCover = true;
    }
    onChange(filtered);
  };

  const coverImg = images.find((img) => img.isCover) || images[0];

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Área de upload */}
      <div
        className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors text-center"
        style={{ borderColor: `${primaryColor}50` }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div
          className="w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          {uploading ? (
            <i className="ri-loader-4-line text-xl animate-spin" style={{ color: primaryColor }}></i>
          ) : (
            <i className="ri-image-add-line text-xl" style={{ color: primaryColor }}></i>
          )}
        </div>
        <p className="text-xs font-semibold text-gray-700">
          {uploading ? "Carregando imagens..." : "Clique para adicionar imagens do computador"}
        </p>
        <p className="text-[11px] text-gray-400">PNG, JPG, WEBP · Várias fotos de uma vez · Máx. {maxImages} imagens</p>
      </div>

      {/* Adicionar via URL */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
          placeholder="Ou cole uma URL de imagem..."
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim()}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-40 whitespace-nowrap"
          style={{ backgroundColor: primaryColor }}
        >
          Adicionar
        </button>
      </div>

      {/* Grid de imagens */}
      {images.length > 0 && (
        <div>
          {/* Preview da capa */}
          {coverImg && (
            <div className="mb-3 rounded-xl overflow-hidden border border-gray-200 relative">
              <img
                src={coverImg.url}
                alt="Foto de capa"
                className="w-full h-40 object-cover object-top"
                onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
              />
              <div className="absolute top-2 left-2">
                <span
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <i className="ri-star-fill text-[9px]"></i> Foto de Capa
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            {images.map((img) => (
              <div
                key={img.id}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${img.isCover ? "border-current" : "border-transparent"} ${!img.ativo ? "opacity-40" : ""}`}
                style={img.isCover ? { borderColor: primaryColor } : {}}
              >
                <div className="w-full h-16 bg-gray-100">
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).parentElement!.style.backgroundColor = "#F3F4F6";
                    }}
                  />
                </div>

                {/* Overlay de ações */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-end justify-center gap-1 p-1 opacity-0 hover:opacity-100">
                  {!img.isCover && (
                    <button
                      type="button"
                      onClick={() => setCover(img.id)}
                      title="Definir como capa"
                      className="w-6 h-6 flex items-center justify-center rounded bg-amber-400 hover:bg-amber-500 cursor-pointer"
                    >
                      <i className="ri-star-line text-white text-[10px]"></i>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleAtivo(img.id)}
                    title={img.ativo ? "Desativar" : "Ativar"}
                    className="w-6 h-6 flex items-center justify-center rounded bg-gray-500 hover:bg-gray-600 cursor-pointer"
                  >
                    <i className={`${img.ativo ? "ri-eye-off-line" : "ri-eye-line"} text-white text-[10px]`}></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImg(img.id)}
                    title="Remover"
                    className="w-6 h-6 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 cursor-pointer"
                  >
                    <i className="ri-delete-bin-line text-white text-[10px]"></i>
                  </button>
                </div>

                {img.isCover && (
                  <div
                    className="absolute top-0.5 left-0.5 w-4 h-4 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <i className="ri-star-fill text-white" style={{ fontSize: "8px" }}></i>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-gray-400 mt-2">
            Passe o mouse sobre uma imagem para ver as opções · <i className="ri-star-line text-amber-400"></i> = definir como capa · <i className="ri-eye-off-line text-gray-400"></i> = ocultar
          </p>
        </div>
      )}
    </div>
  );
}
