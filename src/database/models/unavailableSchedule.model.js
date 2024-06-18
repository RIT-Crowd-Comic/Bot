const { DataTypes } = require('sequelize');
const { paranoidSettings } = require('./settings');

/**
 * Unavailable schedule for updating unavailable role
 * @param {Sequelize} sequelize 
 */
module.exports = (sequelize) => {
    sequelize.define(
        'unavailable_schedule',
        {
            from_time: {
                type:      DataTypes.DATE,
                allowNull: false
            },
            to_time: {
                type:      DataTypes.DATE,
                allowNull: false
            },
            reason: { type: DataTypes.STRING },
        },
        { ...paranoidSettings }
    );
};
