import { query } from "../config/database";

export const faqModel = {
  async listarPublico() {
    return (await query("SELECT * FROM faq WHERE ativo = 1 ORDER BY posicao ASC, id ASC")).rows;
  },
};
