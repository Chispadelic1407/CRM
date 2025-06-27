const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Advisor = sequelize.define('Advisor', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: { notEmpty: true }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        performanceScore: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00
        },
        currentContactCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        maxContacts: {
            type: DataTypes.INTEGER,
            defaultValue: 50
        }
        //... otros campos de rendimiento
    }, {
        timestamps: true,
        tableName: 'Advisors',
        indexes: [
            { name: 'idx_advisor_availability_performance', fields: ['isActive', 'performanceScore', 'currentContactCount'] },
            { fields: ['email'], unique: true }
        ]
    });

    Advisor.associate = (models) => {
        Advisor.hasMany(models.Contact, { foreignKey: 'assignedAdvisorId', as: 'contacts' });
    };

    return Advisor;
};
