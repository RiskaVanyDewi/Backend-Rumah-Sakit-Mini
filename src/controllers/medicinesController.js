const db = require('../config/database');
const { validateRequiredFields, validateNonNegative } = require('../utils/validator');

exports.createMedicine = async (req, res) => {
  const { name, stock, price, description } = req.body;

  const requiredError = validateRequiredFields({ name, stock, price, description });
  if (requiredError) {
    return res.status(400).json({ message: requiredError });
  }

  const stockError = validateNonNegative('Stock', stock);
  if (stockError) {
    return res.status(400).json({ message: stockError });
  }

  const priceError = validateNonNegative('Price', price);
  if (priceError) {
    return res.status(400).json({ message: priceError });
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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  let baseQuery = 'SELECT * FROM medicines';
  const where = [];
  const values = [];

  if (req.query.search) {
    where.push('(name LIKE ? OR description LIKE ?)');
    values.push(`%${req.query.search}%`, `%${req.query.search}%`);
  }

  const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';
  const finalQuery = baseQuery + whereSql + ' ORDER BY id DESC LIMIT ? OFFSET ?';
  values.push(limit, offset);

  const [rows] = await db.query(finalQuery, values);

  res.json({ data: rows, page, limit });
};

exports.updateMedicine = async (req, res) => {
  const { id } = req.params;
  const { name, stock, price, description } = req.body;

  const requiredError = validateRequiredFields({ name, stock, price, description });
  if (requiredError) {
    return res.status(400).json({ message: requiredError });
  }

  const stockError = validateNonNegative('Stock', stock);
  if (stockError) {
    return res.status(400).json({ message: stockError });
  }

  const priceError = validateNonNegative('Price', price);
  if (priceError) {
    return res.status(400).json({ message: priceError });
  }

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
