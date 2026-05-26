import { query, queryOne, runInTransaction } from "../config/database";

export type CandidatoPayload = Record<string, unknown>;

function bool(value: unknown): boolean {
  return value === true || value === 1 || value === "1";
}

function candidatoRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    nome: String(row.nome || ""),
    cargo: String(row.cargo_candidato || ""),
    cargoCandidato: String(row.cargo_candidato || ""),
    conselho: String(row.conselho || ""),
    fotoUrl: String(row.foto_url || ""),
    bio: String(row.bio || ""),
    proposta: String(row.proposta || ""),
    numero: Number(row.numero || 0),
    votos: Number(row.votos || 0),
    ativo: bool(row.ativo),
    eleito: row.eleito === null || row.eleito === undefined ? undefined : bool(row.eleito),
  };
}

async function getJsonConfig<T>(chave: string, fallback: T): Promise<T> {
  const row = await queryOne<{ valor?: unknown }>("SELECT valor FROM app_config WHERE chave = $1", [chave]);
  if (!row?.valor) return fallback;
  if (typeof row.valor !== "string") return row.valor as T;
  try {
    return JSON.parse(row.valor) as T;
  } catch {
    return fallback;
  }
}

async function setJsonConfig(chave: string, valor: unknown): Promise<void> {
  await query(`
    INSERT INTO app_config (chave, valor, tipo, atualizado_em)
    VALUES ($1, $2, 'json', NOW())
    ON DUPLICATE KEY UPDATE valor = VALUES(valor), atualizado_em = NOW()
  `, [chave, JSON.stringify(valor)]);
}

export const eleicaoModel = {
  async obterConfig() {
    return await queryOne("SELECT * FROM eleicao_configuracao ORDER BY id DESC LIMIT 1") ?? { titulo: "Eleicao INPREC", status: "inativa" };
  },

  async salvarConfig(payload: Record<string, unknown>) {
    const atual = await queryOne<{ id: number }>("SELECT id FROM eleicao_configuracao ORDER BY id DESC LIMIT 1");
    if (atual) {
      await query(`
        UPDATE eleicao_configuracao
        SET titulo = $1, descricao = $2, data_inicio = $3, data_fim = $4, status = $5, eleitores_aptos = $6, atualizado_em = NOW()
        WHERE id = $7
      `, [
        payload.titulo,
        payload.descricao ?? "",
        payload.dataInicio ?? payload.data_inicio ?? null,
        payload.dataFim ?? payload.data_fim ?? null,
        payload.status ?? "inativa",
        payload.eleitoresAptos ?? payload.eleitores_aptos ?? 0,
        atual.id
      ]);
    } else {
      await query(`
        INSERT INTO eleicao_configuracao (titulo, descricao, data_inicio, data_fim, status, eleitores_aptos)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        payload.titulo ?? "Eleicao INPREC",
        payload.descricao ?? "",
        payload.dataInicio ?? null,
        payload.dataFim ?? null,
        payload.status ?? "inativa",
        payload.eleitoresAptos ?? 0
      ]);
    }
    return this.obterConfig();
  },

  async obterVotacaoConfig() {
    return getJsonConfig("votacao_config", {});
  },

  async salvarVotacaoConfig(payload: Record<string, unknown>) {
    await setJsonConfig("votacao_config", payload);
    return payload;
  },

  async listarCandidatosPublicos() {
    const rows = (await query("SELECT * FROM eleicao_candidatos WHERE ativo = 1 ORDER BY numero ASC, nome ASC")).rows;
    return rows.map(candidatoRow);
  },

  async listarCandidatosAdmin() {
    const rows = (await query("SELECT * FROM eleicao_candidatos ORDER BY numero ASC, nome ASC")).rows;
    return rows.map(candidatoRow);
  },

  async salvarCandidatos(candidatos: CandidatoPayload[]) {
    await runInTransaction(async (connection) => {
      await query("DELETE FROM eleicao_candidatos", [], connection);
      for (const [index, item] of candidatos.entries()) {
        await query(`
        INSERT INTO eleicao_candidatos (nome, cargo_candidato, conselho, foto_url, bio, proposta, numero, votos, ativo, eleito)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
          item.nome ?? "Candidato",
          item.cargoCandidato ?? item.cargo ?? "",
          item.conselho ?? "",
          item.fotoUrl ?? item.foto_url ?? "",
          item.bio ?? "",
          item.proposta ?? "",
          item.numero ?? index + 1,
          item.votos ?? 0,
          item.ativo === false ? 0 : 1,
          item.eleito === undefined ? null : item.eleito ? 1 : 0
        ], connection);
      }
    });
    return this.listarCandidatosAdmin();
  },

  async registrarCandidatura(payload: Record<string, unknown>) {
    const candidaturas = await getJsonConfig<Record<string, unknown>[]>("eleicao_candidaturas", []);
    candidaturas.push({ ...payload, criadoEm: new Date().toISOString() });
    await setJsonConfig("eleicao_candidaturas", candidaturas);
    return { recebido: true };
  },
};
