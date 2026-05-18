import { useRef, useState } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface Props {
  value: string;
  onChange: (url: string) => void;
  primaryColor?: string;
  label?: string;
  hint?: string;
  previewShape?: "square" | "circle" | "wide";
  previewSize?: "sm" | "md" | "lg";
  placeholder?: string;
  showUrlInput?: boolean;
}

export default function SingleImageUploader({
  value,
  onChange,
  primaryColor = "#6D28D9",
  label,
  hint,
  previewShape = "square",
  previewSize = "md",
  placeholder = "https://... ou escolha do computador",
  showUrlInput = true,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadOk, setUploadOk] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { readFileAsDataURL } = useImageUpload();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setImgError(false);
    try {
      const dataUrl = await readFileAsDataURL(file);
      onChange(dataUrl);
      setUploadOk(true);
      setTimeout(() => setUploadOk(false), 3000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const previewSizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const shapeClass = previewShape === "circle" ? "rounded-full" : previewShape === "wide" ? "rounded-xl w-full h-32" : "rounded-xl";
  const sizeClass = previewShape === "wide" ? "" : previewSizeClasses[previewSize];

  const isDataUrl = value?.startsWith("data:");

  return (
    <div className="flex flex-col gap-2.5">
      {label && <label className="text-xs font-semibold text-gray-600 block">{label}</label>}
      {hint && <p className="text-[11px] text-gray-400 -mt-1">{hint}</p>}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <div className={`flex ${previewShape === "wide" ? "flex-col" : "items-start"} gap-3`}>
        {/* Preview */}
        <div
          className={`${sizeClass} ${shapeClass} overflow-hidden flex-shrink-0 border-2 flex items-center justify-center cursor-pointer transition-all hover:opacity-80`}
          style={{
            backgroundColor: `${primaryColor}08`,
            borderColor: value && !imgError ? primaryColor : "#E5E7EB",
          }}
          onClick={() => fileInputRef.current?.click()}
          title="Clique para escolher uma foto"
        >
          {value && !imgError ? (
            <img
              src={value}
              alt="Preview"
              className={`w-full h-full object-cover ${previewShape === "circle" ? "rounded-full" : "object-top"}`}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-1 p-2 text-center">
              <i className="ri-image-add-line text-xl" style={{ color: primaryColor }}></i>
              {previewShape !== "wide" && (
                <span className="text-[9px] text-gray-400 leading-tight">Clique para<br />carregar</span>
              )}
            </div>
          )}
        </div>

        {/* Upload area + URL input */}
        <div className={`flex flex-col gap-2 ${previewShape === "wide" ? "w-full" : "flex-1 min-w-0"}`}>
          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed cursor-pointer hover:bg-gray-50 transition-all text-xs font-semibold text-gray-600 w-full"
            style={{ borderColor: `${primaryColor}60`, backgroundColor: uploadOk ? `${primaryColor}08` : undefined }}
          >
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              {uploading ? (
                <i className="ri-loader-4-line animate-spin text-sm" style={{ color: primaryColor }}></i>
              ) : uploadOk ? (
                <i className="ri-checkbox-circle-line text-sm" style={{ color: primaryColor }}></i>
              ) : (
                <i className="ri-upload-2-line text-sm" style={{ color: primaryColor }}></i>
              )}
            </div>
            <span style={{ color: uploadOk ? primaryColor : undefined }}>
              {uploading ? "Carregando..." : uploadOk ? "Foto carregada do computador!" : "Escolher do computador"}
            </span>
          </button>

          {/* URL input */}
          {showUrlInput && (
            <div>
              <input
                type="url"
                value={isDataUrl ? "" : (value || "")}
                onChange={(e) => { onChange(e.target.value); setImgError(false); }}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
              {imgError && value && (
                <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                  <i className="ri-error-warning-line"></i> URL inválida ou imagem não carregou
                </p>
              )}
              {isDataUrl && value && (
                <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: primaryColor }}>
                  <i className="ri-checkbox-circle-line"></i> Imagem carregada do computador
                </p>
              )}
            </div>
          )}

          {/* Remove button */}
          {value && (
            <button
              type="button"
              onClick={() => { onChange(""); setImgError(false); }}
              className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600 cursor-pointer w-fit"
            >
              <i className="ri-delete-bin-line text-xs"></i> Remover foto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
