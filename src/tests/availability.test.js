const {createAvailability,createUnavailability,setUnavail,setAvail, displayAvail,displayUnavail} = require ('../utils/availability');

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

const validAvail = {from: '6/21/2024', to: '11/29/2024', days:['m','w','f'] }
test("createAvailability", () => {
    expect(createAvailability('6/21/2024','11/29/2024',['monday','wednesday','friday'])['from']).toMatch('6/21/2024');
});

test("createUnavailability", () => {
    expect(createUnavailability('6/21/2024','11/29/2024','the demons')['from']).toMatch('6/21/2024');
});

test("setAvail", () => {});
test("setUnavail", () => {});
test("displayAvail", () => {});
test("displayUnavail", () => {});