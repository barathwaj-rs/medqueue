const express = require('express');
const router = express.Router();

const {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  completeAppointment,
} = require('../controllers/appointmentController');

router.route('/').post(bookAppointment).get(getAppointments);
router.route('/:id').get(getAppointmentById);
router.route('/:id/cancel').put(cancelAppointment);
router.route('/:id/complete').put(completeAppointment);

module.exports = router;
