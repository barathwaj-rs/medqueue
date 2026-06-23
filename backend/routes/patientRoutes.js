const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  changePassword,
} = require('../controllers/patientController');

router.route('/')
  .get(protect, getPatients)
  .post(protect, createPatient);

router.route('/:id')
  .get(protect, getPatientById)
  .put(protect, updatePatient)
  .delete(protect, deletePatient);

router.put(
  '/:id/change-password',
  changePassword
);

module.exports = router;
