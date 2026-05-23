const db = require('../config/database');

exports.createMedicine = async (req, res) => {
  const { name, stock, price, description } = req.body;

  if (!name || !stock || !price || !description) {
    return res.status(400).json({
      message: 'Semua field wajib diisi'
    });
  }

  const [result] = await db.query(
    `
      INSERT INTO medicines
      (name, stock, price, description)
      VALUES (?, ?, ?, ?)
      `,
    [name, stock, price, description]
  );

  res.status(201).json({
    message: 'Obat berhasil ditambahkan',
    id: result.insertId
  });
};

exports.getMedicines = async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM medicines'
  );

  res.json(rows);
};

exports.updateMedicine = async (req, res) => {
  const { id } = req.params;
  const { name, stock, price, description } = req.body;

  await db.query(
    `
      UPDATE medicines
      SET name=?, stock=?, price=?, description=?
      WHERE id=?
      `,
    [name, stock, price, description, id]
  );

  res.json({
    message: 'Obat berhasil diupdate'
  });
};

exports.deleteMedicine = async (req, res) => {
  const { id } = req.params;

  await db.query(
    'DELETE FROM medicines WHERE id=?',
    [id]
  );

  res.json({
    message: 'Obat berhasil dihapus'
  });
};
