const rolesUtils = require('../utils/roles');

const validUser = {
    'id':                     '330475170835726347',
    'username':               'blckhawker',
    'avatar':                 '7dc8ea3f603dc5fed414c8505aada4ea',
    'discriminator':          '0',
    'public_flags':           0,
    'flags':                  0,
    'banner':                 null,
    'accent_color':           0,
    'global_name':            'Hawker',
    'avatar_decoration_data': null,
    'banner_color':           '#000000',
    'clan':                   null
};

jest.mock('../utils/apiCalls');
const apiCalls = require('../utils/apiCalls');

describe('role utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addUnavailable', () => {
        test('should fail if no "unavailable" role exists', async () => {
            apiCalls.getRoles.mockResolvedValue([]);
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

