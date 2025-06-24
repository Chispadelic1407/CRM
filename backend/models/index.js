const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('../utils/logger');

// Load environment variables
require('dotenv').config();

// Initialize Sequelize with MariaDB/MySQL
const sequelize = new Sequelize(
    process.env.DB_NAME || 'dbu2025297',
    process.env.DB_USER || 'dbu2025297',
    process.env.DB_PASSWORD || 'Svernis1',
    {
        host: process.env.DB_HOST || 'db5018065428.hosting-data.io',
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: (msg) => logger.debug(msg),
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: false
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Import models
const Contact = require('./Contact')(sequelize);
const Advisor = require('./Advisor')(sequelize);

// Set up associations
const models = {
    Contact,
    Advisor,
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
