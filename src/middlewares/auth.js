const { verifyJwt } = require('../utils/auth');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Token tidak ditemukan'
    });
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyJwt(token);

    req.authUser = payload;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token tidak valid'
    });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.authUser.role)) {
      return res.status(403).json({
        message: 'Akses ditolak'
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};