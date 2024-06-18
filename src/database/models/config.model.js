const { DataTypes } = require('sequelize');
const { paranoidSettings } = require('./settings');

/**
 * Config model
 * @param {Sequelize} sequelize 
 */
module.exports = (sequelize) => {
    sequelize.define(
        'config',
        {
            availability_channel_id: {
                type:      DataTypes.STRING,
                allowNull: false
            },
            server_id: {
                type:      DataTypes.STRING,
                allowNull: false
            }
        },
        { ...paranoidSettings }
    );
};
