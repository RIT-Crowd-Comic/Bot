const { DataTypes } = require('sequelize');
const { paranoidSettings } = require('./settings');

/**
 * User model
 * @param {Sequelize} sequelize 
 */
module.exports = (sequelize) => {
    sequelize.define(
        'user',
        {
            discord_user_id: {
                type:      DataTypes.STRING,
                allowNull: false,
                unique:    true
            },
            tag: {
                type:      DataTypes.STRING,
                allowNull: false
            },
            display_name: { type: DataTypes.STRING },
            global_name:  { type: DataTypes.STRING }
        },
        { ...paranoidSettings }
    );
};
