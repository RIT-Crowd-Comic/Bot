const { OpenAI } = require('openai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const openAiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


module.exports = { openAiClient };
