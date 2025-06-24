const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('../utils/logger');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
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
