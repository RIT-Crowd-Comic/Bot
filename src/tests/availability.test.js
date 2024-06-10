const {createAvailability,createUnavailability,setUnavail,setAvail, displayAvail,displayUnavail,loadAvailability} = require ('../utils/availability');


jest.mock('../utils/availability', () => {

    const originalModule = jest.requireActual('../utils/availability');
    console.log(":3c")
  return {
    __esModule: true,
    ...originalModule,
    loadAvailability : validMember,
  };
})
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

const validAvail = {from: '6/21/2024', to: '11/29/2024', timeFrom:"00:00",timeTo: "23:59",days:['m','w','f'] };

var validMember = {
    1234567890 : 
    {
        from: '6/21/2024', to: '11/29/2024', timeFrom:"00:00",timeTo: "23:59",days:['m','w','f'] 
    }
}
test("createAvailability", () => {
    expect(createAvailability('6/21/2024','11/29/2024',['monday','wednesday','friday'])['from']).toMatch('6/21/2024');
});

test("createUnavailability", () => {
    expect(createUnavailability('6/21/2024','11/29/2024','the demons')['from']).toMatch('6/21/2024');
});

test("setAvail", () => {});
test("setUnavail", () => {});
test("displayAvail", () => {
    //commenting this out for now because I have no idea how I'm going to test this!
    //not functional
    //expect(displayAvail(validUser, null,'../savedAvailability.json')).toBe(true);
});
test("displayUnavail", () => {});