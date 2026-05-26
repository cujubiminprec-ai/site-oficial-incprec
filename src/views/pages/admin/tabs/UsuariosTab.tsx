import { useState, useMemo } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import SingleImageUploader from "@/components/base/SingleImageUploader";
import {
  UsuarioAdmin,
  PermissaoModulo,
  NivelAcesso,
  MODULOS_DISPONIVEIS,
  PERMISSOES_POR_NIVEL,
} from "@/mocks/usuarios-admin";

// ── Helpers ────────────────────────────────────────────────────────────────────
function gerarId(): string {
  return `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const NIVEL_LABELS: Record<NivelAcesso, { label: string; color: string; desc: string }> = {
  superadmin: { label: "Super Admin", color: "bg-red-50 text-red-600", desc: "Acesso total e irrestrito ao sistema" },
  admin: { label: "Administrador", color: "bg-amber-50 text-amber-700", desc: "Acesso amplo exceto usuários e configurações avançadas" },
  operador: { label: "Operador", color: "bg-green-50 text-green-700", desc: "Acesso apenas aos módulos definidos" },
};

const GRUPOS = [...new Set(MODULOS_DISPONIVEIS.map(m => m.grupo))];

// ── Formulário de Usuário ──────────────────────────────────────────────────────
interface FormProps {
  usuario: UsuarioAdmin;
  onSave: (u: UsuarioAdmin) => void;
  onClose: () => void;
  primaryColor: string;
  isMe: boolean;
}

function UsuarioForm({ usuario, onSave, onClose, primaryColor, isMe }: FormProps) {
  const isNew = !usuario.id || usuario.id === "";
  const [form, setForm] = useState<UsuarioAdmin>({ ...usuario });
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState(isNew ? "" : "••••••••");
  const [senhaErr, setSenhaErr] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "permissoes">("info");

  const upd = <K extends keyof UsuarioAdmin>(k: K, v: UsuarioAdmin[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleNivelChange = (nivel: NivelAcesso) => {
    setForm(p => ({
      ...p,
      nivelAcesso: nivel,
      permissoes: nivel === "superadmin" ? MODULOS_DISPONIVEIS.map(m => m.key) : PERMISSOES_POR_NIVEL[nivel],
    }));
  };

  const togglePermissao = (key: PermissaoModulo) => {
    if (form.nivelAcesso === "superadmin") return;
    setForm(p => ({
      ...p,
      permissoes: p.permissoes.includes(key)
        ? p.permissoes.filter(k => k !== key)
        : [...p.permissoes, key],
    }));
  };

  const toggleGrupo = (grupo: string) => {
    if (form.nivelAcesso === "superadmin") return;
    const grupoMods = MODULOS_DISPONIVEIS.filter(m => m.grupo === grupo).map(m => m.key);
    const todosAtivos = grupoMods.every(k => form.permissoes.includes(k));
    setForm(p => ({
      ...p,
      permissoes: todosAtivos
        ? p.permissoes.filter(k => !grupoMods.includes(k))
        : [...new Set([...p.permissoes, ...grupoMods])],
    }));
  };

  const handleSubmit = () => {
    if (!form.nome.trim() || !form.email.trim()) return;
    if (isNew && !form.senha.trim()) { setSenhaErr("A senha é obrigatória."); return; }
    if (isNew && form.senha !== confirmarSenha) { setSenhaErr("As senhas não coincidem."); return; }
    if (form.senha && !isNew && confirmarSenha !== "••••••••" && form.senha !== confirmarSenha) {
      setSenhaErr("As senhas não coincidem.");
      return;
    }
    setSenhaErr("");
    onSave(form);
  };

  const tabs = [
    { key: "info" as const, label: "Dados", icon: "ri-user-line" },
    { key: "permissoes" as const, label: "Permissões", icon: "ri-shield-check-line" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[94vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl"
              style={{ backgroundColor: `${primaryColor}15` }}>
              <i className="ri-user-settings-line text-base" style={{ color: primaryColor }}></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {isNew ? "Novo Usuário" : `Editar: ${usuario.nome}`}
              </h3>
              {!isNew && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${NIVEL_LABELS[form.nivelAcesso].color}`}>
                  {NIVEL_LABELS[form.nivelAcesso].label}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 bg-white border-b border-gray-100">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold cursor-pointer border-b-2 transition-all whitespace-nowrap -mb-px"
              style={activeTab === t.key
                ? { color: primaryColor, borderColor: primaryColor }
                : { color: "#9CA3AF", borderColor: "transparent" }}>
              <i className={`${t.icon} text-xs`}></i>{t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── ABA DADOS ── */}
          {activeTab === "info" && (
            <div className="flex flex-col gap-5">
              {/* Avatar */}
              <SingleImageUploader
                value={form.avatar}
                onChange={url => upd("avatar", url)}
                primaryColor={primaryColor}
                label="Foto do Usuário"
                hint="Opcional. Aparece no perfil do painel."
                previewShape="circle"
                previewSize="md"
                placeholder="https://... ou escolha do computador"
                uploadFolder="avatares"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome Completo *</label>
                  <input value={form.nome} onChange={e => upd("nome", e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    placeholder="Nome do usuário" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail *</label>
                  <input type="email" value={form.email} onChange={e => upd("email", e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    placeholder="usuario@inprec.net" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    {isNew ? "Senha *" : "Nova Senha (deixe em branco para manter)"}
                  </label>
                  <div className="relative">
                    <input
                      type={senhaVisivel ? "text" : "password"}
                      value={form.senha}
                      onChange={e => upd("senha", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none pr-10"
                      placeholder={isNew ? "Crie uma senha segura" : "••••••••"} />
                    <button type="button" onClick={() => setSenhaVisivel(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                      <i className={`${senhaVisivel ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Confirmar Senha</label>
                  <input
                    type={senhaVisivel ? "text" : "password"}
                    value={confirmarSenha}
                    onFocus={() => confirmarSenha === "••••••••" && setConfirmarSenha("")}
                    onChange={e => { setConfirmarSenha(e.target.value); setSenhaErr(""); }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    placeholder="Repita a senha" />
                </div>
              </div>
              {senhaErr && (
                <p className="text-xs text-red-500 flex items-center gap-1 -mt-3">
                  <i className="ri-error-warning-line"></i>{senhaErr}
                </p>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Descrição / Função</label>
                <input value={form.descricao || ""} onChange={e => upd("descricao", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  placeholder="Ex: Responsável pela ouvidoria e atendimento ao servidor" />
              </div>

              {/* Nível de acesso */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Nível de Acesso *</label>
                <div className="flex flex-col gap-2">
                  {(["operador", "admin", "superadmin"] as NivelAcesso[]).map(nivel => {
                    const info = NIVEL_LABELS[nivel];
                    const disabled = nivel === "superadmin" && isMe;
                    return (
                      <div key={nivel}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:border-gray-300"}`}
                        style={form.nivelAcesso === nivel
                          ? { borderColor: primaryColor, backgroundColor: `${primaryColor}06` }
                          : { borderColor: "#F3F4F6" }}
                        onClick={() => !disabled && handleNivelChange(nivel)}>
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                          style={form.nivelAcesso === nivel
                            ? { borderColor: primaryColor, backgroundColor: primaryColor }
                            : { borderColor: "#D1D5DB" }}>
                          {form.nivelAcesso === nivel && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-800">{info.label}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${info.color}`}>{info.label}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{info.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ativo */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 cursor-pointer"
                onClick={() => !isMe && upd("ativo", !form.ativo)}>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Usuário ativo</p>
                  <p className="text-xs text-gray-400">{form.ativo ? "Pode acessar o painel normalmente" : "Acesso bloqueado — não conseguirá fazer login"}</p>
                </div>
                <div className="w-11 h-6 rounded-full relative transition-all flex-shrink-0 ml-4"
                  style={{ backgroundColor: form.ativo ? primaryColor : "#E5E7EB" }}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                    style={{ left: form.ativo ? "calc(100% - 22px)" : "2px" }}></div>
                </div>
              </div>
            </div>
          )}

          {/* ── ABA PERMISSÕES ── */}
          {activeTab === "permissoes" && (
            <div className="flex flex-col gap-4">
              {form.nivelAcesso === "superadmin" ? (
                <div className="p-5 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3">
                  <i className="ri-shield-star-line text-2xl text-red-500"></i>
                  <div>
                    <p className="text-sm font-bold text-red-700">Super Admin — Acesso Total</p>
                    <p className="text-xs text-red-500 mt-0.5">Este usuário tem acesso irrestrito a todos os módulos do sistema. Não é possível restringir permissões individuais para Super Admins.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Permissões por Módulo</p>
                      <p className="text-xs text-gray-400">{form.permissoes.length} de {MODULOS_DISPONIVEIS.length} módulos liberados</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button"
                        onClick={() => setForm(p => ({ ...p, permissoes: MODULOS_DISPONIVEIS.map(m => m.key) }))}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">
                        Selecionar tudo
                      </button>
                      <button type="button"
                        onClick={() => setForm(p => ({ ...p, permissoes: ["dashboard"] }))}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">
                        Limpar
                      </button>
                    </div>
                  </div>

                  {/* Atalhos rápidos */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Perfis rápidos:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Ouvidoria / LAI", icon: "ri-speak-line", perms: ["dashboard", "ouvidoria-admin", "lai-admin"] as PermissaoModulo[] },
                        { label: "Atendimento", icon: "ri-customer-service-2-line", perms: ["dashboard", "contato-admin", "pesquisa-admin", "chat-admin", "ouvidoria-admin"] as PermissaoModulo[] },
                        { label: "Editor de Conteúdo", icon: "ri-edit-line", perms: ["dashboard", "noticias", "eventos", "cursos", "servicos", "faq"] as PermissaoModulo[] },
                        { label: "Comunicação Total", icon: "ri-megaphone-line", perms: ["dashboard", "noticias", "eventos", "cursos", "eventos-inscritos", "servicos", "faq", "banner", "slides"] as PermissaoModulo[] },
                      ].map(p => (
                        <button key={p.label} type="button"
                          onClick={() => setForm(f => ({ ...f, permissoes: p.perms }))}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all hover:border-gray-400"
                          style={{ borderColor: "#E5E7EB", color: "#374151" }}>
                          <i className={`${p.icon} text-xs`}></i>{p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Checkboxes por grupo */}
                  <div className="flex flex-col gap-4">
                    {GRUPOS.map(grupo => {
                      const mods = MODULOS_DISPONIVEIS.filter(m => m.grupo === grupo);
                      const todosAtivos = mods.every(m => form.permissoes.includes(m.key));
                      const algunsAtivos = mods.some(m => form.permissoes.includes(m.key));
                      return (
                        <div key={grupo} className="rounded-xl border border-gray-100 overflow-hidden">
                          <div
                            className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleGrupo(grupo)}>
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all ${todosAtivos ? "text-white" : algunsAtivos ? "text-white" : "border border-gray-300"}`}
                              style={todosAtivos ? { backgroundColor: primaryColor } : algunsAtivos ? { backgroundColor: `${primaryColor}80` } : {}}>
                              {(todosAtivos || algunsAtivos) && <i className="ri-check-line text-[10px]"></i>}
                            </div>
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{grupo}</span>
                            <span className="ml-auto text-[10px] text-gray-400">
                              {mods.filter(m => form.permissoes.includes(m.key)).length}/{mods.length}
                            </span>
                          </div>
                          <div className="divide-y divide-gray-50">
                            {mods.map(mod => {
                              const ativo = form.permissoes.includes(mod.key);
                              return (
                                <div key={mod.key}
                                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                  onClick={() => togglePermissao(mod.key)}>
                                  <div
                                    className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ${ativo ? "text-white" : "border border-gray-300"}`}
                                    style={ativo ? { backgroundColor: primaryColor } : {}}>
                                    {ativo && <i className="ri-check-line text-[9px]"></i>}
                                  </div>
                                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                                    <i className={`${mod.icon} text-sm`} style={{ color: ativo ? primaryColor : "#9CA3AF" }}></i>
                                  </div>
                                  <span className={`text-sm transition-colors ${ativo ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                                    {mod.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={handleSubmit}
            disabled={!form.nome.trim() || !form.email.trim()}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}>
            {isNew ? "Criar Usuário" : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Card de usuário na lista ───────────────────────────────────────────────────
interface CardProps {
  usuario: UsuarioAdmin;
  isMe: boolean;
  primaryColor: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

function UsuarioCard({ usuario, isMe, primaryColor, onEdit, onDelete, onToggle }: CardProps) {
  const info = NIVEL_LABELS[usuario.nivelAcesso];
  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${!usuario.ativo ? "opacity-60 border-dashed border-gray-200" : "border-gray-100"}`}>
      <div className="p-4 flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}>
          {usuario.avatar ? (
            <img src={usuario.avatar} alt={usuario.nome} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold" style={{ color: primaryColor }}>
              {usuario.nome.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${info.color}`}>
              {info.label}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${usuario.ativo ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
              {usuario.ativo ? "Ativo" : "Inativo"}
            </span>
            {isMe && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                Você
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-gray-900 truncate">{usuario.nome}</p>
          <p className="text-xs text-gray-400 truncate">{usuario.email}</p>
          {usuario.descricao && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{usuario.descricao}</p>
          )}
        </div>

        {/* Permissões count */}
        <div className="hidden sm:flex flex-col items-center px-4 border-l border-gray-100 flex-shrink-0">
          {usuario.nivelAcesso === "superadmin" ? (
            <>
              <i className="ri-shield-star-line text-xl text-red-400 mb-0.5"></i>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">Acesso total</span>
            </>
          ) : (
            <>
              <span className="text-lg font-bold text-gray-800">{usuario.permissoes.length}</span>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">módulos</span>
            </>
          )}
        </div>

        {/* Último acesso */}
        <div className="hidden lg:flex flex-col items-end flex-shrink-0">
          <span className="text-xs text-gray-400">Último acesso</span>
          <span className="text-xs font-medium text-gray-600">
            {usuario.ultimoAcesso
              ? new Date(usuario.ultimoAcesso + "T12:00:00").toLocaleDateString("pt-BR")
              : "Nunca"}
          </span>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isMe && (
            <button onClick={onToggle}
              className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${usuario.ativo ? "hover:bg-amber-50 text-amber-500" : "hover:bg-green-50 text-green-500"}`}
              title={usuario.ativo ? "Desativar usuário" : "Ativar usuário"}>
              <i className={`${usuario.ativo ? "ri-user-forbid-line" : "ri-user-follow-line"} text-sm`}></i>
            </button>
          )}
          <button onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
            title="Editar">
            <i className="ri-edit-line text-sm"></i>
          </button>
          {!isMe && usuario.nivelAcesso !== "superadmin" && (
            <button onClick={onDelete}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
              title="Excluir">
              <i className="ri-delete-bin-line text-sm"></i>
            </button>
          )}
        </div>
      </div>

      {/* Módulos autorizados */}
      {usuario.nivelAcesso !== "superadmin" && usuario.permissoes.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {usuario.permissoes.slice(0, 8).map(p => {
            const mod = MODULOS_DISPONIVEIS.find(m => m.key === p);
            if (!mod) return null;
            return (
              <span key={p} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full"
                style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                <i className={`${mod.icon} text-[9px]`}></i>{mod.label}
              </span>
            );
          })}
          {usuario.permissoes.length > 8 && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-400">
              +{usuario.permissoes.length - 8} mais
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────────────────────────
export default function UsuariosTab() {
  const { config } = useSiteConfig();
  const { usuarios, usuarioLogado, isSuperAdmin, criarUsuario, atualizarUsuario, removerUsuario } = useAdminAuth();
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroNivel, setFiltroNivel] = useState<"todos" | NivelAcesso>("todos");
  const [saved, setSaved] = useState(false);
  const [erro, setErro] = useState("");

  const marcarSalvo = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = async (u: UsuarioAdmin) => {
    const isNew = !u.id || u.id === "novo";
    setErro("");
    try {
      if (isNew) {
        await criarUsuario(u);
      } else {
        await atualizarUsuario(u);
      }
      marcarSalvo();
      setEditando(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar usuário.");
    }
  };

  const handleToggle = async (id: string) => {
    const usuario = usuarios.find((item) => item.id === id);
    if (!usuario) return;
    setErro("");
    try {
      await atualizarUsuario({ ...usuario, ativo: !usuario.ativo, senha: "" });
      marcarSalvo();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao atualizar status do usuário.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este usuário permanentemente? Ele perderá o acesso imediatamente.")) return;
    setErro("");
    try {
      await removerUsuario(id);
      marcarSalvo();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao remover usuÃ¡rio.");
    }
  };

  const filtrados = useMemo(() => {
    return usuarios.filter(u => {
      const nivelOk = filtroNivel === "todos" || u.nivelAcesso === filtroNivel;
      const buscaOk = !busca || u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase());
      return nivelOk && buscaOk;
    });
  }, [usuarios, filtroNivel, busca]);

  const blankUsuario: UsuarioAdmin = {
    id: "novo",
    nome: "", email: "", senha: "",
    nivelAcesso: "operador",
    permissoes: ["dashboard"],
    avatar: "", ativo: true,
    criadoEm: "", descricao: "",
  };

  const stats = [
    { label: "Total de Usuários", value: usuarios.length, icon: "ri-team-line", color: "#7C3AED" },
    { label: "Ativos", value: usuarios.filter(u => u.ativo).length, icon: "ri-user-follow-line", color: "#059669" },
    { label: "Operadores", value: usuarios.filter(u => u.nivelAcesso === "operador").length, icon: "ri-user-line", color: "#0891B2" },
    { label: "Admins", value: usuarios.filter(u => u.nivelAcesso !== "operador").length, icon: "ri-shield-check-line", color: "#D97706" },
  ];

  if (!isSuperAdmin()) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-red-50 mx-auto mb-4">
          <i className="ri-lock-line text-3xl text-red-400"></i>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Acesso Restrito</h2>
        <p className="text-sm text-gray-400 max-w-xs mx-auto">
          O gerenciamento de usuários é exclusivo para Super Administradores.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Gerenciar Usuários
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Crie e gerencie contas de acesso ao painel administrativo com permissões individuais.
          </p>
        </div>
        <button onClick={() => setEditando(blankUsuario)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90"
          style={{ backgroundColor: config.primaryColor }}>
          <i className="ri-add-line"></i> Novo Usuário
        </button>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Alterações salvas com sucesso!
        </div>
      )}
      {erro && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2">
          <i className="ri-error-warning-line"></i> {erro}
        </div>
      )}

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

      {/* Aviso de segurança */}
      <div className="mb-5 px-4 py-3.5 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i className="ri-shield-check-line text-amber-600 text-sm"></i>
        </div>
        <div>
          <p className="text-xs font-bold text-amber-800 mb-0.5">Segurança e Responsabilidade</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Cada usuário acessa apenas os módulos que você autorizar. Nunca compartilhe senhas. Desative usuários que não trabalham mais no INPREC imediatamente.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {([
            { key: "todos", label: "Todos" },
            { key: "superadmin", label: "Super Admin" },
            { key: "admin", label: "Admin" },
            { key: "operador", label: "Operador" },
          ] as { key: "todos" | NivelAcesso; label: string }[]).map(f => (
            <button key={f.key} onClick={() => setFiltroNivel(f.key)}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer whitespace-nowrap transition-all"
              style={filtroNivel === f.key
                ? { backgroundColor: config.primaryColor, color: "white", borderColor: config.primaryColor }
                : { borderColor: "#E5E7EB", color: "#6B7280" }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {filtrados.length === 0 && (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100">
            <i className="ri-user-search-line text-4xl text-gray-200"></i>
            <p className="text-gray-400 text-sm mt-3">Nenhum usuário encontrado.</p>
          </div>
        )}
        {filtrados.map(u => (
          <UsuarioCard
            key={u.id}
            usuario={u}
            isMe={u.id === usuarioLogado?.id}
            primaryColor={config.primaryColor}
            onEdit={() => setEditando(u)}
            onDelete={() => handleDelete(u.id)}
            onToggle={() => handleToggle(u.id)}
          />
        ))}
      </div>

      {editando && (
        <UsuarioForm
          usuario={editando}
          onSave={handleSave}
          onClose={() => setEditando(null)}
          primaryColor={config.primaryColor}
          isMe={editando.id === usuarioLogado?.id}
        />
      )}
    </div>
  );
}
