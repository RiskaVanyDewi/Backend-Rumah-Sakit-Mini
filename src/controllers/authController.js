const db = require('../config/database');
const { hashPassword, verifyPassword, signJwt, JWT_EXPIRES_IN_SECONDS } = require('../utils/auth');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Semua field wajib diisi.'
      });
    }

    if (!['admin','dokter','pasien','apoteker','kasir'].includes(role)) {
      return res.status(400).json({
        message: 'Role tidak valid.'
      });
    }

    const passwordHash = hashPassword(password);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );

    res.status(201).json({
      message: 'Register berhasil.',
      userId: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Email sudah digunakan.'
      });
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Field email dan password wajib diisi.'
      });
    }

    const [rows] = await db.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0 || !verifyPassword(password, rows[0].password)) {
      return res.status(401).json({
        message: 'Email atau password salah.'
      });
    }

    const user = rows[0];
    const token = signJwt({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    return res.json({
      message: 'Login berhasil.',
      data: {
        token,
        token_type: 'Bearer',
        expires_in: JWT_EXPIRES_IN_SECONDS,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};
