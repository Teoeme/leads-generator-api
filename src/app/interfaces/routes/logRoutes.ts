import express from 'express';
import { LogController } from '../controllers/LogController';
import passport from 'passport';

const router = express.Router();
const logController = new LogController();

const authenticate=passport.authenticate('jwt',{session:false});


/**
 * @route   GET /api/logs
 * @desc    Obtener logs con filtros
 * @access  Privado
 */
router.get('/', authenticate, (req, res) => logController.getLogs(req, res));

/**
 * @route   GET /api/logs/campaigns/:campaignId/summary
 * @desc    Obtener resumen de logs para una campaña
 * @access  Privado
 */
router.get('/campaigns/:campaignId/summary', authenticate, (req, res) => 
    logController.getInterventionLogsSummary(req, res)
);

/**
 * @route   GET /api/logs/interventions/:interventionId
 * @desc    Obtener logs para una intervención específica
 * @access  Privado
 */
router.get('/interventions/:interventionId', authenticate, (req, res) => 
    logController.getInterventionLogs(req, res)
);

/**
 * @route   GET /api/logs/simulators/:simulatorId
 * @desc    Obtener logs para un simulador específico
 * @access  Privado
 */
router.get('/simulators/:simulatorId', authenticate, (req, res) => 
    logController.getSimulatorLogs(req, res)
);

/**
 * @route   DELETE /api/logs
 * @desc    Eliminar todos los logs
 * @access  Privado
 */
router.delete('/', authenticate, (req, res) => logController.deleteLogs(req, res));

export default router; 