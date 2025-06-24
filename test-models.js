const { User, sequelize } = require('./backend/models');

console.log('Models loaded successfully');
console.log('User model exists:', !!User);
console.log('Sequelize exists:', !!sequelize);

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
