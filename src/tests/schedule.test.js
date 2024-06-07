const scheduleUtils = require('../utils/schedule') 
describe('schedule utils', () => {
    describe('parseDaysList', () => {
        test('"daily" should return all days in the week', () => {
            expect(scheduleUtils.parseDaysList('daily').sort()).toEqual(["sunday", "monday", 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].sort());
        })

        test("duplicate days shouldn't be returned", () => {
            expect(scheduleUtils.parseDaysList('h, th')).toEqual(['thursday'])
        })

        test("invalid days should throw an error", () => {
            expect(() => scheduleUtils.parseDaysList('invalid')).toThrow(scheduleUtils.ScheduleError);
        })
    })    
})