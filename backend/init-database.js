const { User, sequelize } = require('./models');
const bcrypt = require('bcrypt');

async function initDatabase() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected successfully');
        
        console.log('Synchronizing database tables...');
        await sequelize.sync({ force: true }); // This will recreate tables
        console.log('Database tables synchronized');
        
        console.log('Creating default users...');
        const defaultUsers = [
            {
                username: 'Chispadelic',
                password: await bcrypt.hash('Svernis1', 12),
                role: 'admin'
            },
            {
                username: 'Kimbowimbo',
                password: await bcrypt.hash('c0razonK', 12),
                role: 'admin'
            },
            {
                username: 'Rafurioso',
                password: await bcrypt.hash('Miau1234*', 12),
                role: 'asesor'
            },
            {
                username: 'Wero',
                password: await bcrypt.hash('Miau1234*', 12),
                role: 'asesor'
            }
        ];

        await User.bulkCreate(defaultUsers);
        console.log('Default users created successfully');
        
        // Verify users were created
        const users = await User.findAll();
        console.log('Users in database:', users.length);
        users.forEach(user => {
            console.log(`- ${user.username} (${user.role})`);
        });
        
        console.log('Database initialization completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Database initialization failed:', error.message);
        process.exit(1);
    }
}

initDatabase();
