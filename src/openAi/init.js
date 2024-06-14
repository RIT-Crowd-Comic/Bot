const { OpenAI } = require('openai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });


let openAiClient;

try {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('API key is missing. Please set the OPENAI_API_KEY environment variable.');
    }

    openAiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('OpenAI client initialized successfully.');
} catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
}

module.exports = { openAiClient };