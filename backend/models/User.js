const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [3, 50]
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [6, 255]
            }
        },
        role: {
            type: DataTypes.ENUM('admin', 'asesor'),
            allowNull: false,
            defaultValue: 'asesor'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        timestamps: true,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, 12);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    user.password = await bcrypt.hash(user.password, 12);
                }
            }
        },
        indexes: [
            {
                fields: ['username']
            },
            {
                fields: ['role']
            },
            {
                fields: ['isActive']
            }
        ]
    });

    // Instance method to check password
    User.prototype.checkPassword = async function(password) {
        return await bcrypt.compare(password, this.password);
    };

    // Class method to find user by username
    User.findByUsername = async function(username) {
        return await this.findOne({
            where: { username: username, isActive: true }
        });
    };

    return User;
};
