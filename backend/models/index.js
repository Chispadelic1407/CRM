const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('../utils/logger');

// Load environment variables
require('dotenv').config();

// Initialize Sequelize with SQLite for development
const sequelize = new Sequelize({
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: (msg) => logger.debug(msg),
    define: {
        timestamps: true,
        underscored: false,
        freezeTableName: false
    }
});

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
