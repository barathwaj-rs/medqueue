const express = require('express');
const router = express.Router();

const {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorAppointments,
  getDoctorQueue,
  getDoctorStats,
} = require('../controllers/doctorController');

router.route('/')
  .post(createDoctor)
  .get(getDoctors);

router.route('/:id')
  .get(getDoctorById)
  .put(updateDoctor)
  .delete(deleteDoctor);

router.get('/:id/appointments', getDoctorAppointments);
router.get('/:id/queue', getDoctorQueue);
router.get('/:id/stats', getDoctorStats);


module.exports = router;
