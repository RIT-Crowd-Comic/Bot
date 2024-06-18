
const models = require('./models');

/**
 * Call this function once in src/index.js to set up a new database
 */
const setup = async (force = false) => {
    models.User.sync({ force });
    models.AvailableSchedule.sync({ force });
    models.CheckInReminder.sync({ force });
    models.CheckInResponse.sync({ force });
    models.CheckInSchedule.sync({ force });
    models.Config.sync({ force });
    models.Message.sync({ force });
    models.UnavailableSchedule.sync({ force });
    models.UnavailableStart.sync({ force });
    models.UnavailableStop.sync({ force });
};

module.exports = { setup };
