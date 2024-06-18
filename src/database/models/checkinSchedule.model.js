const { DataTypes } = require('sequelize');
const { paranoidSettings } = require('./settings');

/**
 * Check-in schedule for scheduling reminders
 * @param {Sequelize} sequelize 
 */
module.exports = (sequelize) => {
    sequelize.define(
        'checkin_schedule',
        {
            utc_days:
            {
                type:      DataTypes.ARRAY(DataTypes.STRING),
                allowNull: false
            },
            utc_time:
            {
                type:      DataTypes.ARRAY(DataTypes.INTEGER),
                allowNull: false
            },
            local_days:
            {
                type:      DataTypes.ARRAY(DataTypes.STRING),
                allowNull: false
            },
            local_time:
            {
                type:      DataTypes.ARRAY(DataTypes.INTEGER),
                allowNull: false
            },
            mark_delete: {
                type:         DataTypes.BOOLEAN,
                defaultValue: false
            }

        },
        { ...paranoidSettings }
    );
};
