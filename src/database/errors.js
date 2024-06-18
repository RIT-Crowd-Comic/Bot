

class ConnectionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConnectionError';
        this.code = 'ConnectionError';
    }
}

class ArgumentError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ArgumentError';
        this.code = 'ArgumentError';
    }
}

module.exports = {
    ConnectionError,
    ArgumentError
};
