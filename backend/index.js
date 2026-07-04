require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

// Connect to DB — don't auto-alter schema on every boot
sequelize.authenticate()
  .then(() => {
    console.log('📡 Database connection established successfully.');
    return sequelize.sync(); // no alter, no force — just verify tables exist
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Unable to connect to database:', err.message);
    process.exit(1);
  });