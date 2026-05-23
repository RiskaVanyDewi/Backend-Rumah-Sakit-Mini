const db = require('../config/database');
const { hashPassword } = require('../utils/auth');

exports.getAllUsers = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email FROM users ORDER BY id ASC'
    );

    res.json({
      message: 'Daftar users berhasil diambil.',
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Field name, email, dan password wajib diisi.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password minimal 8 karakter.'
      });
    }

    const passwordHash = hashPassword(password);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );

    const [rows] = await db.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'User berhasil ditambahkan.',
      data: rows[0]
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

exports.getProfile = (req, res) => {
  res.json({
    message: 'Profile berhasil diambil',
    data: req.authUser
  });
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: 'Field name dan email wajib diisi.'
      });
    }

    let result;

    if (password !== undefined) {
      if (!password || password.length < 8) {
        return res.status(400).json({
          message: 'Password minimal 8 karakter.'
        });
      }

      const passwordHash = hashPassword(password);
      [result] = await db.query(
        'UPDATE users SET name = ?, email = ?, password =? WHERE id = ?',
        [name, email, passwordHash, id]
      );
    } else {
      [result] = await db.query(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, id]
      );
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'User tidak ditemukan.'
      });
    }

    const [rows] = await db.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [id]
    );

    res.json({
      message: 'User berhasil diperbarui.',
      data: rows[0]
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

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'User tidak ditemukan.'
      });
    }

    res.json({
      message: 'User berhasil dihapus.'
    });
  } catch (error) {
    next(error);
  }
};
