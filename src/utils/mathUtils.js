/**
 * Clamps a given number to a min and max
 * @param {num}} min 
 * @param {num} max 
 * @param {num} num 
 * @returns 
 */
const clamp = (min, max, num) => Math.max(min, Math.min(num, max));

module.exports = { clamp };
