import { useEffect, useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { conteudoService } from "@/services/conteudo.service";

type FAQ = {
  id: number;
  categoria: string;
  pergunta: string;
  resposta: string;
  ativo?: boolean;
  ordem?: number;
};

const faqsDefault: FAQ[] = [
  { id: 1, categoria: "Geral", pergunta: "O que é o INPREC?", resposta: "O INPREC é um instituto público dedicado ao fortalecimento da gestão municipal, oferecendo capacitação de servidores, assessoria técnica e modernização administrativa para municípios.", ativo: true },
  { id: 2, categoria: "Geral", pergunta: "Quem pode utilizar os serviços do INPREC?", resposta: "Os serviços são destinados a municípios, servidores públicos e cidadãos. Cada serviço tem critérios específicos de acesso descritos na nossa seção de Serviços.", ativo: true },
  { id: 3, categoria: "Capacitação", pergunta: "Como me inscrever nos cursos de capacitação?", resposta: "As inscrições são realizadas pelo Portal do Servidor ou presencialmente na sede do INPREC. Fique atento às datas das turmas publicadas no site.", ativo: true },
  { id: 4, categoria: "Capacitação", pergunta: "Os cursos são gratuitos?", resposta: "Sim, todos os cursos e programas de capacitação oferecidos pelo INPREC para servidores municipais conveniados são gratuitos.", ativo: true },
  { id: 5, categoria: "Transparência", pergunta: "Como acesso os relatórios financeiros?", resposta: "Todos os relatórios financeiros estão disponíveis no Portal da Transparência, na seção Transparência do nosso site, sem necessidade de cadastro.", ativo: true },
  { id: 6, categoria: "Transparência", pergunta: "Como solicitar informações via LAI?", resposta: "Acesse o menu Transparência > LAI e preencha o formulário de Pedido de Informação. Você receberá resposta em até 20 dias úteis.", ativo: true },
  { id: 7, categoria: "Ouvidoria", pergunta: "Minha manifestação na Ouvidoria é sigilosa?", resposta: "Sim. Todas as manifestações são tratadas com total sigilo. Você também pode registrar anonimamente marcando a opção correspondente no formulário.", ativo: true },
  { id: 8, categoria: "Ouvidoria", pergunta: "Qual o prazo para receber resposta da Ouvidoria?", resposta: "O prazo legal é de até 20 dias úteis a partir do registro da manifestação. Em casos complexos, o prazo pode ser prorrogado mediante comunicação.", ativo: true },
  { id: 9, categoria: "Previdência", pergunta: "Como solicitar benefício previdenciário?", resposta: "Dirija-se à sede do INPREC com documentos pessoais, comprovante de tempo de serviço e formulário de requerimento. Também é possível agendar atendimento online.", ativo: true },
  { id: 10, categoria: "Previdência", pergunta: "Quais documentos são necessários para aposentadoria?", resposta: "São necessários: RG, CPF, comprovante de residência, contracheques dos últimos 3 meses, certidão de tempo de serviço e formulário de requerimento preenchido.", ativo: true },
];

const categoriasOpcoes = ["Geral", "Capacitação", "Transparência", "Ouvidoria", "Previdência", "Serviços", "LGPD"];

const STORAGE_KEY = "inprec_faq_admin";

function FAQFormModal({
  faq,
  onSave,
  onClose,
  primaryColor,
}: {
  faq: FAQ;
  onSave: (f: FAQ) => void;
  onClose: () => void;
  primaryColor: string;
}) {
  const [form, setForm] = useState<FAQ>({ ...faq });
  const isNew = faq.id === 0;
  const upd = (k: keyof FAQ, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {isNew ? "Nova Pergunta" : "Editar Pergunta"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Perguntas aparecem na página <strong>/perguntas-frequentes</strong>.
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Categoria + status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Categoria
                <span className="text-gray-400 font-normal ml-1">— Aba de filtro no FAQ</span>
              </label>
              <select
                value={form.categoria}
                onChange={(e) => upd("categoria", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
              >
                {categoriasOpcoes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Status
                <span className="text-gray-400 font-normal ml-1">— Visível = aparece no site</span>
              </label>
              <select
                value={form.ativo === false ? "inativo" : "ativo"}
                onChange={(e) => upd("ativo", e.target.value === "ativo")}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
              >
                <option value="ativo">Visível</option>
                <option value="inativo">Oculto</option>
              </select>
            </div>
          </div>

          {/* Pergunta */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Pergunta
              <span className="text-gray-400 font-normal ml-1">— Texto da dúvida exibido no acordeão</span>
            </label>
            <input
              value={form.pergunta}
              onChange={(e) => upd("pergunta", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              placeholder="Como faço para...?"
            />
          </div>

          {/* Resposta */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Resposta
              <span className="text-gray-400 font-normal ml-1">— Aparece ao clicar na pergunta (máx. 500 caracteres)</span>
            </label>
            <textarea
              value={form.resposta}
              onChange={(e) => upd("resposta", e.target.value)}
              rows={5}
              maxLength={500}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
              placeholder="Resposta clara e objetiva..."
            />
            <p className="text-xs text-gray-400 text-right">{form.resposta.length}/500</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(form)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {isNew ? "Adicionar Pergunta" : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQTab() {
  const { config } = useSiteConfig();
  const [lista, setLista] = useState<FAQ[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : faqsDefault;
    } catch {
      return faqsDefault;
    }
  });
  const [editando, setEditando] = useState<FAQ | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [saved, setSaved] = useState(false);
  const [dbStatus, setDbStatus] = useState<"carregando" | "online" | "fallback">("carregando");

  const persist = (updated: FAQ[]) => {
    setLista(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    conteudoService.salvarFaq(updated)
      .then((salvos) => {
        setDbStatus("online");
        if (Array.isArray(salvos) && salvos.length > 0) {
          setLista(salvos);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(salvos));
        }
      })
      .catch(() => setDbStatus("fallback"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  useEffect(() => {
    let alive = true;
    conteudoService.listarFaqAdmin()
      .then(async (remote) => {
        if (!alive) return;
        const localRaw = localStorage.getItem(STORAGE_KEY);
        if (localRaw && !localStorage.getItem("inprec_faq_sqlite_migrated")) {
          try {
            const local = JSON.parse(localRaw);
            if (Array.isArray(local) && local.length > 0) {
              const migrated = await conteudoService.salvarFaq(local);
              if (!alive) return;
              setLista(migrated);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
              localStorage.setItem("inprec_faq_sqlite_migrated", "true");
              setDbStatus("online");
              return;
            }
          } catch { /* segue com o banco */ }
        }
        if (Array.isArray(remote) && remote.length > 0) {
          setLista(remote);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
          localStorage.setItem("inprec_faq_sqlite_migrated", "true");
          setDbStatus("online");
          return;
        }
        const migrated = await conteudoService.salvarFaq(lista);
        if (!alive) return;
        setLista(migrated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        localStorage.setItem("inprec_faq_sqlite_migrated", "true");
        setDbStatus("online");
      })
      .catch(() => {
        if (alive) setDbStatus("fallback");
      });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = (id: number) =>
    persist(lista.map((f) => (f.id === id ? { ...f, ativo: f.ativo === false } : f)));

  const handleDelete = (id: number) => {
    if (!confirm("Excluir esta pergunta permanentemente?")) return;
    persist(lista.filter((f) => f.id !== id));
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...lista];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    persist(arr);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === lista.length - 1) return;
    const arr = [...lista];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    persist(arr);
  };

  const handleSave = (f: FAQ) => {
    if (f.id === 0) {
      const newId = Math.max(0, ...lista.map((x) => x.id)) + 1;
      persist([...lista, { ...f, id: newId }]);
    } else {
      persist(lista.map((x) => (x.id === f.id ? f : x)));
    }
    setEditando(null);
  };

  const blank: FAQ = {
    id: 0,
    categoria: "Geral",
    pergunta: "",
    resposta: "",
    ativo: true,
  };

  const todasCategorias = ["Todos", ...Array.from(new Set(lista.map((f) => f.categoria)))];
  const filtradas = lista.filter(
    (f) => filtroCategoria === "Todos" || f.categoria === filtroCategoria
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Perguntas Frequentes (FAQ)
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gerencie as perguntas e respostas exibidas na página <strong>/perguntas-frequentes</strong>.
          </p>
        </div>
        <button
          onClick={() => setEditando(blank)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90"
          style={{ backgroundColor: config.primaryColor }}
        >
          <i className="ri-add-line"></i> Nova Pergunta
        </button>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
          <i className="ri-check-line"></i> Salvo com sucesso!
        </div>
      )}

      <div className={`mb-4 px-4 py-3 rounded-xl border text-sm flex items-center gap-2 ${
        dbStatus === "online" ? "bg-green-50 border-green-100 text-green-700" :
        dbStatus === "carregando" ? "bg-blue-50 border-blue-100 text-blue-700" :
        "bg-amber-50 border-amber-100 text-amber-700"
      }`}>
        <i className={dbStatus === "online" ? "ri-database-2-line" : dbStatus === "carregando" ? "ri-loader-4-line animate-spin" : "ri-alert-line"}></i>
        {dbStatus === "online" ? "FAQ conectado ao SQLite." : dbStatus === "carregando" ? "Conectando FAQ ao SQLite..." : "API local indisponivel. O FAQ continua no navegador ate o backend ficar ativo."}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-5">
        {todasCategorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltroCategoria(cat)}
            className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all"
            style={
              filtroCategoria === cat
                ? { backgroundColor: config.primaryColor, color: "white" }
                : { backgroundColor: "#F3F4F6", color: "#6B7280" }
            }
          >
            {cat}
            {cat !== "Todos" && (
              <span className="ml-1 text-[10px] font-bold">
                {lista.filter((f) => f.categoria === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtradas.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
            Nenhuma pergunta encontrada.
          </div>
        )}
        {filtradas.map((f, idx) => {
          const realIdx = lista.indexOf(f);
          return (
            <div
              key={f.id}
              className={`bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-4 ${f.ativo === false ? "opacity-50" : ""}`}
            >
              {/* Número */}
              <div
                className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 mt-0.5 text-xs font-bold"
                style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}
              >
                {idx + 1}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}
                  >
                    {f.categoria}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${f.ativo === false ? "bg-gray-100 text-gray-400" : "bg-green-50 text-green-600"}`}
                  >
                    {f.ativo === false ? "Oculto" : "Visível"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{f.pergunta}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{f.resposta}</p>
              </div>

              {/* Ações */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <button onClick={() => handleMoveUp(realIdx)} disabled={realIdx === 0} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer disabled:opacity-30">
                  <i className="ri-arrow-up-s-line text-sm"></i>
                </button>
                <button onClick={() => handleMoveDown(realIdx)} disabled={realIdx === lista.length - 1} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer disabled:opacity-30">
                  <i className="ri-arrow-down-s-line text-sm"></i>
                </button>
                <button
                  onClick={() => handleToggle(f.id)}
                  title={f.ativo === false ? "Tornar visível" : "Ocultar do site"}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer ${f.ativo === false ? "hover:bg-green-50 text-green-500" : "hover:bg-amber-50 text-amber-500"}`}
                >
                  <i className={f.ativo === false ? "ri-eye-line text-xs" : "ri-eye-off-line text-xs"}></i>
                </button>
                <button
                  onClick={() => setEditando(f)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
                >
                  <i className="ri-edit-line text-xs"></i>
                </button>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
                >
                  <i className="ri-delete-bin-line text-xs"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editando && (
        <FAQFormModal
          faq={editando}
          onSave={handleSave}
          onClose={() => setEditando(null)}
          primaryColor={config.primaryColor}
        />
      )}
    </div>
  );
}
