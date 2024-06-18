const { DataTypes } = require('sequelize');
const { paranoidSettings } = require('./settings');

/**
 * Available schedule for updating unavailable/available role
 * @param {Sequelize} sequelize 
 */
module.exports = (sequelize) => {
    sequelize.define(
        'available_schedule',
        {
            from_time: {
                type:      DataTypes.DATE,
                allowNull: false
            },
            to_time: {
                type:      DataTypes.DATE,
                allowNull: false
            },
            days: {
                type:      DataTypes.ARRAY(DataTypes.STRING),
                allowNull: false
            },
        },
        { ...paranoidSettings }
    );
};
