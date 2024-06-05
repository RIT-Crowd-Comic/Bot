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

    describe('rememberNumber', () => {
        const count = 3;
        test('get messages with bots', () => {

            //todo: get [count] messages after the first validMessage

            expect(messagesToSave.length).toBe(count);

            //todo: verify validMessage is not in the list
            expect(messagesToSave.find(message => message.id === validMessage.id)).toBe(undefined)

            //todo: verify messages are in order 
        });

        test('get messages without bots', () => {
            //todo: check if message are saved without bots
        })
    });

    describe('getRememberedMessages', () => {

        test('should get all the messages that are remembered', async () => {
            //todo: length of the array should be 0

            //todo: add 5 messages to the array

            //todo: check to see that the array updated correctly
        });
    });
})



describe('clearRememberedMessages', () => {

    test('should clear rememberedMessages and state it was successful', async () => {
        expect(rememberedMessages.length).toBeGreaterThan(0);


        //todo: call the clear method
        //const response = clearRememberedMessages();

        //todo: check the return value
        //expect(response.content).toBe('Success')

        //todo: make sure messages were cleared
        //expect(rememberedMessages.length).toBe(0);
    });
});

// describe('a', () => {

// })