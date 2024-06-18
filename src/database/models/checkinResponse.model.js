const { DataTypes } = require('sequelize');
const { paranoidSettings } = require('./settings');

/**
 * Check-in response model
 * @param {Sequelize} sequelize 
 */
module.exports = (sequelize) => {
    sequelize.define(
        'checkin_response',
        { content: { type: DataTypes.JSON }, },
        { ...paranoidSettings }
    );
};
