const connection = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try {
        const { name, password, email } = req.body;

        if (!name || !password || !email) {
            return res.status(400).json({
                success: false,
                message: 'name, email, and password are required'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userSql = 'INSERT INTO users (name, password, email) VALUES (?, ?, ?)';

        connection.execute(userSql, [name, hashedPassword, email], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    success: false,
                    message: 'Registration failed',
                    error: err.message
                });
            }

            return res.status(201).json({
                success: true,
                message: 'User registered',
                result
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const loginUser = (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT id, name, email, password FROM users WHERE email = ? AND deleted_at IS NULL';

    connection.execute(sql, [email], async (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, error: 'Error logging in', details: err.message });
        }

        if (!results || results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        delete user.password;
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

        return res.status(200).json({
            success: true,
            message: 'welcome back',
            user,
            token
        });
    });
};

const updateUser = (req, res) => {
    try {
        const { fname, lname, addressline, zipcode, phone, town } = req.body;
        let { userId } = req.body;

        if (typeof userId === 'string') {
            userId = userId.replace(/"/g, '').trim();
        }
        userId = Number(userId);

        if (!userId || Number.isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid userId'
            });
        }

        let image = null;
        if (req.file && req.file.path) {
            image = req.file.path.replace(/\\/g, '/');
        }

        // IMPORTANT: table name is `customers` (plural)
        const userSql = `
            INSERT INTO customers
                (fname, lname, addressline, zipcode, phone, town, image_path, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                fname = VALUES(fname),
                lname = VALUES(lname),
                addressline = VALUES(addressline),
                zipcode = VALUES(zipcode),
                phone = VALUES(phone),
                town = VALUES(town),
                image_path = COALESCE(VALUES(image_path), image_path)
        `;

        const params = [
            fname || '',
            lname || '',
            addressline || '',
            zipcode || '',
            phone || '',
            town || '',
            image,
            userId
        ];

        connection.execute(userSql, params, (err, result) => {
            if (err) {
                console.log('PROFILE UPDATE ERROR:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Profile update failed',
                    error: err.message,
                    code: err.code
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                result
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const deactivateUser = (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const sql = 'UPDATE users SET deleted_at = ? WHERE email = ?';
    const timestamp = new Date();

    connection.execute(sql, [timestamp, email], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, error: 'Error deactivating user', details: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        return res.status(200).json({
            success: true,
            message: 'User deactivated successfully',
            email,
            deleted_at: timestamp
        });
    });
};

module.exports = { registerUser, loginUser, updateUser, deactivateUser };