const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Contact = sequelize.define('Contact', {
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
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        status: {
            type: DataTypes.ENUM('Nuevo', 'Contactado', 'Requiere_Seguimiento', 'No_Interesado', 'Convertido'),
            defaultValue: 'Nuevo'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        source: {
            type: DataTypes.STRING,
            allowNull: true
        },
        assignedAdvisorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Advisors',
                key: 'id'
            }
        },
        // AI Analysis fields
        qualityScore: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100
            }
        },
        isValidPhone: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isComplete: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isSuspicious: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        aiAnalysis: {
            type: DataTypes.JSON,
            allowNull: true
        },
        lastContactDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        contactCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        priority: {
            type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
            defaultValue: 'Medium'
        }
    }, {
        timestamps: true,
        indexes: [
            {
                fields: ['phone']
            },
            {
                fields: ['email']
            },
            {
                fields: ['status']
            },
            {
                fields: ['assignedAdvisorId']
            },
            {
                fields: ['qualityScore']
            }
        ]
    });

    Contact.associate = (models) => {
        Contact.belongsTo(models.Advisor, {
            foreignKey: 'assignedAdvisorId',
            as: 'advisor'
        });
    };

    return Contact;
};
