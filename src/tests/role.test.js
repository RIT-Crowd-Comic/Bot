const rolesUtils = require('../utils/roles')
const validUser = {
    "id": "330475170835726347",
    "username": "blckhawker",
    "avatar": "7dc8ea3f603dc5fed414c8505aada4ea",
    "discriminator": "0",
    "public_flags": 0,
    "flags": 0,
    "banner": null,
    "accent_color": 0,
    "global_name": "Hawker",
    "avatar_decoration_data": null,
    "banner_color": "#000000",
    "clan": null
}

test ('role add', async () => {
    //todo: give an invalid user

    //todo: don't have an 'unavailable' role

    //todo: try to give the role to a bot


    //todo: success should return { status: 'Success' }
    const response = await rolesUtils.addUnavailableRole(validUser)

    expect(sum(response)).toMatchObject({ status: 'Success' });
});

test('role remove', () => {

});