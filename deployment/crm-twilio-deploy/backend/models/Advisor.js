const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Advisor = sequelize.define('Advisor', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        department: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        maxContacts: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
            validate: {
                min: 1,
                max: 200
            }
        },
        currentContactCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        specialties: {
            type: DataTypes.JSON,
            allowNull: true
        },
        workingHours: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {
                monday: { start: '09:00', end: '18:00' },
                tuesday: { start: '09:00', end: '18:00' },
                wednesday: { start: '09:00', end: '18:00' },
                thursday: { start: '09:00', end: '18:00' },
                friday: { start: '09:00', end: '18:00' },
                saturday: { start: '09:00', end: '14:00' },
                sunday: { start: null, end: null }
            }
        },
        performanceScore: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100
            }
        },
        totalContactsHandled: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        successfulConversions: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        averageResponseTime: {
            type: DataTypes.INTEGER, // in minutes
            defaultValue: 0
        }
    }, {
        timestamps: true,
        indexes: [
            {
                fields: ['email']
            },
            {
                fields: ['isActive']
            },
            {
                fields: ['performanceScore']
            }
        ]
    });

    Advisor.associate = (models) => {
        Advisor.hasMany(models.Contact, {
            foreignKey: 'assignedAdvisorId',
            as: 'contacts'
        });
    };

    return Advisor;
};
