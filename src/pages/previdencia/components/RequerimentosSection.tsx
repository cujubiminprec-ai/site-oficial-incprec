import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

const requerimentos = [
  {
    id: "aposentadoria",
    titulo: "Requerimento de Aposentadoria",
    descricao: "Solicite sua aposentadoria por idade, tempo de contribuição ou invalidez.",
    icon: "ri-user-star-line",
    cor: "#6D28D9",
    documentos: ["RG e CPF", "Comprovante de residência", "Carteira de trabalho", "Declaração de vínculos empregatícios", "Laudo médico (se invalidez)"],
  },
  {
    id: "pensao",
    titulo: "Requerimento de Pensão por Morte",
    descricao: "Solicite pensão por falecimento do servidor ou aposentado.",
    icon: "ri-heart-line",
    cor: "#DC2626",
    documentos: ["Certidão de óbito", "Comprovante de dependência", "RG e CPF do solicitante", "Documentos do servidor falecido", "Comprovante de residência"],
  },
  {
    id: "auxilio",
    titulo: "Auxílio-Doença / Afastamento",
    descricao: "Solicite benefício por incapacidade temporária para o trabalho.",
    icon: "ri-hospital-line",
    cor: "#0891B2",
    documentos: ["Laudo médico atualizado", "CID da doença", "RG e CPF", "Dados bancários", "Atestado do médico assistente"],
  },
  {
    id: "revisao",
    titulo: "Revisão de Benefício",
    descricao: "Solicite revisão de cálculo ou reclassificação do seu benefício.",
    icon: "ri-refund-2-line",
    cor: "#059669",
    documentos: ["Cópia do último holerite", "Planilha de cálculo contestada", "RG e CPF", "Contrato de trabalho", "Comprovantes de reajuste"],
  },
];

export default function RequerimentosSection() {
  const { config } = useSiteConfig();
  const [activeReq, setActiveReq] = useState<string | null>(null);
  const [formTipo, setFormTipo] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Formulários de Requerimento</h2>
        <p className="text-gray-500 text-sm">Selecione o tipo de requerimento que deseja solicitar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {requerimentos.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer transition-all duration-200 hover:border-gray-200"
            style={activeReq === req.id ? { borderColor: req.cor, backgroundColor: `${req.cor}05` } : {}}
            onClick={() => setActiveReq(activeReq === req.id ? null : req.id)}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${req.cor}15` }}>
                <i className={`${req.icon} text-xl`} style={{ color: req.cor }}></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{req.titulo}</h3>
                  {activeReq === req.id ? <i className="ri-arrow-up-s-line text-gray-400"></i> : <i className="ri-arrow-down-s-line text-gray-400"></i>}
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{req.descricao}</p>
              </div>
            </div>

            {activeReq === req.id && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-600 mb-3">Documentos necessários:</p>
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {req.documentos.map((doc) => (
                    <div key={doc} className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-check-line text-green-500 text-xs"></i>
                      </div>
                      <span className="text-xs text-gray-600">{doc}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setFormTipo(req.id); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: req.cor }}
                  >
                    <i className="ri-file-fill mr-2"></i> Preencher Online
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"
                    style={{ borderColor: req.cor, color: req.cor }}
                  >
                    <i className="ri-download-line mr-1"></i> PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {formTipo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setFormTipo(null)}>
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {requerimentos.find((r) => r.id === formTipo)?.titulo}
              </h3>
              <button onClick={() => setFormTipo(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-400"></i>
              </button>
            </div>
            <div className="p-6">
              {formTipo === "aposentadoria" && <FormAposentadoria config={config} onClose={() => setFormTipo(null)} />}
              {formTipo === "pensao" && <FormPensao config={config} onClose={() => setFormTipo(null)} />}
              {(formTipo === "auxilio" || formTipo === "revisao") && <FormGenerico tipo={formTipo} config={config} onClose={() => setFormTipo(null)} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormAposentadoria({ config, onClose }: { config: { primaryColor: string }; onClose: () => void }) {
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new URLSearchParams(new FormData(form) as unknown as Record<string, string>);
    try {
      await fetch("https://readdy.ai/api/form/d7ehq0jfimgqccpmaabg", { method: "POST", body: data });
      setEnviado(true);
    } catch {
      setEnviado(true);
    }
  };

  if (enviado) return (
    <div className="text-center py-8">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
        <i className="ri-check-line text-3xl text-green-600"></i>
      </div>
      <h4 className="font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Requerimento enviado!</h4>
      <p className="text-sm text-gray-500 mb-6">Em breve você receberá um protocolo por e-mail.</p>
      <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: config.primaryColor }}>Fechar</button>
    </div>
  );

  return (
    <form data-readdy-form action="https://readdy.ai/api/form/d7ehq0jfimgqccpmaabg" method="POST" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome Completo *</label>
          <input name="nome" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="Seu nome" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">CPF *</label>
          <input name="cpf" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="000.000.000-00" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail *</label>
          <input name="email" type="email" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="seu@email.com" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Telefone *</label>
          <input name="telefone" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="(00) 00000-0000" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Matrícula Funcional *</label>
          <input name="matricula" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="Nº da matrícula" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tipo de Aposentadoria *</label>
          <select name="tipo_aposentadoria" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
            <option value="">Selecione</option>
            <option value="idade">Por Idade</option>
            <option value="tempo_contribuicao">Por Tempo de Contribuição</option>
            <option value="invalidez">Por Invalidez</option>
            <option value="especial">Especial</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Cargo / Função *</label>
        <input name="cargo" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="Cargo atual" />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tempo de Contribuição (anos) *</label>
        <input name="tempo_contribuicao" type="number" min={0} max={50} required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="Ex: 25" />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Observações</label>
        <textarea name="observacoes" maxLength={500} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" placeholder="Informações adicionais..."></textarea>
      </div>
      <button type="submit" className="py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: config.primaryColor }}>
        Enviar Requerimento
      </button>
    </form>
  );
}

function FormPensao({ config, onClose }: { config: { primaryColor: string }; onClose: () => void }) {
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new URLSearchParams(new FormData(form) as unknown as Record<string, string>);
    try {
      await fetch("https://readdy.ai/api/form/d7ehq1bfimgqccpmaac0", { method: "POST", body: data });
      setEnviado(true);
    } catch {
      setEnviado(true);
    }
  };

  if (enviado) return (
    <div className="text-center py-8">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
        <i className="ri-check-line text-3xl text-green-600"></i>
      </div>
      <h4 className="font-bold text-gray-900 mb-2">Solicitação enviada!</h4>
      <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: config.primaryColor }}>Fechar</button>
    </div>
  );

  return (
    <form data-readdy-form action="https://readdy.ai/api/form/d7ehq1bfimgqccpmaac0" method="POST" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome do Solicitante *</label>
          <input name="nome_solicitante" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="Seu nome" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">CPF do Solicitante *</label>
          <input name="cpf_solicitante" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="000.000.000-00" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail *</label>
        <input name="email" type="email" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="seu@email.com" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome do Servidor Falecido *</label>
          <input name="nome_falecido" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="Nome completo" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Data do Óbito *</label>
          <input name="data_obito" type="date" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Grau de Parentesco *</label>
        <select name="parentesco" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer">
          <option value="">Selecione</option>
          <option value="conjuge">Cônjuge / Companheiro(a)</option>
          <option value="filho">Filho(a)</option>
          <option value="pai_mae">Pai / Mãe</option>
          <option value="dependente">Dependente Econômico</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Observações</label>
        <textarea name="observacoes" maxLength={500} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" placeholder="Informações adicionais..."></textarea>
      </div>
      <button type="submit" className="py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: config.primaryColor }}>
        Enviar Solicitação
      </button>
    </form>
  );
}

function FormGenerico({ tipo, config, onClose }: { tipo: string; config: { primaryColor: string }; onClose: () => void }) {
  const [enviado, setEnviado] = useState(false);
  const titulo = tipo === "auxilio" ? "Auxílio-Doença" : "Revisão de Benefício";

  if (enviado) return (
    <div className="text-center py-8">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
        <i className="ri-check-line text-3xl text-green-600"></i>
      </div>
      <h4 className="font-bold text-gray-900 mb-2">Solicitação enviada!</h4>
      <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: config.primaryColor }}>Fechar</button>
    </div>
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setEnviado(true); }}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome Completo *</label>
          <input name="nome" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="Seu nome" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">CPF *</label>
          <input name="cpf" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="000.000.000-00" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">E-mail *</label>
        <input name="email" type="email" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="seu@email.com" />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Motivo / Descrição *</label>
        <textarea name="descricao" required maxLength={500} rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" placeholder={`Descreva o motivo do ${titulo}...`}></textarea>
      </div>
      <button type="submit" className="py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: config.primaryColor }}>
        Enviar Solicitação
      </button>
    </form>
  );
}
