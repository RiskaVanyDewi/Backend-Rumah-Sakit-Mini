const express = require('express');
const {
  getAllSchedules,
  getMySchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule
} = require('../controllers/doctorSchedulesController');

const {
  authenticateToken,
  authorizeRoles
} = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, getAllSchedules);

router.get('/me', authenticateToken, authorizeRoles('dokter'), getMySchedule);

router.post('/', authenticateToken, authorizeRoles('admin'), createSchedule);

router.put('/:id', authenticateToken, authorizeRoles('admin'), updateSchedule);

router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteSchedule);

module.exports = router;
