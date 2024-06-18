const { DataTypes } = require('sequelize');
const { paranoidSettings } = require('./settings');

/**
 * Check-in queue for scheduling the reminders of the day
 * @param {Sequelize} sequelize 
 */
module.exports = (sequelize) => {
    sequelize.define(
        'checkin_reminder',
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
