const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]?\$\d{2}\$/.test(value);
}

function buildUserProfile(user) {
  const computedFullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return {
    userId: user.user_id,
    name: computedFullName, // Combines names on the fly for backwards compatibility
    email: user.email,
    avatar: user.avatar || '',
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    addressline: user.addressline || '',
    phone: user.phone || '',
    zipcode: user.zipcode || '',
    role: user.role,
    isActive: user.is_active
  };
}

// 1. REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'firstName, lastName, email, and password are required' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role: 'customer',
      is_active: true
    });

    const computedName = `${newUser.first_name} ${newUser.last_name}`.trim();

    return res.status(201).json({
      success: true,
      message: 'Registered successfully',
      userId: newUser.user_id,
      user: {
        id: newUser.user_id,
        name: computedName,
        email: newUser.email,
        firstName: newUser.first_name || '',
        lastName: newUser.last_name || '',
        role: newUser.role
      }
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

    const storedPassword = String(user.password || '');
    const isPasswordMatched = isBcryptHash(storedPassword)
      ? await bcrypt.compare(password, storedPassword)
      : password === storedPassword;

    if (!isPasswordMatched) {
      return res.status(401).json({ success: false, message: 'Invalid Email or Password' });
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const computedName = `${user.first_name || ''} ${user.last_name || ''}`.trim();

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.user_id,
        name: computedName,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
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
      attributes: ['user_id', 'first_name', 'last_name', 'email', 'role', 'is_active'],
      order: [['user_id', 'DESC']]
    });

    // Maps results so any tables relying on a combined "name" column do not break
    const rows = users.map(u => ({
      user_id: u.user_id,
      first_name: u.first_name,
      last_name: u.last_name,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      email: u.email,
      role: u.role,
      is_active: u.is_active
    }));

    return res.status(200).json({
      success: true,
      rows
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// 4. ADMIN UPDATE USER (role + status + basic fields)
const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, is_active } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({
      first_name: firstName ?? user.first_name,
      last_name: lastName ?? user.last_name,
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

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'user_id',
        'email',
        'avatar',
        'first_name',
        'last_name',
        'addressline',
        'phone',
        'zipcode',
        'role',
        'is_active'
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: buildUserProfile(user) });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const nextAvatar = req.file ? path.join('images', req.file.filename).replace(/\\/g, '/') : user.avatar;

    await user.update({
      first_name: req.body.fname ?? user.first_name,
      last_name: req.body.lname ?? user.last_name,
      addressline: req.body.addressline ?? user.addressline,
      phone: req.body.phone ?? user.phone,
      zipcode: req.body.zipcode ?? user.zipcode,
      avatar: nextAvatar
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: buildUserProfile(user)
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
  updateUserStatus,
  getMyProfile,
  updateMyProfile
};