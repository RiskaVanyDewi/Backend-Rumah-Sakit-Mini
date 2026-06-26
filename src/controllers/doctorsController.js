const db = require('../config/database');
const { validateRequiredFields } = require('../utils/validator');

exports.getAllDoctors = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  let baseQuery = `
      SELECT
        doctors.id,
        doctors.user_id,
        users.name,
        users.email,
        doctors.specialization,
        doctors.phone_number,
        doctors.experience_years

      FROM doctors

      JOIN users
      ON doctors.user_id = users.id
    `;

  const where = [];
  const values = [];

  if (req.query.search) {
    where.push('(users.name LIKE ? OR doctors.specialization LIKE ?)');
    values.push(`%${req.query.search}%`, `%${req.query.search}%`);
  }

  const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';

  const finalQuery = baseQuery + whereSql + ' ORDER BY doctors.id DESC LIMIT ? OFFSET ?';
  values.push(limit, offset);

  const [rows] = await db.query(finalQuery, values);

  res.json({ data: rows, page, limit });
};

exports.getMyDoctorProfile = async (req, res) => {
  const [rows] = await db.query(`
      SELECT
        doctors.id,
        users.name,
        users.email,
        doctors.specialization,
        doctors.phone_number,
        doctors.experience_years

      FROM doctors

      JOIN users
      ON doctors.user_id = users.id

      WHERE doctors.user_id = ?
    `, [req.authUser.sub]);

  res.json(rows[0]);
};

exports.createDoctor = async (req, res) => {
  const {
    user_id,
    specialization,
    phone_number,
    experience_years
  } = req.body;

  const requiredError = validateRequiredFields({
    user_id,
    specialization,
    phone_number,
    experience_years
  });

  if (requiredError) {
    return res.status(400).json({ message: requiredError });
  }

  const [result] = await db.query(
    `
      INSERT INTO doctors
      (
        user_id,
        specialization,
        phone_number,
        experience_years
      )
      VALUES (?, ?, ?, ?)
      `,
    [
      user_id,
      specialization,
      phone_number,
      experience_years
    ]
  );

  res.status(201).json({
    message: 'Data dokter berhasil ditambahkan',
    id: result.insertId
  });
};

exports.updateDoctor = async (req, res) => {
  const { id } = req.params;
  const {
    specialization,
    phone_number,
    experience_years
  } = req.body;

  const requiredError = validateRequiredFields({
    specialization,
    phone_number,
    experience_years
  });

  if (requiredError) {
    return res.status(400).json({ message: requiredError });
  }

  await db.query(
    `
      UPDATE doctors
      SET
        specialization=?,
        phone_number=?,
        experience_years=?
      WHERE id=?
      `,
    [
      specialization,
      phone_number,
      experience_years,
      id
    ]
  );

  res.json({
    message: 'Data dokter berhasil diupdate'
  });
};

exports.deleteDoctor = async (req, res) => {
  const { id } = req.params;

  await db.query(
    'DELETE FROM doctors WHERE id=?',
    [id]
  );

  res.json({
    message: 'Data dokter berhasil dihapus'
  });
};
