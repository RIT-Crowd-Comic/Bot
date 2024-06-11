jest.mock('../utils/apiCalls');
const apiCalls = require('../utils/apiCalls');
const { rememberRangeGrab, rememberOneMessage } = require('../utils/rememberMessages');
const { validMessages } = require('./testUtils');

const validMessage = validMessages[0];

const validChannel = { id: '1234567890' };

describe('remember messages utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rememberOneMessage', () => {
        apiCalls.getMessageObject.mockResolvedValue(validMessage);
        test('should say what the remembered message is', async () => {
            const response = await rememberOneMessage(validChannel.id, validMessage.id);
            expect(response.content).toBe(`Remembered: "${validMessage.content}"`);
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
            expect(response.status).toBe('Fail');
            expect(response.description.startsWith('Cannot find a channel with the id')).toBeTruthy();
        });

        test('invalid startMessageId will result in a fail', async () => {
            channelId = 'a';
            apiCalls.getChannelObject.mockResolvedValue(channelId);
            apiCalls.getMessageObject.mockResolvedValue(undefined);
            const response = await rememberRangeGrab(channelId, startMessageId, endMessageId, excludeBotMessages);
            expect(response.status).toBe('Fail');
            expect(response.description.startsWith('Cannot find start message with the id')).toBeTruthy();
        });
    });
});
