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

// 2. LOGIN USER (Stateless JWT implementation)
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

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(401).json({ success: false, message: 'Invalid Email or Password' });
    }

    // Generate Token for Authentication (MP5 - 15pts)
    const token = jwt.sign(
      { id: user.id || user.user_id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id || user.user_id,
        name: user.name,
        email: user.email
      }
    });

  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// 3. UPDATE USER PROFILE
const updateUser = async (req, res) => {
  try {
    const { name, role, is_active } = req.body;
    const userId = req.user?.id || req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({
      name: name || user.name,
      role: role || user.role,
      is_active: is_active !== undefined ? is_active : user.is_active
    });

    return res.status(200).json({ success: true, message: 'Profile updated successfully' });

  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// 4. DEACTIVATE USER
const deactivateUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const [affectedRows] = await User.update(
      { is_active: false }, 
      { where: { email, is_active: true } }
    );

    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found or already deactivated' });
    }

    return res.status(200).json({ success: true, message: 'User deactivated successfully' });

  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  deactivateUser
};