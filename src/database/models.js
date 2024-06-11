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
            type:      DataTypes.STRING,
            allowNull: false
        },
        content:
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
    { paranoid: true }
);

const Schedule = sequelize.define(
    'schedule',
    {
        user_id: {
            type:      DataTypes.STRING,
            allowNull: false
        },
        utcDays:
        {
            type:      DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false
        },
        utcTime:
        {
            type:      DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: false
        },
        localDays:
        {
            type:      DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false
        },
        localTime:
        {
            type:      DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: false
        }

    },
    { paranoid: true }
);

const Response = sequelize.define(
    'response',
    {
        user_id: {
            type:      DataTypes.STRING,
            allowNull: false
        },
        date: {
            type:      DataTypes.DATE,
            allowNull: false
        },
        rose:  { type: DataTypes.STRING, },
        bud:   { type: DataTypes.STRING, },
        thorn: { type: DataTypes.STRING, },
    },
    { paranoid: true }
);



module.exports = {
    User,
    Message,
    Schedule,
    Response,
    sequelize
};
