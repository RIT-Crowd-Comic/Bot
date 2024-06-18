const { DataTypes } = require('sequelize');
const { paranoidSettings } = require('./settings');

/**
 * Unavailable start queue for changing unavailable role
 * @param {Sequelize} sequelize 
 */
module.exports = (sequelize) => {
    sequelize.define(
        'unavailable_start',
        {
            hour: {
                type:      DataTypes.INTEGER,
                allowNull: false
            },
            min: {
                type:      DataTypes.INTEGER,
                allowNull: false
            },
        },
        { ...paranoidSettings }
    );
};
