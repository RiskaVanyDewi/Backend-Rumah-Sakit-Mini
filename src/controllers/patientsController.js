const db = require('../config/database');

exports.getAllPatients = async (req, res) => {
  const [rows] = await db.query(`
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
    `);

  res.json(rows);
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

  if (
    !user_id ||
    !gender ||
    !birth_date
  ) {
    return res.status(400).json({
      message: 'Field wajib diisi'
    });
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
