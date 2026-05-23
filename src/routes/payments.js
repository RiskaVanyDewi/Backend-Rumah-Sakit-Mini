const express = require('express');
const {
  createPayment,
  getPayments
} = require('../controllers/paymentsController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middlewares/auth');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('admin', 'kasir'), createPayment);

router.get('/', authenticateToken, authorizeRoles('admin', 'kasir'), getPayments);

module.exports = router;
