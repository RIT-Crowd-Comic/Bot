
module.exports = {
    Models: { ...require('./models'), },
    Errors: { ...require('./errors'), },
    ...require('./queries'),
};
