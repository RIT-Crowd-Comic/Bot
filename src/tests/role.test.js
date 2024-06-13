jest.mock('../utils/roles');
jest.mock('../utils/apiCalls');
const rolesUtils = require('../utils/roles');
const apiCalls = require('../utils/apiCalls');
const validUser = {
    'id': '1234567890',
    'username': 'good_username',
    'avatar': 'nf32qkjbfni2qbniuqb',
    'discriminator': '0',
    'public_flags': 0,
    'flags': 0,
    'banner': null,
    'accent_color': 0,
    'global_name': 'User',
    'avatar_decoration_data': null,
    'banner_color': '#000000',
    'clan': null
};

describe('role utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findRole', () => {
        apiCalls.getRoles.mockResolvedValue([{ name: 'a' }, { name: 'b' }, { name: 'c' }])
        test("if the role doesn't exist, undefined should be returned", async () => {
            const response = await rolesUtils.findRole('d');
            expect(response).toBe(undefined);
        });

        test("if the role does exist, the role itself should be returned", async () => {
            const response = await rolesUtils.findRole('a');
            expect(response.name).toBe('a')
        })
    })

    describe('hasRole', () => {
        const roles = [{ id: 'a' }, { id: 'b' }]
        const user = { roles: [{ id: 'a' }] }
        apiCalls.getServerUser.mockResolvedValue(user)
        test("if the user has the role, return true", async () => {
            const response = await rolesUtils.hasRole(user, { id: 'a' });
            expect(response).toBeTruthy();
        });

        test("if the user doesn't have the role, return false", async () => {
            const response = await rolesUtils.hasRole(user, roles[1]);
            expect(response).toBeFalsy();
        })
    })

    describe('addUnavailable', () => {
        test('should fail if no "unavailable" role exists', async () => {

            apiCalls.getRoles.mockResolvedValue([]);
            rolesUtils.findRole.mockResolvedValue(undefined)
            jest.unmock('../utils/roles');
            const response = await rolesUtils.addUnavailableRole(validUser);
            expect(response).toMatchObject({ status: 'Fail', description: 'No role named "unavailable" exists' });
        });

        test('should fail if user is a bot', async () => {
            const botUser = { ...validUser, bot: true };
            apiCalls.getRoles.mockResolvedValue([{ id: '1', name: 'unavailable' }]);
            apiCalls.getServerUser.mockResolvedValue({ roles: ['1'] });
            const response = await rolesUtils.addUnavailableRole(botUser);
            expect(response).toMatchObject({ status: 'Fail', description: `Can't assign roles to bots (<@${botUser.id}>)` });
        });

        test('should fail if user already has the "unavailable" role', async () => {
            apiCalls.getRoles.mockResolvedValue([{ id: '1', name: 'unavailable' }]);
            apiCalls.getServerUser.mockResolvedValue({ roles: ['1'] });
            const response = await rolesUtils.addUnavailableRole(validUser);
            expect(response).toMatchObject({ status: 'Fail', description: `<@${validUser.id}> already has the unavailable role` });
        });

        test('should add the "unavailable" role successfully', async () => {
            apiCalls.getRoles.mockResolvedValue([{ id: '1', name: 'unavailable' }]);
            apiCalls.getServerUser.mockResolvedValue({ roles: [] });
            apiCalls.addRole.mockResolvedValue({ status: 'Success' });

            const response = await rolesUtils.addUnavailableRole(validUser);
            expect(response).toMatchObject({ status: 'Success' });
        });
    });

    describe('removeUnavailableRole', () => {
        test('should fail if no "unavailable" role exists', async () => {
            apiCalls.getRoles.mockResolvedValue([{ name: 'something' }, { name: 'else' }]);
            const response = await rolesUtils.removeUnavailableRole(validUser);
            expect(response).toMatchObject({ status: 'Fail', description: 'No role named "unavailable" exists' });
        });

        test('should fail if user does not have the "unavailable" role', async () => {
            apiCalls.getRoles.mockResolvedValue([{ id: '1', name: 'unavailable' }, { id: '2', name: 'not-unavailable' }]);
            apiCalls.getServerUser.mockResolvedValue({ roles: [{ name: 'not-unavailable' }] });
            const response = await rolesUtils.removeUnavailableRole(validUser);
            expect(response).toMatchObject({ status: 'Fail', description: `<@${validUser.id}> does not have the unavailable role` });
        });

        test('should remove the "unavailable" role successfully', async () => {
            apiCalls.getRoles.mockResolvedValue([{ id: '1', name: 'unavailable' }]);
            apiCalls.getServerUser.mockResolvedValue({ roles: ['1'] });
            apiCalls.removeRole.mockResolvedValue({ status: 'Success' });

            const response = await rolesUtils.removeUnavailableRole(validUser);
            expect(response).toMatchObject({ status: 'Success' });
        });
    });
});

