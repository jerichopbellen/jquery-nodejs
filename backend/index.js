const app = require('./app');
const { sequelize } = require('./models'); // Imports central database synchronization engine
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Sync models to database before running the server listener
sequelize.sync({ alter: true }) // 'alter: true' updates tables if you add columns later without wiping your data
  .then(() => {
    console.log('📡 Database tables verified and synchronized successfully.');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Unable to synchronize database tables:', err.message);
  });