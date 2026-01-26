import { Router, type IRouter } from 'express';
import * as alertController from '../controllers/alertController';
import { checkGlobalRateLimit, checkReportRateLimit, checkVoteRateLimit } from '../middleware/rateLimit';
import { validateCreateAlert, validateVote } from '../middleware/validation';

const router: IRouter = Router();

/**
 * GET /alerts
 * Obtiene lista de alertas
 * Query params: type, localityId, includeHidden
 */
router.get('/', alertController.getAllAlerts);

/**
 * GET /alerts/:id
 * Obtiene una alerta por ID
 */
router.get('/:id', alertController.getAlertById);

/**
 * POST /alerts
 * Crea una nueva alerta
 * Middleware: validateCreateAlert, checkReportRateLimit
 */
router.post(
  '/',
  checkGlobalRateLimit, // Anti-DDoS: máx 10 alertas/min global
  validateCreateAlert,
  checkReportRateLimit,
  alertController.createAlert,
);

/**
 * POST /alerts/:id/vote
 * Vota en una alerta
 * Middleware: validateVote, checkVoteRateLimit
 */
router.post(
  '/:id/vote',
  validateVote,
  checkVoteRateLimit,
  alertController.voteAlert,
);

export default router;
