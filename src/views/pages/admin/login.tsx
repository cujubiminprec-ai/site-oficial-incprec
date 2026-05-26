import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export default function AdminLoginPage() {
  const { config } = useSiteConfig();
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showRecuperar, setShowRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);
  const [recuperacaoStatus, setRecuperacaoStatus] = useState<"idle" | "sucesso" | "erro">("idle");

  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecuperandoSenha(true);
    setRecuperacaoStatus("idle");
    try {
      // TODO: implementar endpoint de recuperação no backend
      setRecuperacaoStatus("sucesso");
    } catch {
      setRecuperacaoStatus("erro");
    } finally {
      setRecuperandoSenha(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const result = await login(email, senha);
    if (result.ok) {
      navigate("/admin/dashboard");
    } else {
      setErro(result.erro || "E-mail ou senha incorretos.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}>

      <Link to="/"
        className="absolute top-5 left-5 flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-white text-xs font-semibold hover:bg-white/25 transition-all cursor-pointer whitespace-nowrap">
        <i className="ri-arrow-left-line text-sm"></i>
        Voltar ao Início
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl mx-auto mb-4"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              <i className={`${config.logoIcon} text-white text-2xl`}></i>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {config.siteName}
          </h1>
          <p className="text-white/60 text-sm mt-1">Painel Administrativo</p>
        </div>

        <div className="bg-white rounded-2xl p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Entrar
          </h2>

          {erro && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2">
              <i className="ri-error-warning-line text-red-500 text-sm"></i>
              <p className="text-sm text-red-600">{erro}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-gray-300"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                  <i className={`${showPass ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: config.primaryColor }}>
              {loading ? "Entrando..." : "Entrar no Painel"}
            </button>

            <button
              type="button"
              onClick={() => { setShowRecuperar(true); setRecuperacaoStatus("idle"); setEmailRecuperar(""); }}
              className="text-xs text-center cursor-pointer hover:underline transition-all"
              style={{ color: config.primaryColor }}
            >
              Esqueci minha senha
            </button>
          </form>
        </div>
      </div>

      {showRecuperar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowRecuperar(false); }}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Recuperar Senha
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Informe o e-mail da sua conta
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRecuperar(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"
              >
                <i className="ri-close-line text-gray-500 text-sm"></i>
              </button>
            </div>

            {recuperacaoStatus === "sucesso" ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="w-14 h-14 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: `${config.primaryColor}15` }}>
                  <i className="ri-mail-check-line text-2xl" style={{ color: config.primaryColor }}></i>
                </div>
                <p className="text-sm font-semibold text-gray-800">Instruções enviadas!</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Se o e-mail <strong>{emailRecuperar}</strong> estiver cadastrado, você receberá as instruções de recuperação em breve.
                </p>
                <button
                  type="button"
                  onClick={() => setShowRecuperar(false)}
                  className="mt-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecuperarSenha} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail cadastrado</label>
                  <input
                    type="email"
                    value={emailRecuperar}
                    onChange={(e) => { setEmailRecuperar(e.target.value); setRecuperacaoStatus("idle"); }}
                    placeholder="seu@email.com"
                    required
                    className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-300"
                  />
                  {recuperacaoStatus === "erro" && (
                    <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>
                      E-mail não encontrado. Verifique e tente novamente.
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={recuperandoSenha}
                  className="py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {recuperandoSenha ? "Enviando..." : "Enviar instruções"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRecuperar(false)}
                  className="text-xs text-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}