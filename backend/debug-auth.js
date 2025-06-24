const { User } = require('./models');

async function debugAuth() {
    try {
        console.log('Testing User.findByUsername method...');
        
        // Test the static method
        const user = await User.findByUsername('Chispadelic');
        console.log('User found via findByUsername:', !!user);
        
        if (user) {
            console.log('Username:', user.username);
            console.log('Role:', user.role);
            console.log('Password hash length:', user.password.length);
            
            // Test password check
            const isValid = await user.checkPassword('Svernis1');
            console.log('Password check result:', isValid);
        }
        
        // Also test direct findOne
        const userDirect = await User.findOne({ where: { username: 'Chispadelic' } });
        console.log('User found via findOne:', !!userDirect);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

debugAuth();
