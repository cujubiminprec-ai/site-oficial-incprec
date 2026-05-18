import { useState } from "react";

interface Props {
  onGenerate: (fields: MagicFields) => void;
  primaryColor: string;
  tipo: "noticia" | "evento" | "audiencia";
}

export interface MagicFields {
  titulo: string;
  resumo: string;
  conteudo: string;
  tags: string[];
  tempoLeitura: string;
}

const TEMPLATES: Record<string, { tituloBase: string; prefixos: string[]; tags: string[] }> = {
  noticia: {
    tituloBase: "notícia",
    prefixos: [
      "INPREC comunica: ",
      "INPREC informa: ",
      "Nota Oficial: ",
      "INPREC anuncia: ",
      "Aviso importante: ",
    ],
    tags: ["INPREC", "previdência", "comunicado"],
  },
  evento: {
    tituloBase: "evento",
    prefixos: [
      "Convite: ",
      "Evento INPREC: ",
      "Participe: ",
      "Atenção servidores: ",
    ],
    tags: ["evento", "INPREC", "servidores"],
  },
  audiencia: {
    tituloBase: "audiência pública",
    prefixos: [
      "Audiência Pública: ",
      "Convocação: ",
      "Aviso de Audiência: ",
    ],
    tags: ["audiência pública", "transparência", "INPREC"],
  },
};

// Templates de conteúdo baseados em palavras-chave detectadas no assunto
function gerarConteudo(assunto: string, tipo: string): MagicFields {
  const tpl = TEMPLATES[tipo] || TEMPLATES.noticia;
  const assuntoLower = assunto.toLowerCase();

  // Detectar contexto
  const isCapacitacao = /capacita|treinamento|curso|formação|palestra|workshop/.test(assuntoLower);
  const isEleicao = /eleição|votação|candidato|conselho|comitê/.test(assuntoLower);
  const isPrevidencia = /aposentadoria|pensão|benefício|previdência|rpps/.test(assuntoLower);
  const isPrazo = /prazo|recadastro|atualização|cadastro|data/.test(assuntoLower);
  const isFinancas = /financ|pagamento|contracheque|salário|demonstrativo/.test(assuntoLower);
  const isLgpd = /lgpd|dados pessoais|privacidade/.test(assuntoLower);
  const isReuniao = /reunião|sessão|assembleia|extraordinária/.test(assuntoLower);

  const prefixo = tpl.prefixos[Math.floor(Math.random() * tpl.prefixos.length)];
  const titulo = `${prefixo}${assunto.charAt(0).toUpperCase() + assunto.slice(1)}`;

  let resumo = "";
  let conteudo = "";
  let tags = [...tpl.tags];
  let tempoBase = 3;

  if (isCapacitacao) {
    resumo = `O INPREC convida todos os servidores municipais para participar de ${assunto}. As vagas são limitadas, por isso garanta já a sua inscrição.`;
    conteudo = `O Instituto de Previdência Municipal de Cujubim — INPREC, no uso de suas atribuições legais, torna público e comunica a todos os servidores municipais ativos e aposentados a realização de ${assunto}.

Esta iniciativa faz parte do compromisso do INPREC com a valorização e o desenvolvimento profissional dos servidores públicos municipais. O evento contará com conteúdo relevante, instrutores qualificados e certificação de participação.

Para participar, basta realizar sua inscrição através dos canais oficiais do INPREC. As inscrições são gratuitas e as vagas são preenchidas por ordem de chegada.

Para mais informações, entre em contato com o INPREC pelo telefone ou pelo e-mail institucional.`;
    tags = [...tags, "capacitação", "desenvolvimento", "servidores"];
    tempoBase = 3;
  } else if (isEleicao) {
    resumo = `O INPREC comunica informações importantes sobre ${assunto}. Confira todos os detalhes e participe deste momento democrático.`;
    conteudo = `O Instituto de Previdência Municipal de Cujubim — INPREC torna público as informações referentes a ${assunto}.

A participação dos servidores municipais é fundamental para garantir uma gestão previdenciária transparente, democrática e representativa. O INPREC reforça a importância do envolvimento de todos os segurados neste processo.

Todas as informações sobre datas, prazos, documentação necessária e regulamento estão disponíveis nos murais da sede do INPREC e no portal oficial.

O INPREC coloca-se à disposição para esclarecimentos pelo telefone ou pelo e-mail institucional.`;
    tags = [...tags, "eleição", "democracia", "participação"];
    tempoBase = 4;
  } else if (isPrevidencia) {
    resumo = `O INPREC esclarece informações importantes sobre ${assunto} para os segurados do regime próprio de previdência.`;
    conteudo = `O Instituto de Previdência Municipal de Cujubim — INPREC, responsável pela gestão do Regime Próprio de Previdência Social dos servidores municipais, presta os seguintes esclarecimentos sobre ${assunto}.

O INPREC está comprometido em garantir os direitos previdenciários de todos os servidores ativos, aposentados e pensionistas do município, conforme a legislação vigente, especialmente a EC nº 103/2019 e a Lei Municipal que rege o RPPS de Cujubim.

Para solicitar informações específicas, agendar atendimento ou obter mais detalhes, acesse o portal do servidor ou dirija-se pessoalmente à sede do INPREC no horário de atendimento.

O INPREC reafirma seu compromisso com a transparência e a qualidade no atendimento aos seus segurados.`;
    tags = [...tags, "previdência", "RPPS", "benefícios"];
    tempoBase = 4;
  } else if (isPrazo) {
    resumo = `Atenção! O INPREC comunica prazo importante sobre ${assunto}. Não perca o prazo e evite transtornos.`;
    conteudo = `O Instituto de Previdência Municipal de Cujubim — INPREC alerta todos os segurados sobre ${assunto}.

É de extrema importância que todos os servidores ativos, aposentados e pensionistas fiquem atentos ao prazo estabelecido. O não cumprimento dentro do prazo poderá acarretar suspensão de benefícios ou necessidade de regularização posterior.

Para realizar o procedimento, compareça à sede do INPREC munido dos documentos necessários, ou acesse o portal do servidor conforme orientação divulgada.

O INPREC reforça a importância do cumprimento dos prazos e coloca sua equipe à disposição para esclarecimentos.`;
    tags = [...tags, "prazo", "recadastro", "atenção"];
    tempoBase = 3;
  } else if (isFinancas) {
    resumo = `O INPREC informa sobre ${assunto} dos servidores e aposentados. Verifique suas informações no portal do servidor.`;
    conteudo = `O Instituto de Previdência Municipal de Cujubim — INPREC presta as seguintes informações sobre ${assunto}.

O INPREC trabalha continuamente para garantir a regularidade e a transparência em todas as suas operações financeiras, assegurando o correto repasse e processamento conforme a legislação aplicável.

Em caso de dúvidas ou divergências, os segurados deverão entrar em contato com o setor financeiro do INPREC pelos canais oficiais de atendimento.`;
    tags = [...tags, "finanças", "pagamento", "transparência"];
    tempoBase = 3;
  } else if (isLgpd) {
    resumo = `O INPREC informa sobre as políticas de proteção de dados relacionadas a ${assunto}, em conformidade com a LGPD.`;
    conteudo = `O Instituto de Previdência Municipal de Cujubim — INPREC, em atendimento à Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD), comunica as seguintes informações sobre ${assunto}.

O INPREC está comprometido com a proteção dos dados pessoais de todos os seus segurados, adotando as medidas técnicas e administrativas necessárias para garantir a segurança e a privacidade das informações tratadas pela instituição.

Para exercer seus direitos como titular de dados ou obter mais informações, entre em contato com o Encarregado de Dados (DPO) do INPREC pelos canais oficiais.`;
    tags = [...tags, "LGPD", "privacidade", "dados pessoais"];
    tempoBase = 4;
  } else if (isReuniao) {
    resumo = `O INPREC convoca para ${assunto}. A participação é importante para a gestão transparente do instituto.`;
    conteudo = `O Instituto de Previdência Municipal de Cujubim — INPREC, por meio de sua diretoria, convoca os interessados para ${assunto}.

A pauta, horário e local serão divulgados nos canais oficiais com antecedência mínima exigida pelo regimento interno. Todos os documentos pertinentes estarão disponíveis para consulta prévia na sede do INPREC.

O INPREC reafirma seu compromisso com a gestão democrática e participativa, incentivando o engajamento de todos os segurados e representantes.`;
    tags = [...tags, "reunião", "transparência", "gestão"];
    tempoBase = 3;
  } else {
    resumo = `O INPREC comunica informações sobre ${assunto}. Para mais detalhes, entre em contato com o instituto pelos canais oficiais.`;
    conteudo = `O Instituto de Previdência Municipal de Cujubim — INPREC torna público as informações referentes a ${assunto}.

O INPREC tem como missão garantir a proteção previdenciária dos servidores públicos municipais com eficiência, transparência e responsabilidade. Todas as ações institucionais visam assegurar os direitos e o bem-estar dos segurados do município de Cujubim - RO.

Para mais informações, esclarecimentos ou agendamento de atendimento, entre em contato pelo telefone, e-mail ou compareça pessoalmente à sede do INPREC no horário de funcionamento.`;
    tags = [...tags];
    tempoBase = 3;
  }

  const wordCount = conteudo.split(/\s+/).length;
  const minutos = Math.max(2, Math.ceil(wordCount / 200)) || tempoBase;
  const tempoLeitura = `${minutos} min`;

  return { titulo, resumo, conteudo, tags: [...new Set(tags)], tempoLeitura };
}

export default function TextoMagico({ onGenerate, primaryColor, tipo }: Props) {
  const [assunto, setAssunto] = useState("");
  const [gerando, setGerando] = useState(false);
  const [gerado, setGerado] = useState(false);

  const handleGerar = () => {
    if (!assunto.trim()) return;
    setGerando(true);
    // Simula tempo de processamento para UX
    setTimeout(() => {
      const fields = gerarConteudo(assunto.trim(), tipo);
      onGenerate(fields);
      setGerando(false);
      setGerado(true);
      setTimeout(() => setGerado(false), 3000);
    }, 800);
  };

  const tipoLabel = tipo === "noticia" ? "notícia" : tipo === "evento" ? "evento" : "audiência";

  return (
    <div
      className="rounded-xl border-2 p-4"
      style={{ borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}05` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${primaryColor}20` }}>
          <i className="ri-magic-line text-sm" style={{ color: primaryColor }}></i>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">Texto Mágico</p>
          <p className="text-[10px] text-gray-400">Preenche automaticamente título, resumo e conteúdo</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleGerar())}
          placeholder={`Descreva o assunto da ${tipoLabel} em poucas palavras...`}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
        />
        <button
          type="button"
          onClick={handleGerar}
          disabled={!assunto.trim() || gerando}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-50 whitespace-nowrap transition-all"
          style={{ backgroundColor: primaryColor }}
        >
          {gerando ? (
            <><i className="ri-loader-4-line animate-spin text-xs"></i> Gerando...</>
          ) : gerado ? (
            <><i className="ri-check-line text-xs"></i> Preenchido!</>
          ) : (
            <><i className="ri-magic-line text-xs"></i> Gerar</>
          )}
        </button>
      </div>

      <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
        <i className="ri-lightbulb-line" style={{ color: primaryColor }}></i>
        Exemplos: &quot;recadastramento 2026&quot;, &quot;capacitação previdência&quot;, &quot;eleição conselho deliberativo&quot;
      </p>

      {gerado && (
        <p className="text-[11px] font-semibold mt-2 flex items-center gap-1" style={{ color: primaryColor }}>
          <i className="ri-checkbox-circle-line"></i>
          Campos preenchidos automaticamente! Revise e ajuste conforme necessário.
        </p>
      )}
    </div>
  );
}
