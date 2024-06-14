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

const user_fk = { foreignKey: { name: 'user_id' } };


const User = sequelize.define(
    'user',
    {
        discord_user_id: {
            type:      DataTypes.STRING,
            allowNull: false
        },
        tag: {
            type:      DataTypes.STRING,
            allowNull: false
        },
        display_name: { type: DataTypes.STRING },
        global_name:  { type: DataTypes.STRING }
    },
    { ...paranoidConfig }
);

const Message = sequelize.define(
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
    { ...paranoidConfig }
);
User.hasMany(Message, user_fk);
Message.belongsTo(User);

const CheckInSchedule = sequelize.define(
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
    { paranoid: true }
);

User.hasMany(CheckInSchedule, user_fk);
CheckInSchedule.belongsTo(User);


const UnavailableSchedule = sequelize.define(
    'unavailable_schedule',
    {
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

User.hasMany(UnavailableSchedule, user_fk);
UnavailableSchedule.belongsTo(User);

const AvailableSchedule = sequelize.define(
    'available_schedule',
    {
        from_time: {
            type:      DataTypes.STRING,
            allowNull: false
        },
        to_time: {
            type:      DataTypes.STRING,
            allowNull: false
        },
        days: {
            type:      DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false
        },
    },
    { ...paranoidConfig }
);


User.hasOne(AvailableSchedule, user_fk);
AvailableSchedule.belongsTo(User);

const Config = sequelize.define(
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
    { ...paranoidConfig }
);

const CheckInResponse = sequelize.define(
    'checkin_response',
    { content: { type: DataTypes.JSON }, },
    { ...paranoidConfig }
);

User.hasMany(CheckInResponse, user_fk);
CheckInResponse.belongsTo(User);

const CheckInReminder = sequelize.define(
    'checkin_reminder',
    {
        discord_user_id: {
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
    CheckInSchedule,
    UnavailableSchedule,
    AvailableSchedule,
    Config,
    CheckInResponse,
    CheckInReminder,
    sequelize
};
