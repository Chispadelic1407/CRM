const { User } = require('./backend/models');

async function testLogin() {
    try {
        const user = await User.findByUsername('Chispadelic');
        if (user) {
            console.log('User found:', user.username);
            console.log('Stored password hash:', user.password);
            
            const isValid = await user.checkPassword('Svernis1');
            console.log('Password check result:', isValid);
        } else {
            console.log('User not found');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testLogin();
