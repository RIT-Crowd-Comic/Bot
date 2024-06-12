// compares commands to see if they are different
module.exports = (existingCommand, localCommand) => {
    const areChoicesDifferent = (existingChoices, localChoices) => {

        // check if the same
        for (const localChoice of localChoices) {
            const existingChoice = existingChoices?.find((choice) => choice.name === localChoice.name);

            // if different return true
            if (!existingChoice) {
                return true;
            }

            // if not equal to existing choice return true
            if (localChoice.value !== existingChoice.value) {
                return true;
            }
        }
        return false;
    };

    // same thing as choice except compares options
    const areOptionsDifferent = (existingOptions, localOptions) => {
        for (const localOption of localOptions) {
            const existingOption = existingOptions?.find((option) => option.name === localOption.name);

            if (!existingOption) {
                return true;
            }

            // compares options and their parameters
            if (
                localOption.description !== existingOption.description ||
                localOption.type !== existingOption.type ||
                (localOption.required || false) !== existingOption.required ||
                (localOption.choices?.length || 0) !==
                (existingOption.choices?.length || 0) ||
                areChoicesDifferent(
                    localOption.choices || [],
                    existingOption.choices || []
                )
            ) {
                return true;
            }
        }
        return false;
    };

    if (
        existingCommand.description !== localCommand.description ||
        existingCommand.options?.length !== (localCommand.options?.length || 0) ||
        areOptionsDifferent(existingCommand.options, localCommand.options || [])
    ) {
        return true;
    }

    return false;
};

