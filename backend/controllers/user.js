const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email, password are required' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'customer',
      is_active: true
    });

    return res.status(201).json({
      success: true,
      message: 'Registered successfully',
      userId: newUser.user_id
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// 2. LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid Email or Password' });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact admin.'
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(401).json({ success: false, message: 'Invalid Email or Password' });
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// 3. LIST USERS (for DataTable)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['user_id', 'name', 'email', 'role', 'is_active'],
      order: [['user_id', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      rows: users
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// 4. ADMIN UPDATE USER (role + status + basic fields)
const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({
      name: name ?? user.name,
      email: email ?? user.email,
      role: role ?? user.role,
      is_active: typeof is_active === 'boolean' ? is_active : user.is_active
    });

    return res.status(200).json({ success: true, message: 'User updated successfully' });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// 5. ADMIN TOGGLE STATUS (activate/deactivate)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'is_active must be boolean' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({ is_active });

    return res.status(200).json({
      success: true,
      message: is_active ? 'User activated successfully' : 'User deactivated successfully'
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  adminUpdateUser,
  updateUserStatus
};