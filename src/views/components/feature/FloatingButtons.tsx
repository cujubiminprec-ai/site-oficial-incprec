import { useState, useRef, useEffect } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { floatingButtonsDefault, FloatingButtonConfig } from "@/mocks/floating-buttons";
import { configuracoesService } from "@/services/configuracoes.service";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface Message {
  from: "user" | "bot";
  text: string;
  options?: string[];
}

const FAQ_TREE: { keywords: string[]; answer: string; followup?: string[] }[] = [
  {
    keywords: ["aposentadoria", "aposentar", "tempo de contribuição"],
    answer: "Para solicitar **aposentadoria**, você precisará de:\n• RG, CPF, certidão de nascimento/casamento\n• Comprovante de tempo de serviço\n• Formulário de requerimento preenchido\n\nAcesse nossa página de Previdência ou compareça presencialmente.",
    followup: ["Documentos necessários", "Simulador de aposentadoria", "Horário de atendimento"],
  },
  {
    keywords: ["pensão", "pensão por morte", "dependente", "óbito"],
    answer: "Para **pensão por morte**, o dependente deve apresentar:\n• Certidão de óbito do servidor\n• Documentos pessoais do dependente\n• Comprovante de dependência\n• Formulário específico do INPREC\n\nPrazo de análise: até 30 dias.",
    followup: ["Horário de atendimento", "Contato INPREC"],
  },
  {
    keywords: ["auxílio", "auxílio-doença", "licença médica", "afastamento"],
    answer: "O **auxílio-doença** é concedido quando o servidor está incapaz temporariamente. Documentos:\n• Atestado médico com CID\n• Laudos e exames\n• Formulário de requerimento\n\nApós 15 dias, o INPREC assume o pagamento.",
    followup: ["Documentos necessários", "Contato"],
  },
  {
    keywords: ["contribuição", "alíquota", "desconto"],
    answer: "A **alíquota de contribuição** varia conforme a legislação vigente. O desconto aparece no contracheque como \"INPREC\".\n\nPara saber sua alíquota exata, consulte seu contracheque ou entre em contato.",
    followup: ["Contato", "Simulador"],
  },
  {
    keywords: ["simulador", "simular", "calcular", "quando me aposento"],
    answer: "Temos um **simulador de aposentadoria** disponível!\n\nAcesse: Menu → Serviços → Previdência → Simulador\n\nOs valores são estimativas baseadas nas regras do RPPS.",
    followup: ["Documentos necessários", "Contato"],
  },
  {
    keywords: ["horário", "atendimento", "funcionamento", "aberto"],
    answer: "Nosso **horário de atendimento** é:\n\n📅 Segunda a Sexta-feira\n⏰ Das 07h30 às 13h30\n\nAtendimento presencial na sede do INPREC.",
    followup: ["Endereço", "Telefone e WhatsApp"],
  },
  {
    keywords: ["endereço", "onde fica", "sede", "localização"],
    answer: "A **sede do INPREC** está localizada em:\n\n📍 Avenida Condor, Nº 2588\nCentro – Cujubim/RO\nCEP: 76.864-000",
    followup: ["Horário de atendimento", "Telefone e WhatsApp"],
  },
  {
    keywords: ["telefone", "ligar", "whatsapp", "contato", "email"],
    answer: "Entre em contato:\n\n📞 Telefone/Whatsapp: (69) 99250-9093\n📧 E-mail: inprec@cujubim.ro.gov.br\n\nAtendimento: Segunda a Sexta — 07h30 às 13h30.",
    followup: ["Horário de atendimento", "Endereço"],
  },
  {
    keywords: ["ouvidoria", "reclamação", "denúncia", "sugestão"],
    answer: "Nossa **Ouvidoria** está disponível para reclamações, sugestões, elogios e denúncias.\n\nAcesse: Menu → Participação → Ouvidoria\n\nRespondemos em até 20 dias úteis.",
    followup: ["Horário de atendimento", "Contato"],
  },
];

function getBotResponse(input: string): { answer: string; options?: string[] } {
  const lower = input.toLowerCase();
  for (const item of FAQ_TREE) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return { answer: item.answer, options: item.followup };
    }
  }
  return {
    answer: "Não encontrei uma resposta específica. Para atendimento personalizado:\n\n📞 (69) 99250-9093\n📧 inprec@cujubim.ro.gov.br\n\nOu visite a seção de Perguntas Frequentes.",
    options: ["Horário de atendimento", "Endereço", "Ouvidoria"],
  };
}

function parseMarkdown(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
}

const QUICK_OPTIONS = ["Aposentadoria", "Pensão por morte", "Auxílio-doença", "Horário de atendimento", "Documentos necessários"];

function ChatWidget({ onClose, primaryColor }: { onClose: () => void; primaryColor: string }) {
  const [messages, setMessages] = useState<Message[]>([{
    from: "bot",
    text: "Olá! 👋 Sou o assistente virtual do **INPREC**.\n\nPosso te ajudar com informações sobre previdência, aposentadoria, pensões, documentos e muito mais.\n\nO que você precisa saber?",
    options: QUICK_OPTIONS,
  }]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setInputText("");
    setMessages((prev) => [...prev, { from: "user", text: text.trim() }]);
    setIsTyping(true);
    setTimeout(() => {
      const response = getBotResponse(text);
      setIsTyping(false);
      setMessages((prev) => [...prev, { from: "bot", text: response.answer, options: response.options }]);
    }, 900);
  };

  return (
    <div className="w-[320px] sm:w-[340px] bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden"
      style={{ height: "480px", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}>
      <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}>
        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20">
          <i className="ri-robot-2-line text-white text-lg"></i>
        </div>
        <div className="flex-1">
          <p className="text-white text-sm font-bold leading-tight">Assistente INPREC</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
            <p className="text-white/75 text-xs">Online</p>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 cursor-pointer">
          <i className="ri-close-line text-white text-sm"></i>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.from === "user" ? "items-end" : "items-start"}`}>
            {msg.from === "bot" && (
              <div className="flex items-end gap-2 max-w-[88%]">
                <div className="w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 mb-0.5" style={{ backgroundColor: primaryColor }}>
                  <i className="ri-robot-2-line text-white text-xs"></i>
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2.5 text-xs text-gray-700 leading-relaxed border border-gray-100"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }} />
              </div>
            )}
            {msg.from === "user" && (
              <div className="max-w-[80%] text-white rounded-2xl rounded-tr-none px-3 py-2.5 text-xs leading-relaxed"
                style={{ backgroundColor: primaryColor }}>{msg.text}</div>
            )}
            {msg.from === "bot" && msg.options && i === messages.length - 1 && (
              <div className="flex flex-wrap gap-1.5 mt-2 ml-8">
                {msg.options.map((opt) => (
                  <button key={opt} onClick={() => sendMessage(opt)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-gray-400 transition-all cursor-pointer whitespace-nowrap">
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 flex items-center justify-center rounded-full" style={{ backgroundColor: primaryColor }}>
              <i className="ri-robot-2-line text-white text-xs"></i>
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-3 py-3 border border-gray-100">
              <div className="flex items-center gap-1">
                {[0, 150, 300].map((delay) => (
                  <span key={delay} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}></span>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-3 py-3 border-t border-gray-100 bg-white flex items-center gap-2 flex-shrink-0">
        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
          placeholder="Pergunte sobre previdência..."
          className="flex-1 text-xs bg-gray-50 rounded-full px-4 py-2.5 focus:outline-none border border-gray-200 focus:border-gray-300 focus:bg-white transition-all" />
        <button onClick={() => sendMessage(inputText)}
          className="w-9 h-9 flex items-center justify-center rounded-full text-white cursor-pointer hover:scale-105 transition-all flex-shrink-0"
          style={{ backgroundColor: primaryColor }}>
          <i className="ri-send-plane-fill text-sm"></i>
        </button>
      </div>
    </div>
  );
}

function AccessibilityButton({ btn, baseClass }: { btn: FloatingButtonConfig; baseClass: string }) {
  const [open, setOpen] = useState(false);
  const { increaseFontSize, decreaseFontSize, resetFontSize, toggleHighContrast, highContrast } = useAccessibility();

  return (
    <div className="relative">
      {open && (
        <div className={`absolute bottom-full mb-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-2xl flex flex-col gap-2 min-w-[140px] z-50 ${btn.lado === "esquerdo" ? "left-0" : "right-0"}`}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Acessibilidade</p>
          <div className="flex items-center gap-2">
            <button onClick={decreaseFontSize} className="flex-1 h-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 cursor-pointer">A-</button>
            <button onClick={resetFontSize} className="flex-1 h-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 cursor-pointer font-bold text-[10px]">A</button>
            <button onClick={increaseFontSize} className="flex-1 h-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 cursor-pointer text-sm">A+</button>
          </div>
          <button 
            onClick={toggleHighContrast}
            className={`w-full py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              highContrast ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <i className="ri-contrast-2-line"></i>
            CONTRASTE
          </button>
        </div>
      )}
      <button 
        onClick={() => setOpen(!open)}
        title={btn.label}
        className={`${baseClass} rounded-xl shadow-lg relative`}
        style={{ backgroundColor: btn.cor, width: "48px", height: "48px" }}>
        <i className={`${open ? "ri-close-line" : btn.icone} text-white text-xl`}></i>
      </button>
    </div>
  );
}

function renderButton(btn: FloatingButtonConfig, whatsapp: string, chatOpen: boolean, setChatOpen: (v: boolean) => void) {
  const baseClass = "flex items-center justify-center transition-transform duration-200 hover:scale-110 cursor-pointer";

  if (btn.tipo === "chat") {
    return (
      <div key={btn.id} className="relative">
        <button onClick={() => setChatOpen(!chatOpen)} title={btn.label}
          className={`${baseClass} rounded-full shadow-lg`}
          style={{ backgroundColor: btn.cor, width: "52px", height: "52px" }}>
          <i className={`${chatOpen ? "ri-close-line" : btn.icone} text-white text-xl`}></i>
        </button>
        {!chatOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white animate-pulse"></span>
        )}
      </div>
    );
  }

  if (btn.tipo === "whatsapp") {
    return (
      <a key={btn.id} href={`https://wa.me/${whatsapp}`} target="_blank"
        rel="nofollow noopener noreferrer" title={btn.label}
        className={`${baseClass} rounded-full shadow-lg relative`}
        style={{ backgroundColor: btn.cor, width: "56px", height: "56px" }}>
        <i className={`${btn.icone} text-white text-2xl`}></i>
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white animate-pulse"></span>
      </a>
    );
  }

  if (btn.tipo === "accessibility") {
    return <AccessibilityButton key={btn.id} btn={btn} baseClass={baseClass} />;
  }

  // contracheque, phone, link
  const href = btn.url || "#";
  const isExternal = href.startsWith("http") || href.startsWith("tel:");

  if (btn.mostrarLabel) {
    return (
      <a key={btn.id} href={href} target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "nofollow noopener noreferrer" : undefined}
        title={btn.label}
        className={`${baseClass} gap-2 px-3 py-2.5 rounded-xl shadow-lg text-white text-xs font-semibold whitespace-nowrap`}
        style={{ backgroundColor: btn.cor }}>
        <i className={`${btn.icone} text-sm`}></i>
        <span>{btn.label}</span>
      </a>
    );
  }

  return (
    <a key={btn.id} href={href} target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "nofollow noopener noreferrer" : undefined}
      title={btn.label}
      className={`${baseClass} rounded-xl shadow-lg`}
      style={{ backgroundColor: btn.cor, width: "48px", height: "48px" }}>
      <i className={`${btn.icone} text-white text-xl`}></i>
    </a>
  );
}

export default function FloatingButtons() {
  const [chatOpen, setChatOpen] = useState(false);
  const { config } = useSiteConfig();
  const [buttons, setButtons] = useState<FloatingButtonConfig[]>(floatingButtonsDefault);

  useEffect(() => {
    let ativo = true;
    const handleUpdate = () => {
      configuracoesService.obterFloatingButtons()
        .then((dados) => {
          if (ativo && dados.length > 0) setButtons(dados.sort((a, b) => a.ordem - b.ordem));
          else if (ativo) setButtons(floatingButtonsDefault);
        })
        .catch(() => {
          if (ativo) setButtons(floatingButtonsDefault);
        });
    };
    handleUpdate();
    window.addEventListener("inprec-floating-buttons-updated", handleUpdate);
    return () => {
      ativo = false;
      window.removeEventListener("inprec-floating-buttons-updated", handleUpdate);
    };
  }, []);

  const ativos = buttons.filter((b) => b.ativo);
  const esquerdo = ativos.filter((b) => b.lado === "esquerdo").sort((a, b) => a.ordem - b.ordem);
  const direito = ativos.filter((b) => b.lado === "direito").sort((a, b) => a.ordem - b.ordem);

  return (
    <>
      {/* Lado Direito */}
      <div className="fixed bottom-4 sm:bottom-6 right-3 sm:right-5 z-50 flex flex-col items-end gap-2 sm:gap-3">
        {chatOpen && (
          <ChatWidget onClose={() => setChatOpen(false)} primaryColor={config.primaryColor} />
        )}
        {direito.map((btn) => renderButton(btn, config.whatsapp, chatOpen, setChatOpen))}
      </div>

      {/* Lado Esquerdo */}
      <div className="fixed bottom-4 sm:bottom-6 left-3 sm:left-5 z-50 flex flex-col gap-2 sm:gap-3 items-start">
        {esquerdo.map((btn) => renderButton(btn, config.whatsapp, chatOpen, setChatOpen))}
      </div>
    </>
  );
}
