import { useState, useRef, useCallback } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const NIVEL_LABELS = {
  superadmin: { label: "Super Admin", color: "bg-red-50 text-red-600" },
  admin: { label: "Administrador", color: "bg-amber-50 text-amber-700" },
  operador: { label: "Operador", color: "bg-green-50 text-green-700" },
};

export default function PerfilTab() {
  const { config } = useSiteConfig();
  const { usuarioLogado, atualizarPerfil, alterarSenha } = useAdminAuth();

  const [nome, setNome] = useState(usuarioLogado?.nome || "");
  const [descricao, setDescricao] = useState(usuarioLogado?.descricao || "");
  const [avatar, setAvatar] = useState(usuarioLogado?.avatar || "");
  const [avatarPreviewErr, setAvatarPreviewErr] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenhas, setShowSenhas] = useState(false);

  const [savedDados, setSavedDados] = useState(false);
  const [savedSenha, setSavedSenha] = useState(false);
  const [erroDados, setErroDados] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [sucessoSenha, setSucessoSenha] = useState("");

  const readFileAsDataURL = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      setAvatar(dataUrl);
      setAvatarPreviewErr(false);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSalvarDados = async () => {
    if (!nome.trim()) { setErroDados("O nome não pode ficar vazio."); return; }
    setErroDados("");
    try {
      await atualizarPerfil({ nome: nome.trim(), descricao, avatar });
      setSavedDados(true);
      setTimeout(() => setSavedDados(false), 2500);
    } catch (err) {
      setErroDados(err instanceof Error ? err.message : "Erro ao salvar perfil.");
    }
  };

  const handleTrocarSenha = async () => {
    setErroSenha("");
    setSucessoSenha("");
    if (!senhaAtual) { setErroSenha("Informe sua senha atual."); return; }
    if (!novaSenha || novaSenha.length < 6) { setErroSenha("A nova senha deve ter pelo menos 6 caracteres."); return; }
    if (novaSenha !== confirmarSenha) { setErroSenha("A confirmação não coincide com a nova senha."); return; }
    try {
      await alterarSenha({ senhaAtual, novaSenha });
      setSucessoSenha("Senha alterada com sucesso!");
      setSavedSenha(true);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setTimeout(() => { setSavedSenha(false); setSucessoSenha(""); }, 3000);
    } catch (err) {
      setErroSenha(err instanceof Error ? err.message : "Erro ao alterar senha.");
    }
  };

  if (!usuarioLogado) return null;

  const nivel = NIVEL_LABELS[usuarioLogado.nivelAcesso];
  const iniciais = usuarioLogado.nome.charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Meu Perfil
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Gerencie seus dados pessoais e altere sua senha de acesso.
        </p>
      </div>

      {/* Card de identidade */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <div className="flex items-center gap-5 mb-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: `${config.primaryColor}20`, color: config.primaryColor }}
            >
              {avatar && !avatarPreviewErr ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarPreviewErr(true)}
                />
              ) : (
                iniciais
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full text-white text-xs cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: config.primaryColor }}
              title="Trocar foto"
            >
              {uploading
                ? <i className="ri-loader-4-line animate-spin text-xs"></i>
                : <i className="ri-camera-line text-xs"></i>
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <div>
            <p className="text-lg font-bold text-gray-900">{usuarioLogado.nome}</p>
            <p className="text-sm text-gray-400">{usuarioLogado.email}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${nivel.color}`}>
                {nivel.label}
              </span>
              <span className="text-xs text-gray-400">
                <i className="ri-calendar-line mr-1"></i>
                Desde {new Date(usuarioLogado.criadoEm + "T12:00:00").toLocaleDateString("pt-BR")}
              </span>
              {usuarioLogado.ultimoAcesso && (
                <span className="text-xs text-gray-400">
                  <i className="ri-time-line mr-1"></i>
                  Último acesso: {new Date(usuarioLogado.ultimoAcesso + "T12:00:00").toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Informações editáveis */}
        <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="ri-user-line text-sm" style={{ color: config.primaryColor }}></i>
          Dados do Perfil
        </h2>

        {erroDados && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
            <i className="ri-error-warning-line"></i> {erroDados}
          </div>
        )}

        {savedDados && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
            <i className="ri-check-line"></i> Dados atualizados com sucesso!
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome Completo</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-300"
              placeholder="Seu nome completo"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail</label>
            <input
              type="email"
              value={usuarioLogado.email}
              disabled
              className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
              <i className="ri-information-line" style={{ color: config.primaryColor }}></i>
              O e-mail só pode ser alterado pelo administrador do sistema.
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Foto do Perfil (URL)</label>
            <input
              type="url"
              value={avatar.startsWith("data:") ? "" : avatar}
              onChange={e => { setAvatar(e.target.value); setAvatarPreviewErr(false); }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
              placeholder="https://... ou use o botão da câmera acima"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Função / Descrição</label>
            <input
              type="text"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-300"
              placeholder="Ex: Responsável pelo atendimento da ouvidoria"
            />
          </div>
          <button
            onClick={handleSalvarDados}
            className="self-start px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ backgroundColor: config.primaryColor }}
          >
            {savedDados ? "Dados salvos!" : "Salvar Dados"}
          </button>
        </div>
      </div>

      {/* Trocar senha */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <i className="ri-lock-password-line text-sm" style={{ color: config.primaryColor }}></i>
              Alterar Senha
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Use uma senha forte com letras, números e símbolos.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowSenhas(v => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ color: config.primaryColor }}
          >
            <i className={showSenhas ? "ri-eye-off-line" : "ri-eye-line"}></i>
            {showSenhas ? "Ocultar" : "Mostrar"} campos
          </button>
        </div>

        {erroSenha && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
            <i className="ri-error-warning-line"></i> {erroSenha}
          </div>
        )}
        {sucessoSenha && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
            <i className="ri-shield-check-line"></i> {sucessoSenha}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Senha Atual</label>
            <input
              type={showSenhas ? "text" : "password"}
              value={senhaAtual}
              onChange={e => { setSenhaAtual(e.target.value); setErroSenha(""); }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-300"
              placeholder="Digite sua senha atual"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nova Senha</label>
              <input
                type={showSenhas ? "text" : "password"}
                value={novaSenha}
                onChange={e => { setNovaSenha(e.target.value); setErroSenha(""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-300"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Confirmar Nova Senha</label>
              <input
                type={showSenhas ? "text" : "password"}
                value={confirmarSenha}
                onChange={e => { setConfirmarSenha(e.target.value); setErroSenha(""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-300"
                placeholder="Repita a nova senha"
              />
            </div>
          </div>

          {/* Indicador de força da senha */}
          {novaSenha && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map(i => {
                    const forca = [novaSenha.length >= 6, /[A-Z]/.test(novaSenha), /[0-9]/.test(novaSenha), /[^a-zA-Z0-9]/.test(novaSenha)];
                    const ativos = forca.filter(Boolean).length;
                    return (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full transition-all"
                        style={{
                          backgroundColor: i <= ativos
                            ? ativos <= 1 ? "#EF4444" : ativos === 2 ? "#F59E0B" : ativos === 3 ? "#84CC16" : "#22C55E"
                            : "#E5E7EB"
                        }}
                      ></div>
                    );
                  })}
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {(() => {
                    const forca = [novaSenha.length >= 6, /[A-Z]/.test(novaSenha), /[0-9]/.test(novaSenha), /[^a-zA-Z0-9]/.test(novaSenha)];
                    const ativos = forca.filter(Boolean).length;
                    return ativos <= 1 ? "Fraca" : ativos === 2 ? "Média" : ativos === 3 ? "Boa" : "Forte";
                  })()}
                </span>
              </div>
              <p className="text-[10px] text-gray-400">
                Dica: use letras maiúsculas, números e símbolos para uma senha mais segura.
              </p>
            </div>
          )}

          <button
            onClick={handleTrocarSenha}
            disabled={savedSenha}
            className="self-start px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-60"
            style={{ backgroundColor: config.primaryColor }}
          >
            {savedSenha ? "Senha alterada!" : "Alterar Senha"}
          </button>
        </div>
      </div>

      {/* Informações do sistema */}
      <div className="mt-5 px-5 py-4 rounded-2xl border border-gray-100 bg-white">
        <h2 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
          <i className="ri-information-line" style={{ color: config.primaryColor }}></i>
          Informações do Sistema
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "ID do Usuário", value: usuarioLogado.id.slice(0, 12) + "..." },
            { label: "Conta criada em", value: new Date(usuarioLogado.criadoEm + "T12:00:00").toLocaleDateString("pt-BR") },
            { label: "Módulos autorizados", value: usuarioLogado.nivelAcesso === "superadmin" ? "Todos" : `${usuarioLogado.permissoes.length} módulos` },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-xl bg-gray-50">
              <p className="text-[10px] text-gray-400 mb-0.5">{item.label}</p>
              <p className="text-xs font-semibold text-gray-700 font-mono">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
