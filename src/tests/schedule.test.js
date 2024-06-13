const dayjs = require('dayjs');
const scheduleUtils = require('../utils/schedule');
const roleUtils = require('../utils/roles');
jest.mock('../utils/roles');

describe('schedule utils', () => {
    describe('parseDaysList', () => {
        test('"daily" should return all days in the week', () => {
            expect(scheduleUtils.parseDaysList('daily').sort()).toEqual(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].sort());
        });

        test("duplicate days shouldn't be returned", () => {
            expect(scheduleUtils.parseDaysList('h, th')).toEqual(['thursday']);
        });

        test('invalid days should throw an error', () => {
            expect(() => scheduleUtils.parseDaysList('invalid')).toThrow(scheduleUtils.ScheduleError);
        });
    });

    describe('displaySchedule', () => {
        test('time of "5" should result to 5:00', () => {
            const schedule = { localDays: ['monday'], localTime: [ 5, 0 ] };
            expect(scheduleUtils.displaySchedule(schedule).includes('5:00')).toBeTruthy();
        });

        test('time 5:50 should result to 5:50', () => {
            const schedule = { localDays: ['monday'], localTime: [ 5, 50 ] };
            expect(scheduleUtils.displaySchedule(schedule).includes('5:50')).toBeTruthy();
        });

        test('time of "5:5" should result to 5:05', () => {
            const schedule = { localDays: ['monday'], localTime: [ 5, 5 ] };
            expect(scheduleUtils.displaySchedule(schedule).includes('5:05')).toBeTruthy();
        });

        test('every day of the week should result with "every day"', () => {
            const schedule = { localDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], localTime: [ 5, 0 ] };
            expect(scheduleUtils.displaySchedule(schedule).includes('every day')).toBeTruthy();
        });
    });

    describe('createSchedule', () => {
        test('days should be in chronological order with work week starting on sunday', () => {
            expect(scheduleUtils.createSchedule(['tuesday', 'monday', 'sunday'], dayjs()).localDays).toEqual(['sunday', 'monday', 'tuesday']);
        });
    });

    describe('validScheduleUser', () => {
        test('invalid user would cause a failure', () => {
            expect(scheduleUtils.validScheduleUser({}).status).toBe('Fail');
        });
    });

    describe('viewCheckInResponses', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        const user = {};
        const commandUser = {};
        test('adminRole not existing should return a failure', async () => {
            roleUtils.findRole.mockResolvedValue(undefined);
            const response = await scheduleUtils.viewCheckInResponses(user, commandUser);
            expect(response.status).toBe('Fail')
            expect(response.description.includes(`does not exist`)).toBeTruthy()
        })
    })
});
