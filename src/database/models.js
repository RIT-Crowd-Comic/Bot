const { DataTypes, Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`,
    { logging: false }
);

// soft deletion
const paranoidConfig = Object.freeze({
    paranoid:  true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
});

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
        display_name: {
            type:      DataTypes.STRING,
            allowNull: false
        },
        global_name: {
            type:      DataTypes.STRING,
            allowNull: false
        }
    },
    { ...paranoidConfig }
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
    { ...paranoidConfig }
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
    { ...paranoidConfig }
);

const CheckInResponse = sequelize.define(
    'checkin_response',
    {
        user_id: {
            type:      DataTypes.STRING,
            allowNull: false
        },
        content: { type: DataTypes.JSON },
    },
    { ...paranoidConfig }
);
const Reminder = sequelize.define(
    'reminder',
    {
        user_id: {
            type:      DataTypes.STRING,
            allowNull: false
        },
        hour: {
            type:      DataTypes.INTEGER,
            allowNull: false
        },
        min: {
            type:      DataTypes.INTEGER,
            allowNull: false
        },
    },
    { ...paranoidConfig }
);
module.exports = {
    User,
    Message,
    Schedule,
    UnavailableSchedule,
    CheckInResponse,
    sequelize
};
