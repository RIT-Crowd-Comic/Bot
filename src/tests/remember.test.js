jest.mock('../utils/apiCalls');
const apiCalls = require('../utils/apiCalls');
const {
    getRememberedMessages, clearRememberedMessages, rememberRangeGrab, rememberOneMessage, rememberPast, rememberNumber, startRemembering, stopRemembering
} = require('../utils/rememberMessages');
const { validMessages } = require('./testUtils')

const validMessage = validMessages[0]

const validChannel = {
    id: "1234567890"
}

let messagesToSave;

const mockGetNumberMessages = jest.fn((_, numberToSave, id) => {

    //todo: get the index of the message id
    const message = validMessages.find(message => message.id === id);
    const startIndex = validMessages.indexOf(message) + 1;
    //todo: get numberToSave messages after id (exclusive)
    messagesToSave = structuredClone(validMessages).slice(startIndex, startIndex + numberToSave)
    console.log('start index ' + startIndex)
    console.log('end index ' + (startIndex + numberToSave))

});

let rememberedMessages = ['mock', 'up', 'data'];

describe('remember messages utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        messagesToSave = [];
    });

    describe('rememberOneMessage', () => {
        apiCalls.getMessageObject.mockResolvedValue(validMessage);
        test('should say what the remembered message is', async () => {
            const response = await rememberOneMessage(validChannel.id, validMessage.id);
            expect(response.content).toBe(`Remembered: "${validMessage.content}"`)
        });
    });
});