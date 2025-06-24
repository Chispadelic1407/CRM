const { User } = require('./backend/models');
const bcrypt = require('bcrypt');

async function fixPasswords() {
    try {
        const users = await User.findAll();
        
        for (const user of users) {
            // Check if password is already hashed (bcrypt hashes start with $2b$)
            if (!user.password.startsWith('$2b$')) {
                console.log(`Hashing password for user: ${user.username}`);
                const hashedPassword = await bcrypt.hash(user.password, 12);
                await user.update({ password: hashedPassword });
                console.log(`Password updated for: ${user.username}`);
            } else {
                console.log(`Password already hashed for: ${user.username}`);
            }
        }
        
        console.log('Password fix completed');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

fixPasswords();
