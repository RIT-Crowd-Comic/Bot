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

    describe('rememberRangeGrab', () => {
        let channelId;
        let startMessageId;
        let endMessageId;
        let excludeBotMessages;
        test('invalid channelId will result in a fail', async () => {
            apiCalls.getChannelObject.mockResolvedValue(undefined);
            const response = await rememberRangeGrab(channelId, startMessageId, endMessageId, excludeBotMessages);
            expect(response.status).toBe('Fail')
            expect(response.description.startsWith('Cannot find a channel with the id')).toBeTruthy()
        })

        test('invalid startMessageId will result in a fail', async () => {
            channelId = 'a';
            apiCalls.getChannelObject.mockResolvedValue(channelId);
            apiCalls.getMessageObject.mockResolvedValue(undefined)
            const response = await rememberRangeGrab(channelId, startMessageId, endMessageId, excludeBotMessages);
            expect(response.status).toBe('Fail')
            expect(response.description.startsWith('Cannot find start message with the id')).toBeTruthy()
        })

        test('invalid endMessageId will result in a fail', async () => {

        })

        test('second message being sent before the first message will result in a fail', async () => {

        })

        test('get all the messages between the first and second message inclusively. should return with success', async () => {

        })

        test('get all the messages between the first and second message inclusively excluding bot messages. should return with success', async () => {

        })
    })
});