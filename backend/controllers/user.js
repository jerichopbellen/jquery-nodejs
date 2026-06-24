const connection = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email, password are required' });
    }

    const checkSql = 'SELECT id FROM users WHERE email = ? LIMIT 1';
    connection.execute(checkSql, [email], async (checkErr, rows) => {
      if (checkErr) return res.status(500).json({ success: false, message: checkErr.message });
      if (rows.length > 0) return res.status(409).json({ success: false, message: 'Email already registered' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      connection.execute(sql, [name, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        return res.status(201).json({ success: true, message: 'Registered successfully', userId: result.insertId });
      });
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

const loginUser = (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT id, name, email, password FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1';

  connection.execute(sql, [email], async (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!rows.length) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    delete user.password;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({ success: true, message: 'Welcome back', token, user });
  });
};

const updateUser = (req, res) => {
  const { fname, lname, addressline, zipcode, phone } = req.body;
  let userId = req.body.userId;

  if (typeof userId === 'string') userId = Number(userId.replace(/"/g, '').trim());
  if (!userId || Number.isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid userId' });
  }

  let imagePath = null;
  if (req.file?.path) imagePath = req.file.path.replace(/\\/g, '/');

  const updateSql = `
    UPDATE customer
    SET fname = ?, lname = ?, addressline = ?, zipcode = ?, phone = ?, image_path = COALESCE(?, image_path)
    WHERE user_id = ?
  `;
  const updateValues = [fname || '', lname || '', addressline || '', zipcode || '', phone || '', imagePath, userId];

  connection.execute(updateSql, updateValues, (updateErr, updateResult) => {
    if (updateErr) return res.status(500).json({ success: false, message: updateErr.message });

    if (updateResult.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Profile updated successfully' });
    }

    const insertSql = `
      INSERT INTO customer (fname, lname, addressline, zipcode, phone, image_path, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const insertValues = [fname || '', lname || '', addressline || '', zipcode || '', phone || '', imagePath, userId];

    connection.execute(insertSql, insertValues, (insertErr) => {
      if (insertErr) return res.status(500).json({ success: false, message: insertErr.message });
      return res.status(201).json({ success: true, message: 'Profile created successfully' });
    });
  });
};

const deactivateUser = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const sql = 'UPDATE users SET deleted_at = ? WHERE email = ? AND deleted_at IS NULL';
  connection.execute(sql, [new Date(), email], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, message: 'User deactivated successfully' });
  });
};

module.exports = { registerUser, loginUser, updateUser, deactivateUser };