const db = require('../config/database');
const { validateRequiredFields } = require('../utils/validator');

exports.getAllPatients = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  let baseQuery = `
      SELECT
        patients.id,
        patients.user_id,
        users.name,
        users.email,
        patients.gender,
        patients.birth_date,
        patients.address,
        patients.phone_number,
        patients.blood_type

      FROM patients

      JOIN users
      ON patients.user_id = users.id
    `;

  const where = [];
  const values = [];

  if (req.query.search) {
    where.push('(users.name LIKE ? OR users.email LIKE ?)');
    values.push(`%${req.query.search}%`, `%${req.query.search}%`);
  }

  const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';

  const finalQuery = baseQuery + whereSql + ' ORDER BY patients.id DESC LIMIT ? OFFSET ?';
  values.push(limit, offset);

  const [rows] = await db.query(finalQuery, values);

  res.json({ data: rows, page, limit });
};

exports.getMyPatientProfile = async (req, res) => {
  const [rows] = await db.query(`
      SELECT
        patients.id,
        users.name,
        users.email,
        patients.gender,
        patients.birth_date,
        patients.address,
        patients.phone_number,
        patients.blood_type

      FROM patients

      JOIN users
      ON patients.user_id = users.id

      WHERE patients.user_id = ?
    `, [req.authUser.sub]);

  res.json(rows[0]);
};

exports.createPatient = async (req, res) => {
  const {
    user_id,
    gender,
    birth_date,
    address,
    phone_number,
    blood_type
  } = req.body;

  const requiredError = validateRequiredFields({
    user_id,
    gender,
    birth_date,
    address,
    phone_number,
    blood_type
  });

  if (requiredError) {
    return res.status(400).json({ message: requiredError });
  }

  const [result] = await db.query(
    `
      INSERT INTO patients
      (
        user_id,
        gender,
        birth_date,
        address,
        phone_number,
        blood_type
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
    [
      user_id,
      gender,
      birth_date,
      address,
      phone_number,
      blood_type
    ]
  );

  res.status(201).json({
    message: 'Data pasien berhasil ditambahkan',
    id: result.insertId
  });
};

exports.updatePatient = async (req, res) => {
  const { id } = req.params;
  const {
    gender,
    birth_date,
    address,
    phone_number,
    blood_type
  } = req.body;

  const requiredError = validateRequiredFields({
    gender,
    birth_date,
    address,
    phone_number,
    blood_type
  });

  if (requiredError) {
    return res.status(400).json({ message: requiredError });
  }

  await db.query(
    `
      UPDATE patients
      SET
        gender=?,
        birth_date=?,
        address=?,
        phone_number=?,
        blood_type=?
      WHERE id=?
      `,
    [
      gender,
      birth_date,
      address,
      phone_number,
      blood_type,
      id
    ]
  );

  res.json({
    message: 'Data pasien berhasil diupdate'
  });
};

exports.deletePatient = async (req, res) => {
  const { id } = req.params;

  await db.query(
    'DELETE FROM patients WHERE id=?',
    [id]
  );

  res.json({
    message: 'Data pasien berhasil dihapus'
  });
};
