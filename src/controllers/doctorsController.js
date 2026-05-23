const db = require('../config/database');

exports.getAllDoctors = async (req, res) => {
  const [rows] = await db.query(`
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
    `);

  res.json(rows);
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

  if (
    !user_id ||
    !specialization
  ) {
    return res.status(400).json({
      message: 'Field wajib diisi'
    });
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
