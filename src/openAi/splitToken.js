const { encode, decode } = require('gpt-3-encoder');

const TOKEN_LIMIT = 4096;

/**
 * 
 * @param {string} prompt 
 * @param {number} tokenLimit 
 * @returns 
 */
const splitMessageToFitTokenLimit = (prompt, tokenLimit = TOKEN_LIMIT) => {

    // encode
    const tokens = encode(prompt);

    // grab num tokens
    const tokenCount = tokens.length;

    // if under return
    if (tokenCount <= tokenLimit) {
        return [prompt];
    }

    // split into segments and return array
    const segments = [];
    let start = 0;
    while (start < tokenCount) {
        const end = Math.min(start + tokenLimit, tokenCount);
        const segmentTokens = tokens.slice(start, end);
        const segment = decode(segmentTokens);
        segments.push(segment);
        start = end;
    }

    return segments;
};

module.exports = { splitMessageToFitTokenLimit };
