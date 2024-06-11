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


const UnavailableSchedule = sequelize.define(
    'unavailable_schedule',
    {
        user_id: {
            type:      DataTypes.STRING,
            allowNull: false
        },
        from_time: {
            type:      DataTypes.STRING,
            allowNull: false
        },
        to_time: {
            type:      DataTypes.STRING,
            allowNull: false
        },
        reason: { type: DataTypes.STRING },
    },
    { paranoid: true }
);

const CheckInResponse = sequelize.define(
    'checkin_response',
    {
        user_id: {
            type:      DataTypes.STRING,
            allowNull: false
        },
        rose:  { type: DataTypes.STRING, },
        thorn: { type: DataTypes.STRING, },
        bud:   { type: DataTypes.STRING, }
    }
);

module.exports = {
    User,
    Message,
    Schedule,
    UnavailableSchedule,
    CheckInResponse,
    sequelize
};
