const express = require('express');
const {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentsController');

const {
  authenticateToken,
  authorizeRoles
} = require('../middlewares/auth');

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'pasien'),
  createAppointment
);

router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'dokter', 'pasien'),
  getAppointments
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  updateAppointment
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  deleteAppointment
);

module.exports = router;
