const { DataTypes, Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`,
    { logging: false }
);

const User = sequelize.define(
    'user',
    {
        user_id: {
            type:      DataTypes.STRING,
            allowNull: false
        },
        user_tag: {
            type:      DataTypes.STRING,
            allowNull: false
        },
        user_name: {
            type:      DataTypes.STRING,
            allowNull: false
        }
    },
    {

        // soft deletion
        paranoid: true
    }
);

const Message = sequelize.define(
    'message',
    {
        user_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content:
        {
            type: DataTypes.STRING,
            allowNull: false
        },
        message_id:
        {
            type: DataTypes.STRING,
            allowNull: false
        },
        timestamp:
        {
            type: DataTypes.TIMESTAMP,
            allowNull: false
        }

    },
    {
        paranoid:true
    }
);

module.exports = {
    User,
    Message,
    sequelize
};
