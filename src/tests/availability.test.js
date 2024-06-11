const {
    newAvailabilityEntry, createAvailability, createUnavailability, setUnavail, setAvail, displayAvail, displayUnavail, loadAvailability
} = require('../utils/availability');


jest.mock('../utils/availability', () => {

    const originalModule = jest.requireActual('../utils/availability');
    console.log(':3c');
    return {
        __esModule:       true,
        ...originalModule,
        loadAvailability: validAvail,
    };
});
const validUser = {
    'id':                     '1234567890',
    'username':               'good_username',
    'avatar':                 'nf32qkjbfni2qbniuqb',
    'discriminator':          '0',
    'public_flags':           0,
    'flags':                  0,
    'banner':                 null,
    'accent_color':           0,
    'global_name':            'User',
    'avatar_decoration_data': null,
    'banner_color':           '#000000',
    'clan':                   null
};

const validAvail = {
    '1234567890': {
        'userId':    '1234567890',
        'userTag':   'servermember',
        'available': {
            'from': '2024-05-20T14:00:00.000Z',
            'to':   '2024-08-09T22:00:00.000Z',
            'days': [
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday'
            ]
        },
        'unavailable': [
            {
                'from':   '2024-07-03T05:00:00.000Z',
                'to':     '2024-07-06T04:59:00.000Z',
                'reason': 'Holiday'
            },
            {
                'from': '2024-08-01T20:00:00.000Z',
                'to':   '2024-08-02T17:30:00.000Z'
            }
        ]
    }
};

var validMember = {

    'user': {
        'id':                     '1234567890',
        'username':               'good_username',
        'avatar':                 'nf32qkjbfni2qbniuqb',
        'discriminator':          '0',
        'public_flags':           0,
        'flags':                  0,
        'banner':                 null,
        'accent_color':           0,
        'global_name':            'User',
        'avatar_decoration_data': null,
        'banner_color':           '#000000',
        'clan':                   null
    },
    'nick':      'NOT API SUPPORT',
    'avatar':    null,
    'roles':     [],
    'joined_at': '2015-04-26T06:26:56.936000+00:00',
    'deaf':      false,
    'mute':      false

};

test('newAvailabilityEntry', () => {
    expect(newAvailabilityEntry('1234567890', 'sneef_snorf')['userTag']).toMatch('sneef_snorf');
});
test('createAvailability', () => {
    expect(createAvailability('6/21/2024', '11/29/2024', ['monday', 'wednesday', 'friday'])['from']).toMatch('6/21/2024');
});

test('createUnavailability', () => {
    expect(createUnavailability('6/21/2024', '11/29/2024', 'the demons')['from']).toMatch('6/21/2024');
});

test('displayAvail', () => {

    // returns JSON
    expect(JSON.stringify(displayAvail(validUser, validMember, './src/savedAvailability.json')).includes('from')).toBe(true);
});
test('displayUnavail', () => {

    // returns embed?
    expect(JSON.stringify(displayUnavail(validUser, validMember, './src/savedAvailability.json')).includes('From')).toBe(true);
});
