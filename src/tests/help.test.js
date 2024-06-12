const {
    help, helpRemember, helpAvailability, helpCheckIn
} = require('../utils/helpCommands');


// all these commands do is stringify the JSON for the help embed builder and check if the title is what it's supposed to be.
// if the title is correct, the content should be too. 

describe('help commands', () => {
    test('help-general', () => {
        expect(JSON.stringify(help().embeds[0]).includes('General Server Commands')).toBe(true); // fails if no embed title
    });

    test('help-remember', () => {

        expect(JSON.stringify(helpRemember().embeds[0]).includes('Remember Commands')).toBe(true); // fails if no embed title
    });
    test('help-availability', () => {

        expect(JSON.stringify(helpAvailability().embeds[0]).includes('Availability Commands')).toBe(true); // fails if no embed title
    });

    test('help-check-in', () => {

        expect(JSON.stringify(helpCheckIn().embeds[0]).includes('Check in Commands')).toBe(true); // fails if no embed title
    });
});
