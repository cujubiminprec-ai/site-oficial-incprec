export type DocumentKind = "pdf" | "presentation" | "drive" | "link" | "empty";

export type DocumentView = {
  kind: DocumentKind;
  sourceUrl: string;
  embedUrl: string;
  canEmbed: boolean;
  openLabel: string;
  icon: string;
};

const PRESENTATION_EXTENSIONS = [".ppt", ".pptx", ".pps", ".ppsx", ".odp"];

function getDriveFileId(url: string): string | null {
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/i,
    /drive\.google\.com\/open\?id=([^&]+)/i,
    /drive\.google\.com\/uc\?id=([^&]+)/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function normalizeGoogleUrl(url: string, delay: number = 5000): string {
  const driveId = getDriveFileId(url);
  if (driveId) return `https://drive.google.com/file/d/${driveId}/preview`;

  if (/docs\.google\.com\/presentation\/d\//i.test(url)) {
    if (url.includes("/embed")) {
      if (!url.includes("delayms=")) {
        return url.includes("?") ? `${url}&delayms=${delay}` : `${url}?delayms=${delay}`;
      }
      return url;
    }
    const clean = url.split("?")[0].replace(/\/(edit|present|view).*$/i, "");
    return `${clean}/embed?start=true&loop=true&delayms=${delay}`;
  }

  return url;
}

function isLocalUrl(url: string): boolean {
  return /^\/uploads\//i.test(url) || /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/i.test(url);
}

function hasAnyExtension(url: string, extensions: string[]): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return extensions.some((ext) => clean.endsWith(ext));
}

export function getDocumentView(rawUrl?: string, delay: number = 5000): DocumentView {
  const sourceUrl = (rawUrl || "").trim();

  if (!sourceUrl) {
    return {
      kind: "empty",
      sourceUrl: "",
      embedUrl: "",
      canEmbed: false,
      openLabel: "Adicionar documento",
      icon: "ri-file-chart-2-line",
    };
  }

  const normalized = normalizeGoogleUrl(sourceUrl, delay);
  const isGoogle = /(^https?:\/\/)?(docs|drive)\.google\.com\//i.test(sourceUrl);
  const isDataPdf = /^data:application\/pdf/i.test(sourceUrl);
  const isDataPresentation = /^data:application\/(vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument\.presentationml\.presentation|vnd\.oasis\.opendocument\.presentation)/i.test(sourceUrl);
  const isPdf = isDataPdf || /\.pdf($|\?)/i.test(sourceUrl) || /\.pdf($|\?)/i.test(normalized);
  const isPresentation = isDataPresentation || hasAnyExtension(sourceUrl, PRESENTATION_EXTENSIONS) || /docs\.google\.com\/presentation\//i.test(sourceUrl);

  if (isGoogle) {
    return {
      kind: /presentation/i.test(sourceUrl) ? "presentation" : "drive",
      sourceUrl,
      embedUrl: normalized,
      canEmbed: true,
      openLabel: "Abrir no Drive",
      icon: /presentation/i.test(sourceUrl) ? "ri-slideshow-2-line" : "ri-google-line",
    };
  }

  if (isPdf) {
    return {
      kind: "pdf",
      sourceUrl,
      embedUrl: sourceUrl,
      canEmbed: true,
      openLabel: "Abrir PDF",
      icon: "ri-file-pdf-2-line",
    };
  }

  if (isPresentation) {
    const canUseOfficeViewer = /^https?:\/\//i.test(sourceUrl) && !isLocalUrl(sourceUrl);
    return {
      kind: "presentation",
      sourceUrl,
      embedUrl: canUseOfficeViewer ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(sourceUrl)}` : "",
      canEmbed: canUseOfficeViewer,
      openLabel: "Abrir apresentacao",
      icon: "ri-slideshow-2-line",
    };
  }

  return {
    kind: "link",
    sourceUrl,
    embedUrl: normalized,
    canEmbed: /^https?:\/\//i.test(normalized),
    openLabel: "Abrir link",
    icon: "ri-external-link-line",
  };
}

export function inferDocumentType(url?: string): "PDF" | "PPT" | "LINK" {
  const sourceUrl = (url || "").trim();
  if (/^data:application\/pdf/i.test(sourceUrl)) return "PDF";
  if (/^data:application\/(vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument\.presentationml\.presentation|vnd\.oasis\.opendocument\.presentation)/i.test(sourceUrl)) return "PPT";
  if (/\.pdf($|\?)/i.test(sourceUrl)) return "PDF";
  if (hasAnyExtension(sourceUrl, PRESENTATION_EXTENSIONS) || /docs\.google\.com\/presentation\//i.test(sourceUrl)) return "PPT";
  return "LINK";
}
