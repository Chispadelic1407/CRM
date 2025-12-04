const { User, sequelize } = require('./models');
const bcrypt = require('bcrypt');

async function initDatabase() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected successfully');
        
        console.log('Synchronizing database tables...');
        // Use alter: true to update existing tables without dropping data
        // Use force: true only for fresh installations
        const syncOptions = process.env.DB_FORCE_SYNC === 'true' 
            ? { force: true } 
            : { alter: true };
        
        await sequelize.sync(syncOptions);
        console.log(`Database tables synchronized (${syncOptions.force ? 'force' : 'alter'} mode)`);
        
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
