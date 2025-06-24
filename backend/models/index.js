const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('../utils/logger');

// Load environment variables
require('dotenv').config();

// Initialize Sequelize with MariaDB for production
const sequelize = new Sequelize(
    process.env.DB_NAME || 'dbu2025297',
    process.env.DB_USER || 'dbu2025297', 
    process.env.DB_PASSWORD || 'Svernis1',
    {
        host: process.env.DB_HOST || 'db5018065428.hosting-data.io',
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: process.env.NODE_ENV === 'production' ? false : (msg) => logger.debug(msg),
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        },
        dialectOptions: {
            charset: 'utf8mb4',
            supportBigNumbers: true,
            bigNumberStrings: true
        }
    }
);

// Import models
const Contact = require('./Contact')(sequelize);
const Advisor = require('./Advisor')(sequelize);
const User = require('./User')(sequelize);

// Set up associations
const models = {
    Contact,
    Advisor,
    User,
    sequelize,
    Sequelize
};

// Run associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = models;
