
const { Sequelize } = require('sequelize');
const { syncTables, setupAssociations } = require('./setup');

/**
 * SSL is required for Heroku Postgres
 */
const sslOptions = process.env.NODE_ENV === 'production' ?
    { dialectOptions: { ssl: { rejectUnauthorized: false }, }, } :
    {};

const sequelize = new Sequelize(
    process.env.DATABASE_URL,
    {
        logging:  false,
        protocol: 'postgres',
        dialect:  'postgres',
        ...sslOptions,
        pool:     {
            max:     5,
            min:     0,
            acquire: 30000,
            idle:    10000
        }
    }
);

// since most models depend on user, user.model might have to be defined first
const models = [
    require('./models/user.model'),
    require('./models/availableSchedule.model'),
    require('./models/checkinReminder.model'),
    require('./models/checkinResponse.model'),
    require('./models/checkinSchedule.model'),
    require('./models/config.model'),
    require('./models/message.model'),
    require('./models/unavailableSchedule.model'),
    require('./models/unavailableStart.model'),
    require('./models/unavailableStop.model'),
];

// actually define each model
models.forEach(modelDefiner => modelDefiner(sequelize));

// additional setup
setupAssociations(sequelize);

// last step is to make sure tables actually exist
syncTables(sequelize);


/**
 * Check if successfully connected to database
 * @returns 
 */
const authenticate = () => {
    return sequelize.authenticate();
};


module.exports = { sequelize, authenticate };
