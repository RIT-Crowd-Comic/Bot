const {help, helpRemember} = require ('../utils/helpCommands');



test("help", () => {

    expect(JSON.stringify(help().embeds[0]).includes("Server Commands")).toBe(true); //fails if no embed title
});
test("help-remember" , () => {

    expect(JSON.stringify(helpRemember().embeds[0]).includes("Remember Commands")).toBe(true); //fails if no embed title
});