const db = require('../config/database');
const { validateRequiredFields } = require('../utils/validator');

exports.getAllPosts = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.user_id,
        users.name AS user_name,
        users.email AS user_email
      FROM posts
      INNER JOIN users ON users.id = posts.user_id
      ORDER BY posts.id ASC
    `);

    res.json({
      message: 'Daftar posts berhasil diambil.',
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, content, user_id: userId } = req.body;
    const requiredError = validateRequiredFields({ title, content, user_id: userId });

    if (requiredError) {
      return res.status(400).json({ message: requiredError });
    }

    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        message: 'User untuk post ini tidak ditemukan.'
      });
    }

    const [result] = await db.query(
      'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)',
      [title, content, userId]
    );

    const [rows] = await db.query(`
      SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.user_id,
        users.name AS user_name,
        users.email AS user_email
      FROM posts
      INNER JOIN users ON users.id = posts.user_id
      WHERE posts.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Post berhasil ditambahkan.',
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`
      SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.user_id,
        users.name AS user_name,
        users.email AS user_email
      FROM posts
      INNER JOIN users ON users.id = posts.user_id
      WHERE posts.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Post tidak ditemukan.'
      });
    }

    res.json({
      message: 'Detail post berhasil diambil.',
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM posts WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Post tidak ditemukan.'
      });
    }

    res.json({
      message: 'Post berhasil dihapus.'
    });
  } catch (error) {
    next(error);
  }
};
