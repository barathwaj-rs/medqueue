const express = require('express');
const router = express.Router();

const {
  getCurrentPatient,
  getRemainingQueue,
  completeCurrentPatient,
  skipCurrentPatient,
  getPatientQueue,
} = require('../controllers/queueController');
router.get('/patient/:patientId', getPatientQueue);
router.get('/:doctorId/current', getCurrentPatient);
router.get('/:doctorId/remaining', getRemainingQueue);
router.put('/:doctorId/complete', completeCurrentPatient);
router.put('/:doctorId/skip', skipCurrentPatient);

module.exports = router;
