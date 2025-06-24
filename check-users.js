const { User, sequelize } = require('./backend/models');

async function checkUsers() {
    try {
        await sequelize.authenticate();
        console.log('Database connected');
        
        // Check if User table exists and has data
        const users = await User.findAll();
        console.log('Users in database:', users.length);
        
        if (users.length > 0) {
            users.forEach(user => {
                console.log(`- ${user.username} (${user.role})`);
            });
        } else {
            console.log('No users found in database');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkUsers();
