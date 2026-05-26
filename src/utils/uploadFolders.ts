export type UploadArea = "slides" | "painel" | "transparencia" | "financas" | "gestores";

export function extensaoArquivo(file: File | string) {
  const nome = typeof file === "string" ? file : file.name;
  return nome.toLowerCase().match(/\.[^.]+$/)?.[0] || "";
}

export function tipoArquivo(file: File | string) {
  const ext = extensaoArquivo(file).replace(".", "").toUpperCase();
  return ext || "ARQUIVO";
}

export function pastaPublicaPorArquivo(area: UploadArea, file: File | string) {
  const ext = extensaoArquivo(file);

  if (area === "slides") {
    if (ext === ".pdf") return "slides-pdfs";
    if ([".ppt", ".pptx", ".pps", ".ppsx", ".odp"].includes(ext)) return "slides-apresentacoes";
    return "slides";
  }

  if (area === "painel") {
    if (ext === ".pdf") return "painel-pdfs";
    return "painel-apresentacoes";
  }

  if (area === "transparencia" || area === "financas") {
    const prefixo = area;
    if (ext === ".pdf") return `${prefixo}-pdfs`;
    if ([".ppt", ".pptx", ".pps", ".ppsx", ".odp"].includes(ext)) return `${prefixo}-apresentacoes`;
    if ([".xls", ".xlsx", ".ods", ".csv"].includes(ext)) return `${prefixo}-planilhas`;
    return `${prefixo}-documentos`;
  }

  return "gestores-documentos";
}

export function arquivoPermitidoDocumento(file: File) {
  return [".pdf", ".doc", ".docx", ".odt", ".xls", ".xlsx", ".ods", ".csv", ".ppt", ".pptx", ".pps", ".ppsx", ".zip"].includes(extensaoArquivo(file));
}
