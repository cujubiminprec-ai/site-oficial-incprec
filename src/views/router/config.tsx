import { Navigate, RouteObject } from "react-router-dom";
import HomePage from "@/pages/home/page";
import AposentadoriaPorIdadePage from "@/pages/beneficios/aposentadoria-por-idade/page";
import PensaoPorMortePage from "@/pages/beneficios/pensao-por-morte/page";
import AuxilioDoencaPage from "@/pages/beneficios/auxilio-doenca/page";
import AposentadoriaPorInvalidezPage from "@/pages/beneficios/aposentadoria-por-invalidez/page";
import FundoPrevidenciarioPage from "@/pages/beneficios/fundo-previdenciario/page";
import AtendimentoPersonalizadoPage from "@/pages/beneficios/atendimento-personalizado/page";
import FinancasInvestimentosPage from "@/pages/financas-investimentos/page";
import ServicosPage from "@/pages/servicos/page";
import QuemSomosPage from "@/pages/quem-somos/page";
import NoticiasPage from "@/pages/noticias/page";
import NoticiaDetalhePage from "@/pages/noticias/detalhe";
import TransparenciaPage from "@/pages/transparencia/page";
import TransparenciaSobrePage from "@/pages/transparencia/sobre";
import TransparenciaGlossarioPage from "@/pages/transparencia/glossario";
import OuvidoriaPage from "@/pages/ouvidoria/page";
import LAIPage from "@/pages/lai/page";
import FAQPage from "@/pages/faq/page";
import PesquisaPage from "@/pages/pesquisa/page";
import ContatoPage from "@/pages/contato/page";
import PrevidenciaPage from "@/pages/previdencia/page";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import EstruturaPage from "@/pages/estrutura/page";
import EventosPage from "@/pages/eventos/page";
import ProGestaoPage from "@/pages/pro-gestao/page";
import LegislacaoPage from "@/pages/legislacao/page";
import GestoresPage from "@/pages/gestores/page";
import LGPDPage from "@/pages/lgpd/page";
import FormulariosPage from "@/pages/formularios/page";
import CodigoDeEticaPage from "@/pages/institucional/codigo-de-etica/page";
import CompromissoPage from "@/pages/institucional/compromisso/page";
import MarcaPage from "@/pages/institucional/marca/page";
import EnderecosPage from "@/pages/enderecos/page";
import CursosPage from "@/pages/cursos/page";
import CursoDetalhePage from "@/pages/cursos/detalhe";
import EleicaoPage from "@/pages/eleicao/page";
import VotacaoPage from "@/pages/votacao/page";
import MapaDoSitePage from "@/pages/mapa-do-site/page";
import AtendimentoAoCidadaoPage from "@/pages/atendimento-ao-cidadao/page";
import DynamicPage from "@/pages/DynamicPage";

const routes: RouteObject[] = [
  { path: "/", element: <HomePage /> },
  { path: "/servicos", element: <ServicosPage /> },
  { path: "/atendimento-ao-cidadao", element: <AtendimentoAoCidadaoPage /> },
  { path: "/previdencia", element: <PrevidenciaPage /> },
  { path: "/quem-somos", element: <QuemSomosPage /> },
  { path: "/estrutura", element: <EstruturaPage /> },
  { path: "/noticias", element: <NoticiasPage /> },
  { path: "/noticias/:id", element: <NoticiaDetalhePage /> },
  { path: "/transparencia", element: <TransparenciaPage /> },
  { path: "/transparencia/sobre", element: <TransparenciaSobrePage /> },
  { path: "/transparencia/glossario", element: <TransparenciaGlossarioPage /> },
  { path: "/ouvidoria", element: <OuvidoriaPage /> },
  { path: "/lai", element: <LAIPage /> },
  { path: "/perguntas-frequentes", element: <FAQPage /> },
  { path: "/pesquisa-satisfacao", element: <PesquisaPage /> },
  { path: "/contato", element: <ContatoPage /> },
  { path: "/eventos", element: <EventosPage /> },
  { path: "/cursos", element: <CursosPage /> },
  { path: "/cursos/:id", element: <CursoDetalhePage /> },
  { path: "/eleicao", element: <EleicaoPage /> },
  { path: "/votacao", element: <VotacaoPage /> },
  { path: "/pro-gestao", element: <ProGestaoPage /> },
  { path: "/legislacao", element: <LegislacaoPage /> },
  { path: "/gestores", element: <GestoresPage /> },
  { path: "/lgpd", element: <LGPDPage /> },
  { path: "/formularios", element: <FormulariosPage /> },
  { path: "/codigo-de-etica", element: <CodigoDeEticaPage /> },
  { path: "/compromisso-com-servidor", element: <CompromissoPage /> },
  { path: "/marca", element: <MarcaPage /> },
  { path: "/enderecos", element: <EnderecosPage /> },
  { path: "/beneficios/aposentadoria-por-idade", element: <AposentadoriaPorIdadePage /> },
  { path: "/beneficios/pensao-por-morte", element: <PensaoPorMortePage /> },
  { path: "/beneficios/auxilio-doenca", element: <AuxilioDoencaPage /> },
  { path: "/beneficios/aposentadoria-por-invalidez", element: <AposentadoriaPorInvalidezPage /> },
  { path: "/beneficios/fundo-previdenciario", element: <FundoPrevidenciarioPage /> },
  { path: "/beneficios/atendimento-personalizado", element: <AtendimentoPersonalizadoPage /> },
  { path: "/financas-investimentos", element: <FinancasInvestimentosPage /> },
  { path: "/mapa-do-site", element: <MapaDoSitePage /> },
  { path: "/admin", element: <Navigate to="/admin/login" replace /> },
  { path: "/admin/login", element: <AdminLoginPage /> },
  { path: "/admin/dashboard", element: <AdminDashboardPage /> },
  { path: "*", element: <DynamicPage /> },
];

export default routes;
