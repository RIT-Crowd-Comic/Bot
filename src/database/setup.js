const userForeignKey = { foreignKey: { name: 'user_id' } };

/**
 * 
 * @param {Sequelize} sequelize 
 */
const setupAssociations = (sequelize) => {
    const {
        user, message, checkin_schedule, unavailable_schedule, available_schedule,
        checkin_response, checkin_reminder, unavailable_start, unavailable_stop,
    } = sequelize.models;

    user.hasMany(message, userForeignKey);
    user.hasMany(checkin_schedule, userForeignKey);
    user.hasMany(unavailable_schedule, userForeignKey);
    user.hasMany(available_schedule, userForeignKey);
    user.hasMany(checkin_response, userForeignKey);
    user.hasMany(checkin_reminder, userForeignKey);
    user.hasMany(unavailable_start, userForeignKey);
    user.hasMany(unavailable_stop, userForeignKey);

    message.hasOne(user);
    checkin_schedule.hasOne(user);
    unavailable_schedule.hasOne(user);
    available_schedule.hasOne(user);
    checkin_response.hasOne(user);
    checkin_reminder.hasOne(user);
    unavailable_start.hasOne(user);
    unavailable_stop.hasOne(user);
};

/**
 * Call this function once in src/index.js to set up a new database
 * @param {Sequelize} sequelize
 */
const syncTables = async (sequelize) => sequelize.sync();


module.exports = { syncTables, setupAssociations };
