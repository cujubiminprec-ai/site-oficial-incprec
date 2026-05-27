/**
 * INDEX DE ROTAS/CONTROLLERS
 * Consolida todos os controllers em um único lugar
 */

import { Router } from 'express';

// Import todos os controllers
import authController from './auth.controller';
import configController from './configuracoes.controller';
import noticiasController from './noticias.controller';
import eventosController from './eventos.controller';
import conteudoController from './conteudo.controller';
import gestoresController from './gestores.controller';
import usuariosController from './usuarios.controller';
import transparenciaController from './transparencia.controller';
import uploadController from './upload.controller';
import auditoriaController from './auditoria.controller';
import paginasController from './paginas.controller';
import servicosController from './servicos.controller';
import menuController from './menu.controller';
import faqController from './faq.controller';
import eleicaoController from './eleicao.controller';
import pesquisaController from './pesquisa.controller';
import formulariosController from './formularios.controller';
import contatoController from './contato.controller';
import ouvidoriaController from './ouvidoria.controller';
import laiController from './lai.controller';
import analyticsController from './analytics.controller';
import chatController from './chat.controller';
import notificacoesController from './notificacoes.controller';

const router = Router();

// Registrar todos os controllers como rotas
router.use('/auth', authController);
router.use('/configuracoes', configController);
router.use('/noticias', noticiasController);
router.use('/eventos', eventosController);
router.use('/conteudo', conteudoController);
router.use('/gestores', gestoresController);
router.use('/usuarios', usuariosController);
router.use('/transparencia', transparenciaController);
router.use('/upload', uploadController);
router.use('/auditoria', auditoriaController);
router.use('/paginas', paginasController);
router.use('/servicos', servicosController);
router.use('/menu', menuController);
router.use('/faq', faqController);
router.use('/eleicao', eleicaoController);
router.use('/pesquisa', pesquisaController);
router.use('/formularios', formulariosController);
router.use('/contato', contatoController);
router.use('/ouvidoria', ouvidoriaController);
router.use('/lai', laiController);
router.use('/analytics', analyticsController);
router.use('/chat', chatController);
router.use('/notificacoes', notificacoesController);

export default router;
