import express from 'express';
import { LogController } from '../controllers/LogController';

const router = express.Router();
const logController = new LogController();

/**
 * @route   GET /api/logs
 * @desc    Obtener logs con filtros
 * @access  Privado
 */
router.get('/', (req, res) => logController.getLogs(req, res));

/**
 * @route   GET /api/logs/campaigns/:campaignId/summary
 * @desc    Obtener resumen de logs para una campaña
 * @access  Privado
 */
router.get('/campaigns/:campaignId/summary', (req, res) => 
    logController.getInterventionLogsSummary(req, res)
);

/**
 * @route   GET /api/logs/interventions/:interventionId
 * @desc    Obtener logs para una intervención específica
 * @access  Privado
 */
router.get('/interventions/:interventionId', (req, res) => 
    logController.getInterventionLogs(req, res)
);

/**
 * @route   GET /api/logs/simulators/:simulatorId
 * @desc    Obtener logs para un simulador específico
 * @access  Privado
 */
router.get('/simulators/:simulatorId', (req, res) => 
    logController.getSimulatorLogs(req, res)
);

export default router; 