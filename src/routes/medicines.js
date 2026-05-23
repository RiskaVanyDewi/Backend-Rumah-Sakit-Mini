const express = require('express');
const {
  createMedicine,
  getMedicines,
  updateMedicine,
  deleteMedicine
} = require('../controllers/medicinesController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middlewares/auth');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('admin', 'apoteker'), createMedicine);

router.get('/', authenticateToken, getMedicines);

router.put('/:id', authenticateToken, authorizeRoles('admin', 'apoteker'), updateMedicine);

router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteMedicine);

module.exports = router;
