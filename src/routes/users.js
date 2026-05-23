const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  getProfile,
  updateUser,
  deleteUser
} = require('../controllers/usersController');

const {
  authenticateToken,
  authorizeRoles
} = require('../middlewares/auth');

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/profile', authenticateToken, getProfile);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
