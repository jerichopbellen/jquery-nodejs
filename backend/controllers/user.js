const { User, Token } = require('../models'); // Imports your Sequelize Models
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email, password are required' });
    }

    // Sequelize equivalent to: SELECT id FROM users WHERE email = ? LIMIT 1
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Sequelize equivalent to: INSERT INTO users ...
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

    // Sequelize equivalent to tracking email checks and active validation state filters
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // MP6 Check: Ensure deactivated profiles cannot get access codes
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT Token (Quiz 6 validation metadata)
    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // MP5 Requirement: Save the active token string record inside your database table
    await Token.create({
      user_id: user.user_id,
      token_value: token
    });

    // Remove sensitive data password tracking securely before sending back to jQuery
    const userData = user.toJSON();
    delete userData.password;

    return res.status(200).json({ 
      success: true, 
      message: 'Welcome back', 
      token, 
      user: userData 
    });

  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// 3. UPDATE USER PROFILE (Admin Role Switching or Info Updates)
const updateUser = async (req, res) => {
  try {
    const { name, role, is_active } = req.body; // Customizable fields for Admin controls (MP6)
    let userId = req.body.userId;

    if (typeof userId === 'string') userId = Number(userId.replace(/"/g, '').trim());
    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }

    // Sequelize handles finding and updating gracefully without separate raw queries
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found' });
    }

    // Apply the changes to the user model instance attributes
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

    // Sequelize equivalent to: UPDATE users SET is_active = false WHERE email = ?
    const [affectedRows] = await User.update(
      { is_active: false }, 
      { where: { email, is_active: true } }
    );

    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found or already deactivated' });
    }

    // Force eject security step: Clear token rows so they are instantly kicked offline
    const targetedUser = await User.findOne({ where: { email } });
    if (targetedUser) {
      await Token.destroy({ where: { user_id: targetedUser.user_id } });
    }

    return res.status(200).json({ success: true, message: 'User deactivated successfully' });

  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { registerUser, loginUser, updateUser, deactivateUser };