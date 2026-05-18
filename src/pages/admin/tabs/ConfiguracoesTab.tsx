import { useState, useRef, useCallback } from "react";
import { useSiteConfig, SiteConfig } from "@/contexts/SiteConfigContext";

export default function ConfiguracoesTab() {
  const { config, updateConfig } = useSiteConfig();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const sloganInputRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const sloganFileRef = useRef<HTMLInputElement>(null);
  const progestaoFileRef = useRef<HTMLInputElement>(null);
  const [logoPreviewError, setLogoPreviewError] = useState(false);
  const [sloganPreviewError, setSloganPreviewError] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [sloganUploading, setSloganUploading] = useState(false);
  const [progestaoUploading, setProgestaoUploading] = useState(false);

  const readFileAsDataURL = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      upd("logoImageUrl", dataUrl);
      setLogoPreviewError(false);
    } catch {
      setLogoPreviewError(true);
    } finally {
      setLogoUploading(false);
      if (logoFileRef.current) logoFileRef.current.value = "";
    }
  };

  const handleSloganFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSloganUploading(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      upd("sloganImageUrl", dataUrl);
      setSloganPreviewError(false);
    } catch {
      setSloganPreviewError(true);
    } finally {
      setSloganUploading(false);
      if (sloganFileRef.current) sloganFileRef.current.value = "";
    }
  };

  const handleProgestaoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProgestaoUploading(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      upd("proGestaoSeloUrl", dataUrl);
    } catch {
      // ignore
    } finally {
      setProgestaoUploading(false);
      if (progestaoFileRef.current) progestaoFileRef.current.value = "";
    }
  };

  const [form, setForm] = useState<SiteConfig & {
    contrachequeUrl: string;
    horarioSeg: string;
    horarioSab: string;
    horarioDom: string;
    redeFacebook: string;
    redeInstagram: string;
    redeYoutube: string;
    redeLinkedin: string;
    mapEmbedUrl: string;
    fontFamily: string;
  }>({
    ...config,
    topbarVisivel: config.topbarVisivel !== false,
    topbarEmailVisivel: config.topbarEmailVisivel !== false,
    topbarTelefoneVisivel: config.topbarTelefoneVisivel !== false,
    topbarRedesVisivel: config.topbarRedesVisivel !== false,
    topbarMapaSiteVisivel: config.topbarMapaSiteVisivel !== false,
    contrachequeUrl: localStorage.getItem("inprec_contracheque_url") || "",
    horarioSeg: localStorage.getItem("inprec_horario_seg") || "Segunda a Sexta: 07h30 às 13h30",
    horarioSab: localStorage.getItem("inprec_horario_sab") || "",
    horarioDom: localStorage.getItem("inprec_horario_dom") || "",
    redeFacebook: localStorage.getItem("inprec_facebook") || "https://facebook.com/inprec",
    redeInstagram: localStorage.getItem("inprec_instagram") || "https://instagram.com/inprec",
    redeYoutube: localStorage.getItem("inprec_youtube") || "https://youtube.com/@inprec",
    redeLinkedin: localStorage.getItem("inprec_linkedin") || "",
    mapEmbedUrl: localStorage.getItem("inprec_map_embed") || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31634.54!2d-63.0266!3d-9.3613!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93a9dd3e4b5f6c1b%3A0x8b2c7e1d6f3a4e5!2sCujubim%2C%20RO%2C%2076934-000!5e0!3m2!1spt-BR!2sbr!4v1710000000000!5m2!1spt-BR!2sbr",
    fontFamily: localStorage.getItem("inprec_font") || "Poppins",
    logoImageUrl: config.logoImageUrl || "",
    sloganImageUrl: config.sloganImageUrl || "",
    sloganImageVisivel: config.sloganImageVisivel !== false,
    sloganImageLocal: config.sloganImageLocal || "navbar,footer",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateConfig({
      ...form,
      logoImageUrl: form.logoImageUrl,
      sloganImageUrl: form.sloganImageUrl,
      sloganImageVisivel: form.sloganImageVisivel,
      sloganImageLocal: form.sloganImageLocal,
    });
    localStorage.setItem("inprec_contracheque_url", form.contrachequeUrl);
    localStorage.setItem("inprec_horario_seg", form.horarioSeg);
    localStorage.setItem("inprec_horario_sab", form.horarioSab);
    localStorage.setItem("inprec_horario_dom", form.horarioDom);
    localStorage.setItem("inprec_facebook", form.redeFacebook);
    localStorage.setItem("inprec_instagram", form.redeInstagram);
    localStorage.setItem("inprec_youtube", form.redeYoutube);
    localStorage.setItem("inprec_linkedin", form.redeLinkedin);
    localStorage.setItem("inprec_map_embed", form.mapEmbedUrl);
    localStorage.setItem("inprec_font", form.fontFamily);
    document.documentElement.style.setProperty("--font-heading", form.fontFamily);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const upd = (k: string, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formAny = form as Record<string, any>;

  type FieldDef = {
    key: string;
    label: string;
    placeholder?: string;
    hint?: string;
    type?: string;
  };

  const coresPresets = [
    { label: "Verde Gov", primary: "#16a34a", secondary: "#14532D" },
    { label: "Verde Esmeralda", primary: "#059669", secondary: "#064E3B" },
    { label: "Teal", primary: "#0891B2", secondary: "#164E63" },
    { label: "Laranja", primary: "#EA580C", secondary: "#7C2D12" },
    { label: "Vermelho", primary: "#DC2626", secondary: "#7F1D1D" },
    { label: "Rosa", primary: "#DB2777", secondary: "#831843" },
    { label: "Cinza Escuro", primary: "#374151", secondary: "#111827" },
    { label: "Âmbar", primary: "#D97706", secondary: "#78350F" },
  ];

  const fontes = [
    { value: "Poppins", label: "Poppins — Moderna e institucional" },
    { value: "Inter", label: "Inter — Limpa e legível" },
    { value: "Roboto", label: "Roboto — Clássica e neutra" },
    { value: "Montserrat", label: "Montserrat — Elegante e geométrica" },
    { value: "Raleway", label: "Raleway — Refinada e sofisticada" },
  ];

  const infoFields: FieldDef[] = [
    { key: "siteName", label: "Nome do Site", placeholder: "INPREC", hint: "Aparece no cabeçalho da navbar, aba do navegador e rodapé." },
    { key: "siteSlogan", label: "Slogan do Rodapé / Meta SEO", placeholder: "Instituto de Previdência Municipal", hint: "Texto de apoio exibido no footer e usado nas tags de SEO do site." },
    { key: "sloganLogo", label: "Slogan abaixo do nome na Navbar", placeholder: "Cuidando do Futuro de Quem Cuida da Cidade", hint: "Frase em itálico exibida embaixo de 'INPREC' no menu superior." },
    { key: "whatsapp", label: "WhatsApp (somente números)", placeholder: "5569390132xx", hint: "Número completo com DDI+DDD. Usado no botão flutuante, footer e página de Contato." },
    { key: "email", label: "E-mail de Contato", type: "email", placeholder: "inprec@cujubim.ro.gov.br", hint: "Aparece na página de Contato e no footer." },
    { key: "telefone", label: "Telefone Fixo", placeholder: "(69) 99250-9093", hint: "Exibido na página de Contato, Endereços e footer." },
    { key: "endereco", label: "Endereço Principal", placeholder: "Rua 31 de Março, s/n, Centro, Cujubim - RO", hint: "Exibido na página de Contato e no footer." },
    { key: "contrachequeUrl", label: "Link do Contracheque (URL externa)", placeholder: "https://contracheque.cujubim.ro.gov.br", hint: "Link de acesso rápido ao contracheque no menu, home e footer." },
  ];

  const redesFields: FieldDef[] = [
    { key: "redeFacebook", label: "Facebook", placeholder: "https://facebook.com/inprec", hint: "Link completo da página no Facebook. Ícone aparece no footer." },
    { key: "redeInstagram", label: "Instagram", placeholder: "https://instagram.com/inprec", hint: "Link do perfil no Instagram. Ícone aparece no footer." },
    { key: "redeYoutube", label: "YouTube", placeholder: "https://youtube.com/@inprec", hint: "Canal do YouTube. Ícone aparece no footer." },
    { key: "redeLinkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/inprec", hint: "Página do LinkedIn. Ícone aparece no footer." },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
        Configurações Gerais
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        Gerencie identidade visual, informações institucionais, contatos, horários e redes sociais do site.
      </p>

      {saved && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Configurações salvas com sucesso! As alterações já estão no site.
        </div>
      )}

      <div className="flex flex-col gap-6 max-w-2xl">

        {/* ── Logo & Slogan (Imagem) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <i className="ri-image-line" style={{ color: config.primaryColor }}></i>
            Logo & Slogan do INPREC
          </h2>
          <p className="text-xs text-gray-400 mb-5">
            Gerencie as imagens da logo e do slogan exibidas no site. Cole a URL ou use um link de imagem hospedada.
          </p>

          {/* Logo do Site */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <i className="ri-shield-line text-sm" style={{ color: config.primaryColor }}></i>
              Imagem da Logo
            </p>
            <div className="flex items-start gap-4 mb-3">
              <div
                className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center"
                style={{ backgroundColor: `${config.primaryColor}08` }}
              >
                {form.logoImageUrl && !logoPreviewError ? (
                  <img
                    src={form.logoImageUrl}
                    alt="Logo INPREC"
                    className="w-full h-full object-contain p-2"
                    onError={() => setLogoPreviewError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <i className="ri-shield-line text-3xl" style={{ color: config.primaryColor }}></i>
                    <span className="text-[9px] text-gray-400">Sem logo</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                {/* Input de arquivo oculto */}
                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFileChange}
                />
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Imagem da Logo</label>
                {/* Botões de upload / URL */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => logoFileRef.current?.click()}
                    disabled={logoUploading}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-gray-400 text-xs font-semibold text-gray-600 hover:text-gray-800"
                    style={{ borderColor: `${config.primaryColor}60`, backgroundColor: `${config.primaryColor}06` }}
                  >
                    {logoUploading ? (
                      <><i className="ri-loader-4-line animate-spin"></i> Carregando...</>
                    ) : (
                      <><i className="ri-upload-2-line text-sm" style={{ color: config.primaryColor }}></i> Escolher do computador</>
                    )}
                  </button>
                </div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Ou cole a URL:</label>
                <input
                  type="url"
                  value={form.logoImageUrl.startsWith("data:") ? "" : form.logoImageUrl}
                  onChange={(e) => { upd("logoImageUrl", e.target.value); setLogoPreviewError(false); }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  placeholder="https://site.com/logo.png"
                />
                {logoPreviewError && form.logoImageUrl && (
                  <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i> URL inválida ou imagem não carregou
                  </p>
                )}
                {form.logoImageUrl && !logoPreviewError && (
                  <p className="text-[11px] text-green-600 mt-1.5 flex items-center gap-1">
                    <i className="ri-checkbox-circle-line"></i> {form.logoImageUrl.startsWith("data:") ? "Imagem carregada do computador" : "Logo carregada com sucesso"}
                  </p>
                )}
                {form.logoImageUrl && (
                  <button
                    type="button"
                    onClick={() => { upd("logoImageUrl", ""); setLogoPreviewError(false); }}
                    className="mt-2 text-[11px] text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-1"
                  >
                    <i className="ri-delete-bin-line text-xs"></i> Remover logo
                  </button>
                )}
                <p className="text-[10px] text-gray-400 mt-1.5">
                  Formatos: PNG, JPG, WEBP. PNG com fundo transparente tem melhor aparência. Proporção quadrada recomendada.
                </p>
              </div>
            </div>
          </div>

          {/* Slogan (imagem) */}
          <div>
            <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <i className="ri-text-wrap text-sm" style={{ color: config.primaryColor }}></i>
              Imagem do Slogan
              <span className="text-[10px] font-normal text-gray-400 ml-1">
                (ex: "Cuidando do Futuro de Quem Cuida da Cidade")
              </span>
            </p>

            {/* Input de arquivo oculto para slogan */}
            <input
              ref={sloganFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSloganFileChange}
            />

            {/* Preview do slogan */}
            {form.sloganImageUrl && !sloganPreviewError ? (
              <div className="mb-4 p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center gap-3">
                <img
                  src={form.sloganImageUrl}
                  alt="Slogan INPREC"
                  className="max-h-24 w-auto object-contain"
                  onError={() => setSloganPreviewError(true)}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { upd("sloganImageUrl", ""); setSloganPreviewError(false); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    <i className="ri-delete-bin-line text-xs"></i> Excluir slogan
                  </button>
                  <button
                    type="button"
                    onClick={() => sloganFileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <i className="ri-upload-2-line text-xs"></i> Trocar imagem
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="mb-4 p-6 rounded-xl bg-gray-50 border-2 border-dashed cursor-pointer hover:bg-gray-100 transition-colors flex flex-col items-center gap-2 text-center"
                style={{ borderColor: `${config.primaryColor}50` }}
                onClick={() => sloganFileRef.current?.click()}
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}15` }}>
                  {sloganUploading ? (
                    <i className="ri-loader-4-line text-xl animate-spin" style={{ color: config.primaryColor }}></i>
                  ) : (
                    <i className="ri-upload-cloud-2-line text-xl" style={{ color: config.primaryColor }}></i>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-700">
                  {sloganUploading ? "Carregando imagem..." : "Clique aqui para escolher a imagem do seu computador"}
                </p>
                <p className="text-[11px] text-gray-400">PNG, JPG, WEBP • PNG transparente tem melhor aparência</p>
              </div>
            )}

            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Ou cole a URL da imagem:</label>
                <input
                  ref={sloganInputRef}
                  type="url"
                  value={form.sloganImageUrl.startsWith("data:") ? "" : form.sloganImageUrl}
                  onChange={(e) => { upd("sloganImageUrl", e.target.value); setSloganPreviewError(false); }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  placeholder="https://site.com/slogan.png"
                />
                {sloganPreviewError && form.sloganImageUrl && (
                  <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i> URL inválida — verifique o link
                  </p>
                )}
                {form.sloganImageUrl && !sloganPreviewError && (
                  <p className="text-[11px] text-green-600 mt-1.5 flex items-center gap-1">
                    <i className="ri-checkbox-circle-line"></i> {form.sloganImageUrl.startsWith("data:") ? "Imagem carregada do computador" : "Imagem carregada com sucesso"}
                  </p>
                )}
                <p className="text-[10px] text-gray-400 mt-1.5">
                  PNG com fundo transparente tem melhor aparência. Use o link direto da imagem hospedada (Google Drive, Imgur, etc.).
                </p>
              </div>
            </div>

            {/* Onde exibir */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-gray-700">Exibir slogan no site</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Ativa ou desativa a exibição da imagem do slogan</p>
                </div>
                <div
                  className="w-11 h-6 rounded-full relative transition-all cursor-pointer flex-shrink-0"
                  style={{ backgroundColor: form.sloganImageVisivel ? config.primaryColor : "#E5E7EB" }}
                  onClick={() => upd("sloganImageVisivel", !form.sloganImageVisivel)}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                    style={{ left: form.sloganImageVisivel ? "calc(100% - 22px)" : "2px" }}
                  ></div>
                </div>
              </div>

              {form.sloganImageVisivel && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Onde exibir a imagem do slogan:</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: "navbar", label: "Navbar (menu superior)", icon: "ri-menu-line" },
                      { value: "footer", label: "Rodapé (footer)", icon: "ri-layout-bottom-line" },
                      { value: "hero", label: "Hero / Banner principal", icon: "ri-slideshow-line" },
                    ].map((loc) => {
                      const locais = form.sloganImageLocal.split(",").filter(Boolean);
                      const ativo = locais.includes(loc.value);
                      return (
                        <div
                          key={loc.value}
                          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            const atual = form.sloganImageLocal.split(",").filter(Boolean);
                            const novo = ativo
                              ? atual.filter((l) => l !== loc.value)
                              : [...atual, loc.value];
                            upd("sloganImageLocal", novo.join(","));
                          }}
                        >
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                            style={ativo ? { backgroundColor: config.primaryColor } : { border: "1.5px solid #D1D5DB" }}
                          >
                            {ativo && <i className="ri-check-line text-white text-xs"></i>}
                          </div>
                          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                            <i className={`${loc.icon} text-sm text-gray-400`}></i>
                          </div>
                          <span className="text-sm text-gray-700">{loc.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Identidade Visual ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <i className="ri-palette-line" style={{ color: config.primaryColor }}></i>
            Identidade Visual
          </h2>
          <p className="text-xs text-gray-400 mb-5">Cores e tipografia aplicadas em todo o site.</p>

          {/* Paleta de cores rápida */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-gray-600 mb-3 block">Paleta de Cores</label>
            <div className="grid grid-cols-4 gap-2">
              {coresPresets.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => { upd("primaryColor", c.primary); upd("secondaryColor", c.secondary); updateConfig({ primaryColor: c.primary, secondaryColor: c.secondary }); }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all hover:border-gray-300"
                  style={form.primaryColor === c.primary ? { borderColor: c.primary, backgroundColor: `${c.primary}08` } : { borderColor: "#F3F4F6" }}
                >
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: c.primary }}></div>
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: c.secondary }}></div>
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cor personalizada */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Cor Principal</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => { upd("primaryColor", e.target.value); updateConfig({ primaryColor: e.target.value }); }}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 flex-shrink-0"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => { upd("primaryColor", e.target.value); updateConfig({ primaryColor: e.target.value }); }}
                  className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Cor Secundária</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => { upd("secondaryColor", e.target.value); updateConfig({ secondaryColor: e.target.value }); }}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 flex-shrink-0"
                />
                <input
                  type="text"
                  value={form.secondaryColor}
                  onChange={(e) => { upd("secondaryColor", e.target.value); updateConfig({ secondaryColor: e.target.value }); }}
                  className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Preview gradiente */}
          <div
            className="w-full h-12 rounded-xl mb-5 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${form.secondaryColor}, ${form.primaryColor})` }}
          >
            <span className="text-white text-xs font-semibold tracking-wide">Pré-visualização do gradiente</span>
          </div>

          {/* Tipografia */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Fonte Principal</label>
            <select
              value={form.fontFamily}
              onChange={(e) => upd("fontFamily", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none cursor-pointer"
            >
              {fontes.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: `'${f.value}', sans-serif` }}>
                  {f.label}
                </option>
              ))}
            </select>
            <div
              className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-100"
              style={{ fontFamily: `'${form.fontFamily}', sans-serif` }}
            >
              <p className="text-sm font-bold text-gray-800">INPREC — Instituto de Previdência Municipal</p>
              <p className="text-xs text-gray-400 mt-0.5">Cujubim, Rondônia • Fonte: {form.fontFamily}</p>
            </div>
          </div>
        </div>

        {/* ── Informações do Site ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <i className="ri-settings-3-line" style={{ color: config.primaryColor }}></i>
            Informações do Site
          </h2>
          <p className="text-xs text-gray-400 mb-4">Dados gerais do INPREC exibidos em toda a plataforma.</p>
          <div className="flex flex-col gap-4">
            {infoFields.map((f) => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-gray-600 mb-0.5 block">{f.label}</label>
                {f.hint && (
                  <p className="text-[11px] text-gray-400 mb-1.5 flex items-start gap-1">
                    <i className="ri-information-line mt-0.5 flex-shrink-0" style={{ color: config.primaryColor }}></i>
                    {f.hint}
                  </p>
                )}
                <input
                  type={f.type ?? "text"}
                  value={(form as unknown as Record<string, string>)[f.key] ?? ""}
                  onChange={(e) => upd(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none"
                />
              </div>
            ))}


          </div>
        </div>

        {/* ── Horários de Atendimento ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <i className="ri-time-line" style={{ color: config.primaryColor }}></i>
            Horários de Atendimento
          </h2>
          <p className="text-xs text-gray-400 mb-4">Aparece na página de Contato, Endereços e nos cards de atendimento.</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-0.5 block">Horário Principal (dias úteis)</label>
              <input
                value={form.horarioSeg}
                onChange={(e) => upd("horarioSeg", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none"
                placeholder="Segunda a Sexta: 07h30 às 13h30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-0.5 block">Sábado (deixe vazio se não atende)</label>
              <input
                value={form.horarioSab}
                onChange={(e) => upd("horarioSab", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none"
                placeholder="Ex: Sábado: 08h às 12h (ou deixe em branco)"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-0.5 block">Domingo (deixe vazio se não atende)</label>
              <input
                value={form.horarioDom}
                onChange={(e) => upd("horarioDom", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none"
                placeholder="Não atende aos domingos (ou deixe em branco)"
              />
            </div>
          </div>
        </div>

        {/* ── Barra Superior ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <i className="ri-layout-top-2-line" style={{ color: config.primaryColor }}></i>
            Barra Superior do Menu
          </h2>
          <p className="text-xs text-gray-400 mb-5">Controle o que aparece na faixa acima do menu principal.</p>
          <div className="flex flex-col gap-3">
            {[
              { key: "topbarVisivel", label: "Ativar barra superior", desc: "Exibe ou oculta toda a barra acima do menu" },
              { key: "topbarEmailVisivel", label: "Mostrar e-mail", desc: "Exibe o e-mail de contato na barra" },
              { key: "topbarTelefoneVisivel", label: "Mostrar telefone", desc: "Exibe o telefone na barra" },
              { key: "topbarRedesVisivel", label: "Mostrar redes sociais", desc: "Exibe os ícones das redes sociais cadastradas" },
              { key: "topbarMapaSiteVisivel", label: "Mostrar link 'Mapa do Site'", desc: "Exibe o botão de navegação para o mapa do site" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <div
                  className="w-11 h-6 rounded-full relative transition-all cursor-pointer flex-shrink-0"
                  style={{ backgroundColor: formAny[item.key] ? config.primaryColor : "#E5E7EB" }}
                  onClick={() => upd(item.key, !formAny[item.key])}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                    style={{ left: formAny[item.key] ? "calc(100% - 22px)" : "2px" }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Redes Sociais ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <i className="ri-share-line" style={{ color: config.primaryColor }}></i>
            Redes Sociais
          </h2>
          <p className="text-xs text-gray-400 mb-4">Links exibidos no footer e na página de Contato. Deixe em branco para ocultar o ícone.</p>
          <div className="flex flex-col gap-4">
            {redesFields.map((f) => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-gray-600 mb-0.5 block">{f.label}</label>
                {f.hint && (
                  <p className="text-[11px] text-gray-400 mb-1.5 flex items-start gap-1">
                    <i className="ri-information-line mt-0.5 flex-shrink-0" style={{ color: config.primaryColor }}></i>
                    {f.hint}
                  </p>
                )}
                <input
                  type="text"
                  value={(form as unknown as Record<string, string>)[f.key] ?? ""}
                  onChange={(e) => upd(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Mapa Embed ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <i className="ri-map-2-line" style={{ color: config.primaryColor }}></i>
            Mapa do Google Maps
          </h2>
          <p className="text-xs text-gray-400 mb-4">URL de incorporação do mapa exibido na página de Endereços.</p>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-0.5 block">URL de Incorporação (embed)</label>
            <p className="text-[11px] text-gray-400 mb-2 flex items-start gap-1">
              <i className="ri-information-line mt-0.5 flex-shrink-0" style={{ color: config.primaryColor }}></i>
              Para obter: acesse Google Maps, clique em Compartilhar → Incorporar um mapa → copie o link <em>src</em> do iframe.
            </p>
            <input
              type="text"
              value={form.mapEmbedUrl}
              onChange={(e) => upd("mapEmbedUrl", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none"
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
          </div>
          {form.mapEmbedUrl && (
            <div className="mt-3 w-full h-40 rounded-xl overflow-hidden border border-gray-100">
              <iframe
                src={form.mapEmbedUrl}
                title="Pré-visualização do mapa"
                className="w-full h-full"
                loading="lazy"
                style={{ border: 0 }}
              ></iframe>
            </div>
          )}
        </div>

        {/* ── Selo Pró-Gestão ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <i className="ri-medal-2-line" style={{ color: "#D97706" }}></i>
            Selo Pró-Gestão RPPS
          </h2>
          <p className="text-xs text-gray-400 mb-4">Aparece ao lado do nome INPREC no menu superior.</p>
          {/* Input de arquivo oculto para pró-gestão */}
          <input
            ref={progestaoFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProgestaoFileChange}
          />
          <div className="flex flex-col gap-4">
            {form.proGestaoSeloUrl && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                <img src={form.proGestaoSeloUrl} alt="Pré-visualização do selo" className="h-20 w-auto object-contain" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-700">Pré-visualização do Selo</p>
                  <p className="text-xs text-gray-400 mt-0.5 mb-2">Esta imagem aparecerá na navbar</p>
                  <button
                    type="button"
                    onClick={() => progestaoFileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    {progestaoUploading ? (
                      <><i className="ri-loader-4-line animate-spin text-xs"></i> Carregando...</>
                    ) : (
                      <><i className="ri-upload-2-line text-xs"></i> Trocar imagem do computador</>
                    )}
                  </button>
                </div>
              </div>
            )}
            {!form.proGestaoSeloUrl && (
              <div
                className="p-5 rounded-xl bg-gray-50 border-2 border-dashed cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-3"
                style={{ borderColor: "#D9770640" }}
                onClick={() => progestaoFileRef.current?.click()}
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: "#D9770615" }}>
                  {progestaoUploading ? (
                    <i className="ri-loader-4-line text-lg animate-spin text-amber-600"></i>
                  ) : (
                    <i className="ri-upload-cloud-2-line text-lg text-amber-600"></i>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Escolher imagem do computador</p>
                  <p className="text-[11px] text-gray-400">PNG, JPG, WEBP</p>
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-0.5 block">Ou cole a URL da Imagem do Selo</label>
              <input
                type="text"
                value={form.proGestaoSeloUrl.startsWith("data:") ? "" : form.proGestaoSeloUrl}
                onChange={(e) => upd("proGestaoSeloUrl", e.target.value)}
                placeholder="https://... (link da imagem do selo)"
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-0.5 block">Link ao Clicar no Selo</label>
              <input
                type="text"
                value={form.proGestaoLink}
                onChange={(e) => upd("proGestaoLink", e.target.value)}
                placeholder="/pro-gestao"
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none"
              />
            </div>
            <div
              className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50"
              onClick={() => upd("proGestaoVisivel", !form.proGestaoVisivel)}
            >
              <div
                className="w-11 h-6 rounded-full relative transition-all flex-shrink-0"
                style={{ backgroundColor: form.proGestaoVisivel ? config.primaryColor : "#E5E7EB" }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: form.proGestaoVisivel ? "calc(100% - 22px)" : "2px" }}
                ></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900">
                  {form.proGestaoVisivel ? "Selo visível no menu" : "Selo oculto"}
                </span>
                <p className="text-xs text-gray-400">
                  {form.proGestaoVisivel ? "O selo aparece ao lado de INPREC na navbar" : "O selo está oculto da navbar"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="py-3.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: config.primaryColor }}
        >
          {saved ? "Configurações salvas!" : "Salvar Todas as Configurações"}
        </button>
      </div>
    </div>
  );
}
