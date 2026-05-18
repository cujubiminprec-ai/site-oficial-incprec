export type TipoNotificacao = "ouvidoria" | "lai" | "contato" | "pesquisa" | "sistema";

export interface NotificacaoAdmin {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  remetente: string;
  data: string;
  lida: boolean;
  tabDestino: string;
}

export const notificacoesAdminDefault: NotificacaoAdmin[] = [];
