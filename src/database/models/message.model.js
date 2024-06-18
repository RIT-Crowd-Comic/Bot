
const { DataTypes } = require('sequelize');
const { paranoidSettings } = require('./settings');

/**
 * Message model
 * @param {Sequelize} sequelize 
 */
module.exports = (sequelize) => {

    sequelize.define(
        'message',
        {
            content:
            {
                type:      DataTypes.STRING,
                allowNull: false
            },
            author_id:
            {
                type:      DataTypes.STRING,
                allowNull: false
            },
            message_id:
            {
                type:      DataTypes.STRING,
                allowNull: false
            },
            message_ts:
            {
                type:      DataTypes.STRING,
                allowNull: false
            }
        },
        { ...paranoidSettings }
    );
};
