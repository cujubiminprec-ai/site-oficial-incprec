import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

interface SimulacaoResult {
  tipo: string;
  tempoFaltante: number;
  idadeFaltante: number;
  beneficioEstimado: number;
  percentual: number;
  dataAposentadoria: string;
  elegivel: boolean;
}

function calcularAposentadoria(dados: {
  sexo: string;
  idade: number;
  tempoContribuicao: number;
  salario: number;
  cargo: string;
}): SimulacaoResult {
  const { sexo, idade, tempoContribuicao, salario, cargo } = dados;
  const idadeMin = sexo === "M" ? 65 : 62;
  const contribuicaoMin = 25;

  const faltaIdade = Math.max(0, idadeMin - idade);
  const faltaContribuicao = Math.max(0, contribuicaoMin - tempoContribuicao);
  const faltaTotal = Math.max(faltaIdade, faltaContribuicao);

  const elegivel = faltaTotal === 0;
  const anoAtual = new Date().getFullYear();
  const anoAposentadoria = anoAtual + Math.ceil(faltaTotal);
  const dataAposentadoria = elegivel ? "Elegível agora" : `Estimativa: ${anoAposentadoria}`;

  const contribuicaoFinal = tempoContribuicao + faltaTotal;
  let percentual = Math.min(100, (contribuicaoFinal / contribuicaoMin) * 80);
  if (contribuicaoFinal >= contribuicaoMin && idade + faltaTotal >= idadeMin) {
    percentual = cargo === "efetivo" ? 100 : 92;
  }

  const beneficioEstimado = (salario * percentual) / 100;
  const tipo = contribuicaoFinal >= 35 && sexo === "M" ? "Integral (35 anos)" :
    contribuicaoFinal >= 30 && sexo === "F" ? "Integral (30 anos)" :
    "Proporcional";

  return {
    tipo,
    tempoFaltante: Math.ceil(faltaTotal),
    idadeFaltante: faltaIdade,
    beneficioEstimado,
    percentual,
    dataAposentadoria,
    elegivel,
  };
}

export default function SimuladorAposentadoria() {
  const { config } = useSiteConfig();
  const [form, setForm] = useState({
    sexo: "M",
    idade: 45,
    tempoContribuicao: 18,
    salario: 4500,
    cargo: "efetivo",
  });
  const [resultado, setResultado] = useState<SimulacaoResult | null>(null);
  const [calculando, setCalculando] = useState(false);

  const handleCalc = () => {
    setCalculando(true);
    setTimeout(() => {
      setResultado(calcularAposentadoria(form));
      setCalculando(false);
    }, 800);
  };

  const updateField = (key: string, value: string | number) => {
    setForm((p) => ({ ...p, [key]: value }));
    setResultado(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Form */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-36">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}15` }}>
              <i className="ri-calculator-line text-lg" style={{ color: config.primaryColor }}></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Simulador</h2>
              <p className="text-xs text-gray-400">Calcule sua aposentadoria</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Sexo */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Sexo</label>
              <div className="flex gap-2">
                {[{ v: "M", label: "Masculino" }, { v: "F", label: "Feminino" }].map((s) => (
                  <button
                    key={s.v}
                    onClick={() => updateField("sexo", s.v)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2 cursor-pointer transition-all"
                    style={form.sexo === s.v ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}10`, color: config.primaryColor } : { borderColor: "#E5E7EB", color: "#6B7280" }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cargo */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Tipo de Cargo</label>
              <select
                value={form.cargo}
                onChange={(e) => updateField("cargo", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="efetivo">Servidor Efetivo</option>
                <option value="comissionado">Cargo Comissionado</option>
                <option value="especial">Regime Especial</option>
              </select>
            </div>

            {/* Idade */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Sua Idade Atual: <span style={{ color: config.primaryColor }}>{form.idade} anos</span>
              </label>
              <input
                type="range" min={18} max={75} value={form.idade}
                onChange={(e) => updateField("idade", Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: config.primaryColor }}
              />
              <div className="flex justify-between text-xs text-gray-300 mt-1"><span>18</span><span>75</span></div>
            </div>

            {/* Tempo Contribuição */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Tempo de Contribuição: <span style={{ color: config.primaryColor }}>{form.tempoContribuicao} anos</span>
              </label>
              <input
                type="range" min={0} max={45} value={form.tempoContribuicao}
                onChange={(e) => updateField("tempoContribuicao", Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: config.primaryColor }}
              />
              <div className="flex justify-between text-xs text-gray-300 mt-1"><span>0</span><span>45</span></div>
            </div>

            {/* Salário */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Salário Bruto: <span style={{ color: config.primaryColor }}>R$ {form.salario.toLocaleString("pt-BR")}</span>
              </label>
              <input
                type="range" min={1320} max={25000} step={100} value={form.salario}
                onChange={(e) => updateField("salario", Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: config.primaryColor }}
              />
              <div className="flex justify-between text-xs text-gray-300 mt-1"><span>R$ 1.320</span><span>R$ 25.000</span></div>
            </div>

            <button
              onClick={handleCalc}
              disabled={calculando}
              className="mt-2 py-3.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: config.primaryColor }}
            >
              {calculando ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i> Calculando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-calculator-line"></i> Simular Aposentadoria
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Resultado */}
      <div className="lg:col-span-3">
        {!resultado ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl mb-4" style={{ backgroundColor: `${config.primaryColor}10` }}>
              <i className="ri-calculator-line text-3xl" style={{ color: config.primaryColor }}></i>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Preencha os dados ao lado</h3>
            <p className="text-sm text-gray-400 max-w-sm">Informe suas informações previdenciárias e clique em "Simular" para ver a estimativa da sua aposentadoria.</p>
            <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-sm">
              {[
                { icon: "ri-user-line", label: "Dados Pessoais" },
                { icon: "ri-time-line", label: "Tempo de Serviço" },
                { icon: "ri-money-dollar-circle-line", label: "Benefício Estimado" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50">
                    <i className={`${s.icon} text-gray-300 text-lg`}></i>
                  </div>
                  <span className="text-xs text-gray-300 text-center">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Status Card */}
            <div className="rounded-2xl p-6 text-white"
              style={{ background: resultado.elegivel ? `linear-gradient(135deg, #059669, #10B981)` : `linear-gradient(135deg, ${config.secondaryColor}, ${config.primaryColor})` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/20">
                    <i className={`${resultado.elegivel ? "ri-checkbox-circle-line" : "ri-time-line"} text-2xl text-white`}></i>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Status</p>
                    <p className="text-white font-bold text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {resultado.elegivel ? "Elegível para Aposentadoria!" : "Em Carência"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs">Previsão</p>
                  <p className="text-white font-bold text-sm">{resultado.dataAposentadoria}</p>
                </div>
              </div>
              {!resultado.elegivel && (
                <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                  <i className="ri-information-line text-white/80"></i>
                  <p className="text-white/80 text-sm">
                    Faltam ainda <strong>{resultado.tempoFaltante} {resultado.tempoFaltante === 1 ? "ano" : "anos"}</strong> para você se aposentar.
                  </p>
                </div>
              )}
            </div>

            {/* Cards de Resultado */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl mb-3" style={{ backgroundColor: `${config.primaryColor}15` }}>
                  <i className="ri-money-dollar-circle-line text-base" style={{ color: config.primaryColor }}></i>
                </div>
                <p className="text-xs text-gray-400 mb-1">Benefício Estimado</p>
                <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  R$ {resultado.beneficioEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-400 mt-1">{resultado.percentual.toFixed(0)}% do salário atual</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl mb-3" style={{ backgroundColor: "#059669" + "15" }}>
                  <i className="ri-award-line text-base text-green-600"></i>
                </div>
                <p className="text-xs text-gray-400 mb-1">Tipo de Aposentadoria</p>
                <p className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{resultado.tipo}</p>
                <p className="text-xs text-gray-400 mt-1">Regime Próprio</p>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900">Progresso para Aposentadoria</p>
                <span className="text-sm font-bold" style={{ color: config.primaryColor }}>{resultado.percentual.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${resultado.percentual}%`, backgroundColor: config.primaryColor }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>0%</span>
                <span>Mínimo 25 anos de contribuição</span>
                <span>100%</span>
              </div>
            </div>

            {/* Tabela Resumo */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Resumo Detalhado</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Idade Atual", value: `${form.idade} anos` },
                  { label: "Tempo de Contribuição", value: `${form.tempoContribuicao} anos` },
                  { label: "Salário Atual", value: `R$ ${form.salario.toLocaleString("pt-BR")}` },
                  { label: "Percentual do Benefício", value: `${resultado.percentual.toFixed(0)}%` },
                  { label: "Regime", value: "Regime Próprio de Previdência (RPPS)" },
                  { label: "Regra Aplicada", value: form.sexo === "M" ? "Masculino: 65 anos / 25 anos contribuição" : "Feminino: 62 anos / 25 anos contribuição" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
              <i className="ri-alert-line text-amber-500 mt-0.5 flex-shrink-0"></i>
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Aviso:</strong> Este simulador é apenas uma estimativa com fins informativos. O cálculo real do benefício deve ser realizado pelo setor de Previdência do INPREC, considerando todas as regras vigentes da legislação previdenciária municipal.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
